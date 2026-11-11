import { test, expect } from "@playwright/test";

import { routes } from "./support/routes";

/**
 * How a keyboard or screen-reader user finds their way around a page.
 *
 * These four checks come from the WCAG audit's observations O1-O4
 * (QA-patstudio-s0-wcag-audit-01, card c13). All four pass WCAG 2.2 AA as
 * written - landmarks already bypass the nav (2.4.1) and links make sense in
 * context (2.4.4) - so no axe rule catches them. They are about the ordinary
 * experience of using the page without a mouse, which is what the rest of the
 * suite cannot see.
 *
 * - Skip link: without one a keyboard user tabs past the whole nav and theme
 *   switch on every page before reaching content.
 * - One h1: screen-reader users jump to the h1 first to learn what page they
 *   are on.
 * - Link names: a screen reader's links list shows names only, so seven links
 *   called "GitHub" are indistinguishable. The name starts with the visible
 *   text (WCAG 2.5.3 Label in Name), so "GitHub: Project name" is fine.
 * - Landmark labels: a landmark list of "navigation, navigation, navigation"
 *   says nothing.
 */

test.describe("skip link", () => {
  for (const route of routes) {
    test(`${route} offers a skip link first, and it moves focus into the page`, async ({
      page,
    }) => {
      await page.goto(route);

      // Only pages built on PageShell carry the global nav, so only they need a bypass.
      const hasGlobalNav = (await page.locator('nav[aria-label="Global navigation"]').count()) > 0;
      test.skip(!hasGlobalNav, "no global nav on this route, nothing to skip");

      await page.keyboard.press("Tab");

      const skip = page.getByRole("link", { name: "Skip to content" });
      await expect(skip).toBeFocused();
      await expect(skip).toBeVisible();

      // Hidden at 1px until focused, so tap-targets.e2e.ts skips it. Measure it
      // here, where it is on screen.
      const box = await skip.boundingBox();
      // 0.5px of slack, the same as tap-targets.e2e.ts: a 40px box can measure 39.999998.
      expect(box?.height ?? 0, "focused skip link height").toBeGreaterThanOrEqual(39.5);

      await page.keyboard.press("Enter");

      // Focus (or the sequential-focus starting point) is now past the nav, so
      // the next Tab lands in the content, not back in the nav.
      await page.keyboard.press("Tab");
      const inNav = await page.evaluate(
        () => document.activeElement?.closest('nav[aria-label="Global navigation"]') !== null,
      );
      expect(inNav, "Tab after the skip link must not land back in the global nav").toBe(false);
    });
  }
});

test.describe("one h1 per page", () => {
  for (const route of routes) {
    test(`${route} has exactly one h1`, async ({ page }) => {
      await page.goto(route);

      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    });
  }
});

test.describe("heading order", () => {
  for (const route of routes) {
    test(`${route} never skips a heading level going down`, async ({ page }) => {
      await page.goto(route);

      // Same rule as axe's heading-order (Lighthouse reports it): going deeper
      // may only step one level at a time. Going back up may jump any amount.
      const skips = await page.evaluate(() => {
        const found: string[] = [];
        let previous = 0;

        for (const heading of document.querySelectorAll("h1, h2, h3, h4, h5, h6")) {
          // Hidden headings are not in the accessibility tree, so they cannot skip.
          if (heading.closest("[hidden], [inert], [aria-hidden='true']")) continue;

          const level = Number(heading.tagName[1]);

          if (previous > 0 && level > previous + 1) {
            found.push(`h${previous} -> h${level}: ${heading.textContent?.trim()}`);
          }
          previous = level;
        }

        return found;
      });

      expect(skips, "headings that skip a level").toEqual([]);
    });
  }
});

test.describe("link names", () => {
  for (const route of routes) {
    test(`${route} has no two links with one name and different targets`, async ({
      page,
      baseURL,
    }) => {
      await page.goto(route);

      const byName = await page.evaluate(() => {
        const nameOf = (el: HTMLAnchorElement) =>
          (el.getAttribute("aria-label") ?? el.textContent ?? "").replaceAll(/\s+/g, " ").trim();
        const seen = new Map<string, Set<string>>();

        for (const link of document.querySelectorAll<HTMLAnchorElement>("a[href]")) {
          // Hidden links (a closed mobile menu) are not in the accessibility
          // tree, so they cannot clash.
          if (link.closest("[hidden], [inert], [aria-hidden='true']")) continue;
          if (link.getClientRects().length === 0) continue;

          const name = nameOf(link);
          const targets = seen.get(name) ?? new Set<string>();

          targets.add(link.href);
          seen.set(name, targets);
        }

        return [...seen]
          .filter(([, targets]) => targets.size > 1)
          .map(([name, t]) => [name, [...t]] as const);
      });

      // Two hrefs can be one destination: /cv redirects to the canonical CV, and
      // the footer links straight to it on purpose. Follow same-site links to
      // where they end up before calling it a clash. Off-site links are compared
      // as written, because fetching someone else's site is not this test's job.
      const clashes: string[] = [];

      for (const [name, hrefs] of byName) {
        const destinations = new Set<string>();

        for (const href of hrefs) {
          destinations.add(
            baseURL && href.startsWith(baseURL) ? (await page.request.get(href)).url() : href,
          );
        }

        if (destinations.size > 1) clashes.push(name);
      }

      expect(clashes, `names shared by links to different places: ${clashes.join(", ")}`).toEqual(
        [],
      );
    });
  }
});

test.describe("landmark labels", () => {
  for (const route of routes) {
    test(`${route} labels every nav landmark, and no two share a label`, async ({ page }) => {
      await page.goto(route);

      const labels = await page.evaluate(() =>
        [...document.querySelectorAll("nav")].map((nav) => nav.getAttribute("aria-label")),
      );
      const unlabelled = labels.filter((label) => !label);
      const named = labels.filter((label): label is string => Boolean(label));
      const repeated = named.filter((label, index) => named.indexOf(label) !== index);

      expect(unlabelled, "nav landmarks without an aria-label").toHaveLength(0);
      expect(repeated, "nav landmarks that share a label").toEqual([]);
    });
  }
});
