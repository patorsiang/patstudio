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
    // Serialisation-agnostic: DOMPurify writes <br>, sanitize-html <br />.
    // Both are valid HTML5; the test is about the tag surviving.
    expect(html).toMatch(/<br\s*\/?>/);
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

  test("keeps the responsive-image attributes render.ts emits", () => {
    // The regression guard for a failure that is entirely silent: the sanitiser
    // drops an unlisted attribute without complaint, so losing these would
    // leave every post image working, un-optimized, and shifting the layout -
    // visible only in a Lighthouse run nobody happened to do that week.
    const html = sanitizeArticleHTML(
      '<img src="/_next/image?url=x&w=1200&q=75" ' +
        'srcset="/_next/image?url=x&w=640&q=75 640w" ' +
        'sizes="100vw" width="1600" height="900" decoding="async" alt="a">',
    );

    for (const attribute of ["srcset=", "sizes=", 'width="1600"', 'height="900"', "decoding="]) {
      expect(html).toContain(attribute);
    }
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

  /*
   * Parity guards for the jsdom-free sanitiser swap (2026-09-28). Each is an
   * obfuscation that naive scheme checks miss; all passed against DOMPurify
   * before the swap, so a failure here means the replacement is weaker.
   */
  test("strips javascript: URLs however they are disguised", () => {
    for (const href of [
      "JaVaScRiPt:alert(1)",
      " javascript:alert(1)",
      "java\tscript:alert(1)",
      "javascript&#58;alert(1)",
      "&#106;avascript:alert(1)",
    ]) {
      expect(sanitizeArticleHTML(`<a href="${href}">x</a>`).toLowerCase()).not.toContain(
        "alert(1)",
      );
    }
  });

  test("strips vbscript: and data: from a link", () => {
    expect(sanitizeArticleHTML('<a href="vbscript:msgbox(1)">x</a>')).not.toContain("vbscript");
    expect(
      sanitizeArticleHTML('<a href="data:text/html,<script>alert(1)</script>">x</a>'),
    ).not.toContain("data:");
  });

  test("strips a javascript: URL from an image src and srcset", () => {
    const html = sanitizeArticleHTML(
      '<img src="javascript:alert(1)" srcset="javascript:alert(2) 1x" alt="a">',
    );

    expect(html).not.toContain("javascript:");
    expect(html).toContain('alt="a"');
  });

  test("removes svg and math, which carry their own script vectors", () => {
    expect(sanitizeArticleHTML("<svg><script>alert(1)</script></svg>")).not.toContain("alert(1)");
    expect(sanitizeArticleHTML('<svg onload="alert(1)"></svg>')).not.toContain("onload");
    expect(sanitizeArticleHTML('<math><a href="javascript:alert(1)">x</a></math>')).not.toContain(
      "javascript:",
    );
  });

  test("keeps https and mailto links", () => {
    expect(sanitizeArticleHTML('<a href="https://example.com/a?b=1">x</a>')).toContain(
      'href="https://example.com/a?b=1"',
    );
    expect(sanitizeArticleHTML('<a href="mailto:a@b.co">x</a>')).toContain('href="mailto:a@b.co"');
  });

  test("escapes text so a stray angle bracket cannot open a tag", () => {
    const html = sanitizeArticleHTML("<p>1 &lt; 2 &amp;&amp; 3 &gt; 2</p>");

    expect(html).toBe("<p>1 &lt; 2 &amp;&amp; 3 &gt; 2</p>");
  });

  test("drops style and id, which are not on the attribute allowlist", () => {
    const html = sanitizeArticleHTML('<p style="color:red" id="x" lang="en">a</p>');

    expect(html).not.toContain("style=");
    expect(html).not.toContain("id=");
    expect(html).toContain('lang="en"');
  });
});
