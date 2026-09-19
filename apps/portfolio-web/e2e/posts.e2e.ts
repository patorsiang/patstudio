import { test, expect } from "@playwright/test";

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

test("Thai paragraphs are marked up as Thai", async ({ page }) => {
  await page.goto("/posts/bkkjs-summer-2026");

  const thai = page.locator('.post-body [lang="th"]');

  await expect(thai.first(), "no Thai passage carries lang=th").toBeVisible();
});

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
