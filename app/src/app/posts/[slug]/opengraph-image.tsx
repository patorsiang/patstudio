import { profile } from "@patorsiang/content";
import { ImageResponse } from "next/og";

import { BRAND_COLORS } from "@/lib/brand";
import { postDateFormat } from "@/lib/dates";
import { OgImageFrame, ogImageContentType, ogImageSize } from "@/lib/og-image";
import { getPost, getPosts } from "@/lib/posts";
import { ownerName } from "@/lib/seo";

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const revalidate = 3600;

export async function generateStaticParams() {
  const posts = await getPosts();

  return posts.map((post) => ({ slug: post.slug }));
}

const TITLE_LIMIT = 70;

/** Satori doesn't reliably ellipsis-truncate within a fixed canvas, so clip in JS first. */
function truncateTitle(title: string): string {
  return title.length > TITLE_LIMIT ? `${title.slice(0, TITLE_LIMIT).trimEnd()}…` : title;
}

/**
 * Same Satori/next-og constraints as the root opengraph-image.tsx: no
 * Tailwind, no custom properties, colours duplicated from @/lib/brand.
 * Falls back to the site-wide default content if the slug doesn't resolve -
 * generateStaticParams only lists real slugs, so this is a defensive path,
 * not a real 404 case.
 */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);

  const headline = post ? truncateTitle(post.title) : ownerName;
  const byline = post
    ? `${ownerName} · ${postDateFormat.format(new Date(post.date))}`
    : profile.role.en;
  const summary = post ? post.summary : profile.headline.en;

  return new ImageResponse(
    <OgImageFrame>
      <div
        style={{
          fontSize: 60,
          fontWeight: 700,
          color: BRAND_COLORS.textStrongLight,
          lineHeight: 1.1,
        }}
      >
        {headline}
      </div>
      <div
        style={{
          fontSize: 34,
          color: BRAND_COLORS.textMutedLight,
          lineHeight: 1.2,
        }}
      >
        {byline}
      </div>
      <div
        style={{
          fontSize: 30,
          color: BRAND_COLORS.textMutedLight,
          lineHeight: 1.35,
          maxWidth: 900,
        }}
      >
        {summary}
      </div>
    </OgImageFrame>,
    size,
  );
}
