import { MARK_DASH_LENGTH, MARK_PATH, MARK_STROKE_WIDTH, MARK_VIEW_BOX } from "@/lib/brand";

/**
 * The site mark, self-drawing once on the homepage hero. A one-shot brand
 * moment, not a general-purpose mark - see SiteMark for that.
 *
 * Its own small SVG rather than a wrapper around SiteMark: the draw effect
 * needs a class on the <path> itself, and SiteMark exposes no such seam.
 * Both still read the same geometry from @/lib/brand, so there is one
 * source of truth for the shape.
 *
 * The draw is pure CSS (see .hero-mark-draw in globals.css) via
 * @starting-style, so this stays a server component - no client-side
 * mount effect, no hydration-visible flash.
 */
export function HeroMark() {
  return (
    <svg
      viewBox={MARK_VIEW_BOX}
      width={32}
      height={32}
      fill="none"
      stroke="currentColor"
      strokeWidth={MARK_STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-(--color-accent)"
      aria-hidden="true"
    >
      <path
        d={MARK_PATH}
        className="hero-mark-draw"
        style={{ "--hero-mark-dash-length": MARK_DASH_LENGTH } as React.CSSProperties}
      />
    </svg>
  );
}
