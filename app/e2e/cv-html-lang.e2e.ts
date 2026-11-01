import { test, expect } from "@playwright/test";

/**
 * DocumentLangSync patches document.documentElement.lang after hydration -
 * it cannot touch the raw server-rendered <html lang="en"> the single root
 * layout ships (see the component's own docstring for why). These tests
 * cover both halves: the corrected live DOM, and the still-en raw response,
 * so the known limitation stays a tracked canary rather than a silent gap.
 */

test("a Thai CV page reports lang=th after hydration", async ({ page }) => {
  await page.goto("/th/cv/fullstack-engineer");

  await expect(page.locator("html")).toHaveAttribute("lang", "th");
});

test("an English CV page reports lang=en after hydration", async ({ page }) => {
  await page.goto("/en/cv/fullstack-engineer");

  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("navigating away from a Thai CV page resets lang back to en", async ({ page }) => {
  await page.goto("/th/cv/fullstack-engineer");
  await expect(page.locator("html")).toHaveAttribute("lang", "th");

  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("the raw HTML response for a Thai CV page still ships lang=en (tracked limitation)", async ({
  request,
}) => {
  const response = await request.get("/th/cv/fullstack-engineer");
  const body = await response.text();

  expect(body).toContain('lang="en"');
});
