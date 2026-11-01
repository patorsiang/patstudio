import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * error.tsx and global-error.tsx cannot be rendered by the e2e suite: nothing
 * short of a route that throws on purpose reaches them in a production build,
 * and e2e/error-recovery.e2e.ts records the two approaches that were tried and
 * why they do not work. So they are pinned the way layout.test.ts and
 * seo.test.ts pin their subjects - by reading the source and asserting the
 * properties that would otherwise be removed silently.
 *
 * A source read cannot prove these files behave correctly. It can prove the
 * two things that were actually lost here before, which a reviewer would have
 * to remember to look for otherwise.
 */

const boundaries = ["error.tsx", "global-error.tsx"];

/**
 * Comments and imports are stripped before matching. Without that, commenting
 * out the `applyStoredTheme()` call still leaves the identifier in the import
 * line and in the comment above it, so a `toContain` check passes against a
 * boundary that no longer applies the theme at all - verified, that is exactly
 * what happened on the first version of this file.
 */
function executableSource(filename: string) {
  return readFileSync(join(import.meta.dir, filename), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "")
    .replace(/^import .*$/gm, "");
}

describe.each(boundaries)("%s", (filename) => {
  const source = executableSource(filename);

  test("re-applies the stored theme itself", () => {
    // Error-boundary rendering bypasses the root layout's inline bootstrap
    // script, so without this the boundary paints light for a reader who
    // chose dark - which is exactly how these files behaved before
    // 2026-08-01, when all three error pages were hard-coded light.
    expect(source).toMatch(/applyStoredTheme\(\)/);
  });

  test("offers a way to retry", () => {
    // The whole contract of an error boundary: reset() re-renders the segment
    // that failed. A boundary that only apologises is a dead end.
    expect(source).toMatch(/onClick=\{\(\)\s*=>\s*reset\(\)\}/);
  });

  test("uses design tokens rather than raw palette classes", () => {
    // "No component may use a raw Tailwind palette class (bg-zinc-900,
    // text-white) for screen styles" (docs/design/design-system.md). These
    // three files are where that rule was broken last, and they are invisible
    // to the contrast sweep that would otherwise catch a regression.
    const rawPalette = source.match(
      /(?:bg|text|border)-(?:zinc|stone|slate|gray|neutral|teal|red)-\d{2,3}/g,
    );

    expect(rawPalette ?? [], `raw palette classes: ${(rawPalette ?? []).join(", ")}`).toEqual([]);
  });
});
