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

  let previous: Buffer | undefined;
  let latest = Buffer.alloc(0);
  let matches = 0;

  await expect
    .poll(
      async () => {
        latest = await page.screenshot({ clip });
        matches = previous?.equals(latest) ? matches + 1 : 0;
        previous = latest;
        return matches;
      },
      {
        message: "The card never stopped repainting, so no stable frame could be captured.",
        timeout: 60 * INTERVAL_MS,
        intervals: [INTERVAL_MS],
      },
    )
    .toBeGreaterThanOrEqual(STABLE_FRAMES);

  return latest;
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
async function awaitFaceSwap(page: Page) {
  await page
    .waitForFunction(
      ([front, back]) =>
        [front, back].filter(
          (selector) =>
            getComputedStyle(document.querySelector<HTMLElement>(selector)!).visibility ===
            "hidden",
        ).length === 1,
      [FRONT_FACE, BACK_FACE],
      // 2000ms here was enough when this file ran alongside sixteen specs and
      // too tight once the suite grew past thirty: under a full parallel run
      // the page can still be settling when the budget expires, the wait falls
      // through by design, and the assertion then reports a mid-swap state as
      // a product failure. Raising it changes nothing about a passing run -
      // the poll returns as soon as exactly one face is hidden - and only
      // costs the extra seconds on a run that was going to fail anyway.
      { timeout: 15_000 },
    )
    .catch(() => {});
}

async function faceVisibility(page: Page) {
  await awaitFaceSwap(page);

  return page.evaluate(
    ([front, back]) => ({
      front: getComputedStyle(document.querySelector<HTMLElement>(front)!).visibility,
      back: getComputedStyle(document.querySelector<HTMLElement>(back)!).visibility,
    }),
    [FRONT_FACE, BACK_FACE],
  );
}

/**
 * The card's own hover lean, pinned so it cannot vary between runs.
 *
 * `.namecard-stage:hover .namecard-tilt` rotates the card 9deg about Y, and
 * that state is not a corner case: it is what a mouse user is looking at for
 * the whole time they are reaching for a control, since the pointer has to be
 * over the card to click anything on it. The entrance peek (`namecard-peek`)
 * swings through the same axis to 17deg on every visit.
 *
 * Injected rather than driven by a real `page.mouse.move`, because the mobile
 * project emulates a touch device where hover does not engage, and the
 * geometry - not the input that produced it - is what breaks. `!important`
 * beats both the :hover rule and the keyframes.
 */
const LEAN = `.namecard-tilt { transform: rotateY(-9deg) !important; }`;

/**
 * What the pointer actually reaches at a point, as the page itself sees it.
 *
 * Driven by a real mouse move and read back off `:hover` rather than through
 * `document.elementFromPoint`, because on this element that API is not telling
 * the truth: inside the card's 3D subtree WebKit answers `.namecard-stage` for
 * every point on the card, including points a real click demonstrably lands
 * on. Measuring the broken API instead of the behaviour reported a WebKit-only
 * failure that does not exist. `:hover` shares its hit-testing with clicks,
 * costs no side effects (unlike a click, which flips the card out from under
 * the next sample), and is half of the actual complaint - the dead half of the
 * card takes no hover, no focus and no clicks.
 */
async function pointerReaches(page: Page, x: number, y: number) {
  await page.mouse.move(x, y);
  return page.evaluate(async () => {
    // WebKit applies the new :hover during a style recalc, not synchronously
    // with the move, so a read in the same turn can still describe where the
    // pointer WAS. Two frames is past the recalc. Without this the first probe
    // after the pointer parks at (0, 0) reports a miss under parallel load -
    // intermittently, and only on WebKit.
    await new Promise((settled) => requestAnimationFrame(() => requestAnimationFrame(settled)));

    const deepest = [...document.querySelectorAll(":hover")].at(-1) ?? null;
    const link = deepest?.closest?.("a");
    return {
      link: link ? (link.getAttribute("aria-label") ?? link.textContent!.trim()) : null,
      face: deepest?.closest?.(".namecard-face") ? true : false,
    };
  });
}

/**
 * Parks the pointer in the middle of the face before any measured probe.
 *
 * `onCard` leaves the mouse at (0, 0), well off the card, and the first probe
 * after the pointer arrives is the one that absorbs the cost of arriving:
 * under parallel load WebKit still reported the previous :hover for it, which
 * reads as a miss at whatever point happened to be sampled first. The middle
 * of a face is on the card at every lean - it is the axis the card turns about
 * - so this settles the hover somewhere known, and somewhere that failing
 * would itself be worth knowing about.
 */
async function primePointer(page: Page, face: string) {
  const { x, y } = await page.evaluate((selector) => {
    const box = document.querySelector<HTMLElement>(selector)!.getBoundingClientRect();
    return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
  }, face);

  await expect
    .poll(async () => (await pointerReaches(page, x, y)).face, {
      message: "The pointer never reached the middle of the card.",
      timeout: 2000,
    })
    .toBe(true);
}

/**
 * Sweeps the pointer along the icon row and reports how many pixels wide each
 * contact link's reachable run is.
 *
 * A sweep rather than one probe at each link's own centre, because inside the
 * flipped face `getBoundingClientRect` is a few pixels out from where WebKit
 * actually paints the link - close enough to look right, far enough to drop a
 * single probe into the gap between two icons. The sweep does not care where
 * the boxes claim to be: it asks the page what is under the pointer, all the
 * way across, and every icon has to answer somewhere.
 */
async function reachableContactRuns(page: Page) {
  await awaitFaceSwap(page);
  await primePointer(page, BACK_FACE);

  const STEP = 4;
  const { left, right, y } = await page.evaluate((selector) => {
    const face = document.querySelector<HTMLElement>(selector)!.getBoundingClientRect();
    const icon = document
      .querySelector<HTMLElement>(`${selector} .grid a`)!
      .getBoundingClientRect();
    return { left: face.left, right: face.right, y: icon.top + icon.height / 2 };
  }, BACK_FACE);

  const runs = new Map<string, number>();
  for (let x = left; x <= right; x += STEP) {
    const { link } = await pointerReaches(page, x, y);
    if (link) runs.set(link, (runs.get(link) ?? 0) + STEP);
  }
  return runs;
}

/**
 * Points spread across the face in view, inset from its edges.
 *
 * A leaning card projects as a trapezoid, not a rectangle: the edge turning
 * away is both shorter and pulled inward, so the corners of the face's
 * bounding box are genuinely not on the card - measured at 8px on WebKit. That
 * is the geometry working, not the bug, and sampling into it would fail for
 * the wrong reason. The inset clears it by a wide margin while still landing
 * well inside the half that used to be dead.
 */
async function pointsAcross(page: Page, face: string) {
  await awaitFaceSwap(page);
  return page.evaluate((selector) => {
    const box = document.querySelector<HTMLElement>(selector)!.getBoundingClientRect();
    return [0.15, 0.3, 0.42, 0.5, 0.58, 0.7, 0.85].flatMap((fx) =>
      [0.25, 0.5, 0.75].map((fy) => ({
        x: box.left + box.width * fx,
        y: box.top + box.height * fy,
        label: `${Math.round(fx * 100)}% across, ${Math.round(fy * 100)}% down`,
      })),
    );
  }, face);
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

  /**
   * `.namecard-swing`, `.namecard-tilt` and `.namecard-inner` are `preserve-3d`
   * containers, so their OWN boxes sit in the card's 3D space as full-width
   * planes at z = 0, coplanar with the faces. Lean the card and the half
   * turning away from the viewer crosses behind those planes; hit-testing then
   * hands that half to the container instead of to the face. Nothing looks
   * different - the containers paint nothing - so the card reads as normal
   * while half of it silently takes no hover, no focus and no clicks.
   *
   * Swept across the icon row at the 9deg hover lean before the pointer-events
   * fix in globals.css, on both engines, where L/W/G/L are the four contact
   * links and x is a point that reaches nothing on the card at all:
   *
   *   xxxxxxxxxxxxxxxxxxx.GGGGGGx.LLLLxLLxx..
   *
   * LINE and WhatsApp, the two leftmost icons, are the whole dead half. The
   * rest of this file pins the mouse at (0, 0) precisely to keep the lean out
   * of its screenshots, which is why nothing here could see it.
   */
  test("every contact link on a leaning card can be reached by the pointer", async ({
    browser,
  }) => {
    // Well under the 52px icon, so this measures "reachable at all" rather than
    // re-testing the hit area's size, which tap-targets.e2e.ts already owns.
    const ENOUGH = 24;

    const runs = await onCard(browser, { flip: true, css: LEAN }, reachableContactRuns);

    expect(
      Object.fromEntries(
        ["LINE", "WhatsApp", "GitHub", "LinkedIn"].map((label) => [
          label,
          (runs.get(label) ?? 0) >= ENOUGH,
        ]),
      ),
      `A contact link on the leaning back face cannot be reached by the pointer. Widths ` +
        `found, in px: ${JSON.stringify(Object.fromEntries(runs))}. See the pointer-events ` +
        `rule on the namecard rig in globals.css.`,
    ).toEqual({ LINE: true, WhatsApp: true, GitHub: true, LinkedIn: true });
  });

  test("a leaning card is reachable across its whole width, not just half of it", async ({
    browser,
  }) => {
    const dead: Record<string, string[]> = {};
    for (const [name, face, flip] of [
      ["front", FRONT_FACE, false],
      ["back", BACK_FACE, true],
    ] as const) {
      dead[name] = await onCard(browser, { flip, css: LEAN }, async (page) => {
        const missed: string[] = [];
        const points = await pointsAcross(page, face);
        await primePointer(page, face);
        for (const { label, x, y } of points) {
          if (!(await pointerReaches(page, x, y)).face) missed.push(label);
        }
        return missed;
      });
    }

    expect(
      dead,
      "Points on a leaning face reach nothing on the card at all, so a tap there neither " +
        "flips it nor hits whatever is painted under the pointer.",
    ).toEqual({ front: [], back: [] });
  });

  // The front face is the flip control, so "reachable" there has to mean the
  // card actually turns - not just that hit-testing lands somewhere plausible.
  test("a tap on the far side of a leaning card still flips it", async ({ browser }) => {
    const flipped = await onCard(browser, { flip: false, css: LEAN }, async (page) => {
      const [{ x, y }] = await pointsAcross(page, FRONT_FACE);
      await page.mouse.click(x, y);
      return page
        .locator(".namecard-inner")
        .getAttribute("data-flipped")
        .then((value) => value === "true");
    });

    expect(
      flipped,
      "Clicking the leaning front face near its left edge did not flip the card.",
    ).toBe(true);
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
