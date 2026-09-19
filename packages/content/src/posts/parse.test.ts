import { describe, expect, test } from "bun:test";

import { parsePost } from "./parse";

const valid = `---
title: "Insights from BKK.js Summer 2026"
date: 2026-06-14
summary: "Web performance, WebAssembly, and AI-assisted engineering."
tags: [events, web-performance]
maturity: published
lang: [en, th]
---

# Insights from BKK.js Summer 2026

The tech scene in Bangkok is heating up.
`;

describe("parsePost", () => {
  test("reads every front-matter field", () => {
    const post = parsePost("bkkjs-summer-2026", valid);

    expect(post.slug).toBe("bkkjs-summer-2026");
    expect(post.title).toBe("Insights from BKK.js Summer 2026");
    expect(post.date).toBe("2026-06-14");
    expect(post.tags).toEqual(["events", "web-performance"]);
    expect(post.maturity).toBe("published");
    expect(post.lang).toEqual(["en", "th"]);
  });

  // Front matter is authoritative. Leaving the H1 in would render the title
  // twice - once from the page heading, once from the body.
  test("strips the leading H1 so the title is not rendered twice", () => {
    const post = parsePost("bkkjs-summer-2026", valid);

    expect(post.body).not.toContain("# Insights from BKK.js Summer 2026");
    expect(post.body).toContain("The tech scene in Bangkok is heating up.");
  });

  // A missing field must fail loudly at build. Defaulting it silently is how a
  // post ships with an empty summary and nobody notices.
  test("rejects a post with no date rather than defaulting it", () => {
    const missingDate = valid.replace("date: 2026-06-14\n", "");

    expect(() => parsePost("bkkjs-summer-2026", missingDate)).toThrow(/date/i);
  });

  test("rejects a file with no front matter at all", () => {
    expect(() => parsePost("x", "# Just a heading\n\nBody.")).toThrow(/front matter/i);
  });

  test("rejects an unknown maturity value", () => {
    const bad = valid.replace("maturity: published", "maturity: brilliant");

    expect(() => parsePost("x", bad)).toThrow(/maturity/i);
  });

  test("rejects a post with no title", () => {
    const missingTitle = valid.replace(/title: ".*"\n/, "");
    expect(() => parsePost("bkkjs-summer-2026", missingTitle)).toThrow(/title/i);
  });

  test("rejects a post with no summary", () => {
    const missingSummary = valid.replace(/summary: ".*"\n/, "");
    expect(() => parsePost("bkkjs-summer-2026", missingSummary)).toThrow(/summary/i);
  });

  test("rejects a post with no lang", () => {
    const missingLang = valid.replace(/lang: \[.*\]\n/, "");
    expect(() => parsePost("bkkjs-summer-2026", missingLang)).toThrow(/lang/i);
  });
});

describe("parsePost — syndication fields", () => {
  // The four posts that predate these fields must keep parsing unchanged.
  // This is the regression that matters: an optional field added with the
  // wrong zod shape turns every existing post into a build failure.
  test("defaults elsewhere to an empty list and leaves canonical unset", () => {
    const post = parsePost("bkkjs-summer-2026", valid);

    expect(post.elsewhere).toEqual([]);
    expect(post.canonical).toBeUndefined();
  });

  test("reads canonical when the post originated somewhere else", () => {
    const syndicated = valid.replace(
      "lang: [en, th]",
      "lang: [en, th]\ncanonical: https://medium.com/@napatcholthaipanich_6231/overall-of-css-meetup-16-08-2023-1289d8b615f2",
    );

    expect(parsePost("css-meetup-2023", syndicated).canonical).toBe(
      "https://medium.com/@napatcholthaipanich_6231/overall-of-css-meetup-16-08-2023-1289d8b615f2",
    );
  });

  test("reads elsewhere as a list of URLs", () => {
    const crossPosted = valid.replace(
      "lang: [en, th]",
      "lang: [en, th]\nelsewhere: [https://medium.com/@x/a-1, https://dev.to/x/a-1]",
    );

    expect(parsePost("bkkjs-summer-2026", crossPosted).elsewhere).toEqual([
      "https://medium.com/@x/a-1",
      "https://dev.to/x/a-1",
    ]);
  });

  // A typo'd URL that reaches the page becomes a dead "Also on Medium" link
  // on a portfolio a recruiter is reading. Fail the build instead.
  test("rejects a canonical that is not a URL", () => {
    const bad = valid.replace("lang: [en, th]", "lang: [en, th]\ncanonical: medium.com/@x/a-1");

    expect(() => parsePost("x", bad)).toThrow(/canonical/i);
  });

  test("rejects an elsewhere entry that is not a URL", () => {
    const bad = valid.replace("lang: [en, th]", "lang: [en, th]\nelsewhere: [not a url]");

    expect(() => parsePost("x", bad)).toThrow(/elsewhere/i);
  });
});
