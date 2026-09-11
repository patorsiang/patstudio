import { describe, expect, test } from "bun:test";

import { POST_IMAGE_SOURCES, isOptimizableImageUrl, matchesPathname } from "./image-hosts";
import { RAW_CONTENT_BASE } from "./source";

describe("isOptimizableImageUrl", () => {
  // The allowlist and the content base are set independently; if they ever
  // drift apart, every post image quietly degrades to a link and the only
  // symptom is that the post stops having pictures.
  test("accepts an image under the content base posts are actually fetched from", () => {
    expect(isOptimizableImageUrl(`${RAW_CONTENT_BASE}assets/hero.jpg`)).toBe(true);
  });

  test("rejects another repo on the same host", () => {
    expect(
      isOptimizableImageUrl("https://raw.githubusercontent.com/patorsiang/other/main/x.jpg"),
    ).toBe(false);
  });

  test("rejects another host", () => {
    expect(isOptimizableImageUrl("https://cdn.example.com/hero.webp")).toBe(false);
  });

  // remotePatterns pins the protocol, so http must not slip through a
  // hostname check that only looked at the host.
  test("rejects http on an allowed host", () => {
    expect(
      isOptimizableImageUrl("http://raw.githubusercontent.com/patorsiang/thinking-in-public/x.jpg"),
    ).toBe(false);
  });

  // A repo-relative href reaches this function only after resolvePostAssetUrl;
  // anything still relative is not a URL and must not match by accident.
  test("rejects a string that is not an absolute URL", () => {
    expect(isOptimizableImageUrl("../assets/hero.jpg")).toBe(false);
    expect(isOptimizableImageUrl("")).toBe(false);
  });

  test("every source is https, since remotePatterns pins the protocol", () => {
    for (const source of POST_IMAGE_SOURCES) {
      expect(source.protocol).toBe("https");
    }
  });
});

describe("matchesPathname", () => {
  test("matches any depth under a trailing wildcard", () => {
    expect(matchesPathname("/a/**", "/a/b/c/d.jpg")).toBe(true);
    expect(matchesPathname("/a/**", "/b/c.jpg")).toBe(false);
  });

  // `/a/**` must not also match `/announcements` - a prefix check without the
  // separator is how an allowlist accidentally widens.
  test("does not match a sibling path that merely shares a prefix", () => {
    expect(matchesPathname("/a/**", "/ab/c.jpg")).toBe(false);
  });

  test("requires an exact match without a wildcard", () => {
    expect(matchesPathname("/a/b.jpg", "/a/b.jpg")).toBe(true);
    expect(matchesPathname("/a/b.jpg", "/a/b.jpg/c")).toBe(false);
  });
});
