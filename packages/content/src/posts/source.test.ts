import { describe, expect, test } from "bun:test";

import { RAW_CONTENT_BASE, resolvePostAssetUrl } from "./source";

describe("resolvePostAssetUrl", () => {
  // The bug this module exists for: posts are written to render on GitHub,
  // where `../assets/x.jpg` from `posts/x.md` is correct. Unresolved, that
  // href reaches the site as-is and 404s under /posts/.
  test("resolves a repo-relative path against the post's directory", () => {
    expect(resolvePostAssetUrl("../assets/hero.jpg")).toBe(`${RAW_CONTENT_BASE}assets/hero.jpg`);
  });

  test("resolves a path relative to the posts directory itself", () => {
    expect(resolvePostAssetUrl("./inline.png")).toBe(`${RAW_CONTENT_BASE}posts/inline.png`);
  });

  test("returns an absolute http url unchanged", () => {
    expect(resolvePostAssetUrl("https://cdn.example.com/a.webp")).toBe(
      "https://cdn.example.com/a.webp",
    );
  });

  // A site-absolute path is already correct for this site; rewriting it to the
  // source repo would break it.
  test("leaves a site-absolute path unresolved", () => {
    expect(resolvePostAssetUrl("/icons/icon-192.png")).toBeNull();
  });

  test("leaves a fragment unresolved", () => {
    expect(resolvePostAssetUrl("#section-6")).toBeNull();
  });

  test("leaves a non-http scheme unresolved", () => {
    expect(resolvePostAssetUrl("mailto:someone@example.com")).toBeNull();
    expect(resolvePostAssetUrl("data:image/png;base64,AAAA")).toBeNull();
  });
});
