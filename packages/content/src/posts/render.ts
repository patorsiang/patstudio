// Subpath, not the main barrel: this is the one file in the app that
// actually needs DOMPurify - see packages/utils/src/index.ts.
import { sanitizeArticleHTML } from "@patorsiang/utils/security";
import { marked } from "marked";

import { resolvePostAssetUrl } from "./source";

type RenderOptions = {
  /** Original image URL to vendored local path. */
  readonly vendoredImages: ReadonlyMap<string, string>;
};

const isLocal = (url: string) => url.startsWith("/");

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
export function renderPostBody(markdown: string, { vendoredImages }: RenderOptions): string {
  const renderer = new marked.Renderer();

  renderer.image = ({ href, text }) => {
    const safeAlt = escapeHtml(text);

    if (isLocal(href)) {
      return `<img src="${escapeHtml(href)}" alt="${safeAlt}" loading="lazy" />`;
    }

    // Posts are authored to read on GitHub, so an image committed beside the
    // post is written `../assets/x.jpg`. `selectImageUrls` keys the vendored
    // map by the resolved URL, so the lookup has to resolve identically.
    const source = resolvePostAssetUrl(href) ?? href;
    const vendored = vendoredImages.get(source);

    if (vendored) {
      return `<img src="${escapeHtml(vendored)}" alt="${safeAlt}" loading="lazy" />`;
    }

    // Not vendored yet: ISR cannot write to public/, so between deploys a new
    // image has no local file. A link works; a broken image does not - but
    // only if the href is absolute. A repo-relative one resolves against
    // /posts/ here and 404s, which reads as deliberate rather than pending.
    return `<a href="${escapeHtml(source)}" rel="noreferrer" target="_blank">${safeAlt}</a>`;
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
