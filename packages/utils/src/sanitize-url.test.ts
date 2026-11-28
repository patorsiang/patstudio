import { describe, expect, test } from "bun:test";

import { sanitizeUrl } from "./sanitize-url";

describe("sanitizeUrl", () => {
  test("keeps safe links unchanged", () => {
    for (const url of ["https://a.test/x", "mailto:a@b.test", "tel:+66", "/about", "#top"]) {
      expect(sanitizeUrl(url)).toBe(url);
    }
  });

  test("blocks script and data schemes", () => {
    expect(sanitizeUrl("javascript:alert(1)")).toBe("about:blank");
    expect(sanitizeUrl("data:text/html,x")).toBe("about:blank");
  });

  // Browsers read "/\" like "//", so both are links to another host, not paths.
  test("blocks protocol-relative links, including the backslash spelling", () => {
    for (const url of ["//evil.test", "/\\evil.test", " /\\evil.test"]) {
      expect(sanitizeUrl(url)).toBe("about:blank");
    }
  });
});
