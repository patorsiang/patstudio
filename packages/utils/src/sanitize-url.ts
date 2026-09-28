/**
 * Deliberately its own module, not part of security.ts: sanitizeUrl is pure
 * string logic with no DOM dependency, but security.ts imported
 * isomorphic-dompurify (for sanitizeHTML/sanitizeArticleHTML) at module
 * scope until 2026-09-28, when it moved to sanitize-html. Because @patorsiang/utils re-exports everything through one barrel
 * (src/index.ts), any consumer that only needed sanitizeUrl was still
 * pulling in isomorphic-dompurify's jsdom dependency at bundle time - which
 * broke every *dynamic* route built on that chain in production (jsdom's
 * transitive html-encoding-sniffer -> @exodus/bytes hit an ESM/CJS
 * interop error under Vercel's Node runtime: `ERR_REQUIRE_ESM`). Static/SSG
 * routes never showed it, because they only run that code at build time.
 *
 * cv-engine's markdown-export.ts (used by the /cv legacy-redirect and
 * /cv/export/* routes, all dynamic) imports sanitizeUrl from this file
 * directly - "@patorsiang/utils/sanitize-url" - instead of the main barrel,
 * so its bundle never touches isomorphic-dompurify at all.
 */
export function sanitizeUrl(url: string | undefined): string {
  if (!url) return "";

  const trimmedUrl = url.trim();

  // "//host" is protocol-relative - a browser resolves it against the
  // current scheme, so it is an external URL wearing an internal-path
  // disguise, not an internal path. Reject it before the "/" case below
  // would otherwise let it through.
  if (trimmedUrl.startsWith("//")) {
    return "about:blank";
  }

  // Allow only safe protocols
  if (
    trimmedUrl.startsWith("http://") ||
    trimmedUrl.startsWith("https://") ||
    trimmedUrl.startsWith("mailto:") ||
    trimmedUrl.startsWith("tel:") ||
    trimmedUrl.startsWith("/") ||
    trimmedUrl.startsWith("#")
  ) {
    return trimmedUrl;
  }

  // If it's a dangerous protocol or ambiguous, return a safe fallback
  return "about:blank";
}
