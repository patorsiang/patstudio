import { test, expect } from "@playwright/test";
import { roleConfigs, type CvRoleId } from "@patorsiang/cv-engine";

/**
 * The CV sheet is the one output with no automated check - `maxPages` in the role
 * config is metadata nothing measures, and print breakage is invisible from the
 * screen (see CLAUDE.md). This sweep is that check.
 *
 * It caught the real thing it was written for: Full-Stack printed a second A4 sheet
 * carrying one line of Languages because the article ran 16px past the page box, and
 * Security printed a second sheet 9% full. Both looked fine in the browser.
 *
 * Measured against the real print box, not the viewport: Playwright's print media
 * emulation applies the `@media print` rules, and the article is forced to the
 * printable width so text wraps exactly as it does on paper. Skipping the width step
 * makes a CV that overflows measure as if it fits, because a wider column wraps less.
 */

const MM_TO_PX = 96 / 25.4;

// A4 less the `@page { margin: 7mm 9mm }` declared in globals.css.
const PRINTABLE_WIDTH_PX = (210 - 9 * 2) * MM_TO_PX;
const PRINTABLE_HEIGHT_PX = (297 - 7 * 2) * MM_TO_PX;

/**
 * A sheet this empty is worse than a denser preceding one - it reads as content that
 * overflowed by accident rather than a second page anyone intended.
 */
const MIN_LAST_SHEET_FILL = 0.25;

const roleSlugs: ReadonlyArray<readonly [CvRoleId, string]> = [
  ["fullstack_engineer", "fullstack-engineer"],
  ["ai_ml_engineer", "ai-ml-engineer"],
  ["security_engineer", "security-engineer"],
  ["apple_specialist", "apple-specialist"],
];

for (const [roleId, slug] of roleSlugs) {
  const { maxPages } = roleConfigs[roleId].limits;

  test(`${slug} CV prints within its ${maxPages}-page budget without an orphan sheet`, async ({
    page,
  }) => {
    // Printing happens at paper width whatever device requested the page, so the
    // viewport is pinned to a full A4 rather than inherited from the project. Left to
    // the mobile project's narrow viewport the `sm:` breakpoints drop out, the skills
    // grid falls to one column, and a CV that fits on paper measures as if it does not.
    await page.setViewportSize({ width: Math.round(210 * MM_TO_PX), height: 1123 });
    await page.emulateMedia({ media: "print" });
    await page.goto(`/en/cv/${slug}`);

    const article = page.locator(".cv-print-article");
    await expect(article).toBeVisible();

    const height = await article.evaluate((element, width) => {
      const el = element as HTMLElement;
      el.style.width = `${width}px`;
      el.style.maxWidth = `${width}px`;
      return el.getBoundingClientRect().height;
    }, PRINTABLE_WIDTH_PX);

    const pages = height / PRINTABLE_HEIGHT_PX;
    const sheets = Math.ceil(pages);
    const lastSheetFill = pages / sheets;

    expect(
      sheets,
      `${slug} needs ${sheets} sheet(s) (${pages.toFixed(3)} pages) but its budget is ${maxPages}`,
    ).toBeLessThanOrEqual(maxPages);

    if (sheets > 1) {
      expect(
        lastSheetFill,
        `${slug} spills onto sheet ${sheets} at only ${Math.round(lastSheetFill * 100)}% fill`,
      ).toBeGreaterThan(MIN_LAST_SHEET_FILL);
    }
  });
}
