import { describe, expect, test } from "bun:test";

import { githubApiHeaders, orderPosts, selectImageUrls, settleFetchedPosts } from "./fetch";
import type { Post } from "../types/post";

const post = (slug: string, date: string): Post => ({
  slug,
  title: slug,
  date,
  summary: "s",
  tags: [],
  maturity: "published",
  lang: ["en"],
  body: "",
});

describe("orderPosts", () => {
  test("puts the newest first", () => {
    const ordered = orderPosts([
      post("old", "2026-03-22"),
      post("new", "2026-07-01"),
      post("mid", "2026-06-14"),
    ]);

    expect(ordered.map((entry) => entry.slug)).toEqual(["new", "mid", "old"]);
  });
});

describe("selectImageUrls", () => {
  test("finds remote images and ignores local ones", () => {
    const urls = selectImageUrls(
      "![a](https://cdn.example.com/a.webp)\n![b](/already/local.png)\n![c](http://x.test/c.jpg)",
    );

    expect(urls).toEqual(["https://cdn.example.com/a.webp", "http://x.test/c.jpg"]);
  });

  test("returns each url once even when a post repeats it", () => {
    const urls = selectImageUrls("![a](https://x.test/a.webp) ![again](https://x.test/a.webp)");

    expect(urls).toEqual(["https://x.test/a.webp"]);
  });

  test("captures the URL when the image has a title, ignoring the title text", () => {
    const urls = selectImageUrls('![alt](https://example.com/x.webp "a title")');

    expect(urls).toEqual(["https://example.com/x.webp"]);
  });
});

// I3: one malformed post must not take down every post. `fetchRawPosts`
// itself calls the real `fetch` global, so this exercises the isolable piece
// of its logic directly instead.
describe("settleFetchedPosts", () => {
  test("keeps a fulfilled post and drops a rejected one, without throwing", () => {
    const paths = ["posts/good.md", "posts/bad.md"];
    const results: PromiseSettledResult<Post>[] = [
      { status: "fulfilled", value: post("good", "2026-01-01") },
      { status: "rejected", reason: new Error("missing front matter") },
    ];

    const kept = settleFetchedPosts(paths, results);

    expect(kept.map((entry) => entry.slug)).toEqual(["good"]);
  });

  test("keeps every post when all settle fulfilled", () => {
    const paths = ["posts/a.md", "posts/b.md"];
    const results: PromiseSettledResult<Post>[] = [
      { status: "fulfilled", value: post("a", "2026-01-01") },
      { status: "fulfilled", value: post("b", "2026-02-01") },
    ];

    expect(settleFetchedPosts(paths, results).map((entry) => entry.slug)).toEqual(["a", "b"]);
  });

  test("returns an empty array, not a throw, when every post rejects", () => {
    const paths = ["posts/bad.md"];
    const results: PromiseSettledResult<Post>[] = [
      { status: "rejected", reason: new Error("bad front matter") },
    ];

    expect(settleFetchedPosts(paths, results)).toEqual([]);
  });
});

// The listing call is the only one that hits api.github.com, which allows 60
// requests/hour per IP unauthenticated. GitHub Actions runners share IPs, so
// that budget is spent by strangers and the listing 403s at random - it took
// down a required check on an unrelated PR. Authenticating raises it to
// 5000/hour. Header construction is the isolable piece; `listPostPaths` calls
// the real fetch global, same reasoning as `settleFetchedPosts` above.
describe("githubApiHeaders", () => {
  test("authenticates when a token is available", () => {
    expect(githubApiHeaders("ghs_example")).toEqual({
      Accept: "application/vnd.github+json",
      Authorization: "Bearer ghs_example",
    });
  });

  test("omits Authorization entirely when there is no token", () => {
    expect(githubApiHeaders(undefined)).toEqual({ Accept: "application/vnd.github+json" });
  });

  // CI and shell environments routinely set an unset variable to "". Sending
  // `Authorization: Bearer ` is worse than sending nothing: GitHub rejects a
  // malformed credential with 401 instead of falling back to the anonymous
  // rate limit, turning a slow path into a hard failure.
  test("treats an empty or whitespace token as absent", () => {
    expect(githubApiHeaders("")).toEqual({ Accept: "application/vnd.github+json" });
    expect(githubApiHeaders("   ")).toEqual({ Accept: "application/vnd.github+json" });
  });

  test("trims a token that arrived with stray whitespace", () => {
    expect(githubApiHeaders("  ghs_example\n")).toEqual({
      Accept: "application/vnd.github+json",
      Authorization: "Bearer ghs_example",
    });
  });
});
