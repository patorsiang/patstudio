import { expect, test } from "@playwright/test";

/**
 * Covers two small motion-consistency gaps a sitewide sweep found against
 * docs/design/motion-guidelines.md's own "similar components should move
 * in similar ways" principle. See
 * docs/superpowers/specs/2026-08-16-hero-motion-design.md.
 */

// "See all projects" is a plain TextLink, not a Button. Every TextLink on
// the site shares the same sharedClassName, so one instance is
// representative - this is a component-level guarantee, not a per-page
// one.
//
// These measure actual rendered movement via getBoundingClientRect(),
// not a CSS property read: TextLink is a bare inline <a>, so the press
// feedback is `top` on a `position: relative` element (not `transform`,
// which Tailwind v4 emits as a `translate:` property and which does
// nothing on a non-transformable inline box anyway). A class-presence or
// getComputedStyle(el).transform check would pass whether or not the
// feature actually renders.
for (const [motion, expectedShift] of [
  ["no-preference", 1],
  ["reduce", 0],
] as const) {
  test(`press feedback ${motion === "reduce" ? "is absent" : "moves the link"} under prefers-reduced-motion: ${motion}`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: motion });
    await page.goto("/");

    const link = page.getByRole("link", { name: "See all projects" });
    await link.scrollIntoViewIfNeeded();

    // "See all projects" lives inside the Projects section, which
    // RevealOnView wraps (see section-reveal.e2e.ts). Scrolling it into
    // view is what triggers that section's own reveal transition
    // (translate-y 8px -> 0 over 200ms), and if the "before" measurement
    // below happens while that's still in flight, the ancestor's own
    // motion gets picked up by getBoundingClientRect() alongside - or
    // instead of - the ~1px press-feedback shift this test actually
    // checks. Wait comfortably past that 200ms so the section has
    // settled into place before either measurement, leaving only the
    // link's own :active movement to observe.
    await page.waitForTimeout(300);

    const before = await link.evaluate((el) => el.getBoundingClientRect().top);
    const box = (await link.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(150); // let the 120ms transition (if any) settle
    const after = await link.evaluate((el) => el.getBoundingClientRect().top);
    await page.mouse.up();

    expect(after - before).toBeCloseTo(expectedShift, 0);
  });
}

test("theme changes cross-fade instead of snapping", async ({ page }) => {
  // Explicit, not the reduced-motion helper in ./support/theme: that
  // collapses every duration to near-zero on purpose, which would hide
  // exactly the thing this test checks.
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");

  const { property, durationSeconds } = await page.evaluate(() => {
    const style = getComputedStyle(document.body);
    return {
      property: style.transitionProperty,
      durationSeconds: Number.parseFloat(style.transitionDuration),
    };
  });

  expect(property).toContain("color");
  expect(property).toContain("background-color");
  // --default-transition-duration is 120ms; computed style always reports
  // in seconds, hence 0.12.
  expect(durationSeconds).toBeCloseTo(0.12, 2);
});

test("under prefers-reduced-motion, theme changes don't ease either", async ({ page }) => {
  // Explicit, on top of the generic sitewide sweep in
  // e2e/reduced-motion.e2e.ts - names body's new rule specifically, the
  // same reasoning as HeroMark's equivalent test.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const durationSeconds = await page.evaluate(() =>
    Number.parseFloat(getComputedStyle(document.body).transitionDuration),
  );

  // The sitewide reduced-motion block forces this to 0.01ms (1e-5s).
  expect(durationSeconds).toBeLessThan(0.0001);
});
