import { test, expect } from "@playwright/test";

/**
 * The theme control is the most-used button on the site, and until this file
 * nothing in the suite had ever clicked it.
 *
 * That gap was structural rather than an oversight. contrast.e2e.ts,
 * focus-visible.e2e.ts and the rest all need a theme pinned before they
 * measure anything, so they go through `loadWithTheme()`, which writes
 * localStorage directly (e2e/support/theme.ts). That is right for those
 * suites - they are asking what the dark theme *looks* like, and driving the
 * UI to get there would only add a way for them to fail for an unrelated
 * reason. The side effect is that the whole app could render both themes
 * perfectly while the only control that reaches them did nothing at all, and
 * every suite would stay green.
 *
 * So this file never touches localStorage to set up a theme. It clicks, and
 * then checks both halves of what a click means: the attribute the page paints
 * from (`data-theme`) and the value that makes it outlast the tab
 * (localStorage). Asserting only the first passes on a control that forgets
 * every reload; asserting only the second passes on one that stores a
 * preference it never applies.
 *
 * The system-preference behaviour below is the part most likely to rot. It is
 * invisible in normal use - it only shows up for a visitor who has never
 * chosen, whose OS then flips to dark - and it is three interacting pieces:
 * a matchMedia listener, a stored-value guard, and a fallback
 * (GlobalNav.tsx:45-64).
 *
 * Every assertion here was verified against a build with the behaviour
 * removed:
 *
 * - Dropping the localStorage write from selectTheme() failed the persistence
 *   and the survives-navigation tests.
 * - Deleting the anti-FOUC bootstrap <script> from layout.tsx failed the
 *   applied-before-paint test, which is the only one that could see it: the
 *   settled DOM is identical either way, and every other suite stayed green.
 * - Removing the matchMedia "change" listener failed the follows-the-system
 *   test and nothing else.
 *
 * One caveat recorded honestly, because a future reader will otherwise trip
 * on it: "an explicit choice outranks the system" does not fail when either
 * protecting mechanism is removed on its own, only when both are. See the
 * comment on that test.
 */

const STORAGE_KEY = "portfolio-theme";

/** GlobalNav renders on every route through PageShell; /card deliberately has none. */
const ROUTE = "/about";

function themeButton(page: import("@playwright/test").Page, theme: "light" | "dark") {
  return page.getByRole("button", { name: `Use ${theme} theme` });
}

function storedTheme(page: import("@playwright/test").Page) {
  return page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY);
}

function appliedTheme(page: import("@playwright/test").Page) {
  return page.evaluate(() => document.documentElement.dataset.theme);
}

test("clicking Dark paints the page dark and remembers the choice", async ({ page }) => {
  await page.goto(ROUTE);

  await themeButton(page, "dark").click();

  await expect
    .poll(() => appliedTheme(page), { message: "data-theme did not change" })
    .toBe("dark");
  expect(await storedTheme(page), "the choice was not persisted").toBe("dark");
});

test("clicking Light again returns to the light theme", async ({ page }) => {
  await page.goto(ROUTE);

  await themeButton(page, "dark").click();
  await expect.poll(() => appliedTheme(page)).toBe("dark");

  await themeButton(page, "light").click();

  await expect.poll(() => appliedTheme(page)).toBe("light");
  expect(await storedTheme(page)).toBe("light");
});

test("the active theme is announced, not just coloured", async ({ page }) => {
  await page.goto(ROUTE);

  // "Do not use colour alone for selected, active, warning, or status states."
  // (docs/design/design-system.md). For this control aria-pressed is that
  // second channel, so it has to track the click rather than just exist.
  await themeButton(page, "dark").click();
  await expect(themeButton(page, "dark")).toHaveAttribute("aria-pressed", "true");
  await expect(themeButton(page, "light")).toHaveAttribute("aria-pressed", "false");

  await themeButton(page, "light").click();
  await expect(themeButton(page, "light")).toHaveAttribute("aria-pressed", "true");
  await expect(themeButton(page, "dark")).toHaveAttribute("aria-pressed", "false");
});

test("the choice survives navigating to another page", async ({ page }) => {
  await page.goto(ROUTE);
  await themeButton(page, "dark").click();
  await expect.poll(() => appliedTheme(page)).toBe("dark");

  // A client-side navigation: the root layout never re-runs, so the theme
  // survives only if it is held somewhere outside the page being replaced.
  await page.getByRole("link", { name: "Projects", exact: true }).click();
  await expect(page).toHaveURL(/\/projects$/);

  expect(await appliedTheme(page), "the theme reset on navigation").toBe("dark");
});

test("the choice is applied before the page paints, not after hydration", async ({ page }) => {
  // The anti-FOUC bootstrap in layout.tsx is a blocking inline script, so the
  // attribute must already be set while the document is still parsing. If it
  // ever regressed to running from GlobalNav's effect instead, the theme would
  // still end up correct - after a visible flash of the light page, which no
  // assertion on the settled DOM could see.
  await page.addInitScript(() => {
    // Observes `document`, not `document.documentElement`: an init script runs
    // before the page's own scripts, which is early enough that <html> does not
    // exist yet - observing it directly throws, and the failure is silent, so
    // the recorded value just stays undefined and the test looks like a
    // product bug. Attribute mutations on <html> surface here through subtree.
    new MutationObserver((records) => {
      for (const record of records) {
        if ((record.target as HTMLElement).dataset?.theme) {
          const store = window as unknown as { __themeSetAt?: string };
          store.__themeSetAt ??= document.readyState;
        }
      }
    }).observe(document, { attributes: true, subtree: true, attributeFilter: ["data-theme"] });
  });
  await page.addInitScript(([key, value]) => localStorage.setItem(key, value), [
    STORAGE_KEY,
    "dark",
  ] as const);

  await page.goto(ROUTE);
  await expect.poll(() => appliedTheme(page)).toBe("dark");

  const readyStateWhenApplied = await page.evaluate(
    () => (window as unknown as { __themeSetAt?: string }).__themeSetAt,
  );

  expect(
    readyStateWhenApplied,
    "the stored theme was applied after parsing finished, so the page flashes light first",
  ).toBe("loading");
});

test.describe("with nothing stored, the system preference decides", () => {
  for (const scheme of ["light", "dark"] as const) {
    test(`a first visit under prefers-color-scheme: ${scheme} renders ${scheme}`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto(ROUTE);

      await expect.poll(() => appliedTheme(page)).toBe(scheme);

      // Following the system is not the same as choosing. Writing it here
      // would silently freeze the visitor's first accidental theme forever.
      expect(
        await storedTheme(page),
        "merely following the system preference wrote a stored choice",
      ).toBeNull();
    });
  }
});

test("the page follows the system flipping to dark mid-visit", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto(ROUTE);
  await expect.poll(() => appliedTheme(page)).toBe("light");

  await page.emulateMedia({ colorScheme: "dark" });

  // The matchMedia "change" listener at GlobalNav.tsx:59. Nothing else in the
  // suite exercises it, and a visitor who has never touched the control is
  // exactly the visitor who would notice it failing.
  await expect
    .poll(() => appliedTheme(page), { message: "the page ignored the system switching to dark" })
    .toBe("dark");
});

test("an explicit choice outranks the system flipping underneath it", async ({ page }) => {
  // One transition, in one direction, and the stored choice deliberately
  // disagrees with where the system ends up. An earlier version of this test
  // flipped light-then-dark back to back to return the system to where it
  // started; Chrome coalesced the pair into no net change, fired no event at
  // all, and the test passed against a build with this behaviour removed
  // outright. A media change the browser never delivers proves nothing.
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto(ROUTE);

  await themeButton(page, "light").click();
  await expect.poll(() => appliedTheme(page)).toBe("light");

  // A witness for the event itself, registered after GlobalNav's own listener
  // and before the flip. This is what makes the negative assertion below mean
  // anything: it is not enough that the theme stayed light, the browser has to
  // have actually delivered the change that the page then declined to follow.
  // The coalescing failure described above is invisible without it, and a
  // fixed sleep here goes green against a browser that fired nothing at all.
  await page.evaluate(() => {
    const w = window as typeof window & { __systemFlip?: boolean };
    w.__systemFlip = false;
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener(
      "change",
      () => {
        w.__systemFlip = true;
      },
      { once: true },
    );
  });

  await page.emulateMedia({ colorScheme: "dark" });

  await expect
    .poll(
      () =>
        page.evaluate(
          () => (window as typeof window & { __systemFlip?: boolean }).__systemFlip === true,
        ),
      { message: "the browser never delivered the prefers-color-scheme change" },
    )
    .toBe(true);

  // Dispatch order across distinct MediaQueryList objects is unspecified, so
  // the witness firing does not on its own prove GlobalNav's handler has run.
  // Two frames is the settle point for a React state update and its commit,
  // and unlike a duration it is anchored to an event that demonstrably fired.
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );

  // Protected twice over: handleChange skips the recompute when anything is
  // stored (GlobalNav.tsx:52-56), and applyPreferredTheme prefers the stored
  // value over the system one anyway (GlobalNav.tsx:48). Either alone holds
  // this up, so this assertion only goes red when both are gone - which is
  // the right sensitivity. It guards the property a reader cares about, not
  // whichever line currently happens to deliver it.
  expect(await appliedTheme(page), "the system override beat an explicit choice").toBe("light");
});

test("a junk stored value falls back to the system rather than breaking", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.addInitScript(([key, value]) => localStorage.setItem(key, value), [
    STORAGE_KEY,
    "solarized",
  ] as const);

  await page.goto(ROUTE);

  // getStoredTheme() returns null for anything but "light"/"dark", so a value
  // left by an older build - or by a different app on a shared localhost
  // origin - degrades to the system preference instead of painting an
  // undefined theme.
  await expect.poll(() => appliedTheme(page)).toBe("dark");
});

test.describe("the control is operable from the keyboard", () => {
  for (const key of ["Enter", "Space"] as const) {
    test(`${key} activates the theme button`, async ({ page }) => {
      await page.goto(ROUTE);

      await themeButton(page, "dark").focus();
      await page.keyboard.press(key);

      await expect
        .poll(() => appliedTheme(page), { message: `${key} did not activate the control` })
        .toBe("dark");
    });
  }
});
