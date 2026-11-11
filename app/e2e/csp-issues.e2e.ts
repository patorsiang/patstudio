import { test, expect } from "@playwright/test";

import { routes } from "./support/routes";

/**
 * Chrome logs a Content Security Policy issue in the DevTools Issues panel when
 * a script is blocked, even if the page handles the block and carries on.
 * Lighthouse reads that panel (`inspector-issues`) and drops best-practices
 * below 100, which is how the weekly check found Zod probing `new Function("")`
 * on every page (#79).
 *
 * This reads the same Issues feed through the DevTools Audits domain, so the
 * regression shows up in the PR that causes it, not a week later. It must run
 * against the production build: next.config.ts only adds 'unsafe-eval' in
 * development, where the probe succeeds and nothing is logged.
 *
 * The Audits domain is Chromium-only, so WebKit skips.
 */

for (const route of routes) {
  test(`${route} logs no Content Security Policy issue`, async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "DevTools Audits domain is Chromium-only");

    const cdp = await page.context().newCDPSession(page);
    const violations: string[] = [];

    cdp.on("Audits.issueAdded", ({ issue }) => {
      if (issue.code !== "ContentSecurityPolicyIssue") return;

      const details = issue.details.contentSecurityPolicyIssueDetails;

      violations.push(
        `${details?.violatedDirective} ${details?.contentSecurityPolicyViolationType} at ${details?.sourceCodeLocation?.url ?? details?.blockedURL ?? "unknown"}`,
      );
    });
    await cdp.send("Audits.enable");

    await page.goto(route, { waitUntil: "networkidle" });

    expect(violations, "Content Security Policy issues Chrome logged").toEqual([]);
  });
}
