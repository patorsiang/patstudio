import { test, expect } from "@playwright/test";

/**
 * A sitemap is a set of promises to a crawler, and nothing in the build checks
 * that the app keeps them. These tests do.
 *
 * The one that matters is that every listed URL answers 200. Listing a URL that
 * redirects is the easy mistake here, because `/cv` and `/cv/[role]` are real,
 * linked, working routes - they just are not canonical. Pointing a crawler at
 * them spends its budget rediscovering `/[lang]/cv/[role]`, and splits the
 * signal between two URLs for one page.
 *
 * Requests go to the local server, so only each entry's pathname is used - the
 * origin in the file comes from NEXT_PUBLIC_SITE_URL and is whatever the deploy
 * target is.
 */

/** Routes that exist and work, but redirect - so must never be advertised. */
const redirectingRoutes = ["/cv", "/cv/fullstack-engineer"];

test("sitemap.xml is served and well-formed", async ({ request }) => {
  const response = await request.get("/sitemap.xml");

  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("xml");

  const body = await response.text();
  expect(body).toContain("<urlset");
  expect(locationsIn(body).length).toBeGreaterThan(0);
});

test("robots.txt is served and points at the sitemap", async ({ request }) => {
  const response = await request.get("/robots.txt");

  expect(response.status()).toBe(200);

  const body = await response.text();
  expect(body).toMatch(/^User-Agent: \*/im);
  expect(body).toMatch(/^Sitemap: https?:\/\/\S+\/sitemap\.xml$/im);
});

test("every sitemap URL is canonical - 200, never a redirect", async ({ request }) => {
  const body = await (await request.get("/sitemap.xml")).text();
  const paths = locationsIn(body).map((url) => new URL(url).pathname);

  const problems: string[] = [];

  for (const path of paths) {
    // maxRedirects: 0 so a 3xx surfaces instead of being silently followed to a
    // 200, which is exactly the bug this test exists to catch.
    const response = await request.get(path, { maxRedirects: 0 });
    const status = response.status();

    if (status !== 200) {
      const target = response.headers()["location"];
      problems.push(
        `${path} -> ${status}${target ? ` (redirects to ${target})` : ""}` +
          (status >= 300 && status < 400 ? " - list the destination instead" : ""),
      );
    }
  }

  expect(problems, `Non-canonical URLs in sitemap.xml:\n${problems.join("\n  ")}`).toEqual([]);
});

test("the CV redirect routes are not advertised", async ({ request }) => {
  const body = await (await request.get("/sitemap.xml")).text();
  const paths = new Set(locationsIn(body).map((url) => new URL(url).pathname));

  for (const route of redirectingRoutes) {
    expect(paths.has(route), `${route} redirects and must not be in the sitemap`).toBe(false);
  }

  // The canonical form it redirects to should be there in its place.
  expect(paths.has("/en/cv/fullstack-engineer")).toBe(true);
});

test("post entries carry lastModified from their real publish date; other entries don't", async ({
  request,
}) => {
  const body = await (await request.get("/sitemap.xml")).text();

  const postEntry = entryFor(body, "/posts/bkkjs-summer-2026");
  expect(postEntry).toContain("<lastmod>2026-06-14");

  const aboutEntry = entryFor(body, "/about");
  expect(aboutEntry).not.toContain("<lastmod>");
});

function locationsIn(xml: string): string[] {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim());
}

function entryFor(xml: string, path: string): string {
  const entries = [...xml.matchAll(/<url>[\s\S]*?<\/url>/g)].map((match) => match[0]);
  const entry = entries.find((candidate) => new URL(locationsIn(candidate)[0]).pathname === path);

  if (!entry) {
    throw new Error(`No sitemap entry found for ${path}`);
  }

  return entry;
}
