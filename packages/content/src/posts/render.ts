// Subpath, not the main barrel: this is the one file in the app that
// actually needs the HTML sanitiser - see packages/utils/src/index.ts.
import { splitThai } from "@patorsiang/utils";
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
 * sees them - safety today rests entirely on the sanitiser's attribute allowlist
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

    // The src is the fallback for a browser that ignores srcset, so it wants the
    // largest candidate. CANDIDATE_WIDTHS is ascending and filter preserves
    // order, so that is the last element - but Math.max says which one it is
    // rather than where it sits, and types as number, where .at(-1) would widen
    // to number | undefined and fail optimizedSrc's signature.
    const largest = Math.max(...widths);

    return (
      `<img src="${escapeHtml(optimizedSrc(source, largest))}"` +
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

  return focusableCodeBlocks(wrapTables(markThai(sanitizeArticleHTML(html))));
}

const VOID_TAGS = new Set(["area", "br", "col", "hr", "img", "input", "wbr"]);

/**
 * Wraps each run of Thai script in `<span lang="th">`, so a screen reader
 * switches to a Thai voice for it (WCAG 3.1.2). The author does not mark the
 * Thai, and posts mix it with English inside one sentence, so this is done per
 * run rather than per paragraph.
 *
 * Works on the sanitised string, like `wrapTables`, because it only touches
 * text between tags - the sanitiser escapes `<` and `>` in both text and
 * attribute values, so splitting on `<...>` cannot cut a tag in half. Thai
 * inside an attribute (an image's alt) stays as it is. Text already inside a
 * `lang="th"` element is skipped, so a post that marks its own Thai does not
 * get a second span nested in the first.
 */
function markThai(html: string): string {
  // One entry per open element: does it carry lang="th"?
  const open: boolean[] = [];

  return html
    .split(/(<[^>]*>)/)
    .map((chunk) => {
      if (chunk.startsWith("<")) {
        const tag = /^<(\/?)([a-z][a-z0-9]*)/i.exec(chunk);

        if (!tag) return chunk;

        if (tag[1]) {
          open.pop();
        } else if (!VOID_TAGS.has(tag[2].toLowerCase()) && !chunk.endsWith("/>")) {
          open.push(/\slang="th"/.test(chunk));
        }

        return chunk;
      }

      if (open.some(Boolean)) return chunk;

      return splitThai(chunk)
        .map((part) => (part.thai ? `<span lang="th">${part.text}</span>` : part.text))
        .join("");
    })
    .join("");
}

/**
 * Gives each table a horizontal scroll container, so a wide one scrolls
 * inside the post body instead of running past a phone's edge, where `main`'s
 * `overflow-hidden` clips it out of reach. `tabindex="0"` and the region role
 * let a keyboard user scroll it.
 *
 * Done on the sanitised string rather than in a marked renderer because the
 * sanitiser allowlist has no `div`, `class`, `role` or `tabindex` - widening it
 * would let post content supply them too. The sanitiser re-emits a bare
 * `<table>` (no attribute is allowed on it) and markdown cannot nest tables,
 * so the literal tags are unambiguous.
 */
function wrapTables(html: string): string {
  return html
    .replaceAll(
      "<table>",
      '<div class="table-scroll" role="region" aria-label="Scrollable table" tabindex="0"><table>',
    )
    .replaceAll("</table>", "</table></div>");
}

/**
 * Makes each code block focusable, so a keyboard user can scroll one whose line
 * runs wider than the column (axe: scrollable-region-focusable, WCAG 2.1.1).
 *
 * Done after sanitising for the same reason as `wrapTables`: the allowlist has
 * no `tabindex`, and widening it would let post content supply one. The
 * sanitiser re-emits a bare `<pre>`, so the literal tag is unambiguous.
 */
function focusableCodeBlocks(html: string): string {
  return html.replaceAll("<pre>", '<pre tabindex="0">');
}
