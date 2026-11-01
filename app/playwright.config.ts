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
 * Storybook, for the one spec about how stories render rather than how the
 * app does. `storybook dev` rather than a static build: it starts in a couple
 * of seconds, where `build-storybook` would add a full build to every run.
 */
const storybookPort = 6106;

/**
 * Runs against a production build, not `next dev`: dev-only overlays inject
 * their own focusable controls, which the tap-target sweep would then measure
 * and report as app violations.
 */

/**
 * The visual-snapshot project, defined only on request (`bun run test:visual`).
 * Its baselines are macOS Chromium PNGs, so it must not run in CI, where fonts
 * and anti-aliasing differ, and it should not slow the everyday `test:e2e` run
 * or fail it for a change that is allowed to move pixels. A project that is
 * not defined cannot run by accident. It needs only the production server, so
 * the dev and Storybook servers are left out of a visual run.
 */
const visual = !!process.env.VISUAL;

export default defineConfig({
  testDir: "./e2e",
  // Undoes the dev server's rewrite of the committed next-env.d.ts; the file
  // itself explains why that is needed.
  globalTeardown: "./e2e/support/restore-next-env.ts",
  // Not *.spec.ts: `bun test` at the repo root globs that pattern and would try
  // to run these under its own runner, which fails on Playwright's fixtures.
  testMatch: "**/*.e2e.ts",
  // The one tolerance for the visual project. Zero: the same machine and the same
  // browser draw the same pixels, so any difference is a change worth looking at.
  expect: { toHaveScreenshot: { maxDiffPixels: 0 } },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  // Every run leaves files a QA report can cite: results.json for the numbers,
  // and the HTML report for screenshots and traces. The console reporter alone
  // left nothing behind. Both live outside test-results/, which Playwright
  // empties at the start of each run.
  reporter: [
    [process.env.CI ? "github" : "list"],
    ["json", { outputFile: "playwright-report/results.json" }],
    ["html", { outputFolder: "playwright-report/html", open: "never" }],
  ],
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    // A trace holds the network panel, console and DOM snapshots for each
    // step, so a failure carries its own evidence and no separate HAR is
    // needed. Kept on failure only, to keep a green run small.
    trace: "retain-on-failure",
    // A QA report shows what passed as well as what failed, so a local run
    // keeps a screenshot of every test. CI keeps failures only: nobody reads
    // 869 screenshots from a push.
    screenshot: process.env.CI ? "only-on-failure" : "on",
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
      testIgnore: ["**/hydration.e2e.ts", "**/storybook-*.e2e.ts"],
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 375, height: 667 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: "desktop",
      testIgnore: ["**/hydration.e2e.ts", "**/storybook-*.e2e.ts"],
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
    // Stories, not the app: a separate server and origin, so the sweeps above
    // exclude it and it excludes them.
    {
      name: "storybook",
      testMatch: "**/storybook-*.e2e.ts",
      use: { ...devices["Desktop Chrome"], baseURL: `http://localhost:${storybookPort}` },
    },
    {
      name: "webkit",
      testMatch: "**/namecard-flip.e2e.ts",
      use: { ...devices["Desktop Safari"] },
    },
    ...(visual
      ? [
          {
            name: "visual-mobile",
            testMatch: "**/*.visual.ts",
            use: {
              ...devices["Desktop Chrome"],
              viewport: { width: 375, height: 667 },
              isMobile: true,
              hasTouch: true,
            },
          },
          {
            name: "visual-desktop",
            testMatch: "**/*.visual.ts",
            use: { ...devices["Desktop Chrome"] },
          },
        ]
      : []),
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
    {
      command: `bunx storybook dev --ci --no-open --port ${storybookPort}`,
      url: `http://localhost:${storybookPort}/iframe.html`,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
  ].slice(0, visual ? 1 : undefined),
});
