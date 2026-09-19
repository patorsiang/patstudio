import { test, expect } from "@playwright/test";

import { routes } from "./support/routes";

/**
 * How long the site's motion runs, measured against the ceiling the motion
 * guidelines actually set.
 *
 * docs/design/motion-guidelines.md says "Do not exceed 250ms for normal UI
 * transitions" and names exactly three exceptions. reduced-motion.e2e.ts
 * proves motion exists when it is allowed and stops when it is not; it never
 * asks how long any of it runs, so a transition could drift to 800ms and stay
 * green.
 *
 * Verified by planting a 400ms transition on the shared button styles, which
 * failed this sweep on all thirteen routes that render a button, naming the
 * element and the measured value each time.
 *
 * A finding from the first run, kept because the fix was to this file rather
 * than to the app: measuring duration + delay reported all three of /card's
 * motion values as overruns on a card that matches the spec exactly. The
 * guideline is a ceiling on how long motion runs, and the namecard uses delay
 * for sequencing - see the comment on the measurement itself.
 *
 * Layout shift is deliberately NOT measured here, having been tried and
 * removed. A PerformanceObserver on `layout-shift` reported zero entries - not
 * a small value, no entries at all - on every route, so the sweep exercised
 * none of its own arithmetic, and the companion test that proved the observer
 * could fire at all failed roughly half the time under a full parallel run.
 * A gate that measures nothing and flakes is worse than no gate: it trains
 * people to re-run CI until it passes. That is the same reasoning that keeps
 * Lighthouse out, despite the 90+ target in
 * docs/requirements/portfolio-web.md section 9.1. The useful half of the
 * finding is that the site currently has no measurable layout shift on any
 * route, which is worth knowing and was worth checking by hand.
 */

/** "Do not exceed 250ms for normal UI transitions." (motion-guidelines.md) */
const MAX_DURATION_MS = 250;

/**
 * The three exceptions the guidelines name, each with the duration it allows.
 * Anything not listed here is held to the 250ms ceiling.
 */
const longRunningExceptions = [
  // One-shot brand-mark stroke draw: 500ms.
  { selector: ".hero-mark-draw", limit: 500 },
  // The /card flip: 560ms.
  { selector: ".namecard-inner", limit: 560 },
  // /card's entrance peek and the lanyard settling: 1100ms one-shot each.
  { selector: ".namecard-swing", limit: 1100 },
  { selector: ".namecard-tilt", limit: 1100 },
  { selector: ".namecard-strap", limit: 1100 },
  { selector: ".namecard-seg", limit: 1100 },
];

test.describe("nothing outstays the motion budget", () => {
  for (const route of routes) {
    test(`${route} keeps its motion inside the guidelines`, async ({ page }) => {
      await page.goto(route);

      const overruns = await page.evaluate(
        ({ ceiling, exceptions }) => {
          const longest = (value: string) =>
            Math.max(
              0,
              ...value
                .split(",")
                .map((part) => part.trim())
                .map((part) =>
                  part.endsWith("ms")
                    ? Number.parseFloat(part)
                    : Number.parseFloat(part) * 1000 || 0,
                ),
            );

          const results: string[] = [];

          for (const el of document.querySelectorAll<HTMLElement>("*")) {
            const style = getComputedStyle(el);
            // Duration only, not duration + delay. The guideline is a
            // statement about how long motion runs ("Do not exceed 250ms for
            // normal UI transitions"), and delay here is used deliberately for
            // sequencing rather than to stretch anything: the namecard's face
            // swap is a 0s transition held until the flip's midpoint (280ms),
            // and its entrance animations are offset 650ms so the card settles
            // after the page has painted. Summing the two reported all three
            // as overruns on a card that matches the spec exactly.
            const measured = Math.max(
              longest(style.transitionDuration),
              longest(style.animationDuration),
            );

            if (measured === 0) continue;

            const exception = exceptions.find((entry) => el.matches(entry.selector));
            const limit = exception ? exception.limit : ceiling;

            if (measured > limit + 1) {
              results.push(
                `<${el.tagName.toLowerCase()}${el.className && typeof el.className === "string" ? `.${el.className.split(" ")[0]}` : ""}> ` +
                  `${Math.round(measured)}ms, limit ${limit}ms`,
              );
            }
          }

          return [...new Set(results)];
        },
        { ceiling: MAX_DURATION_MS, exceptions: longRunningExceptions },
      );

      expect(overruns, `Motion past its budget on ${route}:\n  ${overruns.join("\n  ")}`).toEqual(
        [],
      );
    });
  }
});
