import { test, expect } from "@playwright/test";

/**
 * A page that is not found must say so in its title (WCAG 2.4.2 Page Titled).
 * Before this, not-found.tsx exported no metadata, so the 404 inherited the
 * home page's title and a screen-reader user, or anyone with many tabs open,
 * could not tell it from the real home page.
 */

test("the 404 page has its own title", async ({ page }) => {
  const response = await page.goto("/this-route-does-not-exist");

  expect(response?.status()).toBe(404);
  await expect(page).toHaveTitle("Page not found | Napatchol Thaipanich");
});
