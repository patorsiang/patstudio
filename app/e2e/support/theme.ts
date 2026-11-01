import { expect, type Page } from "@playwright/test";

export const themes = ["light", "dark"] as const;

export type ThemeName = (typeof themes)[number];

/**
 * Loads a route with a theme pinned, and with motion collapsed so only settled
 * styles get measured.
 *
 * The settling is the whole reason this is shared rather than inlined. `color`,
 * `background-color` and `outline-color` are all in Tailwind's
 * transition-property list, and GlobalNav marks the current theme's control
 * active a tick after mount - so anything read in the same frame as a state
 * change returns a blend of two tokens that exists in no palette, or an outline
 * still reading as `currentColor`. That produced three separate rounds of
 * "confirmed WCAG failures" that were nothing of the sort. Forgetting it is
 * easy; forgetting it here is not possible.
 */
export async function loadWithTheme(page: Page, route: string, theme: ThemeName) {
  // Collapses every duration through the app's own globals.css rule rather than
  // injecting foreign CSS.
  await page.emulateMedia({ reducedMotion: "reduce" });

  await page.addInitScript((value) => {
    localStorage.setItem("portfolio-theme", value);
  }, theme);

  const response = await page.goto(route);

  // Guards against measuring a page still painting its light-theme defaults,
  // which would report passes that mean nothing.
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.theme)).toBe(theme);

  await settle(page);

  return response;
}

/**
 * Waits for the frame a collapsed transition still needs to land. Reduced motion
 * shortens a transition to 0.01ms; it does not make it retroactive.
 */
export async function settle(page: Page) {
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
}
