import { describe, expect, test } from "bun:test";

import { sanitizeArticleHTML, sanitizeHTML } from "./security";

/**
 * Characterisation tests, written before upgrading isomorphic-dompurify across
 * two majors. They exist to answer one question the version number cannot: did
 * anything about what we strip, or keep, change?
 *
 * `packages/utils` had no tests at all, and the only coverage of these two
 * functions was indirect, through renderPostBody. That is thin footing for the
 * one dependency standing between a second repo's markdown and the DOM.
 */
describe("sanitizeHTML", () => {
  test("keeps its five formatting tags", () => {
    const html = sanitizeHTML("<p>a <strong>b</strong> <em>c</em> <span>d</span><br></p>");

    expect(html).toContain("<strong>b</strong>");
    expect(html).toContain("<em>c</em>");
    expect(html).toContain("<span>d</span>");
    expect(html).toContain("<br>");
  });

  test("keeps class but drops other attributes", () => {
    const html = sanitizeHTML('<p class="lead" id="x" style="color:red">a</p>');

    expect(html).toContain('class="lead"');
    expect(html).not.toContain("id=");
    expect(html).not.toContain("style=");
  });

  test("strips tags outside the allowlist, keeping their text", () => {
    const html = sanitizeHTML("<div>outer <a href='/x'>link</a></div>");

    expect(html).not.toContain("<div");
    expect(html).not.toContain("<a");
    expect(html).toContain("outer");
    expect(html).toContain("link");
  });

  test("removes a script tag and its contents entirely", () => {
    const html = sanitizeHTML("safe<script>alert(1)</script>");

    expect(html).not.toContain("<script");
    expect(html).not.toContain("alert(1)");
    expect(html).toContain("safe");
  });

  test("removes inline event handlers", () => {
    expect(sanitizeHTML('<p onclick="alert(1)">a</p>')).not.toContain("onclick");
    expect(sanitizeHTML('<span onmouseover="alert(1)">a</span>')).not.toContain("onmouseover");
  });
});

describe("sanitizeArticleHTML", () => {
  test("keeps the structural tags a CommonMark body needs", () => {
    const html = sanitizeArticleHTML(
      "<h2>H</h2><ul><li>i</li></ul><blockquote>q</blockquote><pre><code>c</code></pre>",
    );

    for (const tag of ["<h2>", "<ul>", "<li>", "<blockquote>", "<pre>", "<code>"]) {
      expect(html).toContain(tag);
    }
  });

  test("keeps lang, so Thai passages survive", () => {
    // A bilingual accessibility feature that fails shut rather than open if
    // `lang` is ever dropped from the attribute allowlist.
    expect(sanitizeArticleHTML('<span lang="th">สวัสดี</span>')).toContain('lang="th"');
  });

  test("keeps a normal link and image with their allowed attributes", () => {
    const link = sanitizeArticleHTML('<a href="/x" rel="noopener" target="_blank">t</a>');
    expect(link).toContain('href="/x"');
    expect(link).toContain('rel="noopener"');

    const img = sanitizeArticleHTML('<img src="/x.webp" alt="a" loading="lazy">');
    expect(img).toContain('src="/x.webp"');
    expect(img).toContain('alt="a"');
  });

  test("strips a javascript: URL from an href", () => {
    const html = sanitizeArticleHTML('<a href="javascript:alert(1)">click</a>');

    expect(html).not.toContain("javascript:");
    expect(html).toContain("click");
  });

  test("removes script, iframe and object entirely", () => {
    expect(sanitizeArticleHTML("<script>alert(1)</script>")).not.toContain("alert(1)");
    expect(sanitizeArticleHTML('<iframe src="https://evil.test"></iframe>')).not.toContain(
      "<iframe",
    );
    expect(sanitizeArticleHTML('<object data="x"></object>')).not.toContain("<object");
  });

  test("removes an onerror handler but keeps the image", () => {
    const html = sanitizeArticleHTML('<img src="/x.png" onerror="alert(1)">');

    expect(html).not.toContain("onerror");
    expect(html).toContain('src="/x.png"');
  });

  test("drops style and id, which are not on the attribute allowlist", () => {
    const html = sanitizeArticleHTML('<p style="color:red" id="x" lang="en">a</p>');

    expect(html).not.toContain("style=");
    expect(html).not.toContain("id=");
    expect(html).toContain('lang="en"');
  });
});
