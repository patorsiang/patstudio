import { test, expect } from "@playwright/test";

import { loadForPrint } from "./support/print";
import { themes } from "./support/theme";

/**
 * Guards the printed CV, which CLAUDE.md singles out as the thing that breaks
 * silently:
 *
 *   "whenever you touch anything under apps/portfolio-web/src/app/cv/ or its
 *    print rules in globals.css, manually verify (a) dark-mode print contrast
 *    and (b) that content still fits the page. Printed output breaks silently
 *    and there's no automated check for it."
 *
 * This is that check. Both halves matter more than a usual style regression:
 * the CV is a real job-search document, so a failure here is not a wrong pixel,
 * it is a recruiter opening a black-on-black PDF or a CV whose last role fell
 * onto a third page.
 *
 * Why nothing existing catches either:
 *
 * - contrast.e2e.ts walks the rendered DOM in both themes, but only ever under
 *   *screen* media. Paper has no dark mode - packages/ui/tokens.css carries a
 *   whole @media print block swapping the dark palette back to light - and
 *   nothing exercises it. Break that block and every screen test stays green.
 * - Nothing anywhere measures how many pages the CV occupies.
 *
 * Page count comes from page.pdf() rather than a sum of element heights,
 * because only page.pdf() runs Chrome's real pagination: @page's A4 box, the
 * mm/px rounding slack documented in globals.css, and every `break-inside:
 * avoid` in the .cv-print-* family. A height sum agrees with itself and with
 * nothing that comes out of a printer.
 *
 * GlobalNav and SiteFooter hiding in print is already covered by
 * footer.e2e.ts ("the footer is not printed on the CV"). This file covers the
 * CV toolbar instead - the chrome nearest the content, and the one whose
 * `print:hidden` is easiest to drop while editing the toolbar itself.
 *
 * Every assertion here was verified by planting the bug it exists to catch:
 *
 * - Repointing the @media print selector in packages/ui/tokens.css at a
 *   data-theme nobody sets failed the dark contrast sweep, naming three CV
 *   project links at 1.19:1. Note which test did NOT fail: "paper has no dark
 *   mode" stayed green, because globals.css pins body to #ffffff/#18181b
 *   directly and never consults the tokens. The two are not redundant - one
 *   guards the body rule, the other guards the token block, and only the pair
 *   covers the sheet.
 * - Dropping `print:hidden` from CvToolbar failed the toolbar test; replacing
 *   PrintButton's onClick with a no-op failed the dialog test.
 * - Lowering MAX_PAGES to 1 failed three of the five variants with "prints
 *   across 2 pages" and left the other two green, so the counter reports real,
 *   per-role page counts rather than a constant.
 */

/** Every CV variant: page fit is a property of the content, not of the layout. */
const cvRoutes = [
  "/en/cv/fullstack-engineer",
  "/en/cv/ai-ml-engineer",
  "/en/cv/security-engineer",
  "/en/cv/apple-specialist",
  "/th/cv/fullstack-engineer",
];

/**
 * A CV running past two sides is one nobody reads to the end. A house rule
 * rather than a spec line - but an unbounded page count is exactly how a CV
 * grows to four pages one bullet at a time, unnoticed, which is the silent
 * failure CLAUDE.md is describing. All five variants currently print on two.
 */
const MAX_PAGES = 2;

const MIN_BODY = 4.5;
const MIN_LARGE = 3;

test("the Print CV button opens the browser print dialog", async ({ page }) => {
  // Stubbed before the first load: a real window.print() blocks on a native
  // dialog, which would hang the run with no way back.
  await page.addInitScript(() => {
    (window as unknown as { __printCalls: number }).__printCalls = 0;
    window.print = () => {
      (window as unknown as { __printCalls: number }).__printCalls += 1;
    };
  });

  await page.goto("/en/cv/fullstack-engineer");
  await page.getByRole("button", { name: /print/i }).click();

  const calls = await page.evaluate(
    () => (window as unknown as { __printCalls: number }).__printCalls,
  );

  expect(calls, "Print CV did not call window.print()").toBe(1);
});

test("the CV toolbar is not printed", async ({ page }) => {
  await loadForPrint(page, "/en/cv/fullstack-engineer", "light");

  // The role selector and the download buttons are screen affordances. On
  // paper they are a row of dead pill outlines sitting above the name.
  await expect(page.getByRole("button", { name: /print/i })).toBeHidden();
  await expect(page.getByRole("link", { name: /download json/i })).toBeHidden();
  await expect(page.getByRole("link", { name: /download markdown/i })).toBeHidden();
  await expect(page.locator(".grid-glow")).toBeHidden();
});

test.describe("paper has no dark mode", () => {
  for (const theme of themes) {
    test(`a CV stored as ${theme} still prints on a light sheet`, async ({ page }) => {
      await loadForPrint(page, "/en/cv/fullstack-engineer", theme);

      const painted = await page.evaluate(() => {
        const parse = (colour: string) => (colour.match(/[\d.]+/g) || []).map(Number);
        const style = getComputedStyle(document.body);
        return {
          background: parse(style.backgroundColor).slice(0, 3),
          text: parse(style.color).slice(0, 3),
        };
      });

      // The print block in packages/ui/tokens.css re-declares the light
      // palette for :root[data-theme="dark"], and globals.css pins the body
      // itself to #ffffff/#18181b. If either stops matching - a renamed
      // attribute, a specificity change - the sheet prints near-black, and
      // nothing else in the suite would notice.
      const brightness = (rgb: number[]) => (rgb[0] + rgb[1] + rgb[2]) / 3;

      expect(
        brightness(painted.background),
        `printed page background is rgb(${painted.background}), not a light sheet`,
      ).toBeGreaterThan(240);
      expect(
        brightness(painted.text),
        `printed body text is rgb(${painted.text}), too light to read on paper`,
      ).toBeLessThan(80);
    });
  }
});

test.describe("printed text meets WCAG AA", () => {
  for (const theme of themes) {
    test(`a CV stored as ${theme} is legible in print media`, async ({ page }) => {
      await loadForPrint(page, "/en/cv/fullstack-engineer", theme);

      // The same DOM walk as contrast.e2e.ts, under print media instead of
      // screen. Helpers are duplicated into the callback on purpose:
      // Playwright serialises it, so it cannot close over anything out here.
      const failures = await page.evaluate(
        ({ minBody, minLarge }) => {
          // Print media is the only place the app paints a colour Chrome
          // serialises outside sRGB: TextLink carries `print:text-zinc-800`,
          // a raw Tailwind palette class (v4 defines those in oklch), which
          // design-system.md permits specifically as a `print:` override.
          // getComputedStyle then reports `lab(15.7305 ...)`, and a naive
          // `/[\d.]+/g` parse reads that as rgb(15, 0, 2) - near-black, so it
          // scores a contrast the element does not have. Painting the colour
          // into a canvas and reading the pixel back is the one conversion
          // that holds for any CSS colour, in any space, including alpha.
          //
          // This is load-bearing, not tidiness: with the token block broken on
          // purpose, the offending links reported rgb(39, 39, 42) at 1.19:1
          // through the canvas. Parsed naively they read as rgb(15, 0, 2),
          // which clears 4.5:1 comfortably - the sweep would have gone green
          // on an unreadable page.
          const ctx = document.createElement("canvas").getContext("2d")!;
          const toRgba = (colour: string) => {
            ctx.clearRect(0, 0, 1, 1);
            ctx.fillStyle = colour;
            ctx.fillRect(0, 0, 1, 1);
            const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
            return [r, g, b, a];
          };

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
          // Nearest painted backdrop. Starts at the element itself, so text on
          // its own fill compares against that fill rather than the page.
          const backdrop = (el: Element | null) => {
            for (let node = el; node; node = node.parentElement) {
              const painted = toRgba(getComputedStyle(node).backgroundColor);
              if (painted[3] === 255) return painted.slice(0, 3);
            }
            return toRgba(getComputedStyle(document.body).backgroundColor).slice(0, 3);
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

            const foreground = toRgba(style.color).slice(0, 3);
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
        `Printed text below WCAG AA with the ${theme} theme stored:\n` +
          failures.map((line) => `  ${line}`).join("\n"),
      ).toEqual([]);
    });
  }
});

test.describe("the CV fits on the page", () => {
  for (const route of cvRoutes) {
    test(`${route} prints on at most ${MAX_PAGES} A4 pages`, async ({ page, browserName }) => {
      // page.pdf() is Chromium-headless only. The sweeps already run on
      // Chromium; this skip exists so a headed debugging run reports the
      // reason rather than an opaque protocol error.
      test.skip(browserName !== "chromium", "page.pdf() requires Chromium");

      await page.goto(route);

      // page.pdf() applies print media itself, so this deliberately does not
      // go through loadForPrint - the DOM it paginates is the screen one.
      const pdf = await page.pdf({ format: "A4", printBackground: true });

      // Chrome writes one `/Type /Page` object per page, plus a single
      // `/Type /Pages` node for the tree - hence the negative lookahead on the
      // plural, which would otherwise inflate every count by one.
      const pages = (pdf.toString("latin1").match(/\/Type\s*\/Page(?!s)/g) ?? []).length;

      expect(pages, `${route} produced no pages at all`).toBeGreaterThan(0);
      expect(pages, `${route} prints across ${pages} pages`).toBeLessThanOrEqual(MAX_PAGES);
    });
  }
});
