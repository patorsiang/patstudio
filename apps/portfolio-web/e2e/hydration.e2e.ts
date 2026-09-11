import { expect, test, type ConsoleMessage, type Page } from "@playwright/test";

import { routes } from "./support/routes";

/**
 * Fails if any route hydrates with a React mismatch, throws an uncaught
 * exception, or logs an unexpected console error.
 *
 * This suite exists because a sitewide hydration warning once sat in the dev
 * console with nothing to catch it: sixteen e2e specs, and not one of them
 * looked at the console. Every assertion here is about output nobody sees
 * unless they happen to have DevTools open.
 *
 * Alone in this suite, it runs against `next dev` rather than a production
 * build - playwright.config.ts's `devPort` comment explains why that is
 * forced rather than chosen. Everything else here still runs against
 * `next start`; do not "tidy" this one back onto the shared server.
 *
 * The other half of the value is the browser it runs in. A hydration mismatch
 * reported on a developer's machine is ambiguous - Grammarly, 1Password and
 * friends inject attributes into <body> and provoke the identical warning -
 * and chasing that ambiguity is expensive. A clean browser with no extensions
 * settles it: if this suite is green and your own console is not, the
 * difference is your browser, not the app.
 *
 * If this suite fails locally on a /posts route and nowhere else, check the
 * GitHub rate limit before reading anything into it: unauthenticated, the
 * posts listing gets 60 requests/hour per IP, and a few rebuilds exhaust it.
 * The post then 404s and React client-renders the subtree, which surfaces a
 * second, unrelated warning about rendering <script> tags. Re-run as
 * `GITHUB_TOKEN=$(gh auth token) bunx playwright test --project=hydration`
 * to rule it out - CI already passes a token for exactly this reason.
 */

/**
 * React's mismatch messages, across the several shapes it uses. Matched
 * loosely on purpose - the wording changes between React releases, and a
 * guard that silently stops matching is worse than no guard. The
 * react.dev/errors codes are the minified production wording; they should not
 * appear against a dev server, and are kept so this still catches something
 * if the project is ever pointed at a production build.
 */
const hydrationPattern =
  /hydrat|did not match|server rendered HTML|react\.dev\/errors\/(?:418|423|425)/i;

/**
 * Console errors that are expected here and say nothing about the app.
 *
 * Keep this list short, specific, and justified. The temptation is to widen
 * an entry until the suite goes green - don't. A bare "Failed to load
 * resource" would swallow a genuinely missing image, which is exactly the
 * class of bug this suite is meant to surface.
 */
const allowedConsoleErrors: readonly { pattern: RegExp; because: string }[] = [
  {
    pattern: /_vercel\/(?:insights|speed-insights)\/script\.js/,
    because:
      "@vercel/analytics and @vercel/speed-insights fetch their script from a path that only exists when deployed on Vercel. Off-platform - which is every local and CI run - it 404s and the client logs the failure. Nothing to fix; the components are correct.",
  },
  {
    pattern: /va\.vercel-scripts\.com/,
    because: "Same two components, but the dev/debug script host they fall back to.",
  },
  {
    // Matched on the upstream cause rather than on the two messages it
    // produces ("Falling back to committed post summaries" for the index,
    // "Could not load post <slug>" for a single post), so a third caller
    // degrading the same way does not need a third entry here.
    pattern: /listing posts failed: \d+/,
    because:
      "The posts listing reads api.github.com, which allows 60 requests/hour per IP unauthenticated - see the GITHUB_TOKEN comment in .github/workflows/ci.yml. When that fails the app deliberately degrades to committed summaries and logs that it did, and `next dev` replays the server-side log into the browser console. That fallback firing is the app behaving correctly; whether the rate limit is hit is environmental. Whether the listing itself is healthy belongs to posts/fetch.test.ts and posts.e2e.ts - failing here would only make the hydration guard flaky for an unrelated reason.",
  },
];

function isAllowed(message: ConsoleMessage) {
  const text = `${message.text()} ${message.location().url}`;

  return allowedConsoleErrors.some((entry) => entry.pattern.test(text));
}

type Collected = {
  readonly hydration: string[];
  readonly pageErrors: string[];
  readonly consoleErrors: string[];
};

/**
 * Listeners must be attached before the first navigation: hydration happens
 * within a few hundred ms of the document arriving, and a listener registered
 * after `goto` resolves has already missed it.
 */
function collect(page: Page): Collected {
  const hydration: string[] = [];
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];

  page.on("console", (message) => {
    const text = message.text();

    if (hydrationPattern.test(text)) {
      hydration.push(text);
      return;
    }

    if (message.type() === "error" && !isAllowed(message)) {
      consoleErrors.push(`${text} (${message.location().url})`);
    }
  });

  page.on("pageerror", (error) => {
    const text = `${error.name}: ${error.message}`;

    if (hydrationPattern.test(text)) {
      hydration.push(text);
      return;
    }

    pageErrors.push(text);
  });

  return { hydration, pageErrors, consoleErrors };
}

/**
 * `<next-route-announcer>` is appended by the App Router from an effect, so
 * its presence means React has hydrated *and* committed - which is precisely
 * the window a mismatch would be reported in. Waiting on it beats a fixed
 * timeout: it is a real condition, and if a future Next.js stops emitting the
 * element this fails loudly on a timeout rather than quietly passing without
 * ever having waited for hydration at all.
 */
async function waitForHydration(page: Page) {
  await page.waitForSelector("next-route-announcer", { state: "attached" });
}

test.describe("every route hydrates cleanly", () => {
  for (const route of routes) {
    test(`${route} reports no hydration mismatch`, async ({ page }) => {
      const collected = collect(page);

      await page.goto(route);
      await waitForHydration(page);

      // The browser logs a console error for any non-OK document, and two
      // routes here legitimately produce one: `/this-route-does-not-exist` is
      // in the shared list precisely to cover not-found.tsx, and a post page
      // 404s whenever the GitHub listing is rate-limited (see the fallback
      // entry in the allowlist above). A 404 page still hydrates, and that is
      // what this suite is about - whether a route *should* 200 belongs to
      // sitemap.e2e.ts and posts.e2e.ts, which own content and routing.
      // Asserting status here only made a hydration guard fail for reasons
      // that have nothing to do with hydration.
      //
      // Matched on the navigated document's exact URL, so every *subresource*
      // error on the page still counts - a missing image is still a failure.
      const documentUrl = page.url();
      const consoleErrors = collected.consoleErrors.filter(
        (entry) => !entry.endsWith(`(${documentUrl})`),
      );

      expect(collected.hydration, `React reported a hydration mismatch on ${route}`).toEqual([]);
      expect(collected.pageErrors, `Uncaught exception on ${route}`).toEqual([]);
      expect(consoleErrors, `Unexpected console error on ${route}`).toEqual([]);
    });
  }
});

/**
 * The theme bootstrap script (src/lib/theme.ts) only does anything when a
 * theme is already stored, so a first-time visitor never exercises it. That
 * makes the returning visitor - the one whose <html data-theme> is rewritten
 * before React hydrates - the case most likely to mismatch, and the one an
 * empty-profile sweep would silently skip.
 */
test.describe("a returning visitor with a stored theme hydrates cleanly", () => {
  for (const theme of ["light", "dark"] as const) {
    test(`${theme} theme restores without a mismatch`, async ({ page }) => {
      await page.addInitScript(
        ([key, value]) => {
          try {
            localStorage.setItem(key, value);
          } catch {
            // Private-mode browsers throw here; the app's own bootstrap
            // script swallows this too, so matching it keeps the test honest
            // about what the app actually tolerates.
          }
        },
        ["portfolio-theme", theme],
      );

      const collected = collect(page);

      await page.goto("/");
      await waitForHydration(page);

      // Proves the script actually ran, so a mismatch would have had the
      // chance to happen. Without this the test could pass by doing nothing.
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);

      expect(collected.hydration, `Stored ${theme} theme caused a mismatch`).toEqual([]);
    });
  }
});
