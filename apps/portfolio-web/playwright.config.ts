import { defineConfig, devices } from "@playwright/test";

const port = 3100;

/**
 * Runs against a production build, not `next dev`: dev-only overlays inject
 * their own focusable controls, which the tap-target sweep would then measure
 * and report as app violations.
 */
export default defineConfig({
  testDir: "./e2e",
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
    {
      name: "mobile",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 375, height: 667 },
        isMobile: true,
        hasTouch: true,
      },
    },
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
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
  webServer: {
    command: `bun run build && bun run start --port ${port}`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
