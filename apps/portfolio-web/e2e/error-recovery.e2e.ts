import { test, expect } from "@playwright/test";

import { loadWithTheme, themes } from "./support/theme";

/**
 * The 404 page's recovery path.
 *
 * /this-route-does-not-exist is already in e2e/support/routes.ts - the comment
 * there says it is "deliberate, not a placeholder: it renders not-found.tsx,
 * which has its own controls and needs its own coverage" - so its contrast,
 * tap targets, focus rings and motion are all swept. Its *controls* were not:
 * nothing had checked that the way out of a dead end actually leads anywhere.
 *
 * On the two error boundaries, and why they are not here:
 *
 * error.tsx and global-error.tsx cannot be reached from a production build
 * without shipping something to reach them with. Two approaches that need no
 * product change were tried and both failed, for good reasons:
 *
 * - Failing the RSC payload for a client-side navigation (page.route on
 *   `_rsc=`, fulfilled 500). Next falls back to a full document request and
 *   the page renders normally.
 * - Aborting the JavaScript chunks. The server-rendered HTML still paints;
 *   the page simply never hydrates.
 *
 * Both are the framework being resilient, which is the right behaviour to
 * have. The remaining option is a NODE_ENV-gated route that throws, and that
 * is a worse trade than the coverage is worth: it puts a real route into a
 * real portfolio site permanently, to test a button whose behaviour is almost
 * entirely React's. What those two files can lose without anyone noticing is
 * pinned instead in src/app/error-boundaries.test.ts, using the same
 * source-reading technique as layout.test.ts and seo.test.ts.
 */

const NOT_FOUND = "/this-route-does-not-exist";

test("an unknown route answers 404 rather than a soft landing", async ({ page }) => {
  const response = await page.goto(NOT_FOUND);

  // A styled 404 served with a 200 is the version of this that looks fine to
  // a person and tells a crawler the page exists.
  expect(response?.status()).toBe(404);
});

test("the way out of a dead end leads home", async ({ page }) => {
  await page.goto(NOT_FOUND);

  await expect(page.getByRole("heading", { level: 1 })).toContainText(/page not found/i);

  await page.getByRole("link", { name: /go back home/i }).click();

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("navigation", { name: "Global navigation" })).toBeVisible();
});

test("the dead end offers a way to report it", async ({ page }) => {
  await page.goto(NOT_FOUND);

  const support = page.getByRole("link", { name: /contact support/i });

  // The 404 is where someone lands after following a link that no longer
  // works - the one page where a way to say so is worth more than usual.
  await expect(support).toBeVisible();
  await expect(support).toHaveAttribute("href", /^mailto:/);
});

test.describe("the 404 is themed like the rest of the site", () => {
  for (const theme of themes) {
    test(`it honours a stored ${theme} theme`, async ({ page }) => {
      await loadWithTheme(page, NOT_FOUND, theme);

      // Worth pinning rather than assuming: every one of these pages was
      // hard-coded to light classes once (bg-stone-50, text-zinc-950) and
      // ignored data-theme entirely. The a11y sweeps check contrast within
      // whichever theme is applied, so a page that silently refused to go
      // dark would pass all of them.
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);

      const painted = await page.evaluate(() => {
        const parse = (colour: string) => (colour.match(/[\d.]+/g) || []).map(Number);
        return parse(getComputedStyle(document.body).backgroundColor).slice(0, 3);
      });
      const brightness = (painted[0] + painted[1] + painted[2]) / 3;

      if (theme === "dark") {
        expect(brightness, `the dark 404 painted rgb(${painted})`).toBeLessThan(80);
      } else {
        expect(brightness, `the light 404 painted rgb(${painted})`).toBeGreaterThan(200);
      }
    });
  }
});
