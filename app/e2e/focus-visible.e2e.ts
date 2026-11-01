import { test, expect } from "@playwright/test";

import { routes } from "./support/routes";
import { loadWithTheme, settle, themes } from "./support/theme";

/**
 * "Focus states must be visible on all links, buttons, and controls."
 * (docs/design/design-system.md)
 *
 * Tabs the whole focus order of every route in both themes and checks each stop
 * three ways:
 *
 * - an indicator exists at all;
 * - it is at least 2px thick, per WCAG 2.2 SC 2.4.11 Focus Appearance (AA),
 *   which wants an indicator no smaller than a 2px perimeter of the control;
 * - it clears 3:1 against what sits behind it, per SC 1.4.11.
 *
 * The thickness check is what a manual pass keeps missing. A 1px ring is
 * visible, so it survives a look-and-see review, while being half the size the
 * rest of the app uses and half what 2.4.11 asks for. Reading the number is the
 * only reliable way to catch it.
 */

const MIN_RING_PX = 2;
const MIN_RING_CONTRAST = 3;

for (const theme of themes) {
  for (const route of routes) {
    test(`every focus stop on ${route} has a visible ring in ${theme}`, async ({ page }) => {
      const response = await loadWithTheme(page, route, theme);
      expect(response?.status(), `${route} did not render`).toBeLessThan(500);

      const expectedStops = await page.evaluate(
        () =>
          document.querySelectorAll(
            "a[href], button:not([disabled]), input:not([type=hidden]):not([disabled]), " +
              'select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])',
          ).length,
      );
      expect(expectedStops, `${route} has nothing focusable to check`).toBeGreaterThan(0);

      const failures: string[] = [];
      const seen = new Set<string>();

      // A few past the count, so the sweep still completes if the browser
      // inserts a stop the selector above does not predict.
      for (let step = 0; step < expectedStops + 4; step += 1) {
        await page.keyboard.press("Tab");
        await settle(page);

        const stop = await page.evaluate(
          ({ minWidth, minContrast }) => {
            const el = document.activeElement as HTMLElement | null;
            if (!el || el === document.body || el === document.documentElement) return null;

            const parse = (colour: string) => (colour.match(/[\d.]+/g) || []).map(Number);
            const channel = (value: number) => {
              const s = value / 255;
              return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
            };
            const luminance = (rgb: number[]) =>
              0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2]);
            const contrast = (a: number[], b: number[]) => {
              const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
              return (hi + 0.05) / (lo + 0.05);
            };

            const label = `<${el.tagName.toLowerCase()}> ${(
              el.getAttribute("aria-label") ||
              el.textContent ||
              ""
            )
              .trim()
              .replace(/\s+/g, " ")
              .slice(0, 30)}`;

            const style = getComputedStyle(el);
            const width = Number.parseFloat(style.outlineWidth) || 0;

            if (style.outlineStyle === "none" || width === 0) {
              return { key: label, problem: `${label} - focused with no visible indicator` };
            }

            // `auto` is the browser's own ring: it ignores most of the app's
            // outline styling and renders differently per engine, so the design
            // system's focus state is not actually what a user sees.
            if (style.outlineStyle === "auto") {
              return {
                key: label,
                problem: `${label} - falls back to the browser default ring (no focus-visible: classes)`,
              };
            }

            if (width < minWidth) {
              return {
                key: label,
                problem: `${label} - ring is ${width}px, needs ${minWidth}px (WCAG 2.4.11)`,
              };
            }

            // The ring sits outside the control (outline-offset), so it is
            // judged against what surrounds it, not the control's own fill.
            let behind = "rgba(0, 0, 0, 0)";
            for (let node = el.parentElement; node; node = node.parentElement) {
              const colour = getComputedStyle(node).backgroundColor;
              if (colour !== "rgba(0, 0, 0, 0)") {
                behind = colour;
                break;
              }
            }
            if (behind === "rgba(0, 0, 0, 0)") {
              behind = getComputedStyle(document.body).backgroundColor;
            }

            const ratio =
              Math.round(
                contrast(parse(style.outlineColor).slice(0, 3), parse(behind).slice(0, 3)) * 100,
              ) / 100;

            return ratio < minContrast
              ? {
                  key: label,
                  problem: `${label} - ring ${ratio}:1, needs ${minContrast}:1 (WCAG 1.4.11)`,
                }
              : { key: label, problem: null };
          },
          { minWidth: MIN_RING_PX, minContrast: MIN_RING_CONTRAST },
        );

        if (!stop) continue;
        if (seen.has(stop.key)) continue;
        seen.add(stop.key);
        if (stop.problem) failures.push(stop.problem);
      }

      expect(seen.size, `${route} produced no tab stops at all`).toBeGreaterThan(0);

      expect(
        failures,
        `Focus indicator problems on ${route} in ${theme} ` +
          `(${seen.size} stops checked):\n` +
          failures.map((line) => `  ${line}`).join("\n"),
      ).toEqual([]);
    });
  }
}
