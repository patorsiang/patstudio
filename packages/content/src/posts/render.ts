// Subpath, not the main barrel: this is the one file in the app that
// actually needs DOMPurify - see packages/utils/src/index.ts.
import { sanitizeArticleHTML } from "@patorsiang/utils/security";
import { marked } from "marked";

import { isOptimizableImageUrl } from "./image-hosts";
import { resolvePostAssetUrl } from "./source";

type RenderOptions = {
  /**
   * Source image URL to its intrinsic `[width, height]`, as measured by
   * `scripts/post-image-manifest.ts`.
   *
   * Only used to set `width`/`height` (so the browser reserves the right box
   * and CLS stays at zero) and to avoid asking the optimizer for a transform
   * larger than the original. A missing entry is not an error - the image
   * still renders, it just reflows on load.
   */
  readonly imageSizes: ReadonlyMap<string, readonly [number, number]>;
};

const isLocal = (url: string) => url.startsWith("/");

/** The post body is `max-w-2xl`; see apps/portfolio-web/src/app/posts/[slug]/page.tsx. */
const BODY_WIDTH = 672;

/**
 * `auto` first, and it is doing the real work: posts put images inside
 * comparison tables, where one renders at ~190px in a 672px column. A fixed
 * `sizes` claims every image is full-width and makes the browser download a
 * 828w candidate for a 190px slot - measured, on
 * four-frameworks-one-question-2026, for eight of its ten images.
 *
 * `sizes="auto"` (valid only on a lazy image, which these all are) lets the
 * browser use the width the image actually laid out at. Where it is not
 * supported the browser falls through to the two descriptors after it, which
 * are the full-width assumption - correct for a body image, merely wasteful
 * for a table one, and exactly the behaviour that shipped before.
 */
const SIZES = `auto, (max-width: ${BODY_WIDTH + 32}px) 100vw, ${BODY_WIDTH}px`;

/**
 * Every width here must appear in Next's `images.deviceSizes`
 * (640, 750, 828, 1080, 1200, 1920, 2048, 3840 by default) or its
 * `images.imageSizes` (16, 32, 48, 64, 96, 128, 256, 384). The optimizer
 * answers a width outside both lists with a 400 - there is no nearest-match
 * fallback - so a "nicer" number here is a broken image, not a slightly
 * different one.
 *
 * 256 and 384 come from `imageSizes` and exist for the in-table case: without
 * a candidate below 640, `sizes="auto"` correctly works out that a 190px slot
 * needs 190px and then has nothing smaller than 640 to pick. The two together
 * are the fix; either alone does nothing.
 *
 * The rest cover a 672px column: 640 for a phone at 1x, 828/1080 at 1x-1.5x,
 * 1920 at 2x.
 */
const CANDIDATE_WIDTHS = [256, 384, 640, 828, 1080, 1920] as const;

const optimizedSrc = (url: string, width: number) =>
  // q=75 deliberately: Next 16 rejects any quality not listed in
  // `images.qualities`, and 75 is the built-in default. Another value would
  // mean another config entry for a difference nobody can see.
  `/_next/image?url=${encodeURIComponent(url)}&w=${width}&q=75`;

/**
 * Exported for testing. Never asks for a transform wider than the original -
 * the optimizer will not upscale, so those candidates cost a transformation
 * and return the same pixels as the one below them. Keeps the smallest
 * candidate when the source is smaller than all of them, so `srcset` is never
 * empty.
 */
export function candidateWidths(sourceWidth: number | undefined): number[] {
  if (sourceWidth === undefined) return [...CANDIDATE_WIDTHS];

  const fits = CANDIDATE_WIDTHS.filter((width) => width <= sourceWidth);

  return fits.length > 0 ? fits : [CANDIDATE_WIDTHS[0]];
}

/**
 * The renderer below builds raw HTML strings before sanitizeArticleHTML ever
 * sees them - safety today rests entirely on DOMPurify's ALLOWED_ATTR
 * excluding event handlers, with no independent layer if that ever changes.
 * Escaping href/text here means a crafted alt or URL can't break out of the
 * attribute or tag in the first place.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Turns a post body into HTML that is safe to inject.
 *
 * Sanitising is not optional even though the author wrote the content. This is
 * the first HTML on the site not authored in TSX, `style-src` already allows
 * 'unsafe-inline', and the source lives in a second repo - if that repo is ever
 * compromised, or a post embeds a raw HTML block, this is the only thing
 * between it and the reader.
 */
export function renderPostBody(markdown: string, { imageSizes }: RenderOptions): string {
  const renderer = new marked.Renderer();

  renderer.image = ({ href, text }) => {
    const safeAlt = escapeHtml(text);

    if (isLocal(href)) {
      return `<img src="${escapeHtml(href)}" alt="${safeAlt}" loading="lazy" />`;
    }

    // Posts are authored to read on GitHub, so an image committed beside the
    // post is written `../assets/x.jpg`. The manifest is keyed by the resolved
    // URL and `remotePatterns` matches on it, so resolution has to happen
    // before either is consulted.
    const source = resolvePostAssetUrl(href) ?? href;

    if (!isOptimizableImageUrl(source)) {
      // A host `remotePatterns` doesn't cover would 400 at the optimizer, and
      // pointing straight at it instead would be blocked by img-src 'self'
      // anyway. A link is the only form that actually reaches the reader.
      // Add the host to POST_IMAGE_SOURCES to turn this into an image.
      return `<a href="${escapeHtml(source)}" rel="noreferrer" target="_blank">${safeAlt}</a>`;
    }

    const size = imageSizes.get(source);
    const widths = candidateWidths(size?.[0]);
    const srcset = widths.map((width) => `${optimizedSrc(source, width)} ${width}w`).join(", ");

    // Only ever both or neither: one half of an aspect ratio reserves nothing
    // and makes the layout worse than leaving it to the CSS.
    const dimensions = size ? ` width="${size[0]}" height="${size[1]}"` : "";

    return (
      `<img src="${escapeHtml(optimizedSrc(source, widths[widths.length - 1]))}"` +
      ` srcset="${escapeHtml(srcset)}" sizes="${escapeHtml(SIZES)}"${dimensions}` +
      ` alt="${safeAlt}" loading="lazy" decoding="async" />`
    );
  };

  /**
   * Overridden for the href only. A post can link a repo file directly - the
   * video is `[![poster](../assets/poster.jpg)](../assets/clip.mp4)` - and that
   * href needs the same resolution an image's does. `tokens` is parsed rather
   * than escaped so a nested image still renders as one; a regular function is
   * required for `this.parser`.
   */
  renderer.link = function ({ href, tokens }) {
    const target = resolvePostAssetUrl(href) ?? href;

    return `<a href="${escapeHtml(target)}">${this.parser.parseInline(tokens)}</a>`;
  };

  const html = marked.parse(markdown, { renderer, async: false });

  return sanitizeArticleHTML(html);
}
