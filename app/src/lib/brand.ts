/**
 * Geometry and colour for the site mark.
 *
 * Everything that draws the mark reads from here: the SiteMark component, the
 * OG image, and scripts/generate-brand-assets.ts.
 *
 * The colours are duplicated from packages/ui/tokens.css on purpose. icon.svg
 * and the OG image both render outside the CSS pipeline and cannot resolve
 * custom properties, so the literals have to live somewhere - this file is that
 * somewhere, rather than each renderer inventing its own copy. If a token
 * changes in tokens.css, change it here too.
 *
 * accentLight/accentDark map to --color-accent, pageLight to --color-page,
 * and onAccentLight/textStrongLight/textMutedLight to the LIGHT values of
 * --color-on-accent/--color-text/--color-text-muted - all from
 * packages/ui/tokens.css. Those three also have distinct dark values in
 * tokens.css (#111110, #f4f4f5, #d4d4d8 respectively), but the dark values
 * are not mirrored here because nothing outside the CSS pipeline renders
 * dark yet - only add them once something actually needs to.
 */
export const MARK_VIEW_BOX = "0 0 100 100";
export const MARK_PATH = "M34 82 V24 H54 a17 17 0 1 1 0 34 H34";
export const MARK_STROKE_WIDTH = 15;

/**
 * Length, in MARK_PATH's own user-space units (the viewBox is 0 0 100 100,
 * so this is independent of any rendered size), that HeroMark's
 * stroke-dasharray uses to draw the mark on mount.
 *
 * Computed by hand rather than measured at runtime with
 * SVGPathElement.getTotalLength(): that needs a mounted DOM node, which
 * would force HeroMark into a client component and risk a
 * visible-then-hidden-then-drawn flash on hydration. The stem is two
 * straight runs of 58 and 20 units, the bowl is a semicircle of radius 17
 * (its chord equals its diameter, so both possible arc-length choices are
 * identical), and the base is a third straight run of 20 units:
 * 58 + 20 + (Math.PI * 17) + 20 ≈ 151.41. Rounded up to 160 so the dash
 * always fully covers the path - a dasharray longer than the path draws
 * with no visible gap once stroke-dashoffset reaches 0.
 */
export const MARK_DASH_LENGTH = 160;

export const BRAND_COLORS = {
  accentLight: "#0f766e",
  accentDark: "#5eead4",
  pageLight: "#fafaf9",
  onAccentLight: "#ffffff",
  textStrongLight: "#18181b",
  textMutedLight: "#3f3f46",
} as const;

/**
 * The favicon, as a string.
 *
 * A favicon is a separate document: it inherits nothing from the page, so
 * `currentColor` would resolve to black rather than the accent token. The two
 * values are embedded and switched on prefers-color-scheme, which is the only
 * theme signal a favicon can see.
 */
export function buildIconSvg(): string {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${MARK_VIEW_BOX}">`,
    `<style>`,
    `path{stroke:${BRAND_COLORS.accentLight}}`,
    `@media (prefers-color-scheme:dark){path{stroke:${BRAND_COLORS.accentDark}}}`,
    `</style>`,
    `<path d="${MARK_PATH}" fill="none" stroke-width="${MARK_STROKE_WIDTH}"`,
    ` stroke-linecap="round" stroke-linejoin="round"/>`,
    `</svg>`,
  ].join("");
}
