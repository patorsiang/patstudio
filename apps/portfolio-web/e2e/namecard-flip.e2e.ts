import { test, expect, type Browser, type Page } from "@playwright/test";

import { allowInsecureSubresources } from "./support/csp";

/**
 * /card is the one place in the app whose correctness rests on CSS 3D
 * compositing rather than on layout, and the engines disagree about it.
 *
 * The flip hides whichever face is turned away with `backface-visibility:
 * hidden` on `.namecard-face` (globals.css). WebKit does not honour that on
 * first paint: it renders the BACK face, mirror-reversed - backwards email,
 * backwards "save contact" - on a card nobody has flipped, and the identity
 * face never appears until the visitor turns the card over. Safari showed this
 * on the real site. Chromium renders it correctly, so nothing else in the suite
 * could see it: every other sweep is pinned to Chromium because it measures
 * layout, where one engine is enough.
 *
 * The fix is the visibility swap keyed off `[data-flipped]` in globals.css,
 * which does not depend on the engine getting 3D backfaces right.
 *
 * Two kinds of test, because neither alone is enough:
 *
 * 1. The computed-visibility checks are the dependable ones. They are exact,
 *    engine-independent, immune to rasterisation timing, and they fail on the
 *    original bug, where both faces computed to `visible` and WebKit painted
 *    the wrong one.
 * 2. The pixel check is the one that watches the actual symptom rather than
 *    the mechanism. It is byte-equality between two independent page loads
 *    that differ by one injected rule, which is unavoidably sensitive to
 *    half-painted frames - hence `stableScreenshot`, and hence serial mode.
 *
 * Things that do NOT work here, all learned the hard way:
 *
 * - Screenshot, mutate the DOM, screenshot again. WebKit does not reliably
 *   repaint this composited subtree after a post-load DOM or inline-style
 *   change, so the second capture comes back byte-identical even when the
 *   element is gone. Silent, and always green. A stylesheet injected at load
 *   time IS honoured, which is why each comparison is two separate loads.
 * - Stored snapshot baselines. WebKit rasterises differently on macOS and on
 *   CI's Linux, so committed PNGs would need per-platform baselines.
 * - Clipping to the badge's own rect. The engines disagree about where a rect
 *   inside a rotated 3D context even is, so a "precise" clip can watch an
 *   empty region and pass against a broken card. The clip is the whole card.
 */

/** The two faces, as the CSS distinguishes them. */
const FRONT_FACE = ".namecard-face:not(.namecard-face--back)";
const BACK_FACE = ".namecard-face--back";

/**
 * Screenshots the region until the render stops changing.
 *
 * A capture taken mid-paint is indistinguishable from a real difference when
 * the assertion is byte-equality. On WebKit a screenshot taken as soon as the
 * card settles comes back with the whole inline-SVG icon row missing, filling
 * in a few hundred milliseconds later; Chromium does the same under parallel
 * load. Several consecutive identical frames are required rather than two,
 * because rasterisation stalls long enough to produce a matching PAIR of
 * half-painted frames - which is exactly how this went green on one engine and
 * red on the other for no real reason.
 */
async function stableScreenshot(
  page: Page,
  clip: { x: number; y: number; width: number; height: number },
): Promise<Buffer> {
  const STABLE_FRAMES = 5;
  const INTERVAL_MS = 150;

  let previous = await page.screenshot({ clip });
  let matches = 0;

  for (let attempt = 0; attempt < 60; attempt += 1) {
    await page.waitForTimeout(INTERVAL_MS);
    const current = await page.screenshot({ clip });

    matches = current.equals(previous) ? matches + 1 : 0;
    previous = current;
    if (matches >= STABLE_FRAMES) return current;
  }

  throw new Error("The card never stopped repainting, so no stable frame could be captured.");
}

/**
 * Opens /card in a known state and hands the settled page to `read`.
 *
 * Opens its own page rather than taking the test's: `addInitScript`
 * accumulates on a page, so reusing one across calls leaves an earlier
 * comparison's injected rule installed for every later render - which surfaces,
 * renders later, as a card whose front face is invisible and unclickable.
 */
async function onCard<T>(
  browser: Browser,
  { flip, css }: { flip: boolean; css?: string },
  read: (page: Page) => Promise<T>,
): Promise<T> {
  // browser.newPage() inherits nothing from the project's `use`, so the two
  // options that change what gets rendered are passed through by hand.
  const { baseURL, viewport } = test.info().project.use;
  const page = await browser.newPage({ baseURL, viewport, serviceWorkers: "block" });

  try {
    // Without this WebKit applies the app's `upgrade-insecure-requests` to
    // loopback, every subresource fails, and the "card" is unstyled text.
    await allowInsecureSubresources(page);

    if (css) {
      await page.addInitScript((rules) => {
        document.addEventListener("DOMContentLoaded", () => {
          const style = document.createElement("style");
          style.textContent = rules;
          document.head.append(style);
        });
      }, css);
    }

    // Collapses the 560ms flip and the one-shot entrance peek through the app's
    // own reduced-motion rule, so the card is settled rather than mid-rotation.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/card");

    if (flip) {
      await page.getByRole("button", { name: "Turn card over to see contact channels" }).click();
      // A real button on the back face, so this is proof the card actually
      // turned rather than just flipping an attribute. Skipped when a rule has
      // been injected, since some of those hide the face this button lives on.
      if (!css) await expect(page.getByRole("button", { name: "front" })).toBeVisible();
    }

    // The hover lean (`.namecard-stage:hover .namecard-tilt`) rotates the card
    // 9deg. Harmless, but it must not vary between two runs being compared.
    await page.mouse.move(0, 0);
    await expect(page.locator(".namecard-inner")).toHaveAttribute("data-flipped", String(flip));

    // Awaited, not returned: `finally` closes the page as soon as this function
    // returns, which would cancel work still in flight.
    return await read(page);
  } finally {
    await page.close();
  }
}

/**
 * What each face computes to, which is what decides whether it can paint.
 *
 * Waits for the swap to settle first. It is applied through a transition -
 * `transition: visibility 0s` plus a delay that reduced motion collapses to
 * zero - so a read taken in the same tick as the flip can still catch the old
 * value. The wait is allowed to time out: falling through to the assertion
 * reports what the faces actually are, which is far more useful than a bare
 * "waitForFunction timed out".
 */
async function faceVisibility(page: Page) {
  await page
    .waitForFunction(
      ([front, back]) =>
        [front, back].filter(
          (selector) =>
            getComputedStyle(document.querySelector<HTMLElement>(selector)!).visibility ===
            "hidden",
        ).length === 1,
      [FRONT_FACE, BACK_FACE],
      { timeout: 2000 },
    )
    .catch(() => {});

  return page.evaluate(
    ([front, back]) => ({
      front: getComputedStyle(document.querySelector<HTMLElement>(front)!).visibility,
      back: getComputedStyle(document.querySelector<HTMLElement>(back)!).visibility,
    }),
    [FRONT_FACE, BACK_FACE],
  );
}

async function cardScreenshot(page: Page) {
  const card = await page.locator(".namecard-inner").boundingBox();
  expect(card, "the card did not render").not.toBeNull();
  return stableScreenshot(page, {
    x: card!.x,
    y: card!.y,
    width: card!.width,
    height: card!.height,
  });
}

test.describe("namecard flip", () => {
  test("the face turned away is hidden outright, not just by its backface", async ({ browser }) => {
    expect(
      await onCard(browser, { flip: false }, faceVisibility),
      "On an unflipped card the back face must be hidden by something other than " +
        "backface-visibility. WebKit ignores that on first paint and renders the back " +
        "face mirror-reversed over the identity face - see the [data-flipped] " +
        "visibility swap in globals.css.",
    ).toEqual({ front: "visible", back: "hidden" });

    expect(
      await onCard(browser, { flip: true }, faceVisibility),
      "On a flipped card the front face must be hidden by something other than " +
        "backface-visibility.",
    ).toEqual({ front: "hidden", back: "visible" });
  });

  // Serial: these compare two page loads byte for byte, and rasterisation under
  // parallel load produces half-painted frames that read as real differences.
  test.describe.configure({ mode: "serial" });

  test("an unflipped card paints only its front face", async ({ browser }) => {
    const asRendered = await onCard(browser, { flip: false }, cardScreenshot);
    const backForcedHidden = await onCard(
      browser,
      { flip: false, css: `${BACK_FACE} { visibility: hidden !important; }` },
      cardScreenshot,
    );

    expect(
      asRendered.equals(backForcedHidden),
      "Hiding the back face changed what an unflipped /card paints, so the back face " +
        "is being painted on a card nobody has flipped. That is the Safari bug: it " +
        "renders mirror-reversed over the identity face.",
    ).toBe(true);
  });

  // Without this, the test above is one silent repaint failure away from passing
  // against a card that paints nothing at all - and a comparison that cannot
  // fail reads as coverage while proving nothing. Same guard as the "the app
  // animates, so the reduced-motion sweep is not vacuous" test next door.
  test("the comparison is not vacuous: hiding the face in view does change the picture", async ({
    browser,
  }) => {
    const asRendered = await onCard(browser, { flip: false }, cardScreenshot);
    const frontForcedHidden = await onCard(
      browser,
      { flip: false, css: `${FRONT_FACE} { visibility: hidden !important; }` },
      cardScreenshot,
    );

    expect(
      asRendered.equals(frontForcedHidden),
      "Hiding the front face of an unflipped card changed nothing, so this comparison " +
        "cannot see the face in view and the test above proves nothing.",
    ).toBe(false);
  });
});
