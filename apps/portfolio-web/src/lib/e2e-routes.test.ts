import { describe, expect, test } from "bun:test";
import { POST_FALLBACK } from "@patorsiang/content/posts";

import { routes } from "../../e2e/support/routes";

/**
 * The sweeps read `routes`, so a post missing from it is never checked for
 * contrast, tap targets, overflow or axe. Before this test, 7 of 9 posts
 * were missing, because adding a post meant remembering to edit routes.ts too.
 */
describe("sweep routes", () => {
  test("include every post in POST_FALLBACK", () => {
    const missing = POST_FALLBACK.map((post) => `/posts/${post.slug}`).filter(
      (path) => !(routes as readonly string[]).includes(path),
    );

    expect(missing).toEqual([]);
  });

  test("list no route twice", () => {
    expect(new Set(routes).size).toBe(routes.length);
  });
});
