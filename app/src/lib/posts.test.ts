import { afterEach, beforeEach, describe, expect, spyOn, test, type Mock } from "bun:test";
import { POST_FALLBACK } from "@patorsiang/content/posts";

import { getPost, getPosts } from "./posts";

let fetchMock: Mock<(...args: Parameters<typeof fetch>) => ReturnType<typeof fetch>>;

beforeEach(() => {
  fetchMock = spyOn(globalThis, "fetch").mockRejectedValue(new Error("network down"));
});

afterEach(() => fetchMock.mockRestore());

describe("getPosts", () => {
  test("falls back to POST_FALLBACK when the live fetch fails", async () => {
    const posts = await getPosts();

    expect(posts).toEqual([...POST_FALLBACK]);
  });
});

describe("getPost", () => {
  test("throws when the listing fails", async () => {
    await expect(getPost(POST_FALLBACK[0].slug)).rejects.toThrow("network down");
  });

  test("only reports an unlisted post as missing during a partial outage", async () => {
    const goodSlug = POST_FALLBACK[0].slug;
    const goodPost = `---
title: A working post
date: 2026-06-14
summary: A summary
maturity: published
lang: [en]
---
An **available** post.`;
    fetchMock.mockImplementation(async (input) => {
      const url = new URL(String(input));
      if (url.hostname === "api.github.com") {
        return Response.json(
          [goodSlug, "unavailable"].map((slug) => ({
            name: `${slug}.md`,
            type: "file",
            path: `posts/${slug}.md`,
          })),
        );
      }
      if (url.pathname.endsWith(`/posts/${goodSlug}.md`)) return new Response(goodPost);
      return new Response(null, { status: 503 });
    });

    await expect(getPosts()).resolves.toMatchObject([{ slug: goodSlug }]);
    await expect(getPost(goodSlug)).resolves.toMatchObject({
      body: "<p>An <strong>available</strong> post.</p>\n",
    });
    await expect(getPost("missing")).resolves.toBeNull();
    await expect(getPost("unavailable")).rejects.toThrow(
      "fetching posts/unavailable.md failed: 503",
    );
  });
});
