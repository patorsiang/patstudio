/**
 * Where posts come from, and how a href written inside one becomes a URL this
 * site can use.
 *
 * Separate from `fetch.ts` because `render.ts` needs the same resolution and
 * `fetch.ts` already imports `render.ts` - putting the base URL in `fetch.ts`
 * would make that a cycle. Both sides must agree on the answer: `fetch.ts`
 * uses it to decide what to vendor, `render.ts` to look the result up. A
 * disagreement here silently un-vendors an image.
 */
const OWNER = "patorsiang";
const REPO = "thinking-in-public";
const BRANCH = "main";

/** Trailing slash included: it is the base every post path resolves against. */
export const RAW_CONTENT_BASE = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/`;

export const CONTENTS_API_URL = `https://api.github.com/repos/${OWNER}/${REPO}/contents/posts?ref=${BRANCH}`;

export const rawUrl = (path: string) => `${RAW_CONTENT_BASE}${path}`;

/** Posts live in `posts/`, so a relative href resolves against that directory. */
const POSTS_BASE = rawUrl("posts/");

/**
 * The absolute URL a post's href points at, or `null` when the href already
 * means something correct on this site and must not be rewritten.
 *
 * Posts are authored to read on GitHub, where `../assets/hero.jpg` inside
 * `posts/x.md` is a working link. Delivered to this site unchanged, that href
 * resolves against `/posts/` and 404s - the source repo's directory layout is
 * not this site's routing. Resolving it here is what makes markdown that works
 * in the repo also work in the browser.
 */
export function resolvePostAssetUrl(href: string): string | null {
  const trimmed = href.trim();

  if (!trimmed) return null;

  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  // Already-correct-for-this-site paths and in-page anchors: not repo paths.
  if (trimmed.startsWith("/") || trimmed.startsWith("#")) return null;

  // Any other scheme (mailto:, data:, tel:) is a destination, not a repo path.
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return null;

  return new URL(trimmed, POSTS_BASE).toString();
}
