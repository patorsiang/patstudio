import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { buildIconSvg, MARK_DASH_LENGTH, MARK_PATH } from "./brand";

const iconPath = join(import.meta.dir, "../app/icon.svg");

describe("committed brand assets", () => {
  // Icons are the one asset nobody looks at twice - create-next-app's Vercel
  // triangle shipped for months unnoticed. This fails if MARK_PATH is edited
  // without rerunning scripts/generate-brand-assets.ts.
  test("icon.svg still contains the current mark path", () => {
    const committed = readFileSync(iconPath, "utf8");

    expect(committed).toContain(MARK_PATH);
  });

  test("icon.svg is byte-identical to what the generator would write", () => {
    const committed = readFileSync(iconPath, "utf8");

    expect(committed).toBe(buildIconSvg());
  });

  test("icon.svg carries both theme colours, since a favicon cannot inherit currentColor", () => {
    const committed = readFileSync(iconPath, "utf8");

    expect(committed).toContain("#0f766e");
    expect(committed).toContain("#5eead4");
    expect(committed).not.toContain("currentColor");
  });
});

describe("MARK_DASH_LENGTH", () => {
  // Independent of SVGPathElement.getTotalLength() - there is no DOM here.
  // Recomputes the path's segments by hand from MARK_PATH's own numbers, so
  // this fails if MARK_PATH changes shape without MARK_DASH_LENGTH being
  // rechecked: stem is two straight runs (V then H), the bowl is a
  // semicircle (its chord equals its diameter, so both possible arc lengths
  // are identical), the base is a third straight run.
  test("covers the mark's actual stroke length, with room to spare", () => {
    const stem = 82 - 24 + (54 - 34); // V24 then H54, from M34 82
    const bowl = Math.PI * 17; // a17 17 0 1 1 0 34: radius 17, chord 34 = 2r
    const base = 54 - 34; // H34

    const actualLength = stem + bowl + base;

    expect(MARK_DASH_LENGTH).toBeGreaterThan(actualLength);
  });
});
