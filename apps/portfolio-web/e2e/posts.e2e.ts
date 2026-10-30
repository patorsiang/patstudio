import { test, expect } from "@playwright/test";

import { routes } from "./support/routes";

test("the index lists every post, newest first", async ({ page }) => {
  await page.goto("/posts");

  const headings = await page.locator("article h2").allTextContents();

  expect(headings.length).toBeGreaterThanOrEqual(3);

  const dates = await page
    .locator("article time")
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("datetime") ?? ""));
  const sorted = [...dates].toSorted((a, b) => b.localeCompare(a));

  expect(dates, "posts are not in newest-first order").toEqual(sorted);
});

test("a post renders its body", async ({ page }) => {
  await page.goto("/posts/bkkjs-summer-2026");

  await expect(page.getByRole("heading", { level: 1 })).toContainText(/BKK\.js/i);
  await expect(page.locator(".post-body")).toContainText(/Bangkok/i);
});

test("the title is not rendered twice", async ({ page }) => {
  await page.goto("/posts/bkkjs-summer-2026");

  // Front matter supplies the h1; the body's own h1 is stripped.
  await expect(page.locator("h1")).toHaveCount(1);
});

test("an unknown slug 404s", async ({ page }) => {
  const response = await page.goto("/posts/not-a-real-post");

  expect(response?.status()).toBe(404);
});

test("an unknown slug 404s, and still renders after hydration despite the missing initial theme (tracked limitation)", async ({
  page,
}) => {
  const response = await page.goto("/posts/not-a-real-post");
  expect(response?.status()).toBe(404);

  // Next.js limitation, not specific to this route: notFound() called from a
  // dynamic-fallback Server Component (dynamicParams: true, no static match)
  // omits the theme-bootstrap script and stylesheet from the FIRST response.
  // Confirmed permanent (not a one-time artifact) and pre-existing on
  // /cv/[role] too. Two fixes were tried and rejected: dynamicParams=false
  // (breaks ISR for genuinely new posts) and a nested not-found.tsx (doesn't
  // touch the document shell). The client does hydrate into the real styled
  // not-found.tsx — this test is the canary for that still being true.
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/page not found/i);
});

// img-src is 'self' data: blob:. Post images live on other hosts entirely and
// stay same-origin only because /_next/image serves the optimized copy from
// here - so this is the test that the whole arrangement still holds. A source
// URL that leaked into the page unoptimized is a blocked image nobody notices
// until they open the console.
test("every image in a post body is same-origin", async ({ page }) => {
  await page.goto("/posts/bkkjs-summer-2026");

  const foreign = await page
    .locator(".post-body img")
    .evaluateAll((images) =>
      images
        .map((image) => (image as HTMLImageElement).src)
        .filter((src) => new URL(src).origin !== location.origin),
    );

  expect(foreign, `post images from another origin: ${foreign.join(", ")}`).toEqual([]);
});

// The reason the bytes are no longer committed: every post image is resized
// and re-encoded on the way out. Without this, the src could silently go back
// to a raw full-size original and only a Lighthouse run would ever say so.
test("a post image is served resized and re-encoded by the optimizer", async ({
  page,
  request,
}) => {
  await page.goto("/posts/bkkjs-summer-2026");

  const image = page.locator(".post-body img").first();
  const source = await image.getAttribute("src");

  expect(source, "post image is not going through /_next/image").toContain("/_next/image?url=");

  // width/height come from the generated manifest and are what keep the
  // article from reflowing as images load.
  await expect(image).toHaveAttribute("width", /\d+/);
  await expect(image).toHaveAttribute("height", /\d+/);
  await expect(image).toHaveAttribute("srcset", /\d+w/);

  // The Accept header is not decoration: /_next/image negotiates the output
  // format from it, and a request without one gets the source format back
  // unchanged. Asking the way a browser asks is the only way to see AVIF.
  const optimized = await request.get(source!, {
    headers: { accept: "image/avif,image/webp,image/*,*/*;q=0.8" },
  });

  expect(optimized.status()).toBe(200);
  expect(optimized.headers()["content-type"]).toMatch(/image\/(avif|webp)/);
});

// WCAG 3.1.2 Language of Parts: a screen reader picks its voice from lang, so
// Thai text outside lang="th" is read with an English voice. This walks every
// text node on every post and the index, not one element on one post - the
// check it replaces passed while 32 of 32 Thai blocks on line-dev-conf-2026
// carried no lang at all.
const postPages = routes.filter((route) => route === "/posts" || route.startsWith("/posts/"));

for (const route of postPages) {
  test(`every Thai passage on ${route} is marked lang="th"`, async ({ page }) => {
    await page.goto(route);

    const result = await page.evaluate(() => {
      const thai = /[฀-๿]/;
      const walker = document.createTreeWalker(
        document.querySelector("main")!,
        NodeFilter.SHOW_TEXT,
      );
      const unmarked: string[] = [];
      let found = 0;

      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const text = node.textContent ?? "";

        // JSON-LD sits in a script tag inside main; nobody hears it.
        if (!thai.test(text) || node.parentElement?.closest("script, style")) continue;

        found += 1;

        if (!node.parentElement?.closest('[lang="th"]')) unmarked.push(text.trim().slice(0, 60));
      }

      return { found, unmarked };
    });

    expect(result.unmarked, "Thai text outside lang=th").toEqual([]);

    // Most posts are English only. These two carry Thai, so the loop cannot
    // pass vacuously on them.
    if (route === "/posts/line-dev-conf-2026" || route === "/posts/bkkjs-summer-2026") {
      expect(result.found, "no Thai text found - the test is vacuous").toBeGreaterThan(0);
    }
  });
}

test("posts appear in the sitemap", async ({ request }) => {
  const body = await (await request.get("/sitemap.xml")).text();

  expect(body).toContain("/posts");
  expect(body).toContain("/posts/bkkjs-summer-2026");
});

test("a post has its own OG image, distinct from the site default", async ({ page, request }) => {
  const imageResponse = await request.get("/posts/bkkjs-summer-2026/opengraph-image");
  expect(imageResponse.status()).toBe(200);
  expect(imageResponse.headers()["content-type"]).toContain("image/png");

  await page.goto("/posts/bkkjs-summer-2026");
  const ogImage = await page.locator('meta[property="og:image"]').getAttribute("content");

  expect(ogImage).toContain("/posts/bkkjs-summer-2026/opengraph-image");
});

test("a post page carries BreadcrumbList and BlogPosting structured data", async ({ page }) => {
  await page.goto("/posts/bkkjs-summer-2026");

  const scripts = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((nodes) => nodes.map((node) => JSON.parse(node.textContent ?? "null")));

  const breadcrumb = scripts.find((script) => script["@type"] === "BreadcrumbList");
  const blogPosting = scripts.find((script) => script["@type"] === "BlogPosting");

  expect(breadcrumb).toBeTruthy();
  expect(blogPosting).toMatchObject({
    headline: expect.stringContaining("BKK.js"),
    datePublished: "2026-06-14",
  });
});

// Scrolling is for a table that cannot fit; a 2-3 column image comparison can,
// and the point of one is seeing the images side by side. A blanket table
// min-width once made those scroll on a phone too.
test("on a phone only a wide table scrolls, not a narrow image comparison", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/posts/four-frameworks-one-question-2026");

  const tables = await page.locator(".post-body .table-scroll").evaluateAll((wrappers) =>
    wrappers.map((wrapper) => ({
      columns: wrapper.querySelector("tr")?.children.length ?? 0,
      scrolls: wrapper.scrollWidth > wrapper.clientWidth + 1,
    })),
  );

  const narrow = tables.filter((table) => table.columns <= 3);
  const wide = tables.filter((table) => table.columns >= 4);

  expect(narrow.length, "no narrow table to check - the test is vacuous").toBeGreaterThan(0);
  expect(wide.length, "no wide table to check - the test is vacuous").toBeGreaterThan(0);
  expect(narrow.filter((table) => table.scrolls)).toEqual([]);
  expect(wide.every((table) => table.scrolls)).toBe(true);
});
