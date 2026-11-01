/**
 * Writes every brand artefact that cannot be produced by the CSS pipeline.
 *
 * Run by hand after changing anything in src/lib/brand.ts:
 *   bun run --cwd app generate:brand
 *
 * Deliberately not wired into CI. These are committed artefacts; regenerating
 * them on every run would produce diff noise and, worse, make the drift test in
 * src/lib/brand.test.ts self-fulfilling.
 *
 * Rasterising uses Playwright rather than an image library: it is already a
 * devDependency for the e2e suite, so this adds nothing to install, and the
 * engine that renders the site renders its icons.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { chromium } from "@playwright/test";

import {
  buildIconSvg,
  BRAND_COLORS,
  MARK_PATH,
  MARK_STROKE_WIDTH,
  MARK_VIEW_BOX,
} from "../src/lib/brand";

const appDir = join(import.meta.dir, "../src/app");
const iconsDir = join(import.meta.dir, "../public/icons");

type TileOptions = {
  /** Fraction of the canvas the glyph may occupy. */
  readonly scale: number;
  readonly background: string;
  readonly stroke: string;
};

/**
 * A full-bleed tile with the glyph inset.
 *
 * Android crops maskable icons to a circle and guarantees only the inner 80%,
 * so a maskable tile passes scale 0.6 to keep the glyph well inside that. A
 * bare glyph on transparency is never correct for an icon slot: the launcher
 * either clips it or floats it on white.
 */
function buildTileHtml(size: number, { scale, background, stroke }: TileOptions): string {
  const inset = ((1 - scale) / 2) * 100;

  return `<!doctype html><html><body style="margin:0">
<div style="width:${size}px;height:${size}px;background:${background};display:flex;align-items:center;justify-content:center">
  <svg viewBox="${MARK_VIEW_BOX}" width="${size * scale}" height="${size * scale}"
       style="margin:${inset}px" fill="none" stroke="${stroke}"
       stroke-width="${MARK_STROKE_WIDTH}" stroke-linecap="round" stroke-linejoin="round">
    <path d="${MARK_PATH}"/>
  </svg>
</div></body></html>`;
}

/**
 * An ICO is a 6-byte header, one 16-byte directory entry per image, then the
 * payloads. Embedding a PNG payload has been legal since Vista, so a single
 * 256x256 PNG wrapped in that header is a valid .ico - which avoids adding an
 * image-encoding dependency for one file.
 */
function pngToIco(png: Buffer): Buffer {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type 1 = icon
  header.writeUInt16LE(1, 4); // one image

  const entry = Buffer.alloc(16);
  entry.writeUInt8(0, 0); // width 0 means 256
  entry.writeUInt8(0, 1); // height 0 means 256
  entry.writeUInt8(0, 2); // palette size, 0 for truecolour
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // colour planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(png.byteLength, 8);
  entry.writeUInt32LE(header.byteLength + entry.byteLength, 12);

  return Buffer.concat([header, entry, png]);
}

async function main() {
  writeFileSync(join(appDir, "icon.svg"), buildIconSvg(), "utf8");
  console.log("wrote icon.svg");

  mkdirSync(iconsDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage();

  const shoot = async (size: number, options: TileOptions): Promise<Buffer> => {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(buildTileHtml(size, options));
    return page.screenshot({ omitBackground: false });
  };

  /**
   * Playwright's page.screenshot() encodes an opaque capture as plain RGB.
   * Next's Turbopack ICO decoder rejects that: it only accepts an RGBA PNG
   * payload inside a .ico. Round-tripping the capture through a <canvas> forces
   * an alpha channel (canvas export is always RGBA) without pulling in an image
   * library just for this one file.
   */
  const toRgba = async (png: Buffer, size: number): Promise<Buffer> => {
    const dataUrl = `data:image/png;base64,${png.toString("base64")}`;
    await page.setContent(
      `<!doctype html><html><body style="margin:0"><canvas id="c" width="${size}" height="${size}"></canvas><img id="i" src="${dataUrl}" style="display:none"/></body></html>`,
    );
    const outDataUrl = await page.evaluate(async () => {
      const img = document.getElementById("i") as HTMLImageElement;
      await img.decode();
      const canvas = document.getElementById("c") as HTMLCanvasElement;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      return canvas.toDataURL("image/png");
    });
    const base64Payload = outDataUrl.split(",")[1];
    if (!base64Payload) {
      throw new Error(
        `toRgba: canvas.toDataURL() returned no base64 payload for a ${size}px round-trip - the PNG failed to decode or re-encode`,
      );
    }
    return Buffer.from(base64Payload, "base64");
  };

  const tile: TileOptions = {
    scale: 0.68,
    background: BRAND_COLORS.accentLight,
    stroke: BRAND_COLORS.onAccentLight,
  };
  const maskable: TileOptions = { ...tile, scale: 0.6 };

  const targets: { path: string; size: number; options: TileOptions }[] = [
    { path: join(appDir, "apple-icon.png"), size: 180, options: tile },
    { path: join(iconsDir, "icon-192.png"), size: 192, options: tile },
    { path: join(iconsDir, "icon-512.png"), size: 512, options: tile },
    { path: join(iconsDir, "icon-maskable-512.png"), size: 512, options: maskable },
  ];

  for (const target of targets) {
    writeFileSync(target.path, await shoot(target.size, target.options));
    console.log(`wrote ${target.path}`);
  }

  const ico = await toRgba(await shoot(256, tile), 256);
  writeFileSync(join(appDir, "favicon.ico"), pngToIco(ico));
  console.log("wrote favicon.ico");

  await browser.close();
}

await main();
