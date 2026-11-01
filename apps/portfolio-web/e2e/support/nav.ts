import type { Page } from "@playwright/test";

/**
 * Makes the primary navigation links clickable on any viewport.
 *
 * Below the `sm` breakpoint GlobalNav keeps the links behind a "Menu" button
 * (audit observation O5), so a test that clicks a nav link on the `mobile`
 * project has to open the menu first. From `sm` up there is no button and this
 * does nothing, which lets one test body serve both projects.
 *
 * Opens only when closed: pressing the button twice would shut it again.
 */
export async function openNavMenu(page: Page) {
  const button = page
    .getByRole("navigation", { name: "Global navigation" })
    .getByRole("button", { name: "Menu", exact: true });

  if ((await button.isVisible()) && (await button.getAttribute("aria-expanded")) === "false") {
    await button.click();
  }
}
