import { POST_IMAGE_SOURCES } from "@patorsiang/content/posts/image-hosts";
import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === "development";

/**
 * script-src keeps 'unsafe-inline': Next.js App Router injects its own
 * inline <script> tags for streaming RSC hydration data, with content that
 * varies per page (sometimes per request) - those can't be hash-allowlisted,
 * and the alternative (a per-request nonce via proxy.ts + headers() in the
 * root layout) forces every page to dynamic rendering, since headers() opts
 * the whole layout out of static generation. Verified directly: with that
 * nonce approach, /, /about, /contact, /experience, /posts, /projects, and
 * every CV page all flipped from static/SSG to server-rendered-per-request.
 * That is too large a trade for this one hardening item on a fundamentally
 * static site - revisit only as a deliberate, scoped change, not a
 * side-effect of a routine security pass.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""}`,
  [
    "connect-src 'self' https://vitals.vercel-insights.com https://*.vercel-analytics.com",
    isDevelopment ? "http://localhost:* ws://localhost:*" : "",
  ]
    .filter(Boolean)
    .join(" "),
  ...(isDevelopment ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const nextConfig: NextConfig = {
  transpilePackages: ["@patorsiang/content", "@patorsiang/cv-engine"],
  /*
   * Post images are not committed to this repo - they stay in
   * `thinking-in-public` and reach the reader through /_next/image, which
   * resizes them, re-encodes to AVIF/WebP, and serves the result from this
   * origin. That last part is why img-src can stay 'self': whatever the source
   * host, the URL in the page is same-origin, and `remotePatterns` below is
   * the allowlist doing the work CSP would otherwise have to.
   *
   * The pattern list is shared with `render.ts` so the two cannot drift; see
   * packages/content/src/posts/image-hosts.ts.
   */
  images: {
    remotePatterns: POST_IMAGE_SOURCES.map(({ protocol, hostname, pathname }) => ({
      protocol,
      hostname,
      pathname,
    })),
    formats: ["image/avif", "image/webp"],
    // A published post's images never change, and the origin is a repo host
    // with no CDN contract - there is nothing to gain from re-fetching them.
    minimumCacheTTL: 2_592_000,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: contentSecurityPolicy,
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
