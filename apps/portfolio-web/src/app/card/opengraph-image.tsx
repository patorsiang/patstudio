import { profile } from "@patorsiang/content";
import { ImageResponse } from "next/og";

import { BRAND_COLORS } from "@/lib/brand";
import { OgImageFrame, ogImageContentType, ogImageSize } from "@/lib/og-image";

export const size = ogImageSize;
export const contentType = ogImageContentType;

/**
 * So pasting the /card link into LINE, WhatsApp, or Slack renders a real
 * preview instead of a bare URL - the whole point of a namecard is being
 * shared, and a bare-link preview undersells that.
 */
export default function Image() {
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
        {profile.name.en}
      </div>
      <div
        style={{
          fontSize: 34,
          color: BRAND_COLORS.textMutedLight,
          lineHeight: 1.2,
        }}
      >
        {`${profile.role.en} · ${profile.location.en}`}
      </div>
      <div
        style={{
          fontSize: 28,
          color: BRAND_COLORS.accentLight,
          lineHeight: 1.35,
        }}
      >
        Save my contact card
      </div>
    </OgImageFrame>,
    size,
  );
}
