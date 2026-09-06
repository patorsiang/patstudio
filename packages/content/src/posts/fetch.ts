import { parsePost } from "./parse";
import { renderPostBody } from "./render";
import { CONTENTS_API_URL, rawUrl, resolvePostAssetUrl } from "./source";
import type { Post, RawPost } from "../types/post";

/**
 * Exported for testing: ordering is a pure decision, worth asserting directly.
 * Generic so it works for both `fetchPosts`'s `Post[]` and `fetchRawPosts`'s
 * `RawPost[]` without losing the raw/sanitised distinction on the way out.
 */
export function orderPosts<T extends Pick<Post, "date">>(posts: readonly T[]): T[] {
  return [...posts].sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Exported for testing. Every image a post points at somewhere other than this
 * site, as an absolute URL - the set the vendoring script downloads.
 *
 * Resolution happens before deduplication so that two spellings of the same
 * file collapse to one key. `render.ts` looks images up by the same resolved
 * URL; if the two ever disagree, an image is vendored under a key nothing
 * asks for and silently renders as a link instead.
 */
export function selectImageUrls(markdown: string): string[] {
  const found = [...markdown.matchAll(/!\[[^\]]*\]\(([^)]*)\)/g)]
    .map((match) => resolvePostAssetUrl(match[1].trim().split(/\s+/)[0]))
    .filter((url): url is string => url !== null);

  return [...new Set(found)];
}

/**
 * Exported for testing: header construction is the isolable piece, the same
 * way `settleFetchedPosts` is for the per-post failure path.
 *
 * `listPostPaths` is the only call that touches api.github.com, and
 * unauthenticated that endpoint allows 60 requests/hour **per IP**. GitHub
 * Actions runners share IPs with every other job on the fleet, so the budget is
 * spent by strangers and the listing 403s on nobody's schedule but theirs - it
 * failed a required check on an unrelated PR, and a plain re-run of identical
 * code passed. Authenticating raises the limit to 5000/hour.
 *
 * The token stays optional on purpose. Local dev and Vercel builds have no
 * `GITHUB_TOKEN`, and `thinking-in-public` is a public repo, so anonymous
 * access still works there - it is only the shared-IP case that needs help.
 * An absent token must therefore degrade to today's behaviour, never fail.
 */
export function githubApiHeaders(token: string | undefined): Record<string, string> {
  const headers: Record<string, string> = { Accept: "application/vnd.github+json" };

  // Empty and whitespace-only are treated as absent. CI routinely sets an unset
  // variable to "", and `Authorization: Bearer ` is worse than no header at
  // all: GitHub rejects a malformed credential with 401 rather than falling
  // back to the anonymous limit, converting a slow path into a hard failure.
  const trimmed = token?.trim();

  if (trimmed) {
    headers.Authorization = `Bearer ${trimmed}`;
  }

  return headers;
}

async function listPostPaths(): Promise<string[]> {
  const response = await fetch(
    CONTENTS_API_URL,
    // GH_TOKEN is the gh CLI's variable; accepted so a local run that already
    // has one authenticates without extra setup.
    { headers: githubApiHeaders(process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN) },
  );

  if (!response.ok) {
    throw new Error(`listing posts failed: ${response.status}`);
  }

  const entries = (await response.json()) as { name: string; type: string; path: string }[];

  return entries
    .filter((entry) => entry.type === "file" && entry.name.endsWith(".md"))
    .map((entry) => entry.path);
}

/**
 * Every post, newest first, with `body` still raw markdown - not rendered to
 * HTML.
 *
 * Exported separately from `fetchPosts` because the vendoring script needs
 * markdown link syntax (`![alt](url)`) to find image URLs with
 * `selectImageUrls`, and `renderPostBody` has already turned that into `<img>`
 * tags by the time `fetchPosts` returns. This is the single place that lists
 * and parses posts, so `fetchPosts` is defined in terms of it below rather
 * than duplicating the fetch-and-parse loop.
 *
 * Throws only if the listing itself fails, or if every path it names fails
 * to fetch or parse. A single post that fails (missing/malformed front
 * matter, a schema violation) is skipped and logged rather than failing the
 * whole batch - `thinking-in-public` is a personal archive committed to
 * independently of this codebase, and one malformed post should not take
 * down every other post in the listing. But if literally every post failed,
 * that is functionally a total outage from the caller's point of view - an
 * index with zero posts is exactly the "empty page" `lib/posts.ts`'s
 * fallback exists to prevent, even though the failure mode here is parse
 * errors rather than the listing call itself being unreachable.
 *
 * Returns `RawPost[]`, not `Post[]`: the brand stops a future caller from
 * silently feeding raw markdown to something that expects sanitised HTML
 * (or vice versa - `fetchPosts`'s output into `selectImageUrls`, which needs
 * markdown link syntax). The cast below is the one place that brand is
 * applied; it exists only for the compiler; see `RawPost`'s docstring.
 */
export async function fetchRawPosts(): Promise<RawPost[]> {
  const paths = await listPostPaths();

  const results = await Promise.allSettled(
    paths.map(async (path) => {
      const response = await fetch(rawUrl(path));

      if (!response.ok) {
        throw new Error(`fetching ${path} failed: ${response.status}`);
      }

      const slug = path.replace(/^posts\//, "").replace(/\.md$/, "");
      return parsePost(slug, await response.text());
    }),
  );

  const posts = settleFetchedPosts(paths, results);

  if (paths.length > 0 && posts.length === 0) {
    throw new Error(`every post (${paths.length}) failed to fetch or parse`);
  }

  return orderPosts(posts as RawPost[]);
}

/**
 * Exported for testing: the isolable piece of I3's per-post failure
 * handling. Keeps posts whose fetch+parse settled fulfilled, skips (and
 * logs) the ones that rejected.
 */
export function settleFetchedPosts(
  paths: readonly string[],
  results: readonly PromiseSettledResult<Post>[],
): Post[] {
  const posts: Post[] = [];

  for (const [index, result] of results.entries()) {
    if (result.status === "fulfilled") {
      posts.push(result.value);
    } else {
      console.error(`skipping ${paths[index]}:`, result.reason);
    }
  }

  return posts;
}

/**
 * Every post, newest first, with `body` already sanitised HTML.
 *
 * Throws if the listing fails. The app-side accessor catches that and falls
 * back to the committed summaries — the decision to degrade belongs there,
 * not here, so this stays honest about what it could not do.
 *
 * `vendoredImages` is supplied by the caller because vendoring writes to
 * public/ and only the build can do that; ISR passes an empty map, which makes
 * a not-yet-vendored image render as a link.
 */
export async function fetchPosts(
  vendoredImages: ReadonlyMap<string, string> = new Map(),
): Promise<Post[]> {
  const posts = await fetchRawPosts();

  return posts.map((post) => ({
    ...post,
    body: renderPostBody(post.body, { vendoredImages }),
  }));
}
