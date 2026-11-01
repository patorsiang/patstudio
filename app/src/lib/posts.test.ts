import { describe, expect, mock, test } from "bun:test";
import { POST_FALLBACK } from "@patorsiang/content/posts";

/**
 * `getPosts`/`getPost` degrade to `POST_FALLBACK` when the live fetch
 * throws (a GitHub outage, or - post I3 - the listing call itself failing).
 * Nothing previously exercised that path: an absence assertion ("the posts
 * page doesn't crash") would pass whether or not the fallback actually
 * fires. `fetchPosts` calls the real `fetch` global and Playwright can't
 * intercept it (this runs server-side), so the only way to force the
 * failure is to mock `@patorsiang/content/posts` itself - the exact
 * specifier lib/posts.ts imports `fetchPosts` from.
 *
 * `mock.module` swaps the module for every import that happens after this
 * call, including the dynamic `import("./posts")` below - which is why
 * `getPosts`/`getPost` are imported dynamically inside each test rather
 * than statically at the top of the file. The static import of
 * `POST_FALLBACK` above runs first (module evaluation, before any test
 * body), so it captures the real fallback data to assert against.
 */
mock.module("@patorsiang/content/posts", () => ({
  fetchPosts: () => Promise.reject(new Error("network down")),
  POST_FALLBACK,
}));

describe("getPosts", () => {
  test("falls back to POST_FALLBACK when the live fetch fails", async () => {
    const { getPosts } = await import("./posts");

    const posts = await getPosts();

    expect(posts).toEqual([...POST_FALLBACK]);
  });
});

describe("getPost", () => {
  test("returns null when the fetch fails, rather than a stale body", async () => {
    const { getPost } = await import("./posts");

    const post = await getPost(POST_FALLBACK[0].slug);

    expect(post).toBeNull();
  });
});
