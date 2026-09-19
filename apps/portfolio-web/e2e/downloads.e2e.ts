import { test, expect } from "@playwright/test";

import { routes } from "./support/routes";

/**
 * Every file the site hands a visitor: the namecard's vCard, and the CV's JSON
 * and Markdown exports.
 *
 * These were covered from both ends and not in the middle. src/lib/vcard.ts is
 * unit-tested against the RFC's escaping and folding rules, and pwa.e2e.ts
 * proves the service worker never caches an export. Nothing checked that the
 * button reaches the route, that the route serves what the builder built, or
 * that the browser is told to save it rather than render it - and a download
 * that opens as a wall of text in a tab is a broken download even though every
 * unit test still passes.
 *
 * The vCard is also the one place the phone number is published
 * (docs/requirements/namecard.md section 5): deliberately absent from /card's
 * HTML, and disallowed in robots.ts. That is a privacy decision with no
 * enforcement behind it, so it is pinned here - including the negative, which
 * is the half that erodes. The number is read back out of the served file
 * rather than written into this test, so the assertion cannot drift from the
 * profile and nothing has to restate a real phone number in a fixture.
 *
 * Verified by planting each fault: dropping the Content-Disposition header
 * failed the attachment checks; returning the export unconditionally (ignoring
 * an unparseable selection) failed the 400 case; and rendering the phone number
 * into the back face of the card failed the not-in-HTML sweep, naming /card.
 */

const VCARD_PATH = "/card/vcard";

function attachmentName(disposition: string | undefined) {
  return disposition?.match(/filename="([^"]+)"/)?.[1];
}

test.describe("the vCard", () => {
  test("Save Contact downloads the card", async ({ page }) => {
    await page.goto("/card");

    // The control lives on the back face, so the card has to be turned first -
    // the accepted trade-off recorded in docs/design/namecard.md.
    await page.getByRole("button", { name: /turn card over/i }).click();

    const download = await Promise.race([
      page.waitForEvent("download"),
      page
        .getByRole("link", { name: /save contact/i })
        .click()
        .then(() => page.waitForEvent("download")),
    ]);

    expect(download.suggestedFilename()).toBe("napatchol-thaipanich.vcf");
  });

  test("the served file is a vCard a phone will accept", async ({ request }) => {
    const response = await request.get(VCARD_PATH);
    expect(response.status()).toBe(200);

    const headers = response.headers();
    expect(headers["content-type"]).toBe("text/vcard; charset=utf-8");
    expect(
      attachmentName(headers["content-disposition"]),
      "the vCard is not served as an attachment, so it opens as text instead of saving",
    ).toBe("napatchol-thaipanich.vcf");

    const body = await response.text();

    expect(body.startsWith("BEGIN:VCARD")).toBe(true);
    expect(body.trimEnd().endsWith("END:VCARD")).toBe(true);
    // 3.0 rather than 4.0 on purpose: iOS and Android both import 3.0 without
    // complaint, and 4.0 is still patchily supported.
    expect(body).toContain("VERSION:3.0");
    expect(body).toMatch(/\r\nFN[;:]/);
    expect(body).toMatch(/\r\nEMAIL[;:]/);

    // CRLF throughout, not just somewhere. A lone \n is the single most common
    // way a hand-built vCard fails to import, and it fails silently.
    const strayNewlines = body.split("\n").filter((line, index, all) => {
      const isLast = index === all.length - 1;
      return !isLast && !line.endsWith("\r");
    });
    expect(strayNewlines, "vCard lines are not CRLF-terminated").toEqual([]);
  });

  test("the Thai name survives the round trip", async ({ request }) => {
    const body = await (await request.get(VCARD_PATH)).text();

    // The charset in the Content-Type is load-bearing: a client that assumes
    // latin-1 renders these as mojibake, and nothing else in the file would
    // look wrong.
    expect(body, "no Thai characters in the vCard").toMatch(/[฀-๿]/);
  });

  test("the phone number is in the file and nowhere in the HTML", async ({ page, request }) => {
    const body = await (await request.get(VCARD_PATH)).text();
    const tel = body.match(/\r\nTEL[^:]*:(.+)\r/)?.[1]?.trim();

    expect(
      tel,
      "the vCard carries no TEL, so Save Contact saves a contact with no number",
    ).toBeTruthy();

    // Compared digits-only, so a formatting change in either place does not
    // turn this into a false pass.
    const digits = (tel ?? "").replace(/\D/g, "");
    expect(digits.length).toBeGreaterThan(8);

    const leaked: string[] = [];
    const visible: string[] = [];

    for (const route of routes) {
      await page.goto(route);

      // This used to subtract the wa.me href before checking, on the reasoning
      // that a wa.me URL *is* the number and "there is no form of that link
      // that does not carry it". There is: /card/whatsapp redirects
      // server-side, so the card keeps the one-tap affordance and the number
      // stays off the page. The exception is gone and the rule in
      // docs/requirements/namecard.md section 5 now holds as written.
      const html = await page.content();
      if (html.replace(/\D/g, "").includes(digits)) leaked.push(route);

      // Nothing should print it on the page either, WhatsApp included: the
      // icon row is bare glyphs, so the number is in the href and never in
      // text a reader or a scraper reads off the screen.
      const text = await page.evaluate(() => document.body.innerText);
      if (text.replace(/\D/g, "").includes(digits)) visible.push(route);
    }

    expect(leaked, `the phone number is rendered into HTML on: ${leaked.join(", ")}`).toEqual([]);
    expect(visible, `the phone number is shown as text on: ${visible.join(", ")}`).toEqual([]);
  });

  test("the vCard is kept out of the crawl surface", async ({ request }) => {
    const robots = await (await request.get("/robots.txt")).text();

    expect(robots, "robots.txt no longer disallows the vCard").toContain(VCARD_PATH);
    expect(robots, "robots.txt no longer disallows the CV exports").toContain("/cv/export/");
  });
});

test.describe("the CV exports", () => {
  const cases = [
    { format: "json", role: "fullstack_engineer", lang: "en", type: "application/json" },
    { format: "json", role: "security_engineer", lang: "th", type: "application/json" },
    { format: "markdown", role: "ai_ml_engineer", lang: "en", type: "text/markdown" },
  ] as const;

  for (const { format, role, lang, type } of cases) {
    test(`${format} for ${role}/${lang} downloads under its own name`, async ({ request }) => {
      const response = await request.get(`/cv/export/${format}?role=${role}&lang=${lang}`);

      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toContain(type);

      // The extension is "md" while the route segment is "markdown"; the two
      // deliberately differ, so a rename of either would surface here.
      const extension = format === "markdown" ? "md" : "json";
      expect(attachmentName(response.headers()["content-disposition"])).toBe(
        `napatchol-thaipanich-${role}-${lang}.cv.${extension}`,
      );
    });
  }

  test("the exported CV is the one on screen, not the default", async ({ request }) => {
    const response = await request.get("/cv/export/json?role=security_engineer&lang=en");
    const payload = (await response.json()) as Record<string, unknown>;

    // Guards the query actually reaching the generator. Dropping it would
    // serve the default role to every reader who picked a different one -
    // a wrong file that still downloads, opens and looks entirely plausible.
    expect(JSON.stringify(payload)).toContain("security");
  });

  for (const query of ["", "?role=not_a_role&lang=en", "?role=fullstack_engineer&lang=xx"]) {
    test(`an unusable selection "${query}" is refused, not guessed at`, async ({ request }) => {
      const response = await request.get(`/cv/export/json${query}`);

      expect(
        response.status(),
        `/cv/export/json${query} did not refuse an unusable selection`,
      ).toBe(400);
    });
  }
});
