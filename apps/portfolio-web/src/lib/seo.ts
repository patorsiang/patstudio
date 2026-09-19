import type { Metadata } from "next";

export const siteName = "Patorsiang Portfolio";
export const ownerName = "Napatchol Thaipanich";
export const defaultTitle = "Napatchol Thaipanich | Full-Stack Developer";
export const defaultDescription =
  "Portfolio of Napatchol Thaipanich, a full-stack developer in Bangkok working on practical web systems, applied AI projects, and security-aware software.";
export const siteUrl =
  normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL) ?? "https://patstudio.vercel.app";
export const siteMetadataBase = new URL(siteUrl);

/**
 * NEXT_PUBLIC_SITE_URL is meant to be a full origin, but Vercel's own
 * VERCEL_URL convention (bare host, no scheme) makes it an easy value to
 * paste in by mistake - that shape throws in `new URL()` and breaks the
 * production build. Treat a schemeless value as https rather than fail.
 */
export function normalizeSiteUrl(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

type PageMetadataInput = {
  readonly title: string;
  readonly description: string;
  /** Route path, used as both canonical and OpenGraph url. */
  readonly path: string;
  /** "profile" for pages about the person, "website" for indexes. */
  readonly type?: "website" | "profile";
  /**
   * Absolute URL of the original, for a page that is a copy of something
   * first published elsewhere. Defaults to `path`, which is the right answer
   * everywhere except the backfilled Medium posts.
   */
  readonly canonical?: string;
};

/**
 * Every static page needs the same canonical/OpenGraph/Twitter shape, differing
 * only in title, description, path and type. Kept here so a new page cannot
 * ship with a subtly different SEO shape, which is what four copy-pasted
 * blocks were heading towards.
 *
 * The CV route builds its own metadata: it adds hreflang alternates per
 * language, which nothing else needs.
 */
export function buildPageMetadata({
  title,
  description,
  path,
  type = "website",
  canonical,
}: PageMetadataInput): Metadata {
  const fullTitle = `${title} | ${ownerName}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonical ?? path,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: path,
      siteName,
      type,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
  };
}
