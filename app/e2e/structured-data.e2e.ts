import { test, expect } from "@playwright/test";

test("every page carries WebSite structured data, with no SearchAction", async ({ page }) => {
  await page.goto("/");

  const scripts = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((nodes) => nodes.map((node) => JSON.parse(node.textContent ?? "null")));

  const website = scripts.find((script) => script["@type"] === "WebSite");

  expect(website).toBeTruthy();
  // No on-site search exists yet - a SearchAction pointing at nothing real
  // is invalid structured data, so this stays absent until one does.
  expect(website).not.toHaveProperty("potentialAction");
});
