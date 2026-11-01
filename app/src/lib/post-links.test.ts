import { describe, expect, test } from "bun:test";

import { postExternalLinks } from "./post-links";

const MEDIUM = "https://medium.com/@x/overall-of-css-meetup-16-08-2023-1289d8b615f2";

describe("postExternalLinks", () => {
  test("returns nothing for a post that lives only here", () => {
    expect(postExternalLinks({ elsewhere: [] })).toEqual([]);
  });

  test("marks a canonical URL as the original, not as a copy", () => {
    expect(postExternalLinks({ canonical: MEDIUM, elsewhere: [] })).toEqual([
      { kind: "original", label: "Medium", href: MEDIUM },
    ]);
  });

  test("marks syndicated copies as 'also'", () => {
    expect(postExternalLinks({ elsewhere: [MEDIUM, "https://dev.to/x/a-1"] })).toEqual([
      { kind: "also", label: "Medium", href: MEDIUM },
      { kind: "also", label: "DEV", href: "https://dev.to/x/a-1" },
    ]);
  });

  // Listing the original again under "also on" would tell a reader the same
  // page exists in two places.
  test("does not repeat the canonical URL when elsewhere also lists it", () => {
    expect(postExternalLinks({ canonical: MEDIUM, elsewhere: [MEDIUM] })).toEqual([
      { kind: "original", label: "Medium", href: MEDIUM },
    ]);
  });

  // POST_FALLBACK is hand-written and unvalidated, so junk can reach the UI.
  // Dropping the link beats rendering a confident label over about:blank.
  test("drops a value that is not a usable web link", () => {
    expect(postExternalLinks({ elsewhere: ["javascript:alert(1)", "nope"] })).toEqual([]);
  });
});
