#!/usr/bin/env node
// Makes the reference Storybook (.design-sync/sb-reference) render Geist.
// Why: the nextjs-vite next/font plugin leaves the reference on a system-sans
// fallback, so the compare oracle would grade our Geist previews against the wrong
// font. This injects the same vendored @font-face the design system ships
// (.design-sync/fonts/geist.css) and pins the --font-geist-* variables.
// Re-run after every `storybook build` into sb-reference; it is idempotent.
import { cpSync, existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const ref = join(root, ".design-sync/sb-reference");
const fonts = join(root, ".design-sync/fonts");
const html = join(ref, "iframe.html");
if (!existsSync(html)) {
  console.error("sb-reference/iframe.html missing - build the reference first");
  process.exit(1);
}
for (const f of readdirSync(fonts).filter((n) => /\.(css|woff2)$/.test(n))) {
  cpSync(join(fonts, f), join(ref, "ds-fonts", f), { recursive: true });
}
const MARK = "<!-- ds-geist -->";
const src = readFileSync(html, "utf8");
if (src.includes(MARK)) {
  console.error("already patched");
  process.exit(0);
}
// html[class] outranks the next/font .variable class the preview decorator adds.
const tag = `${MARK}<link rel="stylesheet" href="./ds-fonts/geist.css"><style>html[class],:root{--font-geist-sans:"Geist" !important;--font-geist-mono:"Geist Mono" !important;}</style>`;
writeFileSync(html, src.replace("</head>", `${tag}</head>`));
console.error("patched sb-reference/iframe.html");
