import type { FullConfig } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/**
 * `next dev` rewrites the committed next-env.d.ts to point at whatever dist
 * directory it was started with. The hydration project runs its own dev server
 * under NEXT_DIST_DIR=.next/e2e-dev (see playwright.config.ts), so without this
 * every e2e run would leave next-env.d.ts pointing into a test-only directory -
 * showing up in `git status`, and eventually getting committed by accident.
 *
 * It rewrites only the `.next/e2e-dev/dev/` prefix this suite is responsible
 * for, back to the `.next/` paths `next build` writes. A developer who has
 * their own `bun dev` running has next-env.d.ts pointing at `.next/dev/` -
 * that is theirs, not ours, and is deliberately left alone.
 *
 * Best-effort by design: a run killed mid-flight skips teardown, and that is
 * fine. `tsc` resolves these references leniently, so a stale path does not
 * break `bun run typecheck` - the cost of missing it is an untidy diff, not a
 * broken build. Never fail the suite over tidiness.
 */
const testDistPrefix = "./.next/e2e-dev/dev/";
const buildDistPrefix = "./.next/";

export default function restoreNextEnv(config: FullConfig) {
  // `config.rootDir` is the testDir (./e2e), not the directory holding
  // playwright.config.ts - hence the "..". Derived from Playwright's own
  // config rather than from `import.meta`, which Playwright compiles away
  // when it loads this hook as CommonJS.
  const path = join(config.rootDir, "..", "next-env.d.ts");

  try {
    const source = readFileSync(path, "utf8");

    if (!source.includes(testDistPrefix)) {
      return;
    }

    writeFileSync(path, source.replaceAll(testDistPrefix, buildDistPrefix));
  } catch {
    // Unreadable or unwritable next-env.d.ts is not this suite's problem.
  }
}
