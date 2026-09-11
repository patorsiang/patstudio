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
  /**
   * Next allows only one `next dev` per dist directory - it takes a lock
   * there. The e2e suite runs its own dev server (playwright.config.ts's
   * `devPort` comment explains why the hydration spec cannot use the
   * production build), so without an override, having `bun dev` running would
   * stop the entire e2e suite from starting. The test server sets
   * NEXT_DIST_DIR to a directory inside the already-gitignored .next/, which
   * gives it its own lock and leaves a developer's dev server alone.
   */
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  transpilePackages: ["@patorsiang/content", "@patorsiang/cv-engine"],
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
