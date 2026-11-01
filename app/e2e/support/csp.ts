import type { Page } from "@playwright/test";

/**
 * Drops `upgrade-insecure-requests` from the app's CSP for the life of one
 * page, so a WebKit run can load the plain-HTTP test server at all.
 *
 * The directive is real and correct in production (next.config.ts sends it on
 * every response, and production is HTTPS-only). The problem is local:
 * Chromium exempts potentially-trustworthy origins - `127.0.0.1` included -
 * from the upgrade, so the Chromium projects never notice it. WebKit applies
 * it to loopback as well, rewrites every subresource to `https://127.0.0.1:3100`
 * and fails the lot with "A TLS error caused the secure connection to fail".
 * The page then renders as unstyled HTML: no stylesheet, no hydration, and a
 * namecard that is a 234px stack of text rather than a 308x504 card. Every
 * assertion after that measures the wrong thing.
 *
 * `bypassCSP: true` does not help - Playwright's CSP bypass does not reach
 * WebKit's upgrade path - so the header itself has to go. Rewriting only this
 * one directive keeps the rest of the policy enforced during the test.
 */
export async function allowInsecureSubresources(page: Page) {
  await page.route("**/*", async (route) => {
    const response = await route.fetch();
    const headers = { ...response.headers() };
    const csp = headers["content-security-policy"];

    if (csp) {
      headers["content-security-policy"] = csp
        .split(";")
        .map((directive) => directive.trim())
        .filter((directive) => directive !== "upgrade-insecure-requests")
        .join("; ");
    }

    await route.fulfill({ response, headers });
  });
}
