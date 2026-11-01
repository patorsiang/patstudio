import { profile } from "@patorsiang/content";
// Narrow subpath, not the "@patorsiang/utils" barrel: this file is imported
// by the root layout, which wraps every route including the still-dynamic
// /cv redirects - see packages/utils/src/sanitize-url.ts for why that
// matters (pulling in isomorphic-dompurify/jsdom broke them in production).
import { sanitizeUrl } from "@patorsiang/utils/sanitize-url";

import { siteUrl } from "./seo";
import { toJsonLdScript } from "./json-ld";

/**
 * Person structured data (schema.org), read by search engines for rich
 * results (knowledge panel, sitelinks). Built entirely from our own profile
 * data, not user input, so this is safe to serialize - unlike the
 * markdown-rendered post body elsewhere in the app, nothing here crosses a
 * trust boundary. `<` is still escaped before embedding, so a value that
 * happened to contain "</script>" could never end the tag early.
 *
 * A plain exported string, not computed inline in layout.tsx: next.config.ts
 * keeps 'unsafe-inline' in its CSP script-src (see the comment above
 * contentSecurityPolicy) rather than a per-script hash allowlist, because
 * Next's own RSC hydration scripts vary per request and can't be hashed. This
 * script rides on that same unsafe-inline allowance, not a hash of its own.
 */
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name.en,
  alternateName: profile.handle,
  jobTitle: profile.role.en,
  description: profile.headline.en,
  url: siteUrl,
  email: profile.contact.email.url.replace(/^mailto:/, ""),
  address: {
    "@type": "PostalAddress",
    addressLocality: profile.location.en,
  },
  sameAs: profile.links
    .filter((link) => link.label.en !== "Portfolio")
    .map((link) => sanitizeUrl(link.url)),
};

export const personJsonLdScript = toJsonLdScript(personJsonLd);
