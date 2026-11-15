import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, readlinkSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
// @ts-expect-error -- plain .mjs script, no declarations
import { APP_NODE_MODULES, linkAppNodeModules } from "../../../.design-sync/link-node-modules.mjs";

/**
 * build-dist.mjs links .design-sync/ds-package/node_modules to app/node_modules
 * so the converter finds @types/react. A clone made before the apps/portfolio-web
 * -> app rename (PR #74) keeps the old link, and the build then reads the wrong
 * React types (issue #82). The temp tree mirrors the repo layout so the relative
 * link target resolves the same way it does for real.
 */
describe("linkAppNodeModules", () => {
  let root: string;
  let pkg: string;
  let nm: string;

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "ds-link-"));
    pkg = join(root, ".design-sync/ds-package");
    nm = join(pkg, "node_modules");
    mkdirSync(pkg, { recursive: true });
    mkdirSync(join(root, "app/node_modules"), { recursive: true });
  });

  afterEach(() => rmSync(root, { recursive: true, force: true }));

  test("creates the link when none exists", () => {
    linkAppNodeModules(pkg);
    expect(readlinkSync(nm)).toBe(APP_NODE_MODULES);
  });

  test("replaces a dangling link to the old apps/portfolio-web path", () => {
    symlinkSync("../../apps/portfolio-web/node_modules", nm);
    linkAppNodeModules(pkg);
    expect(readlinkSync(nm)).toBe(APP_NODE_MODULES);
  });

  test("replaces a link whose old target still exists", () => {
    mkdirSync(join(root, "apps/portfolio-web/node_modules"), { recursive: true });
    symlinkSync("../../apps/portfolio-web/node_modules", nm);
    linkAppNodeModules(pkg);
    expect(readlinkSync(nm)).toBe(APP_NODE_MODULES);
  });
});
