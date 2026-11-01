import { describe, expect, test } from "bun:test";

import {
  buildBlogPostingJsonLd,
  buildBreadcrumbJsonLd,
  buildWebsiteJsonLd,
  toJsonLdScript,
} from "./json-ld";

describe("toJsonLdScript", () => {
  test("escapes < so a value cannot end the script tag early", () => {
    const script = toJsonLdScript({ note: "</script><script>alert(1)" });

    expect(script).not.toContain("</script>");
    expect(script).toContain("\\u003c/script>\\u003cscript>alert(1)");
  });
});

describe("buildWebsiteJsonLd", () => {
  test("declares a WebSite with no SearchAction", () => {
    const website = buildWebsiteJsonLd();

    expect(website["@type"]).toBe("WebSite");
    expect(website).not.toHaveProperty("potentialAction");
    expect(typeof website.url).toBe("string");
  });
});

describe("buildBreadcrumbJsonLd", () => {
  test("mirrors the visible trail, in order, as absolute URLs", () => {
    const breadcrumb = buildBreadcrumbJsonLd([
      { href: "/posts", label: "Posts" },
      { href: "/posts/example", label: "Example" },
    ]);

    expect(breadcrumb["@type"]).toBe("BreadcrumbList");
    expect(breadcrumb.itemListElement).toHaveLength(2);
    expect(breadcrumb.itemListElement[0]).toMatchObject({ position: 1, name: "Posts" });
    expect(breadcrumb.itemListElement[1]).toMatchObject({ position: 2, name: "Example" });
    expect(breadcrumb.itemListElement[0].item).toMatch(/^https?:\/\/.+\/posts$/);
  });
});

describe("buildBlogPostingJsonLd", () => {
  const post = {
    slug: "example-post",
    title: "Example Post",
    date: "2026-06-14",
    summary: "A summary.",
    tags: [],
    maturity: "published" as const,
    lang: ["en"] as const,
    elsewhere: [],
    body: "<p>ignored</p>",
  };

  // A post that originated on Medium must tell Google so. Claiming
  // mainEntityOfPage for a copy is how you compete with your own original.
  test("hands mainEntityOfPage to canonical when the post originated elsewhere", () => {
    const jsonLd = buildBlogPostingJsonLd({
      ...post,
      canonical: "https://medium.com/@x/overall-of-css-meetup-16-08-2023-1289d8b615f2",
    });

    expect(jsonLd.mainEntityOfPage).toBe(
      "https://medium.com/@x/overall-of-css-meetup-16-08-2023-1289d8b615f2",
    );
  });

  test("keeps mainEntityOfPage on this site when there is no canonical", () => {
    const jsonLd = buildBlogPostingJsonLd(post);

    expect(jsonLd.mainEntityOfPage).toContain("/posts/example-post");
  });

  test("only carries fields real Post data actually has - nothing fabricated", () => {
    const jsonLd = buildBlogPostingJsonLd(post);

    expect(jsonLd.headline).toBe(post.title);
    expect(jsonLd.description).toBe(post.summary);
    expect(jsonLd.datePublished).toBe(post.date);
    expect(jsonLd.dateModified).toBe(post.date);
    expect(jsonLd).not.toHaveProperty("wordCount");
    expect(jsonLd).not.toHaveProperty("interactionStatistic");
  });

  test("points image at the per-post OG image route", () => {
    const jsonLd = buildBlogPostingJsonLd(post);

    expect(jsonLd.image).toContain(`/posts/${post.slug}/opengraph-image`);
  });
});
