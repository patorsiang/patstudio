import { test, expect, type Page } from "@playwright/test";

/**
 * docs/design/namecard.md section 2: the card is 308x504 (55x90mm, ratio
 * 0.611) in the mockups, but "in the build it must scale proportionally -
 * roughly min(308px, calc(100vw - 48px)) with the height derived from the
 * 0.611 ratio - or it overflows a 320px phone."
 *
 * It did not. A fixed w-[308px] plus the page's 24px padding needs 356px, so
 * at 320px flexbox squeezed the width to 272 while h-[504px] held the height:
 * a 272x504 card, ratio 1.853 instead of 1.636. overflow.e2e.ts could not see
 * it - nothing overflowed, the card was just the wrong shape - and it only
 * runs at 375px, where the card still fits.
 *
 * Found by a Hallmark audit (life-planning tools trail, 2026-10-02), then
 * measured on production before this test was written.
 */

const DESIGN_RATIO = 504 / 308;

async function faceBox(page: Page) {
  await page.goto("/card");
  const face = page.locator(".namecard-face").first();
  await expect(face).toBeVisible();
  const box = await face.boundingBox();
  if (!box) throw new Error("namecard face has no box");
  return box;
}

for (const width of [320, 360]) {
  test(`the card keeps its 55x90 shape and fits a ${width}px phone`, async ({ page }) => {
    await page.setViewportSize({ width, height: 640 });
    const box = await faceBox(page);

    expect(box.height / box.width).toBeCloseTo(DESIGN_RATIO, 2);
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width);
  });
}

test("the card is its full 308x504 once there is room", async ({ page }) => {
  await page.setViewportSize({ width: 414, height: 896 });
  const box = await faceBox(page);

  expect(box.width).toBeCloseTo(308, 0);
  expect(box.height).toBeCloseTo(504, 0);
});
