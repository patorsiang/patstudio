import { test, expect } from "@playwright/test";

/**
 * WCAG 2.5.3 Label in Name (A): a control's accessible name must contain its
 * visible text, or a voice-control user who says "click Print CV" is not
 * understood, and a screen-reader user hears something other than what the
 * page shows. Two controls broke it: Print CV was named by a developer note
 * about PDF export, and the TH link was named only "ภาษาไทย".
 */

const cvRoute = "/en/cv/fullstack-engineer";

test("Print CV is named by its visible text", async ({ page }) => {
  await page.goto(cvRoute);

  await expect(page.getByRole("button", { name: "Print CV", exact: true })).toBeVisible();
});

test("each language link is named by its short label and its own name", async ({ page }) => {
  await page.goto(cvRoute);
  const languages = page.getByRole("group", { name: "Language" });

  await expect(languages.getByRole("link", { name: "EN, English", exact: true })).toBeVisible();
  await expect(languages.getByRole("link", { name: "TH, ภาษาไทย", exact: true })).toBeVisible();
});
