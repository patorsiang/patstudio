import { test, expect, type Page } from "@playwright/test";

import { routes } from "./support/routes";

/**
 * Enforces the motion rules in docs/design/motion-guidelines.md and the
 * "Respect `prefers-reduced-motion`" line in docs/design/design-system.md.
 *
 * Two properties, because either one alone can pass while the app is broken:
 *
 * 1. Under `prefers-reduced-motion: reduce`, nothing animates. A page with no
 *    motion at all satisfies this trivially, which is why (2) exists.
 * 2. With motion allowed, the app does animate - so a future change that
 *    accidentally strips every transition fails loudly instead of turning this
 *    file into a test that can no longer detect anything.
 *
 * (2) also asserts nothing loops forever. An animation that runs indefinitely
 * and offers no way to pause it is a WCAG 2.2.2 (Pause, Stop, Hide, Level A)
 * failure - which is exactly the shape of the blinking caret still live in
 * legacy-v1, so it is worth catching here before the replacement inherits it.
 */

/** Anything above this is motion a user would perceive. */
const STILL = 0.0001;

async function collectMotion(page: Page) {
  return page.evaluate(
    ({ still }) => {
      // Longest duration in a computed value, which may be a comma-separated
      // list ("0.12s, 0.12s") because a rule can transition several properties.
      const seconds = (value: string) =>
        Math.max(
          ...String(value)
            .split(",")
            .map((part) => {
              const trimmed = part.trim();
              const parsed = Number.parseFloat(trimmed);
              if (Number.isNaN(parsed)) return 0;
              return trimmed.endsWith("ms") ? parsed / 1000 : parsed;
            }),
        );

      const moving: { label: string; detail: string }[] = [];
      let scanned = 0;

      for (const el of document.querySelectorAll<HTMLElement>("*")) {
        scanned += 1;
        const style = getComputedStyle(el);
        const transition = seconds(style.transitionDuration);
        const animation = seconds(style.animationDuration);
        if (transition <= still && animation <= still) continue;

        const className = typeof el.className === "string" ? el.className : "";
        moving.push({
          label: `<${el.tagName.toLowerCase()}>${className ? ` .${className.trim().split(/\s+/).join(".")}` : ""}`,
          detail:
            `transition ${transition}s, animation ${animation}s` +
            (style.animationName !== "none" ? ` (${style.animationName})` : ""),
        });
      }

      return {
        scanned,
        moving,
        infinite: [...document.querySelectorAll<HTMLElement>("*")]
          .filter((el) => getComputedStyle(el).animationIterationCount.includes("infinite"))
          .map((el) => `<${el.tagName.toLowerCase()}> ${getComputedStyle(el).animationName}`),
        scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
      };
    },
    { still: STILL },
  );
}

test.describe("prefers-reduced-motion: reduce", () => {
  for (const route of routes) {
    test(`nothing animates on ${route}`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      const response = await page.goto(route);
      expect(response?.status(), `${route} did not render`).toBeLessThan(500);

      const { scanned, moving, scrollBehavior } = await collectMotion(page);

      expect(scanned, `${route} rendered nothing to measure`).toBeGreaterThan(20);

      expect(
        moving,
        `Still animating under reduced motion on ${route}:\n` +
          moving.map((m) => `  ${m.label} - ${m.detail}`).join("\n"),
      ).toEqual([]);

      // The global block forces this; smooth scrolling is motion a reduced-motion
      // user did not ask for, and it is easy to reintroduce from a component.
      expect(scrollBehavior, `${route} still scrolls smoothly`).toBe("auto");
    });
  }
});

test.describe("motion allowed", () => {
  test("the app animates, so the reduced-motion sweep is not vacuous", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    const { moving } = await collectMotion(page);

    expect(
      moving.length,
      "Nothing on / animates even with motion allowed. Either the transitions were " +
        "removed, or the reduced-motion tests above are no longer proving anything.",
    ).toBeGreaterThan(0);
  });

  for (const route of routes) {
    test(`nothing loops forever on ${route}`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.goto(route);
      const { infinite } = await collectMotion(page);

      expect(
        infinite,
        `Animations running indefinitely on ${route} (WCAG 2.2.2 needs a way to ` +
          `pause, stop or hide them):\n` +
          infinite.map((line) => `  ${line}`).join("\n"),
      ).toEqual([]);
    });
  }
});
