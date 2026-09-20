import type { Post } from "@patorsiang/content";

import { ownerName, siteName, siteUrl } from "./seo";

/**
 * Structured data is safe to serialize here only because every builder below
 * is fed our own content data (profile, posts, breadcrumb labels we wrote),
 * never raw user input - the escaping still guards against a value that
 * happens to contain "</script>" ending the tag early.
 */
export function toJsonLdScript(value: unknown): string {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

export function buildWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
  };
}

type Crumb = {
  readonly href: string;
  readonly label: string;
};

export function buildBreadcrumbJsonLd(trail: readonly Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.label,
      item: new URL(crumb.href, siteUrl).href,
    })),
  };
}

export function buildBlogPostingJsonLd(post: Post) {
  const url = new URL(`/posts/${post.slug}`, siteUrl).href;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.summary,
    datePublished: post.date,
    dateModified: post.date,
    // A post backfilled from the Medium archive points at its original.
    // Claiming this page as the main entity for a copy competes with the
    // version that already has the history and the inbound links.
    mainEntityOfPage: post.canonical ?? url,
    image: new URL(`/posts/${post.slug}/opengraph-image`, siteUrl).href,
    author: {
      "@type": "Person",
      name: ownerName,
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: siteName,
      logo: {
        "@type": "ImageObject",
        url: new URL("/icons/icon-512.png", siteUrl).href,
      },
    },
  };
}
