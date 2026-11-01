import { expect, type Page } from "@playwright/test";

import { loadWithTheme, type ThemeName } from "./theme";

/**
 * Loads a route with a theme pinned and print media already active.
 *
 * The ordering is the whole point, and it is not the obvious one. Emulating
 * print on an already-loaded page is what you would reach for first, and it
 * silently measures the wrong thing:
 *
 * - `page.emulateMedia()` arrives over CDP, out of step with the page's own
 *   frame loop, so the two requestAnimationFrames in `settle()` can both land
 *   before print styles apply at all;
 * - `body` carries a 120ms colour cross-fade (globals.css), so even once print
 *   media lands the sheet takes another ~50ms to actually turn white;
 * - a colour read inside that window comes back either as the screen value or
 *   as a mid-transition one Chrome serialises in an interpolation space
 *   (`oklab(...)`), which no naive colour parser handles.
 *
 * Measured, not guessed: reading `body` right after the switch returned
 * `rgb(17, 17, 16)` - the dark page token - and reported the print stylesheet
 * as broken, while `page.pdf()` on the same page produced a correct white
 * sheet. Loading straight into print media means no transition ever runs, so
 * every colour is settled and serialised as plain `rgb()` from the first frame.
 */
export async function loadForPrint(page: Page, route: string, theme: ThemeName) {
  await page.emulateMedia({ media: "print" });

  // loadWithTheme() also calls emulateMedia, for reducedMotion. Playwright
  // leaves unspecified options alone, so print media survives that call.
  const response = await loadWithTheme(page, route, theme);

  await expect.poll(() => page.evaluate(() => matchMedia("print").matches)).toBe(true);

  return response;
}
