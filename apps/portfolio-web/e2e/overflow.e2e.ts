import { test, expect } from "@playwright/test";

import { routes } from "./support/routes";

/**
 * Flags any element whose content overflows its own padding box while
 * nothing in its own styling is set up to scroll or clip it - the class of
 * bug that let the CV role selector spill 30px past its rounded border at
 * 375px (see segmented-control.e2e.ts and SegmentedLinks.tsx) without
 * tripping any existing check: `main` is `overflow-hidden` (for GridGlow),
 * so the usual `document.body.scrollWidth > clientWidth` horizontal-scroll
 * check passed despite the bug - the overflow was clipped, not scrollable.
 *
 * `overflow-x: visible` is the app's default everywhere except two
 * deliberate containers - `main` (`overflow-hidden`, globals.css) and
 * `.post-body pre` (`overflow-x: auto`, globals.css) - so filtering to
 * `visible` also filters out both of them, along with anything nested
 * inside `main`'s clip that would otherwise read as "overflowing" its own
 * box while actually being invisible past the clip.
 *
 * `document.documentElement`/`document.body` are skipped: their scrollWidth
 * reflects the whole page's layout, not a single component's box, and a
 * horizontal-scroll regression at that level is a different check than this
 * one.
 */
const MAX_SLACK_PX = 1;

type Failure = {
  readonly label: string;
  readonly overflowPx: number;
};

for (const route of routes) {
  test(`nothing on ${route} overflows its own box at this viewport`, async ({ page }) => {
    const response = await page.goto(route);

    expect(response?.status(), `${route} did not render`).toBeLessThan(500);

    const failures = await page.evaluate(
      ({ maxSlack }) => {
        const results: Failure[] = [];

        for (const element of document.querySelectorAll<HTMLElement>("*")) {
          if (element === document.documentElement || element === document.body) continue;
          if (getComputedStyle(element).overflowX !== "visible") continue;
          if (!element.checkVisibility()) continue;

          const overflowPx = element.scrollWidth - element.clientWidth;
          if (overflowPx <= maxSlack) continue;

          const label = `<${element.tagName.toLowerCase()}>${element.id ? `#${element.id}` : ""} ${(
            element.getAttribute("aria-label") ||
            element.textContent ||
            ""
          )
            .trim()
            .replace(/\s+/g, " ")
            .slice(0, 40)}`;

          results.push({ label, overflowPx });
        }

        return results;
      },
      { maxSlack: MAX_SLACK_PX },
    );

    expect(
      failures,
      `Overflow on ${route}:\n` +
        failures
          .map((item) => `  ${item.label} - ${item.overflowPx}px past its own box`)
          .join("\n"),
    ).toEqual([]);
  });
}
