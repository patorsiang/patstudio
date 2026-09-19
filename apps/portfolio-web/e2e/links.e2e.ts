import { test, expect } from "@playwright/test";

import { routes } from "./support/routes";

/**
 * Sweeps every link the app renders, on every route, for the three ways a link
 * goes wrong: it points at nothing, it points somewhere unsafe, or it gives a
 * screen reader nothing to announce.
 *
 * sitemap.e2e.ts already does this for the URLs the site *advertises*. That is
 * a different set, and a much smaller one: the sitemap lists canonical
 * destinations, while this walks the links a reader can actually click - nav,
 * footer, cards, breadcrumbs, CV header, contact rows, post bodies. A typo in
 * an href reaches a visitor without ever touching the sitemap.
 *
 * Internal links are fetched; external ones are not. Asserting that
 * github.com answers 200 tests GitHub's uptime and the CI runner's egress, and
 * fails on a morning when neither the repo nor anything in it has changed.
 * What is worth pinning is the shape the app controls: the scheme, the
 * rel/target pairing, and the accessible name.
 *
 * Verified by planting each fault: a bad internal href (/projectss) failed the
 * reachability sweep naming the route it was found on; dropping `rel` from a
 * `target="_blank"` link failed the safety check; and blanking a link's text
 * failed the accessible-name check.
 */

/**
 * Links that redirect on purpose. /cv is the stable entry point the IA names
 * for primary navigation, so GlobalNav links to it rather than to whichever
 * canonical CV it currently resolves to (see GlobalNav.tsx:31 and the
 * `isCvRoute` predicate under it). Anything else that starts redirecting is a
 * mistake - a moved page nobody updated the links for - and should surface.
 */
// "/card/whatsapp" redirects by design: it exists so the card can offer WhatsApp
// without the wa.me deep link putting the phone number into /card's HTML and the
// client bundle. The number is read server-side - see src/lib/contact-phone.ts.
const expectedRedirects = new Set(["/cv", "/card/whatsapp"]);

type CollectedLink = {
  readonly href: string;
  readonly route: string;
  readonly target: string | null;
  readonly rel: string | null;
  readonly name: string;
  readonly inProse: boolean;
};

async function collectLinks(page: import("@playwright/test").Page, route: string) {
  await page.goto(route);

  return page.evaluate(
    (currentRoute) =>
      [...document.querySelectorAll("a")].map((anchor) => ({
        href: anchor.getAttribute("href") ?? "",
        route: currentRoute,
        target: anchor.getAttribute("target"),
        rel: anchor.getAttribute("rel"),
        // The same order a screen reader resolves an accessible name in, far
        // enough for a link: aria-label, then text, then a nested image's alt.
        name: (
          anchor.getAttribute("aria-label") ||
          anchor.textContent?.trim() ||
          anchor.querySelector("img")?.getAttribute("alt") ||
          anchor.getAttribute("title") ||
          ""
        ).trim(),
        // Rendered post markdown is not ours to restyle; it is covered by the
        // sanitiser and by posts.e2e.ts, which already pins every image in a
        // post body to the same origin.
        inProse: Boolean(anchor.closest(".post-body")),
      })),
    route,
  );
}

const links: CollectedLink[] = [];

test.beforeAll(async ({ browser }) => {
  const page = await browser.newPage();
  for (const route of routes) {
    links.push(...(await collectLinks(page, route)));
  }
  await page.close();
});

test("every route renders links at all, so the sweeps below are not vacuous", () => {
  // Without this, a change that stopped rendering links entirely would turn
  // every assertion in this file into a pass over an empty list.
  const routesWithoutLinks = routes.filter((route) => !links.some((link) => link.route === route));

  expect(routesWithoutLinks, `routes rendering no links: ${routesWithoutLinks.join(", ")}`).toEqual(
    [],
  );
});

test("every internal link resolves", async ({ request }) => {
  const internal = links.filter((link) => link.href.startsWith("/"));
  const seen = new Map<string, string>();

  for (const link of internal) {
    // Keyed on path *and* query, not path alone. The CV export links carry
    // their selection in the query string (/cv/export/json?role=&lang=), and
    // the route answers 400 without it - so stripping the query turns a
    // working link into a reported failure. Only the hash is dropped: it never
    // reaches the server. Deduping still collapses the nav and footer, which
    // are otherwise refetched once per route.
    const target = link.href.split("#")[0] || "/";
    if (!seen.has(target)) seen.set(target, link.route);
  }

  const broken: string[] = [];

  for (const [target, foundOn] of seen) {
    const response = await request.get(target, { maxRedirects: 0 });
    const status = response.status();

    if (status >= 300 && status < 400) {
      if (!expectedRedirects.has(target)) {
        broken.push(
          `${target} (linked from ${foundOn}) -> ${status} to ${response.headers()["location"]}`,
        );
      }
      continue;
    }

    if (status !== 200) {
      broken.push(`${target} (linked from ${foundOn}) -> ${status}`);
    }
  }

  expect(
    broken,
    `Links pointing at something that is not there:\n  ${broken.join("\n  ")}`,
  ).toEqual([]);
});

test("every link that opens a new tab is safe and explicit", () => {
  const problems: string[] = [];

  for (const link of links) {
    if (link.target !== "_blank") continue;

    // "Ensure all external links have clear labels and safe behavior."
    // (docs/design/design-system.md). A _blank link without noreferrer hands
    // the opened page a reference back to this one through window.opener.
    if (!/\bnoreferrer\b/.test(link.rel ?? "")) {
      problems.push(`${link.href} (on ${link.route}) opens a new tab without rel="noreferrer"`);
    }
  }

  expect(problems, `Unsafe new-tab links:\n  ${problems.join("\n  ")}`).toEqual([]);
});

test("every outbound link uses https", () => {
  const problems = links
    .filter((link) => /^https?:/i.test(link.href) && !link.href.toLowerCase().startsWith("https:"))
    .map((link) => `${link.href} (on ${link.route})`);

  expect(problems, `Plain-http links:\n  ${problems.join("\n  ")}`).toEqual([]);
});

test("mailto and tel links are well formed", () => {
  const problems: string[] = [];

  for (const link of links) {
    if (link.href.startsWith("mailto:")) {
      const address = link.href.slice("mailto:".length).split("?")[0];
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
        problems.push(`${link.href} (on ${link.route}) is not a usable address`);
      }
    }

    if (link.href.startsWith("tel:")) {
      // E.164: a leading + and digits only, which is the form every dialler
      // accepts without the reader having to edit it first.
      const number = link.href.slice("tel:".length);
      if (!/^\+[0-9]+$/.test(number)) {
        problems.push(`${link.href} (on ${link.route}) is not in E.164 form`);
      }
    }
  }

  expect(problems, `Malformed contact links:\n  ${problems.join("\n  ")}`).toEqual([]);
});

test("every link has something to announce", () => {
  const problems = links
    .filter((link) => !link.inProse && link.name === "")
    .map((link) => `${link.href} (on ${link.route})`);

  // A link whose only content is an icon, with no aria-label and no alt, is
  // announced as its own URL - or as nothing at all.
  expect(problems, `Links with no accessible name:\n  ${problems.join("\n  ")}`).toEqual([]);
});
