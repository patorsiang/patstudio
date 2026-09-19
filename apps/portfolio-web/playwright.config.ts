import { defineConfig, devices } from "@playwright/test";

const port = 3100;

/**
 * hydration.e2e.ts needs a *development* server, and is the only spec that
 * does. React reports an attribute-level hydration mismatch ("some attributes
 * of the server rendered HTML didn't match the client properties") as a
 * development-only warning - in a production build it is silently ignored,
 * and only text and structural mismatches survive as recoverable errors.
 * Verified the hard way: a deliberate `useState(getStoredTheme())` mismatch
 * planted in GlobalNav passes the entire suite against `next start`, and
 * fails immediately against `next dev`. A hydration guard that only runs
 * against a production build is not a guard.
 */
const devPort = 3101;

/**
 * Runs against a production build, not `next dev`: dev-only overlays inject
 * their own focusable controls, which the tap-target sweep would then measure
 * and report as app violations.
 */
export default defineConfig({
  testDir: "./e2e",
  // Undoes the dev server's rewrite of the committed next-env.d.ts; the file
  // itself explains why that is needed.
  globalTeardown: "./e2e/support/restore-next-env.ts",
  // Not *.spec.ts: `bun test` at the repo root globs that pattern and would try
  // to run these under its own runner, which fails on Playwright's fixtures.
  testMatch: "**/*.e2e.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    // A service worker can serve a cached response inside an unrelated spec,
    // so an assertion passes without ever touching the app. That failure is
    // invisible — the suite goes green either way. Every spec runs with
    // workers blocked; pwa.e2e.ts opts back in.
    serviceWorkers: "block",
  },
  projects: [
    // 375px is the narrowest width the design system targets, and the width at
    // which the nav wraps - so it is where tap targets are tightest. Pinned to
    // Chromium rather than devices["iPhone SE"] (which is WebKit) so CI only
    // downloads one browser for the sweeps; they measure layout, not engine
    // differences. The `webkit` project below is the deliberate exception.
    //
    // Both exclude hydration.e2e.ts: it runs against the dev server instead,
    // in its own project below.
    {
      name: "mobile",
      testIgnore: "**/hydration.e2e.ts",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 375, height: 667 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: "desktop",
      testIgnore: "**/hydration.e2e.ts",
      use: { ...devices["Desktop Chrome"] },
    },
    // The one project pointed at `next dev` rather than a production build -
    // see the `devPort` comment above for why that is required rather than
    // preferred. The dev-only overlay that made the layout sweeps avoid dev
    // is harmless here: this spec reads the console, it does not measure
    // anything the overlay could contribute a control to.
    {
      name: "hydration",
      testMatch: "**/hydration.e2e.ts",
      // localhost, not 127.0.0.1: Next 16 dev treats them as different
      // origins and blocks its own HMR resources cross-origin, which stops
      // the client bundle running - so the page never hydrates and every
      // assertion here times out waiting for a hydration that cannot happen.
      use: { ...devices["Desktop Chrome"], baseURL: `http://localhost:${devPort}` },
    },
    // Everything above measures layout, where one engine is enough. The
    // namecard's flip does not: it is the only thing in the app whose
    // correctness rests on CSS 3D compositing, and WebKit gets it wrong in a
    // way Chromium never reproduces - /card renders its BACK face, mirror
    // reversed, on a card nobody has flipped, so the first thing a Safari
    // visitor sees is backwards text. Nothing else in the suite could catch
    // that. Scoped by testMatch to just that file, so the second browser
    // download buys exactly the coverage that needs it and nothing else.
    {
      name: "webkit",
      testMatch: "**/namecard-flip.e2e.ts",
      use: { ...devices["Desktop Safari"] },
    },
  ],
  webServer: [
    {
      command: `bun run build && bun run start --port ${port}`,
      url: `http://127.0.0.1:${port}`,
      // A stand-in number, so downloads.e2e.ts can assert both halves of the rule -
      // that the vCard carries a TEL line, and that the digits appear in no rendered
      // HTML. With the variable unset the first half cannot be tested at all, and
      // /card/whatsapp 404s, which links.e2e.ts reports as a broken internal link.
      env: { CONTACT_PHONE_E164: "+66000000000" },
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
    {
      // Its own dist dir, so this server's lock never collides with a
      // developer's `bun dev` - see the distDir comment in next.config.ts.
      command: `NEXT_DIST_DIR=.next/e2e-dev bun run dev --port ${devPort}`,
      env: { CONTACT_PHONE_E164: "+66000000000" },
      url: `http://localhost:${devPort}`,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
  ],
});
