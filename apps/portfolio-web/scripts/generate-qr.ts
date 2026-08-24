/**
 * Regenerates public/portfolio-qr.svg and public/card-qr.svg from the site's
 * own canonical URLs.
 *
 * Run by hand whenever NEXT_PUBLIC_SITE_URL (or its fallback in src/lib/seo.ts)
 * changes - e.g. moving off the placeholder Vercel URL onto a custom domain:
 *   bun run --cwd apps/portfolio-web generate:qr
 *
 * Deliberately not wired into CI, same reasoning as generate-brand-assets.ts:
 * these are committed artefacts, not build output.
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";

import QRCode from "qrcode";

import { siteUrl } from "../src/lib/seo";

const publicDir = join(import.meta.dir, "../public");

async function writeQr(path: string, outFile: string) {
  const url = new URL(path, siteUrl).href;

  const svg = await QRCode.toString(url, {
    type: "svg",
    margin: 1,
    // Brand teal (brand.ts BRAND_COLORS.accentLight), not black - print is
    // always dark-on-white regardless of theme (design-system.md), so this
    // is a single fixed color rather than a light/dark pair.
    color: { dark: "#0f766e", light: "#ffffff" },
  });

  // QRCode's own output has no <title> - inject one so the asset stays
  // self-describing (matches every other generated icon in this repo, e.g.
  // apple-icon.png's alt text) and so a future "what does this encode?"
  // question doesn't require decoding the QR by hand.
  const withTitle = svg.replace("<svg ", `<svg role="img" aria-label="QR code for ${url}" `);
  const outPath = join(publicDir, outFile);

  writeFileSync(outPath, withTitle, "utf8");
  console.log(`wrote ${outPath} for ${url}`);
}

async function main() {
  await writeQr("/", "portfolio-qr.svg");
  await writeQr("/card", "card-qr.svg");
}

await main();
