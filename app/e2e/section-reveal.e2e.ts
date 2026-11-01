import { test, expect, type Page } from "@playwright/test";

/**
 * Covers docs/superpowers/specs/2026-08-16-section-reveal-design.md.
 *
 * All four tests run against a 375x667 viewport (the mobile Playwright
 * project's size) so the "Skills" section - last on the page - is
 * reliably below the fold, regardless of which project actually runs
 * this file. Desktop Chrome's default viewport is tall enough that this
 * would not reliably hold otherwise.
 */

test.use({ viewport: { width: 375, height: 667 } });

const SKILLS_HEADING = "Core skill groups.";

function skillsWrapper(page: Page) {
  // RevealOnView renders a <div> that directly wraps the <Section>'s
  // <section> element - climb from the heading to its ancestor <section>,
  // then one more level to that wrapper div.
  return page.getByRole("heading", { name: SKILLS_HEADING }).locator("xpath=ancestor::section/..");
}

test("a below-the-fold section starts hidden and reveals when scrolled into view", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");

  const wrapper = skillsWrapper(page);
  await expect(wrapper).toHaveCSS("opacity", "0");

  await page.getByRole("heading", { name: SKILLS_HEADING }).scrollIntoViewIfNeeded();
  await expect(wrapper).toHaveCSS("opacity", "1");
});

test("without JavaScript, every section is visible without ever scrolling", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 },
    javaScriptEnabled: false,
  });
  const page = await context.newPage();
  await page.goto("/");

  for (const name of [
    "Practical software for real product problems.",
    "Work and education.",
    "Selected project samples.",
    SKILLS_HEADING,
  ]) {
    const wrapper = page.getByRole("heading", { name }).locator("xpath=ancestor::section/..");
    await expect(wrapper).toHaveCSS("opacity", "1");
  }

  await context.close();
});

test("under prefers-reduced-motion, a below-the-fold section is visible without scrolling", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  // toHaveCSS resolves the moment it finds a match, and the wrapper's
  // SSR/hydration default is opacity-100 - the same value this assertion
  // expects. Without this wait, a broken reduced-motion check (one that
  // fails to skip the hide mechanism) could still pass: the assertion
  // would catch the still-default "1" before IntersectionObserver's
  // async callback ever gets a chance to hide the section. Waiting
  // comfortably past that callback's delivery (and the 200ms reveal
  // transition) means this checks the settled state a genuinely broken
  // implementation would have visibly failed at.
  await page.waitForTimeout(300);
  await expect(skillsWrapper(page)).toHaveCSS("opacity", "1");
});

test("scrolling back up after a reveal does not re-hide the section", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");

  const wrapper = skillsWrapper(page);
  await page.getByRole("heading", { name: SKILLS_HEADING }).scrollIntoViewIfNeeded();
  await expect(wrapper).toHaveCSS("opacity", "1");

  await page.evaluate(() => window.scrollTo(0, 0));

  // Same race as the reduced-motion test above: right after scrolling
  // back up, the wrapper's opacity is still "1" from the earlier reveal
  // regardless of whether the observer is one-shot or not - a
  // non-disconnected observer that wrongly re-hides on scroll-away does
  // so asynchronously, via its own callback. Waiting past that callback
  // (and the 200ms transition) before asserting means a broken
  // (non-disconnecting) observer would have visibly re-hidden the
  // section by the time this checks, instead of the check racing ahead
  // of it and coincidentally matching the still-"1" value.
  await page.waitForTimeout(300);
  await expect(wrapper).toHaveCSS("opacity", "1");
});
