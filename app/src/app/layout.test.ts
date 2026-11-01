import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const layoutSourcePath = join(import.meta.dir, "layout.tsx");

describe("Google Search Console verification", () => {
  // The verification code is provided by whoever registers the Search
  // Console property, never fabricated - this pins that the value is read
  // from the environment, not hardcoded, mirroring seo.test.ts's
  // source-pinning pattern for env-driven module state.
  test("is read from GOOGLE_SITE_VERIFICATION, not hardcoded", () => {
    const source = readFileSync(layoutSourcePath, "utf8");

    expect(source).toContain("process.env.GOOGLE_SITE_VERIFICATION");
    expect(source).not.toMatch(/verification:\s*{\s*google:\s*["']/);
  });
});
