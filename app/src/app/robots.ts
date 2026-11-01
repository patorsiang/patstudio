import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/seo";

export const dynamic = "force-static";

/**
 * `/cv/export/` is disallowed because those routes generate a JSON or Markdown
 * download per request from query parameters - crawlable in principle, endless
 * in practice, and worth nothing in an index.
 *
 * `/card/vcard` is disallowed for a different reason: it is where the phone number
 * is published, and keeping it out of the index keeps the number off the crawl
 * surface. This is not access control - the file stays publicly fetchable by anyone
 * who has the URL, which is the accepted trade in docs/requirements/namecard.md
 * section 5.
 *
 * This comment used to say the vCard was the *only* such place. That was wrong: the
 * namecard linked to `wa.me/<number>`, which put the number in /card's own HTML and
 * in the client bundle. Both now go through /card/whatsapp, which reads it
 * server-side - see src/lib/contact-phone.ts.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/cv/export/", "/card/vcard"],
    },
    sitemap: new URL("/sitemap.xml", siteUrl).href,
  };
}
