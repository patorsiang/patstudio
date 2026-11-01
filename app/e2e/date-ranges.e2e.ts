import { test, expect } from "@playwright/test";

/**
 * Date ranges on the site pages use an en dash ("2024-01–2025-06"), the
 * typographic range mark. The CV keeps a spaced hyphen ("2024-01 - 2025-06")
 * on purpose: the CV is what applicant-tracking systems parse, and some older
 * parsers mis-read an en dash inside a date. The CV has its own formatter
 * (CvPageContent.tsx), so the two must not drift into each other.
 *
 * Found by a Hallmark audit (life-planning tools trail, 2026-10-02).
 */

const ISO_RANGE_EN_DASH = /\d{4}-\d{2}–(\d{4}-\d{2}|present)/i;
const ISO_RANGE_HYPHEN = /\d{4}-\d{2} - (\d{4}-\d{2}|present)/i;

for (const route of ["/", "/experience"]) {
  test(`${route} writes date ranges with an en dash`, async ({ page }) => {
    await page.goto(route);
    const text = await page.locator("main").innerText();

    expect(text).toMatch(ISO_RANGE_EN_DASH);
    expect(text).not.toMatch(ISO_RANGE_HYPHEN);
  });
}

test("the CV keeps the ATS-safe spaced hyphen", async ({ page }) => {
  await page.goto("/cv");
  const text = await page.locator("main").innerText();

  expect(text).toMatch(ISO_RANGE_HYPHEN);
  expect(text).not.toMatch(ISO_RANGE_EN_DASH);
});

test("experience card dates use tabular figures so stacked ranges align", async ({ page }) => {
  await page.goto("/");
  const date = page.getByText(ISO_RANGE_EN_DASH).first();
  await expect(date).toHaveCSS("font-variant-numeric", "tabular-nums");
});
