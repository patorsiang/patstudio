import { describe, expect, test } from "bun:test";

import { candidateWidths, renderPostBody } from "./render";
import { RAW_CONTENT_BASE } from "./source";

type Sizes = ReadonlyMap<string, readonly [number, number]>;

const noSizes: Sizes = new Map();

/** The one host `POST_IMAGE_SOURCES` allows, spelled through the real base. */
const repoImage = `${RAW_CONTENT_BASE}assets/hero.jpg`;

describe("renderPostBody", () => {
  test("renders markdown to HTML", () => {
    const html = renderPostBody("## A heading\n\nSome **bold** text.", { imageSizes: noSizes });

    expect(html).toContain("<h2");
    expect(html).toContain("<strong>bold</strong>");
  });

  // The whole reason a sanitiser is a dependency rather than a nicety. The
  // source lives in a second repo, and style-src already allows unsafe-inline.
  test("strips a script tag from the body", () => {
    const html = renderPostBody("Before\n\n<script>alert(1)</script>\n\nAfter", {
      imageSizes: noSizes,
    });

    expect(html).not.toContain("<script");
    expect(html).not.toContain("alert(1)");
    expect(html).toContain("Before");
  });

  test("strips an inline event handler", () => {
    const html = renderPostBody('<img src="/x.png" onerror="alert(1)">', { imageSizes: noSizes });

    expect(html).not.toContain("onerror");
  });

  // The point of the whole arrangement: the reader gets a same-origin URL the
  // optimizer can resize and re-encode, not the 500KB original. Same-origin
  // also means img-src 'self' needs no widening - remotePatterns is the
  // allowlist instead.
  test("sends an allowlisted image through the optimizer", () => {
    const html = renderPostBody(`![Hero](${repoImage})`, { imageSizes: noSizes });

    expect(html).toContain(`src="/_next/image?url=${encodeURIComponent(repoImage)}&amp;w=1920`);
    expect(html).toContain("q=75");
    expect(html).not.toContain(`src="${repoImage}"`);
  });

  test("offers every candidate width as a srcset, with sizes to pick between them", () => {
    const html = renderPostBody(`![Hero](${repoImage})`, { imageSizes: noSizes });

    for (const width of [256, 384, 640, 828, 1080, 1920]) {
      expect(html).toContain(`w=${width}&amp;q=75 ${width}w`);
    }

    // `auto` leads so a browser that supports it uses the width the image
    // actually laid out at - the in-table case, where a fixed 672px claim
    // fetches four times the pixels the slot can show.
    expect(html).toContain('sizes="auto, (max-width: 704px) 100vw, 672px"');
  });

  // Without these the image reflows the article as it loads, which is a
  // Core Web Vital, not a cosmetic detail.
  test("reserves the image's box when the manifest knows its dimensions", () => {
    const html = renderPostBody(`![Hero](${repoImage})`, {
      imageSizes: new Map([[repoImage, [2048, 1365] as const]]),
    });

    expect(html).toContain('width="2048"');
    expect(html).toContain('height="1365"');
  });

  // A missing manifest entry costs the reservation and nothing else. This is
  // the failure mode that replaced "renders as a link", and it has to stay
  // this boring.
  test("still renders an image the manifest has never seen", () => {
    const html = renderPostBody(`![Hero](${repoImage})`, { imageSizes: noSizes });

    expect(html).toContain("<img");
    expect(html).not.toContain("width=");
    expect(html).not.toContain("height=");
  });

  // Asking for 1920 from a 1200px original spends a transformation to get the
  // same pixels back: the optimizer does not upscale.
  test("does not ask for a transform wider than the original", () => {
    const html = renderPostBody(`![Hero](${repoImage})`, {
      imageSizes: new Map([[repoImage, [900, 600] as const]]),
    });

    expect(html).toContain("w=640");
    expect(html).not.toContain("w=1080");
    expect(html).not.toContain("w=1920");
  });

  // The optimizer answers a host outside remotePatterns with a 400, and
  // img-src 'self' would block the direct URL. A link is the only form that
  // actually reaches the reader; adding the host to POST_IMAGE_SOURCES is how
  // it becomes an image.
  test("degrades an image from a host outside the allowlist to a link", () => {
    const html = renderPostBody("![Hero](https://cdn.example.com/new.webp)", {
      imageSizes: noSizes,
    });

    expect(html).not.toContain("<img");
    expect(html).not.toContain("/_next/image");
    expect(html).toContain('href="https://cdn.example.com/new.webp"');
    expect(html).toContain("Hero");
  });

  test("leaves an already-local image alone", () => {
    const html = renderPostBody("![Mark](/icons/icon-192.png)", { imageSizes: noSizes });

    expect(html).toContain('src="/icons/icon-192.png"');
    expect(html).not.toContain("/_next/image");
  });

  // A post is written to read on GitHub, so an image committed beside it is
  // `../assets/x.jpg`. remotePatterns matches the resolved URL, and the
  // manifest is keyed by it, so resolution has to happen first or every such
  // image degrades to a link.
  test("resolves a repo-relative image before deciding it is optimizable", () => {
    const html = renderPostBody("![Hero](../assets/hero.jpg)", {
      imageSizes: new Map([[repoImage, [1600, 900] as const]]),
    });

    expect(html).toContain(`src="/_next/image?url=${encodeURIComponent(repoImage)}`);
    expect(html).toContain('width="1600"');
    expect(html).not.toContain("../assets");
  });

  // Not only images: the video in a post is a plain link wrapping a poster.
  test("rewrites a repo-relative link to its absolute source", () => {
    const html = renderPostBody("[the clip](../assets/clip.mp4)", { imageSizes: noSizes });

    expect(html).toContain(`href="${RAW_CONTENT_BASE}assets/clip.mp4"`);
    expect(html).toContain("the clip");
  });

  test("leaves an in-page anchor and an external link alone", () => {
    const html = renderPostBody("[jump](#section-6) [out](https://example.com/a)", {
      imageSizes: noSizes,
    });

    expect(html).toContain('href="#section-6"');
    expect(html).toContain('href="https://example.com/a"');
  });

  // `[![alt](img)](target)` is how a poster-image video link is written. The
  // link renderer must render its inline children, not escape them.
  test("keeps an image nested inside a link", () => {
    const html = renderPostBody(
      `[![Poster](${RAW_CONTENT_BASE}assets/poster.jpg)](../assets/clip.mp4)`,
      { imageSizes: noSizes },
    );

    expect(html).toContain(`href="${RAW_CONTENT_BASE}assets/clip.mp4"`);
    expect(html).toContain("/_next/image");
    expect(html).not.toContain("&lt;img");
  });
});

describe("candidateWidths", () => {
  test("offers every width when the source size is unknown", () => {
    expect(candidateWidths(undefined)).toEqual([256, 384, 640, 828, 1080, 1920]);
  });

  test("drops widths larger than the source", () => {
    expect(candidateWidths(1000)).toEqual([256, 384, 640, 828]);
  });

  // An empty srcset is an invalid attribute, so the smallest candidate stays
  // even when the source is smaller than all of them.
  test("keeps one candidate for a source smaller than every width", () => {
    expect(candidateWidths(200)).toEqual([256]);
  });

  // The sub-640 candidates are not decoration: without them `sizes="auto"`
  // works out that a 190px slot needs 190px and has nothing smaller than 640
  // to choose. Both halves of the fix, or neither.
  test("offers candidates below the smallest device width, for in-table images", () => {
    expect(candidateWidths(1600).filter((width) => width < 640)).toEqual([256, 384]);
  });
});
