import { profile } from "@patorsiang/content";
import { ImageResponse } from "next/og";

import { BRAND_COLORS, MARK_PATH, MARK_STROKE_WIDTH, MARK_VIEW_BOX } from "@/lib/brand";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

/**
 * So pasting the /card link into LINE, WhatsApp, or Slack renders a real
 * preview instead of a bare URL - the whole point of a namecard is being
 * shared, and a bare-link preview undersells that.
 *
 * Same Satori/next-og constraints as the root and per-post images: no
 * Tailwind, no custom properties, colours duplicated from @/lib/brand.
 */
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 86px",
        background: BRAND_COLORS.pageLight,
        fontFamily: "sans-serif",
      }}
    >
      <svg
        viewBox={MARK_VIEW_BOX}
        width={96}
        height={96}
        fill="none"
        stroke={BRAND_COLORS.accentLight}
        strokeWidth={MARK_STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={MARK_PATH} />
      </svg>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
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
      </div>
    </div>,
    size,
  );
}
