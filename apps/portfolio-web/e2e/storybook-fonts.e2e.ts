import { test, expect } from "@playwright/test";

/**
 * The app gets Geist from layout.tsx, which puts geistSans.variable on <html>.
 * Storybook never renders layout.tsx, so unless its preview does the same,
 * --font-geist-sans is empty and every story falls back to Tailwind's
 * ui-sans-serif / system-ui stack. On macOS that is San Francisco, close
 * enough to Geist at 14px that nobody noticed; a pixel comparison against the
 * Figma design did (uimatch trial, 2026-09-28). Anything that treats a story
 * as "what the component looks like" inherits the wrong font.
 */

const story = "/iframe.html?id=atoms-button--primary&viewMode=story";

test("stories render in Geist, the app's typeface", async ({ page }) => {
  await page.goto(story);
  const button = page.locator("#storybook-root button");
  await expect(button).toBeVisible();

  const fontFamily = await button.evaluate((el) => getComputedStyle(el).fontFamily);
  expect(fontFamily).toMatch(/^['"]?Geist\b/);
});

test("stories get both font variables the app's root layout sets", async ({ page }) => {
  await page.goto(story);
  await expect(page.locator("#storybook-root button")).toBeVisible();

  const vars = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    return {
      sans: root.getPropertyValue("--font-geist-sans").trim(),
      mono: root.getPropertyValue("--font-geist-mono").trim(),
    };
  });
  expect(vars.sans).not.toBe("");
  expect(vars.mono).not.toBe("");
});
