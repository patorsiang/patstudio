import { test, expect, type Page } from "@playwright/test";

/**
 * The phone menu in GlobalNav (QA-patstudio-s0-wcag-audit-01, observation O5).
 *
 * Seven links and the theme buttons wrapped into a block that filled three
 * quarters of a phone screen once text was enlarged to 200%: 505 of 667 px
 * on a 375 px phone, with the page heading pushed to 777 px, below the fold.
 * Below the `sm` breakpoint the links now sit behind a "Menu" button. From
 * `sm` up the nav is as it was, with no button.
 *
 * The breakpoint is the project's own: the `mobile` project is 375 px wide and
 * the `desktop` project is 1280 px. Each test says which it is for, and skips in
 * the other, so a run in either project tests the half that applies.
 */

const SM_BREAKPOINT_PX = 640;
const primaryLabels = ["Home", "About", "Experience", "Projects", "Posts", "CV", "Contact"];

function nav(page: Page) {
  return page.getByRole("navigation", { name: "Global navigation" });
}

function menuButton(page: Page) {
  return nav(page).getByRole("button", { name: "Menu", exact: true });
}

function isPhone(page: Page) {
  return (page.viewportSize()?.width ?? 0) < SM_BREAKPOINT_PX;
}

test.describe("on a phone", () => {
  test.beforeEach(({ page }) => {
    test.skip(!isPhone(page), "the menu button exists below the sm breakpoint only");
  });

  test("the links are behind a Menu button until it is pressed", async ({ page }) => {
    await page.goto("/about");

    const button = menuButton(page);

    await expect(button).toBeVisible();
    await expect(button).toHaveAttribute("aria-expanded", "false");
    for (const label of primaryLabels) {
      await expect(nav(page).getByRole("link", { name: label, exact: true })).toBeHidden();
    }

    await button.click();

    await expect(button).toHaveAttribute("aria-expanded", "true");
    for (const label of primaryLabels) {
      await expect(nav(page).getByRole("link", { name: label, exact: true })).toBeVisible();
    }

    await button.click();

    await expect(button).toHaveAttribute("aria-expanded", "false");
    await expect(nav(page).getByRole("link", { name: "About", exact: true })).toBeHidden();
  });

  test("the button points at the links it controls", async ({ page }) => {
    await page.goto("/about");

    const controlled = await menuButton(page).getAttribute("aria-controls");

    expect(controlled, "aria-controls is set").toBeTruthy();
    // The id must exist in the document even while the panel is closed, or the
    // relationship points at nothing.
    await expect(page.locator(`[id="${controlled}"]`)).toHaveCount(1);
    // A CSS locator, not getByRole: a closed panel is display:none, so it is
    // out of the accessibility tree and getByRole would not find its links.
    await expect(page.locator(`[id="${controlled}"] a[href="/about"]`)).toHaveCount(1);
  });

  test("the theme buttons stay in view with the menu closed", async ({ page }) => {
    await page.goto("/about");

    await expect(menuButton(page)).toHaveAttribute("aria-expanded", "false");
    await expect(nav(page).getByRole("button", { name: "Use dark theme" })).toBeVisible();
    await expect(nav(page).getByRole("button", { name: "Use light theme" })).toBeVisible();
  });

  test("Escape closes the menu and puts focus back on the button", async ({ page }) => {
    await page.goto("/about");

    const button = menuButton(page);

    await button.click();
    await nav(page).getByRole("link", { name: "Projects", exact: true }).focus();
    await page.keyboard.press("Escape");

    await expect(button).toHaveAttribute("aria-expanded", "false");
    await expect(button).toBeFocused();
  });

  test("choosing a link goes there, and the next page starts with the menu closed", async ({
    page,
  }) => {
    await page.goto("/");
    await menuButton(page).click();
    await nav(page).getByRole("link", { name: "Projects", exact: true }).click();

    await expect(page).toHaveURL(/\/projects$/);
    await expect(menuButton(page)).toHaveAttribute("aria-expanded", "false");
  });

  test("the keyboard reaches the menu button before the links, and the links in order", async ({
    page,
  }) => {
    await page.goto("/about");

    // Skip link first, then the Menu button.
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await expect(menuButton(page)).toBeFocused();

    await page.keyboard.press("Enter");
    await expect(menuButton(page)).toHaveAttribute("aria-expanded", "true");

    const order: string[] = [];

    for (let index = 0; index < primaryLabels.length; index += 1) {
      await page.keyboard.press("Tab");
      order.push(await page.evaluate(() => document.activeElement?.textContent?.trim() ?? ""));
    }

    expect(order).toEqual(primaryLabels);
  });

  test("at 200% text the closed nav leaves the page heading on the first screen", async ({
    page,
  }) => {
    await page.goto("/about");
    await page.addStyleTag({ content: "html { font-size: 200% !important; }" });

    const { navHeight, headingTop, viewport } = await page.evaluate(() => {
      const navBox = document
        .querySelector('nav[aria-label="Global navigation"]')
        ?.getBoundingClientRect();
      const heading = document.querySelector("h1")?.getBoundingClientRect();

      return {
        navHeight: navBox?.height ?? Number.POSITIVE_INFINITY,
        headingTop: (heading?.top ?? Number.POSITIVE_INFINITY) + window.scrollY,
        viewport: window.innerHeight,
      };
    });

    // Measured before the change: nav 505 px, heading at 777 px, on a 667 px screen.
    expect(navHeight, "closed nav height at 200% text").toBeLessThan(viewport * 0.4);
    expect(headingTop, "page heading position at 200% text").toBeLessThan(viewport);
  });
});

test.describe("on a wide screen", () => {
  test.beforeEach(({ page }) => {
    test.skip(isPhone(page), "the nav is the same row of links from the sm breakpoint up");
  });

  test("there is no Menu button, and every link is visible", async ({ page }) => {
    await page.goto("/about");

    await expect(menuButton(page)).toBeHidden();
    for (const label of primaryLabels) {
      await expect(nav(page).getByRole("link", { name: label, exact: true })).toBeVisible();
    }
  });
});
