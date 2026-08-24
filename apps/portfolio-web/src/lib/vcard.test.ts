import { describe, expect, test } from "bun:test";
import { profile, type Profile } from "@patorsiang/content";

import { buildVCard } from "./vcard";

/**
 * The real profile is the template so these tests stay honest about the shape
 * the builder actually receives, while overrides let each test isolate one
 * field without restating the whole record.
 */
function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return { ...profile, ...overrides };
}

/**
 * The spec caps a folded line at 75 OCTETS, not characters - the distinction
 * only shows up once a value is non-Latin, which is exactly this profile's
 * case.
 */
function octetLength(value: string): number {
  return new TextEncoder().encode(value).length;
}

function contentLines(card: string): readonly string[] {
  return card.split("\r\n").filter((line) => line.length > 0);
}

/** Reverses folding: CRLF followed by a single space is a continuation. */
function unfold(card: string): string {
  return card.replace(/\r\n /g, "");
}

describe("buildVCard", () => {
  test("wraps the output in a vCard 3.0 envelope", () => {
    const card = buildVCard(makeProfile());

    expect(card.startsWith("BEGIN:VCARD\r\nVERSION:3.0\r\n")).toBe(true);
    expect(card.endsWith("END:VCARD\r\n")).toBe(true);
  });

  test("splits the name into N as family;given", () => {
    const card = buildVCard(makeProfile());

    expect(card).toContain("FN:Napatchol Thaipanich\r\n");
    expect(card).toContain("N:Thaipanich;Napatchol;;;\r\n");
  });

  test("emits the role as TITLE and omits ORG entirely", () => {
    const card = buildVCard(makeProfile());

    expect(card).toContain("TITLE:Full-stack developer\r\n");
    // A vCard lives in someone's phone for years, so baking in a current
    // employer means it silently goes stale. Decision 4 in the ADR.
    expect(card).not.toContain("ORG:");
  });

  test("strips the mailto: scheme off the email", () => {
    const card = buildVCard(makeProfile());

    expect(card).toContain("EMAIL;TYPE=INTERNET:napatchol.tha@gmail.com\r\n");
    expect(card).not.toContain("mailto:");
  });

  test("escapes backslashes, semicolons and commas in values", () => {
    const card = buildVCard(makeProfile({ role: { en: "Engineer, Sr\\Jr; Lead" } }));

    // Backslash has to be escaped first, or escaping the delimiters would
    // then double-escape the backslashes it just introduced.
    expect(card).toContain("TITLE:Engineer\\, Sr\\\\Jr\\; Lead\r\n");
  });

  test("escapes newlines inside a value rather than emitting a bare line break", () => {
    const card = buildVCard(makeProfile({ role: { en: "Line one\nLine two" } }));

    expect(card).toContain("TITLE:Line one\\nLine two\r\n");
    expect(contentLines(card).some((line) => line === "Line two")).toBe(false);
  });

  test("folds every line to 75 octets or fewer", () => {
    const card = buildVCard(
      makeProfile({
        role: { en: "Principal Full-Stack Engineer, Distributed Systems and Applied AI Platforms" },
      }),
    );

    for (const line of contentLines(card)) {
      expect(octetLength(line)).toBeLessThanOrEqual(75);
    }
  });

  test("marks folded continuations with a single leading space", () => {
    const card = buildVCard(
      makeProfile({
        role: { en: "Principal Full-Stack Engineer, Distributed Systems and Applied AI Platforms" },
      }),
    );

    const continuations = contentLines(card).filter((line) => line.startsWith(" "));
    expect(continuations.length).toBeGreaterThan(0);
  });

  test("counts octets rather than characters when folding Thai text", () => {
    // Thai codepoints are 3 bytes in UTF-8, so a line that looks short by
    // string length can still blow the 75-octet cap. This is the case a
    // naive `value.length` fold gets wrong.
    const thai = "ณภัทรชล ไทพาณิชย์ นักพัฒนาซอฟต์แวร์ฟูลสแตก กรุงเทพมหานคร ประเทศไทย";
    const card = buildVCard(makeProfile({ role: { en: thai } }));

    for (const line of contentLines(card)) {
      expect(octetLength(line)).toBeLessThanOrEqual(75);
    }
  });

  test("never splits a multi-byte character across a fold", () => {
    const thai = "ณภัทรชล ไทพาณิชย์ นักพัฒนาซอฟต์แวร์ฟูลสแตก กรุงเทพมหานคร ประเทศไทย";
    const card = buildVCard(makeProfile({ role: { en: thai } }));

    // Assert the fold actually happened first - without this the test would
    // pass trivially on unfolded output and guard nothing.
    expect(card).toContain("\r\n ");
    // If a fold landed mid-codepoint the text would not survive unfolding.
    expect(unfold(card)).toContain(thai);
  });

  test("strips the tel: scheme off the phone number", () => {
    const card = buildVCard(makeProfile());

    expect(card).toContain("TEL;TYPE=CELL:+66959390164\r\n");
    expect(card).not.toContain("tel:");
  });

  test("omits TEL entirely when the profile carries no phone", () => {
    const card = buildVCard(
      makeProfile({
        contact: {
          email: profile.contact.email,
          github: profile.contact.github,
          linkedin: profile.contact.linkedin,
        },
      }),
    );

    expect(card).not.toContain("TEL");
  });

  test("emits the portfolio link as URL", () => {
    const card = buildVCard(makeProfile());

    expect(card).toContain("URL:https://patstudio.vercel.app/\r\n");
  });

  test("emits GitHub and LinkedIn as X-SOCIALPROFILE", () => {
    // Asserted against the unfolded card: the LinkedIn line is 78 octets, so
    // it legitimately folds. Matching the raw output here would be asserting
    // that folding had NOT happened, which contradicts the 75-octet rule.
    const card = unfold(buildVCard(makeProfile()));

    expect(card).toContain("X-SOCIALPROFILE;TYPE=github:https://github.com/patorsiang\r\n");
    expect(card).toContain(
      "X-SOCIALPROFILE;TYPE=linkedin:https://www.linkedin.com/in/napatchol-thaipanich\r\n",
    );
  });

  test("emits the nickname, which is how people actually search their contacts", () => {
    const card = buildVCard(makeProfile());

    expect(card).toContain("NICKNAME:Pat\r\n");
  });

  test("carries the Thai name in NOTE, since vCard 3.0 has no second-script name field", () => {
    const card = buildVCard(makeProfile());

    expect(unfold(card)).toContain("ณภัทรชล ไทพาณิชย์");
  });

  test("maps a 'City, Country' location into ADR locality and country", () => {
    const card = buildVCard(makeProfile());

    expect(card).toContain("ADR;TYPE=WORK:;;;Bangkok;;;Thailand\r\n");
  });

  test("puts a single-part location in locality and leaves country empty", () => {
    const card = buildVCard(makeProfile({ location: { en: "Bangkok" } }));

    expect(card).toContain("ADR;TYPE=WORK:;;;Bangkok;;;\r\n");
  });
});
