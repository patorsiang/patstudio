import { test, expect, type Page } from "@playwright/test";

import { routes } from "../support/routes";
import { loadWithTheme, themes } from "../support/theme";

/**
 * One screenshot per route, per theme, per viewport. A CSS change that shifts a
 * page nobody touched passes every other test in the suite, because they read
 * numbers (contrast, target size, overflow), not pixels. This one fails and
 * writes a diff image.
 *
 * Run locally only: `bun run test:visual`. Baselines are macOS Chromium PNGs
 * (the file names carry the platform), and CI's Linux renders fonts and
 * anti-aliasing differently, so the project is not defined when CI runs. A
 * baseline changes only on purpose, in the same PR as the change that moved it:
 * `bun run test:visual:update`, then look at the images in the diff.
 *
 * Things that change a baseline without a CSS change, so a failure is not
 * always a bug:
 * - A post is added or edited in the content repo (post pages and /posts).
 * - The CV pages rank projects and pick experience by the current year, so
 *   they move when the year turns.
 * - GitHub's API limit is spent, the build falls back to the committed post
 *   list, and a post that is only on the live site answers 404.
 */

/**
 * Baselines are PNGs in git, so their size is a cost. Uncapped, the 26 routes
 * came to 73 MB. Two cuts bring it to about 31 MB:
 *
 * - A page is captured down to its first 3000 px, and a post page to its first
 *   2000 px (the long ones are 14 000 px tall, and every post shares one
 *   template). What is lost is the bottom of tall pages, mostly on the phone;
 *   the footer is still covered by the shorter pages (/contact, /card, the 404).
 * - The CV pages are captured in light only. They are the heaviest pages
 *   (about 2.5 MB each per route) and are documents built to print in light.
 *   What is lost is a dark-mode regression that only the CV pages have; the
 *   shared components and tokens are still covered in dark on the other routes.
 */
const PAGE_HEIGHT_CAP = 3000;
const POST_HEIGHT_CAP = 2000;

const isPost = (route: string) => route.startsWith("/posts/");
const isCv = (route: string) => route.includes("/cv/");
const heightCap = (route: string) => (isPost(route) ? POST_HEIGHT_CAP : PAGE_HEIGHT_CAP);

/** "/posts/some-post" -> "posts-some-post"; "/" -> "home". */
function slug(route: string) {
  return route.replace(/^\/|\/$/g, "").replaceAll("/", "-") || "home";
}

/**
 * Scrolls the page top to bottom so lazy images load, then waits for every
 * image and font. A full-page capture taken before that has blank boxes where
 * the images should be, and differs from run to run.
 */
async function settleForSnapshot(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    window.scrollTo(0, 0);
    await document.fonts.ready;
    await Promise.all(
      [...document.images].map((image) =>
        image.complete
          ? Promise.resolve()
          : new Promise((resolve) => {
              image.addEventListener("load", resolve, { once: true });
              image.addEventListener("error", resolve, { once: true });
            }),
      ),
    );
  });
}

for (const theme of themes) {
  for (const route of routes) {
    if (theme === "dark" && isCv(route)) continue;

    test(`${route} looks the same in ${theme}`, async ({ page }) => {
      await loadWithTheme(page, route, theme);
      await settleForSnapshot(page);

      const width = page.viewportSize()?.width ?? 0;
      const height = await page.evaluate(() => document.documentElement.scrollHeight);

      await expect(page).toHaveScreenshot(`${slug(route)}-${theme}.png`, {
        fullPage: true,
        animations: "disabled",
        ...(height > heightCap(route)
          ? { clip: { x: 0, y: 0, width, height: heightCap(route) } }
          : {}),
      });
    });
  }
}
