import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
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

/**
 * The design-system bundle has no server, so an app image such as the
 * namecard's QR code 404s in the Artifact's preview (QA card c27). The bundle
 * carries those files itself: `build-dist.mjs` inlines the ones it lists and
 * the `next/image` shim looks them up. A component that starts using another
 * `public/` image must be added to that list, or its preview shows alt text.
 */
const publicDir = join(root, "../../public");
const buildDist = readFileSync(join(root, "../../../../.design-sync/build-dist.mjs"), "utf8");

function componentSources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);

    if (entry.isDirectory()) return entry.name === "stories" ? [] : componentSources(path);

    return /\.tsx$/.test(entry.name) ? [readFileSync(path, "utf8")] : [];
  });
}

const publicFiles = new Set(readdirSync(publicDir));
const usedPublicImages = [
  ...new Set(
    componentSources(root)
      .flatMap((source) => [...source.matchAll(/["'`]\/([\w.-]+\.(?:svg|png|jpe?g|webp))["'`]/g)])
      .map((match) => match[1])
      .filter((file) => publicFiles.has(file)),
  ),
];

describe("design-sync bundle images", () => {
  test("the components still use public images, so this test is not vacuous", () => {
    expect(usedPublicImages).toContain("card-qr.svg");
    expect(usedPublicImages).toContain("avataaars.svg");
  });

  test("every public image a component uses is inlined by .design-sync/build-dist.mjs", () => {
    const missing = usedPublicImages.filter((file) => !buildDist.includes(`"${file}"`));

    expect(missing).toEqual([]);
  });
});
