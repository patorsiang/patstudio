import type { MetadataRoute } from "next";

import { BRAND_COLORS } from "@/lib/brand";
import { defaultDescription, siteName } from "@/lib/seo";

export const dynamic = "force-static";

/**
 * A manifest carries one theme_color, but the accent differs by theme
 * (#0f766e light, #5eead4 dark). The light accent is used because the install
 * surface and splash screen are light-first. Varying the browser chrome by
 * theme needs a <meta name="theme-color" media="..."> pair, which a manifest
 * cannot express — noted in the spec as a follow-up.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteName,
    short_name: "Patorsiang",
    description: defaultDescription,
    start_url: "/",
    display: "standalone",
    background_color: BRAND_COLORS.pageLight,
    theme_color: BRAND_COLORS.accentLight,
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
