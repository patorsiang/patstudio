import { test, expect } from "@playwright/test";

import { routes } from "./support/routes";

/**
 * Keyboard *operability*, which is a different property from the focus
 * visibility focus-visible.e2e.ts already sweeps.
 *
 * That file tabs the whole focus order of every route and measures the ring at
 * each stop - so it proves a keyboard user can see where they are. It presses
 * Tab and nothing else, so it cannot tell whether anything happens when they
 * act. A control that takes focus, draws a perfect 2px ring and ignores Enter
 * passes every existing suite.
 *
 * "Keyboard navigable" is a stated requirement
 * (docs/requirements/portfolio-web.md section 9.2), and
 * docs/design/ux-principles.md section 6 asks for "keyboard access for all
 * interactive elements".
 *
 * Scope note: this does not try to activate every control on every route.
 * Pressing Enter on each of a few hundred links would mostly re-test
 * next/link, and each activation navigates away from the page under test. It
 * covers instead the controls whose keyboard path is bespoke enough to break:
 * the native <details> role selector, and /card's flip with its hand-written
 * focus retarget across two faces. The theme toggle's Enter/Space handling
 * lives in theme-toggle.e2e.ts, next to the rest of that control.
 *
 * Escape is deliberately not asserted on the <details> dropdown. Native
 * <details> does not close on Escape in any engine, nothing in the design docs
 * asks it to, and a test demanding it would be inventing a requirement.
 *
 * Verified by planting each fault: giving the <summary> a positive tabindex
 * failed the tab-order sweep on all five CV routes, and replacing
 * NamecardFlip's requestAnimationFrame retarget with a no-op failed the
 * focus-follows-the-flip test.
 *
 * The third is worth recording precisely, because the obvious reading of it is
 * wrong. Removing `inert` from the hidden namecard face does NOT fail the
 * tabbing test on its own: `visibility: hidden` in globals.css drops that face
 * out of the tab order too, and its own comment says it is there partly for
 * exactly this ("matching the aria-hidden and inert the component already sets
 * on it"). Only neutralising both makes Tab reach the back face. That is the
 * right sensitivity for a property guarded on purpose by two mechanisms - but
 * do not read a green run here as proof that `inert` specifically is still
 * doing its job.
 */

test.describe("nothing hijacks the tab order", () => {
  for (const route of routes) {
    test(`${route} leaves tab order to the DOM`, async ({ page }) => {
      await page.goto(route);

      const offenders = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>("[tabindex]")]
          .filter((el) => Number.parseInt(el.getAttribute("tabindex") ?? "0", 10) > 0)
          .map((el) => `<${el.tagName.toLowerCase()}> tabindex=${el.getAttribute("tabindex")}`),
      );

      // A positive tabindex pulls an element to the front of the tab order for
      // the whole document, so the reading order and the tabbing order stop
      // agreeing - and it does it silently, for every control after it.
      expect(offenders, `positive tabindex on ${route}:\n  ${offenders.join("\n  ")}`).toEqual([]);
    });
  }
});

test.describe("the CV role dropdown", () => {
  // Below `sm` the segmented control collapses to a native <details>; above it
  // the row renders instead and there is no disclosure to operate.
  test.use({ viewport: { width: 375, height: 667 } });

  for (const key of ["Enter", "Space"] as const) {
    test(`${key} opens the role list`, async ({ page }) => {
      await page.goto("/en/cv/fullstack-engineer");

      const details = page.locator("details");
      await expect(details).toHaveCount(1);
      await expect(details).not.toHaveAttribute("open", /.*/);

      await page.locator("summary").focus();
      await page.keyboard.press(key);

      await expect(details, `${key} did not open the dropdown`).toHaveAttribute("open", /.*/);
    });
  }

  test("a role can be chosen without a pointer", async ({ page }) => {
    await page.goto("/en/cv/fullstack-engineer");

    await page.locator("summary").focus();
    await page.keyboard.press("Enter");

    const target = page.locator("details").getByRole("link", { name: "Security Engineer" });
    await target.focus();
    await page.keyboard.press("Enter");

    // Real anchors, so Enter navigates without any JS of ours involved. The
    // point is that the disclosure does not trap the options behind a pointer.
    await expect(page).toHaveURL(/\/en\/cv\/security-engineer$/);
  });
});

test.describe("the namecard flip", () => {
  const frontCue = "Turn card over to see contact channels";

  test("flips from the keyboard", async ({ page }) => {
    await page.goto("/card");

    const inner = page.locator(".namecard-inner");
    await expect(inner).toHaveAttribute("data-flipped", "false");

    await page.getByRole("button", { name: frontCue }).focus();
    await page.keyboard.press("Enter");

    await expect(inner, "Enter did not turn the card").toHaveAttribute("data-flipped", "true");
  });

  test("focus follows the card to the face that is now showing", async ({ page }) => {
    await page.goto("/card");

    await page.getByRole("button", { name: frontCue }).focus();
    await page.keyboard.press("Enter");
    await expect(page.locator(".namecard-inner")).toHaveAttribute("data-flipped", "true");

    // toggle() blurs the active element before flipping, so without the
    // deferred retarget in NamecardFlip's layout effect a keyboard user is
    // left on <body> - tabbing from the top of the document again, with no
    // indication the card even turned.
    // That retarget is deliberately one requestAnimationFrame behind the
    // attribute (NamecardFlip.tsx:148-157): `inert` has to be gone from the DOM
    // *and* painted before the new target will accept focus at all. So
    // data-flipped turning true does not mean focus has moved yet, and reading
    // activeElement once, right after that attribute, races the frame - green
    // on a quiet machine, red on a loaded CI runner under the full suite, which
    // is exactly how this first failed. Poll until focus settles off <body>,
    // then ask where it actually went.
    await expect
      .poll(
        () =>
          page.evaluate(() => {
            const active = document.activeElement;
            return active !== null && active !== document.body;
          }),
        { message: "focus was dropped on the body after the flip" },
      )
      .toBe(true);

    const landedOn = await page.evaluate(() => {
      const active = document.activeElement as HTMLElement | null;
      return {
        tag: active?.tagName.toLowerCase() ?? "none",
        insideVisibleFace: Boolean(active?.closest(".namecard-face--back")),
      };
    });

    expect(
      landedOn.insideVisibleFace,
      `focus landed on a <${landedOn.tag}> off the visible face`,
    ).toBe(true);
  });

  test("the face turned away cannot be reached by tabbing", async ({ page }) => {
    await page.goto("/card");

    // "The face-down side stays in the DOM, so it must be made `inert` (or
    // equivalent) while hidden." (docs/design/motion-guidelines.md)
    // namecard-flip.e2e.ts proves the hidden face is not *painted*; nothing
    // proved it was out of the tab order, which is the other half of hidden.
    const reached: string[] = [];

    for (let step = 0; step < 25; step += 1) {
      await page.keyboard.press("Tab");
      const where = await page.evaluate(() => {
        const active = document.activeElement as HTMLElement | null;
        if (!active || active === document.body) return null;
        return active.closest(".namecard-face--back")
          ? `${active.tagName.toLowerCase()}:${(active.textContent || active.getAttribute("aria-label") || "").trim().slice(0, 24)}`
          : null;
      });
      if (where) reached.push(where);
    }

    expect(reached, `Tab reached the hidden back face:\n  ${reached.join("\n  ")}`).toEqual([]);
  });
});
