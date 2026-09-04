import Link from "next/link";

import { classNames } from "@/lib/classnames";

export type SegmentedLinkItem = {
  readonly id: string;
  readonly href: string;
  /** Short text shown inside the segment. */
  readonly label: string;
  /** Full, unabbreviated name exposed to assistive tech and tooltips. */
  readonly fullLabel?: string;
  readonly active: boolean;
};

type SegmentedLinksProps = {
  readonly items: readonly SegmentedLinkItem[];
  /** Names the control for screen readers, e.g. "CV variant". */
  readonly label: string;
  /** Width and placement are the caller's business; the track sizes to content by default. */
  readonly className?: string;
  /**
   * Below `sm`, render as a `<details>` dropdown instead of a row - the row
   * cannot fit four-plus real-length options at 375px without spilling past
   * its own border (see e2e/segmented-control.e2e.ts). `summary` is the text
   * shown on the closed control; pass the current item's full, localized
   * name. From `sm` up this has no effect - the row renders as it always has.
   */
  readonly collapsible?: {
    readonly summary: string;
  };
};

// Deliberately no `min-w-0`. With `flex-1`, `min-w-0` sets the flex base size
// to 0, so the line never breaks and `flex-wrap` becomes inert - segments shrink
// below their `whitespace-nowrap` text and it spills out of each anchor instead.
// Leaving the default `min-width: auto` floors each segment at min-content, which
// is what lets the row actually wrap to a second line.
const rowItemClassName =
  "inline-flex h-10 flex-1 items-center justify-center whitespace-nowrap rounded-md px-3 text-xs font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus) motion-safe:active:translate-y-px sm:flex-none";

const listItemClassName =
  "flex h-10 items-center justify-between gap-2 rounded-md px-3 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus)";

function activeClassName(active: boolean) {
  return active
    ? "bg-(--color-accent) font-semibold text-(--color-on-accent)"
    : "text-(--color-text-muted) hover:bg-(--color-surface) hover:text-(--color-accent)";
}

/**
 * Joined set of links styled as one segmented control. Stays a list of real
 * anchors (not a JS-driven select) so each option remains crawlable and works
 * without client JS - true in both the row and the `collapsible` dropdown.
 */
export function SegmentedLinks({ items, label, className, collapsible }: SegmentedLinksProps) {
  const row = items.map((item) => (
    <Link
      key={item.id}
      href={item.href}
      aria-current={item.active ? "page" : undefined}
      aria-label={item.fullLabel}
      title={item.fullLabel}
      className={classNames(rowItemClassName, activeClassName(item.active))}
    >
      {item.label}
    </Link>
  ));

  if (!collapsible) {
    return (
      <nav
        aria-label={label}
        className={classNames(
          "inline-flex flex-wrap gap-1 rounded-lg border border-(--color-border-strong) bg-(--color-surface-muted) p-1",
          className,
        )}
      >
        {row}
      </nav>
    );
  }

  return (
    <nav aria-label={label} className={classNames("flex flex-col", className)}>
      <details className="group rounded-lg border border-(--color-border-strong) bg-(--color-surface-muted) sm:hidden">
        <summary
          className={classNames(
            "flex h-10 list-none items-center justify-between gap-2 rounded-lg px-3 text-sm font-medium text-foreground [&::-webkit-details-marker]:hidden",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus)",
          )}
        >
          <span className="truncate">{collapsible.summary}</span>
          <ChevronIcon className="shrink-0 group-open:rotate-180 motion-safe:transition-transform motion-safe:duration-150" />
        </summary>

        <div className="flex flex-col gap-1 border-t border-(--color-border-strong) p-1">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className={classNames(listItemClassName, activeClassName(item.active))}
            >
              {item.fullLabel ?? item.label}
            </Link>
          ))}
        </div>
      </details>

      <div className="hidden flex-wrap gap-1 rounded-lg border border-(--color-border-strong) bg-(--color-surface-muted) p-1 sm:flex">
        {row}
      </div>
    </nav>
  );
}

function ChevronIcon({ className }: { readonly className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={16}
      height={16}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
