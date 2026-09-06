import { describe, expect, test } from "bun:test";

import { renderPostBody } from "./render";
import { RAW_CONTENT_BASE } from "./source";

const noImages = new Map<string, string>();

describe("renderPostBody", () => {
  test("renders markdown to HTML", () => {
    const html = renderPostBody("## A heading\n\nSome **bold** text.", {
      vendoredImages: noImages,
    });

    expect(html).toContain("<h2");
    expect(html).toContain("<strong>bold</strong>");
  });

  // The whole reason a sanitiser is a dependency rather than a nicety. The
  // source lives in a second repo, and style-src already allows unsafe-inline.
  test("strips a script tag from the body", () => {
    const html = renderPostBody("Before\n\n<script>alert(1)</script>\n\nAfter", {
      vendoredImages: noImages,
    });

    expect(html).not.toContain("<script");
    expect(html).not.toContain("alert(1)");
    expect(html).toContain("Before");
  });

  test("strips an inline event handler", () => {
    const html = renderPostBody('<img src="/x.png" onerror="alert(1)">', {
      vendoredImages: noImages,
    });

    expect(html).not.toContain("onerror");
  });

  test("rewrites a vendored image to its local path", () => {
    const html = renderPostBody("![Hero](https://cdn.example.com/hero.webp)", {
      vendoredImages: new Map([["https://cdn.example.com/hero.webp", "/posts/x/hero.webp"]]),
    });

    expect(html).toContain('src="/posts/x/hero.webp"');
    expect(html).not.toContain("cdn.example.com");
  });

  // ISR revalidation runs on a read-only filesystem and cannot vendor. Between
  // deploys, a newly added image has no local file - a link is a working
  // affordance where a broken <img> is just a hole in the page.
  test("degrades an unvendored image to a link rather than a broken image", () => {
    const html = renderPostBody("![Hero](https://cdn.example.com/new.webp)", {
      vendoredImages: noImages,
    });

    expect(html).not.toContain("<img");
    expect(html).toContain('href="https://cdn.example.com/new.webp"');
    expect(html).toContain("Hero");
  });

  test("leaves an already-local image alone", () => {
    const html = renderPostBody("![Mark](/icons/icon-192.png)", { vendoredImages: noImages });

    expect(html).toContain('src="/icons/icon-192.png"');
  });

  // A post is written to read on GitHub, so an image committed beside it is
  // `../assets/x.jpg`. The vendored map is keyed by resolved URL, and the
  // lookup has to resolve the same way or every such image misses.
  test("rewrites a vendored repo-relative image to its local path", () => {
    const html = renderPostBody("![Hero](../assets/hero.jpg)", {
      vendoredImages: new Map([[`${RAW_CONTENT_BASE}assets/hero.jpg`, "/posts/x/image-1.jpg"]]),
    });

    expect(html).toContain('src="/posts/x/image-1.jpg"');
    expect(html).not.toContain("../assets");
  });

  // The link fallback is only a working affordance if the href works. Left
  // relative, it resolves against /posts/ on this site and 404s - which is
  // worse than a broken image, because it looks deliberate.
  test("points an unvendored repo-relative image at its absolute source", () => {
    const html = renderPostBody("![Hero](../assets/hero.jpg)", { vendoredImages: noImages });

    expect(html).toContain(`href="${RAW_CONTENT_BASE}assets/hero.jpg"`);
    expect(html).not.toContain('href="../assets');
  });

  // Not only images: the video in a post is a plain link wrapping a poster.
  test("rewrites a repo-relative link to its absolute source", () => {
    const html = renderPostBody("[the clip](../assets/clip.mp4)", { vendoredImages: noImages });

    expect(html).toContain(`href="${RAW_CONTENT_BASE}assets/clip.mp4"`);
    expect(html).toContain("the clip");
  });

  test("leaves an in-page anchor and an external link alone", () => {
    const html = renderPostBody("[jump](#section-6) [out](https://example.com/a)", {
      vendoredImages: noImages,
    });

    expect(html).toContain('href="#section-6"');
    expect(html).toContain('href="https://example.com/a"');
  });

  // `[![alt](img)](target)` is how a poster-image video link is written. The
  // link renderer must render its inline children, not escape them.
  test("keeps an image nested inside a link", () => {
    const html = renderPostBody("[![Poster](../assets/poster.jpg)](../assets/clip.mp4)", {
      vendoredImages: new Map([[`${RAW_CONTENT_BASE}assets/poster.jpg`, "/posts/x/image-1.jpg"]]),
    });

    expect(html).toContain(`href="${RAW_CONTENT_BASE}assets/clip.mp4"`);
    expect(html).toContain('src="/posts/x/image-1.jpg"');
    expect(html).not.toContain("&lt;img");
  });
});
