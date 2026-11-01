import { test, expect } from "@playwright/test";

import { routes } from "./support/routes";
import { loadWithTheme, themes } from "./support/theme";

/**
 * Enforces the design system's text contrast rule against what the browser
 * actually paints, in both themes:
 *
 *   "Text contrast should meet WCAG AA at minimum."
 *   (docs/design/design-system.md)
 *
 * Focus indicators are a different property with a different threshold, and
 * live in focus-visible.e2e.ts.
 *
 * Computing ratios from the token table is easy, and covers only the pairs
 * somebody thought to list. This walks the rendered DOM instead, so a component
 * that puts accent text on a surface nobody has combined before gets measured
 * too - that gap is the whole reason this exists.
 *
 * Thresholds are WCAG 2.1 AA per 1.4.3: 4.5:1 for body text, 3:1 for large text
 * (>=24px, or >=18.66px at weight 700+).
 *
 * Known limits, so a green run is not over-read: it compares flat colours, so
 * text over a gradient or an image is not meaningfully checked; and it sees
 * only what a route renders at this viewport, not a state behind an
 * interaction.
 *
 * The contrast helpers are duplicated into each page.evaluate on purpose -
 * Playwright serialises the callback, so it cannot close over anything defined
 * out here.
 */

const MIN_BODY = 4.5;
const MIN_LARGE = 3;

for (const theme of themes) {
  test.describe(`${theme} theme`, () => {
    for (const route of routes) {
      test(`text on ${route} meets WCAG AA contrast`, async ({ page }) => {
        const response = await loadWithTheme(page, route, theme);
        expect(response?.status(), `${route} did not render`).toBeLessThan(500);

        const failures = await page.evaluate(
          ({ minBody, minLarge }) => {
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
            const isOpaque = (colour: string) => {
              const p = parse(colour);
              return p.length > 0 && (p[3] === undefined || p[3] === 1);
            };
            // Nearest painted backdrop. Starts at the element itself, so text
            // on its own fill compares against that fill rather than the page.
            const backdrop = (el: Element | null) => {
              for (let node = el; node; node = node.parentElement) {
                const colour = getComputedStyle(node).backgroundColor;
                if (colour !== "rgba(0, 0, 0, 0)" && isOpaque(colour)) {
                  return parse(colour).slice(0, 3);
                }
              }
              return parse(getComputedStyle(document.body).backgroundColor).slice(0, 3);
            };

            const results: string[] = [];

            for (const el of document.querySelectorAll<HTMLElement>("*")) {
              // Only elements holding their own text, or a wrapper would be
              // reported once per descendant.
              const ownsText = [...el.childNodes].some(
                (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
              );
              if (!ownsText) continue;

              const style = getComputedStyle(el);
              if (style.visibility === "hidden" || style.display === "none") continue;
              if (Number.parseFloat(style.opacity) === 0) continue;

              const rect = el.getBoundingClientRect();
              if (rect.width === 0 || rect.height === 0) continue;

              const foreground = parse(style.color).slice(0, 3);
              const background = backdrop(el);
              const size = Number.parseFloat(style.fontSize);
              const weight = Number.parseInt(style.fontWeight, 10) || 400;
              const isLarge = size >= 24 || (size >= 18.66 && weight >= 700);
              const required = isLarge ? minLarge : minBody;
              const ratio = contrast(foreground, background);

              // Tolerance absorbs float noise at the threshold; nothing in the
              // app sits inside it.
              if (ratio + 0.005 < required) {
                const label = `<${el.tagName.toLowerCase()}> ${(el.textContent || "")
                  .trim()
                  .replace(/\s+/g, " ")
                  .slice(0, 32)}`;
                results.push(
                  `${label} - ${Math.round(ratio * 100) / 100}:1, needs ${required}:1 ` +
                    `(rgb(${foreground}) on rgb(${background}), ${size}px/${weight})`,
                );
              }
            }
            return results;
          },
          { minBody: MIN_BODY, minLarge: MIN_LARGE },
        );

        expect(
          failures,
          `Text below WCAG AA on ${route} in ${theme}:\n` +
            failures.map((line) => `  ${line}`).join("\n"),
        ).toEqual([]);
      });
    }
  });
}
