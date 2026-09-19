import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { buildPageMetadata, normalizeSiteUrl } from "./seo";

const seoSourcePath = join(import.meta.dir, "seo.ts");

describe("normalizeSiteUrl", () => {
  test("passes through an undefined value", () => {
    expect(normalizeSiteUrl(undefined)).toBeUndefined();
  });

  test("prepends https to a schemeless value", () => {
    // Vercel's own VERCEL_URL convention is a bare host, and it's an easy
    // value to paste into NEXT_PUBLIC_SITE_URL by mistake - `new URL()`
    // throws on it, which previously crashed the production build.
    expect(normalizeSiteUrl("patstudio.vercel.app")).toBe("https://patstudio.vercel.app");
  });

  test("leaves an https value untouched", () => {
    expect(normalizeSiteUrl("https://example.com")).toBe("https://example.com");
  });

  test("leaves an http value untouched", () => {
    expect(normalizeSiteUrl("http://localhost:3000")).toBe("http://localhost:3000");
  });
});

describe("siteUrl fallback", () => {
  // siteUrl is computed once at module load from process.env, so a test
  // can't override the env and re-check the live binding. Pin the source
  // string instead - this is what would have caught the fallback silently
  // pointing at the decommissioned patorsiang.github.io GitHub Pages site.
  test("falls back to the current production origin, not a decommissioned one", () => {
    const source = readFileSync(seoSourcePath, "utf8");

    expect(source).toContain('"https://patstudio.vercel.app"');
    expect(source).not.toContain("patorsiang.github.io");
  });
});

describe("buildPageMetadata — off-site canonical", () => {
  test("defaults canonical to the page's own path", () => {
    const metadata = buildPageMetadata({
      title: "Posts",
      description: "Learning in public.",
      path: "/posts",
    });

    expect(metadata.alternates?.canonical).toBe("/posts");
  });

  // A post backfilled from Medium is a copy. Pointing canonical at the
  // original is the whole reason the field exists; OpenGraph still names
  // this page, because that is the URL being shared.
  test("hands canonical to the original while og:url stays on this page", () => {
    const metadata = buildPageMetadata({
      title: "Overall of CSS Meetup",
      description: "Notes from the meetup.",
      path: "/posts/css-meetup-2023",
      canonical: "https://medium.com/@x/overall-of-css-meetup-16-08-2023-1289d8b615f2",
    });

    expect(metadata.alternates?.canonical).toBe(
      "https://medium.com/@x/overall-of-css-meetup-16-08-2023-1289d8b615f2",
    );
    expect(metadata.openGraph?.url).toBe("/posts/css-meetup-2023");
  });
});
