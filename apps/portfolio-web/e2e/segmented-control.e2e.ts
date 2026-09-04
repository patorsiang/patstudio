import { test, expect, type Page } from "@playwright/test";

import { routes } from "./support/routes";

/**
 * Regression coverage for the CV role selector (SegmentedLinks, rendered by
 * CvToolbar): it used to overflow its own rounded border at 375-414px
 * viewports because its segments were `flex-1 whitespace-nowrap` with no
 * `min-w-0` and no `flex-wrap` - a flex item's default `min-width: auto`
 * floors it at min-content width regardless of `flex-1`. `main` being
 * `overflow-hidden` (for GridGlow) clipped the spill, so it never showed up
 * as a document-level horizontal scrollbar - see overflow.e2e.ts for the
 * generic version of that check.
 *
 * Below `sm` the control is now a `<details>` dropdown instead of a row; from
 * `sm` up it stays the row, now wrap-safe. Both are checked here because a
 * fix to one is not evidence the other still works.
 */

const cvRoutes = routes.filter((route) => route.includes("/cv/"));

function controlLabel(route: string) {
  return route.startsWith("/th/") ? "รูปแบบ CV" : "CV variant";
}

type ContainmentResult = {
  readonly found: boolean;
  readonly scrollWidth: number;
  readonly clientWidth: number;
  readonly overflowingLinks: readonly { readonly text: string; readonly overflowPx: number }[];
};

/**
 * Measures the element that actually carries the control's rounded border -
 * the thing a segment can visibly spill out of - and whether any visible link
 * inside it crosses that border's inner edge.
 *
 * Anchoring on the border rather than on "nav's first child" is deliberate and
 * load-bearing. The first-child rule described the current markup only: here
 * the nav wraps a `<details>` and a row `<div>`, but in the markup this test
 * exists to guard against, the nav's children *were* the `<a>` segments. That
 * rule therefore measured a single anchor against itself, found no nested
 * `<a>`, and passed against the very bug it was written for. The border is the
 * one landmark both shapes share.
 */
async function measureContainment(page: Page, label: string): Promise<ContainmentResult> {
  return page.evaluate((ariaLabel) => {
    const nav = document.querySelector(`nav[aria-label="${ariaLabel}"]`);
    const notFound = { found: false, scrollWidth: 0, clientWidth: 0, overflowingLinks: [] };
    if (!nav) return notFound;

    const isRendered = (el: Element) => {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && el.checkVisibility();
    };

    // The nav itself when it is the bordered control (the pre-fix shape, and
    // the non-collapsible one), otherwise whichever child is currently on
    // screen - the closed dropdown below `sm`, the row from `sm` up.
    const box = [nav, ...nav.children].find(
      (el) => isRendered(el) && Number.parseFloat(getComputedStyle(el).borderRightWidth) > 0,
    ) as HTMLElement | undefined;
    if (!box) return notFound;

    const style = getComputedStyle(box);
    const innerRight =
      box.getBoundingClientRect().right -
      Number.parseFloat(style.borderRightWidth) -
      Number.parseFloat(style.paddingRight);

    const overflowingLinks = [...box.querySelectorAll("a")]
      .filter((a) => a.checkVisibility())
      .map((a) => ({
        text: (a.textContent ?? "").trim(),
        overflowPx: Math.round((a.getBoundingClientRect().right - innerRight) * 10) / 10,
      }))
      .filter((link) => link.overflowPx > 1);

    return {
      found: true,
      scrollWidth: box.scrollWidth,
      clientWidth: box.clientWidth,
      overflowingLinks,
    };
  }, label);
}

for (const route of cvRoutes) {
  test(`the CV variant control stays inside its own border on ${route}`, async ({ page }) => {
    await page.goto(route);
    const label = controlLabel(route);
    const result = await measureContainment(page, label);

    expect(result.found, `control "${label}" not found on ${route}`).toBe(true);
    expect(
      result.scrollWidth,
      `control overflows: scrollWidth ${result.scrollWidth} > clientWidth ${result.clientWidth}`,
    ).toBeLessThanOrEqual(result.clientWidth + 1);
    expect(
      result.overflowingLinks,
      `links spilling past the control's border on ${route}:\n` +
        result.overflowingLinks
          .map((link) => `  "${link.text}" by ${link.overflowPx}px`)
          .join("\n"),
    ).toEqual([]);
  });

  test(`the CV variant control adapts to viewport width on ${route}`, async ({ page }) => {
    await page.goto(route);
    const width = page.viewportSize()?.width ?? 0;
    const label = controlLabel(route);
    const nav = page.locator(`nav[aria-label="${label}"]`);
    const summary = nav.locator("summary");
    const row = nav.locator("> div");
    const dropdownLinks = nav.locator("details a");

    if (width < 640) {
      await expect(summary, "dropdown summary should be visible below sm").toBeVisible();
      await expect(row, "the row should be hidden below sm").toBeHidden();

      for (const link of await dropdownLinks.all()) {
        expect(
          await link.evaluate((el) => el.checkVisibility()),
          "dropdown options should not be visible before it is opened",
        ).toBe(false);
      }

      await summary.click();

      for (const link of await dropdownLinks.all()) {
        await expect(link).toBeVisible();
      }
    } else {
      await expect(summary, "the dropdown should not render at sm and up").toBeHidden();
      await expect(row, "the row should be visible at sm and up").toBeVisible();

      for (const link of await row.locator("a").all()) {
        await expect(link).toBeVisible();
      }
    }
  });
}
