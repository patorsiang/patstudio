import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * `/design-sync` skips NamecardIcons: its story shows 8 icon functions and no
 * component of that name exists, so no card, README entry or .d.ts is written
 * for them (QA card c26). They are on `window.PortfolioUI` all the same, so
 * the design agent is told about them in `.design-sync/conventions.md`, which
 * the sync copies into the project README.
 *
 * A hand-written list drifts. This fails when an icon is added or renamed in
 * NamecardIcons.tsx and the list is not.
 */

const root = import.meta.dir;
const iconsSource = readFileSync(join(root, "atoms/NamecardIcons.tsx"), "utf8");
const conventions = readFileSync(join(root, "../../../../.design-sync/conventions.md"), "utf8");

const exportedIcons = [...iconsSource.matchAll(/^export function (\w+)\(/gm)].map(
  (match) => match[1],
);

describe("design-sync conventions", () => {
  test("the icon file still exports icons, so this test is not vacuous", () => {
    expect(exportedIcons.length).toBeGreaterThanOrEqual(8);
  });

  test("every namecard icon is named in .design-sync/conventions.md", () => {
    const missing = exportedIcons.filter((name) => !conventions.includes(`\`${name}\``));

    expect(missing).toEqual([]);
  });
});
