/**
 * Front matter lists syndicated copies as bare URLs, not `{ label, url }`
 * pairs: `parse.ts` reads front matter line-by-line without a YAML
 * dependency, so a nested object would cost either that dependency or a
 * bespoke `Label|URL` micro-syntax. Deriving the label from the host costs
 * this file instead, and a new platform needs no code change to render.
 */
const KNOWN_HOSTS: Record<string, string> = {
  "medium.com": "Medium",
  "dev.to": "DEV",
  "github.com": "GitHub",
  "linkedin.com": "LinkedIn",
};

/**
 * A human label for a syndicated copy, or `null` when the value is not a
 * usable web link.
 *
 * Null rather than a guess: `POST_FALLBACK` is a hand-written const that no
 * schema validates, so junk can reach here. A caller that drops the link is
 * correct; one that renders "Medium" over an `about:blank` href is not.
 */
export function postLinkLabel(url: string): string | null {
  let parsed: URL;

  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return null;
  }

  const host = parsed.hostname.replace(/^www\./, "");
  const known = KNOWN_HOSTS[host];

  if (known) return known;

  // "blog.example.co.uk" -> "Blog". The first label is the distinctive part
  // for a subdomain, and for a bare domain it is the brand name itself.
  const [first = ""] = host.split(".");

  return first ? first.charAt(0).toUpperCase() + first.slice(1) : null;
}
