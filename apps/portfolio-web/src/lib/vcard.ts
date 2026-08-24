import type { Profile } from "@patorsiang/content";

/**
 * Builds a vCard for the /card namecard's "Save Contact" download.
 *
 * vCard 3.0 rather than 4.0: 3.0 is what iOS Contacts and Android import most
 * reliably, which matters more here than 4.0's newer feature set. See
 * docs/requirements/namecard.md section 6.
 */

const CRLF = "\r\n";

/** RFC 2426 caps a content line at 75 octets, excluding the line break. */
const MAX_OCTETS = 75;

const encoder = new TextEncoder();

function octetLength(value: string): number {
  return encoder.encode(value).length;
}

/**
 * Escapes the four characters that carry structural meaning in a value.
 *
 * Backslash goes first on purpose: escaping it after the delimiters would
 * double-escape the backslashes those replacements had just introduced.
 */
function escapeValue(value: string): string {
  return value
    .replaceAll("\\", String.raw`\\`)
    .replaceAll(";", String.raw`\;`)
    .replaceAll(",", String.raw`\,`)
    .replace(/\r\n|\r|\n/g, String.raw`\n`);
}

/**
 * Folds one content line to the 75-octet cap, continuing with a single space.
 *
 * Measures OCTETS, not characters, and steps by whole codepoints. Both matter
 * for this profile specifically: Thai is 3 bytes per codepoint, so a
 * `value.length` fold would overshoot the cap, and a byte-wise fold would slice
 * a character in half and corrupt the text.
 *
 * Iterating with `for...of` yields codepoints rather than UTF-16 code units,
 * so astral characters survive too.
 */
function foldLine(line: string): string {
  if (octetLength(line) <= MAX_OCTETS) return line;

  const folded: string[] = [];
  let current = "";
  // Continuation lines spend one octet on their leading space.
  let limit = MAX_OCTETS;

  for (const char of line) {
    const size = octetLength(char);
    if (octetLength(current) + size > limit) {
      folded.push(current);
      current = char;
      limit = MAX_OCTETS - 1;
    } else {
      current += char;
    }
  }
  folded.push(current);

  return folded.join(`${CRLF} `);
}

/**
 * Splits a display name into the family;given halves N wants.
 *
 * Deliberately naive - the last whitespace-separated token is the family name.
 * Correct for "Napatchol Thaipanich" and for any two-part name; it is not a
 * general solution to human names and does not pretend to be.
 */
function splitName(fullName: string): { readonly given: string; readonly family: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length < 2) return { given: fullName.trim(), family: "" };

  const family = parts.at(-1) ?? "";
  return { given: parts.slice(0, -1).join(" "), family };
}

/**
 * Splits "Bangkok, Thailand" into the locality and country slots of ADR.
 *
 * Only the last comma is treated as the country boundary, and a location with
 * no comma becomes locality alone rather than being guessed at. ADR has seven
 * fields (po;ext;street;locality;region;postal;country) and inventing values
 * for the ones this profile does not carry would be fabricating data.
 */
function splitLocation(location: string): { readonly locality: string; readonly country: string } {
  const index = location.lastIndexOf(",");
  if (index === -1) return { locality: location.trim(), country: "" };

  return {
    locality: location.slice(0, index).trim(),
    country: location.slice(index + 1).trim(),
  };
}

export function buildVCard(profile: Profile): string {
  const { given, family } = splitName(profile.name.en);
  const { locality, country } = splitLocation(profile.location.en);
  const email = profile.contact.email.url.replace(/^mailto:/i, "");
  const portfolio = profile.links.find((link) => link.label.en === "Portfolio");
  // The Thai name has nowhere structural to live: vCard 3.0 has no
  // second-script name field, so NOTE is where it goes rather than being
  // dropped or jammed into FN alongside the Latin name.
  const thaiName = profile.name.translated?.th?.value;

  const lines: string[] = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${escapeValue(profile.name.en)}`,
    `N:${escapeValue(family)};${escapeValue(given)};;;`,
    `NICKNAME:${escapeValue(profile.nickname.en)}`,
    `TITLE:${escapeValue(profile.role.en)}`,
    `EMAIL;TYPE=INTERNET:${escapeValue(email)}`,
  ];

  if (profile.contact.phone) {
    lines.push(`TEL;TYPE=CELL:${escapeValue(profile.contact.phone.url.replace(/^tel:/i, ""))}`);
  }

  lines.push(`ADR;TYPE=WORK:;;;${escapeValue(locality)};;;${escapeValue(country)}`);

  if (portfolio) lines.push(`URL:${escapeValue(portfolio.url)}`);

  lines.push(
    `X-SOCIALPROFILE;TYPE=github:${escapeValue(profile.contact.github.url)}`,
    `X-SOCIALPROFILE;TYPE=linkedin:${escapeValue(profile.contact.linkedin.url)}`,
  );

  if (thaiName) lines.push(`NOTE:${escapeValue(thaiName)}`);

  lines.push("END:VCARD");

  return lines.map(foldLine).join(CRLF) + CRLF;
}
