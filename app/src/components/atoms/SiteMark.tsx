import { MARK_PATH, MARK_STROKE_WIDTH, MARK_VIEW_BOX } from "@/lib/brand";

type SiteMarkProps = {
  readonly size?: number;
  readonly className?: string;
  /**
   * Accessible name. Omit when the mark sits next to the site name, which is
   * the usual case - naming it there would make a screen reader announce the
   * brand twice.
   */
  readonly title?: string;
};

/**
 * The site mark, in-page. Inherits `currentColor`, so it follows
 * `--color-accent` in both themes with no second asset.
 *
 * The favicon cannot do this and embeds its colours instead - see
 * buildIconSvg in @/lib/brand.
 */
export function SiteMark({ size = 24, className, title }: SiteMarkProps) {
  return (
    <svg
      viewBox={MARK_VIEW_BOX}
      width={size}
      height={size}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={MARK_STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <path d={MARK_PATH} />
    </svg>
  );
}
