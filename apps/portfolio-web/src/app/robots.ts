import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/seo";

export const dynamic = "force-static";

/**
 * `/cv/export/` is disallowed because those routes generate a JSON or Markdown
 * download per request from query parameters - crawlable in principle, endless
 * in practice, and worth nothing in an index.
 *
 * `/card/vcard` is disallowed for a different reason: it is the one place the
 * phone number is published, and keeping it out of the index keeps the number
 * off the crawl surface. This is not access control - the file stays publicly
 * fetchable by anyone who has the URL, which is the accepted trade in
 * docs/requirements/namecard.md section 5.
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
