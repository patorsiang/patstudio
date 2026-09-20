import { describe, expect, test } from "bun:test";

import { postLinkLabel } from "./elsewhere";

describe("postLinkLabel", () => {
  test("names the platforms this site actually syndicates to", () => {
    expect(postLinkLabel("https://medium.com/@napatcholthaipanich_6231/a-1")).toBe("Medium");
    expect(postLinkLabel("https://www.medium.com/@x/a-1")).toBe("Medium");
    expect(postLinkLabel("https://dev.to/x/a-1")).toBe("DEV");
  });

  // Front matter is hand-written, so an unlisted host must still render a
  // sensible label rather than needing a code change first.
  test("falls back to the host's own name for an unlisted platform", () => {
    expect(postLinkLabel("https://hashnode.com/x/a-1")).toBe("Hashnode");
    expect(postLinkLabel("https://blog.example.co.uk/a-1")).toBe("Blog");
  });

  // POST_FALLBACK is a hand-written const that no schema validates, so this
  // helper is reachable with junk. Returning null lets the caller drop the
  // link instead of rendering "about:blank" behind a confident label.
  test("returns null for anything that is not a parseable http(s) URL", () => {
    expect(postLinkLabel("not a url")).toBeNull();
    expect(postLinkLabel("")).toBeNull();
    expect(postLinkLabel("javascript:alert(1)")).toBeNull();
    expect(postLinkLabel("mailto:someone@example.com")).toBeNull();
  });
});
