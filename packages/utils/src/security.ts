import DOMPurify from "isomorphic-dompurify";

// Re-exported for existing consumers of "@patorsiang/utils" - see
// sanitize-url.ts for why the implementation lives there instead of here.
export { sanitizeUrl } from "./sanitize-url";

/**
 * Sanitizes HTML to prevent XSS.
 * By default, it allows a very limited set of safe formatting tags.
 */
export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["b", "strong", "i", "em", "br", "p", "span"],
    ALLOWED_ATTR: ["class"], // Allow classes for basic styling if needed
  });
}

/**
 * Sanitizes rendered post-body HTML.
 *
 * Wider than sanitizeHTML's five-tag allowlist because post bodies come from
 * CommonMark, not a hand-typed string: headings, links, lists, code blocks,
 * images and blockquotes are all legitimate content there. `lang` is
 * explicitly allowed — without it, the Thai-paragraph markup posts rely on
 * (`<span lang="th">`) would be silently stripped, which is a bilingual
 * accessibility feature failing shut rather than open.
 */
export function sanitizeArticleHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "p",
      "a",
      "strong",
      "em",
      "ul",
      "ol",
      "li",
      "blockquote",
      "code",
      "pre",
      "img",
      "hr",
      "br",
      "span",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "figure",
      "figcaption",
      "del",
    ],
    /*
     * srcset/sizes/width/height/decoding are here for post images, which
     * render.ts emits through /_next/image with a responsive srcset. DOMPurify
     * drops an unlisted attribute silently, so omitting them does not fail -
     * it just quietly serves one full-size image and loses the height
     * reservation that keeps CLS at zero. security.test.ts guards that.
     *
     * All five are presentational and non-executable. srcset does carry URLs,
     * but the only srcset values that exist here are the same-origin
     * /_next/image ones this codebase generates, and CSP img-src 'self'
     * remains the backstop either way.
     */
    ALLOWED_ATTR: [
      "href",
      "src",
      "srcset",
      "sizes",
      "width",
      "height",
      "decoding",
      "alt",
      "loading",
      "rel",
      "target",
      "lang",
    ],
  });
}
