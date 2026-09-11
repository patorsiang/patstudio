import { test, expect } from "@playwright/test";

/**
 * The primary navigation and the language switcher.
 *
 * Two things here are easy to get wrong in a way no other suite would notice.
 *
 * The first is `aria-current`. Each primary link carries its own `matches`
 * predicate rather than comparing against its own href, because CV is reached
 * through three different paths - /cv and /cv/[role] both redirect to
 * /[lang]/cv/[role] - so an href compare would never mark CV active on the
 * page it links to (GlobalNav.tsx:12-16). Predicates are exactly the kind of
 * thing that keeps working for the route someone tested and quietly stops for
 * the other five.
 *
 * The second is that the switcher appears at all. buildLanguageLinks() returns
 * null anywhere but /[lang]/cv/[role], because that is the only route that
 * exists in more than one language; offering it elsewhere would point the
 * reader at a CV they were not looking at. A regression in that guard shows up
 * as a control appearing on pages it cannot serve, which reads as a broken
 * feature rather than a missing one - so nothing would 404 and no existing
 * test would fail.
 *
 * cv-html-lang.e2e.ts covers what `<html lang>` reports on the Thai CV, but it
 * navigates by URL. Nothing had ever clicked the switcher.
 *
 * Verified by planting each fault. Replacing isCvRoute with an href compare
 * failed all five CV active-state cases, including /cv itself - it redirects,
 * so by the time the nav renders the pathname is no longer the href. Returning
 * the language links unconditionally failed the not-offered-elsewhere sweep on
 * all seven routes, each named in its own message.
 */

/** Routes that render GlobalNav, with the primary link each should mark active. */
const navRoutes = [
  { route: "/", active: "Home" },
  { route: "/about", active: "About" },
  { route: "/experience", active: "Experience" },
  { route: "/projects", active: "Projects" },
  { route: "/posts", active: "Posts" },
  { route: "/posts/bkkjs-summer-2026", active: "Posts" },
  { route: "/contact", active: "Contact" },
  { route: "/en/cv/fullstack-engineer", active: "CV" },
  { route: "/th/cv/fullstack-engineer", active: "CV" },
] as const;

/**
 * /card renders no PageShell, and /offline and the 404 are bare shells - none
 * of the three has a nav to check. Same reasoning as footer.e2e.ts's own list.
 */
const routesWithoutNav = ["/card", "/offline", "/this-route-does-not-exist"];

const primaryLabels = ["Home", "About", "Experience", "Projects", "Posts", "CV", "Contact"];

function nav(page: import("@playwright/test").Page) {
  return page.getByRole("navigation", { name: "Global navigation" });
}

/** Labels of the primary nav links currently carrying aria-current="page". */
function markedPrimaryLinks(page: import("@playwright/test").Page) {
  return nav(page)
    .locator("a")
    .evaluateAll(
      (links, labels) =>
        links
          .filter((link) => labels.includes(link.textContent?.trim() ?? ""))
          .filter((link) => link.getAttribute("aria-current") === "page")
          .map((link) => link.textContent?.trim() ?? ""),
      primaryLabels,
    );
}

test.describe("every primary link goes where it says", () => {
  const destinations = [
    { label: "About", url: /\/about$/ },
    { label: "Experience", url: /\/experience$/ },
    { label: "Projects", url: /\/projects$/ },
    { label: "Posts", url: /\/posts$/ },
    { label: "Contact", url: /\/contact$/ },
    // /cv redirects; the reader should land on the canonical CV, not the hop.
    { label: "CV", url: /\/en\/cv\/fullstack-engineer$/ },
  ] as const;

  for (const { label, url } of destinations) {
    test(`${label} lands on its page`, async ({ page }) => {
      await page.goto("/");
      await nav(page).getByRole("link", { name: label, exact: true }).click();
      await expect(page).toHaveURL(url);
      // A URL alone can be satisfied by an error boundary or an empty shell.
      // Any heading level, not h1 specifically: Section renders <h2>, so most
      // pages here have no h1 at all. That is worth looking at on its own
      // terms, but it is a document-structure question, and pinning it from
      // the navigation suite would make this fail for a reason that has
      // nothing to do with navigation.
      await expect(page.getByRole("heading").first()).toBeVisible();
    });
  }

  test("Home returns to the homepage", async ({ page }) => {
    await page.goto("/about");
    await nav(page).getByRole("link", { name: "Home", exact: true }).click();
    await expect(page).toHaveURL(/\/$/);
  });
});

test.describe("the current page is marked, exactly once", () => {
  for (const { route, active } of navRoutes) {
    test(`${route} marks ${active}`, async ({ page }) => {
      await page.goto(route);

      const marked = await markedPrimaryLinks(page);

      // Scoped to the primary links by name rather than to the whole <nav>.
      // The language switcher lives in the same nav and marks the active
      // language with aria-current="page" too, which is correct - each
      // language really is a different page - so counting every aria-current
      // in the nav reports two on any CV route and tests nothing.
      //
      // Exactly one, because two marked links is as wrong as none, and is
      // what a loosened predicate (a startsWith catching a sibling route)
      // produces.
      expect(marked, `${route} did not mark exactly one primary link`).toEqual([active]);
    });
  }
});

test.describe("CV stays marked through every path it is reached by", () => {
  // All three resolve to the same page. The redirecting two are the ones an
  // href comparison gets wrong, and they are not in the sweep above because
  // they are not where the reader ends up.
  for (const route of ["/cv", "/cv/fullstack-engineer", "/en/cv/fullstack-engineer"]) {
    test(`${route} marks CV`, async ({ page }) => {
      await page.goto(route);

      expect(await markedPrimaryLinks(page)).toEqual(["CV"]);
    });
  }
});

test.describe("the language switcher is offered only where it leads somewhere", () => {
  test("it is present on a CV page", async ({ page }) => {
    await page.goto("/en/cv/fullstack-engineer");

    // Non-vacuity guard: without this, the sweep below would pass just as
    // happily on a build that had deleted the switcher outright.
    await expect(page.getByRole("group", { name: "Language" })).toBeVisible();
  });

  for (const route of [...navRoutes.map((entry) => entry.route), ...routesWithoutNav].filter(
    (route) => !route.includes("/cv/"),
  )) {
    test(`it is absent on ${route}`, async ({ page }) => {
      await page.goto(route);

      await expect(
        page.getByRole("group", { name: "Language" }),
        `${route} offers a language switch it cannot honour`,
      ).toHaveCount(0);
    });
  }
});

test("switching to Thai keeps the role, and switching back keeps it too", async ({ page }) => {
  await page.goto("/en/cv/security-engineer");

  const languages = page.getByRole("group", { name: "Language" });
  await languages.getByRole("link", { name: "ภาษาไทย" }).click();

  // The role travels with the switch. Dropping back to the default CV here
  // would lose the variant the reader had chosen, silently.
  await expect(page).toHaveURL(/\/th\/cv\/security-engineer$/);
  await expect(languages.locator('a[aria-current="page"]')).toHaveText("TH");

  await languages.getByRole("link", { name: "English" }).click();
  await expect(page).toHaveURL(/\/en\/cv\/security-engineer$/);
  await expect(languages.locator('a[aria-current="page"]')).toHaveText("EN");
});

test("the chrome stays English on the Thai CV", async ({ page }) => {
  await page.goto("/th/cv/fullstack-engineer");

  // Deliberate, and marked as such in GlobalNav.tsx:82-84: the nav is not
  // localized, so it declares its own language rather than inheriting Thai
  // from the page and having a screen reader read "Experience" in a Thai
  // voice. Pinned here so it reads as a decision, not an oversight, if
  // someone localizes the CV body and wonders why the nav was left out.
  await expect(nav(page)).toHaveAttribute("lang", "en");
});
