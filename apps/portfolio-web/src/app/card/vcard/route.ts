import { profile } from "@patorsiang/content";

import { buildVCard } from "@/lib/vcard";

/**
 * The namecard's "Save Contact" download.
 *
 * `force-static` unlike the /cv/export routes next door: those build their
 * payload from per-request query parameters, whereas this one has no inputs at
 * all - the profile is fixed at build time, so the file can be generated once.
 *
 * This is the only place the phone number is published. It is deliberately
 * absent from /card's rendered HTML and this route is disallowed in robots.ts,
 * which keeps the number off the crawl surface without pretending it is
 * private - see docs/requirements/namecard.md section 5.
 */
export const dynamic = "force-static";

export function GET(): Response {
  return new Response(buildVCard(profile), {
    headers: {
      // charset matters: the NOTE field carries the Thai name, and a client
      // that assumes latin-1 renders it as mojibake.
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": 'attachment; filename="napatchol-thaipanich.vcf"',
    },
  });
}
