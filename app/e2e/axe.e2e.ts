import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@playwright/test";

import { routes } from "./support/routes";
import { loadWithTheme, themes } from "./support/theme";

/**
 * Runs axe-core's WCAG 2.2 A and AA rules against every route, in both themes.
 *
 * Storybook's addon-a11y already runs axe, but only on components in
 * isolation. A component can pass alone and fail once a page composes it: a
 * duplicate id from two instances, a heading level skipped between sections, a
 * landmark nested inside another. Those only exist on a real page, which is
 * what this sweeps.
 *
 * contrast.e2e.ts, focus-visible.e2e.ts, keyboard.e2e.ts and tap-targets.e2e.ts
 * stay: each measures one rule more strictly than axe does. axe's own
 * color-contrast rule is left on, so the two contrast checks disagreeing is
 * itself something a run can show.
 *
 * Known limits, so a green run is not over-read: axe finds roughly a third to a
 * half of WCAG issues, the ones a machine can decide. It sees only what a route
 * renders on load, not a state behind an interaction.
 *
 * The full axe result is attached to each test, so a QA report can cite the
 * file rather than the console.
 */

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

for (const theme of themes) {
  test.describe(`${theme} theme`, () => {
    for (const route of routes) {
      test(`${route} has no axe WCAG A/AA violations`, async ({ page }, testInfo) => {
        const response = await loadWithTheme(page, route, theme);
        expect(response?.status(), `${route} did not render`).toBeLessThan(500);

        const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();

        await testInfo.attach("axe-results", {
          body: JSON.stringify(results, null, 2),
          contentType: "application/json",
        });

        const failures = results.violations.flatMap((violation) =>
          violation.nodes.map(
            (node) =>
              `[${violation.impact ?? "unknown"}] ${violation.id}: ${violation.help} - ${node.target.join(" ")}`,
          ),
        );

        expect(
          failures,
          `axe WCAG A/AA violations on ${route} in ${theme}:\n` +
            failures.map((line) => `  ${line}`).join("\n"),
        ).toEqual([]);
      });
    }
  });
}
