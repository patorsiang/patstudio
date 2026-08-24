import { profile } from "@patorsiang/content";
import { ImageResponse } from "next/og";

import { BRAND_COLORS } from "@/lib/brand";
import { OgImageFrame, ogImageContentType, ogImageSize } from "@/lib/og-image";
import { ownerName } from "@/lib/seo";

export const size = ogImageSize;
export const contentType = ogImageContentType;

/**
 * Rendered by Satori, outside the CSS pipeline: no custom properties, no
 * Tailwind, and no access to the Geist webfont without shipping the file. The
 * colours come from @/lib/brand so they are at least duplicated once rather
 * than reinvented here.
 *
 * SiteMark is not reused for the same reason - Satori takes a restricted
 * subset of SVG and it is safer to inline the path than to rely on a component
 * rendering identically under a different engine.
 */
export default function Image() {
  return new ImageResponse(
    <OgImageFrame>
      <div
        style={{
          fontSize: 72,
          fontWeight: 700,
          color: BRAND_COLORS.textStrongLight,
          lineHeight: 1.05,
        }}
      >
        {ownerName}
      </div>
      <div
        style={{
          fontSize: 46,
          color: BRAND_COLORS.textMutedLight,
          lineHeight: 1.2,
        }}
      >
        {profile.role.en}
      </div>
      <div
        style={{
          fontSize: 34,
          color: BRAND_COLORS.textMutedLight,
          lineHeight: 1.35,
          maxWidth: 900,
        }}
      >
        {profile.headline.en}
      </div>
    </OgImageFrame>,
    size,
  );
}
