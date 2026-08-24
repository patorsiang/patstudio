import type { ReactNode } from "react";

import { BRAND_COLORS, MARK_PATH, MARK_STROKE_WIDTH, MARK_VIEW_BOX } from "@/lib/brand";

export const ogImageSize = {
  width: 1200,
  height: 630,
};

export const ogImageContentType = "image/png";

/**
 * The shell every opengraph-image.tsx in the app renders inside: brand mark
 * over a text stack, on the Satori/next-og constraints shared by all of them
 * (no Tailwind, no custom properties - colours come from @/lib/brand). Each
 * route supplies its own text stack as children, since font sizes and colours
 * differ per page.
 */
export function OgImageFrame({ children }: { readonly children: ReactNode }) {
  return (
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

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>{children}</div>
    </div>
  );
}
