import type { ReactNode } from "react";

import { GridGlow } from "@/components/atoms/GridGlow";
import { GlobalNav } from "@/components/organisms/GlobalNav";
import { SiteFooter } from "@/components/organisms/SiteFooter";
import { classNames } from "@/lib/classnames";

type PageShellProps = {
  readonly children: ReactNode;
  readonly className?: string;
  readonly contentClassName?: string;
  /**
   * BCP 47 tag for the page content, when it is not the document default.
   * The root layout has to declare lang="en" because it is shared with the
   * un-localized routes, so localized pages scope their own language here.
   */
  readonly lang?: string;
};

export function PageShell({ children, className, contentClassName, lang }: PageShellProps) {
  return (
    // The footer sits outside <main> on purpose: a <footer> nested inside main
    // is a sectioning footer, not the contentinfo landmark a screen reader user
    // jumps to. `flex-1` rather than `min-h-screen` so it settles at the bottom
    // of a short page instead of always below the fold - the body is already
    // `min-h-full flex flex-col` for this.
    <>
      {/* First Tab stop on every page that has the global nav. Visible only
          while focused, so it costs sighted mouse users nothing. It jumps past
          the nav and theme switch to #main-content, below. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:inline-flex focus:h-10 focus:items-center focus:rounded-full focus:bg-(--color-accent) focus:px-4 focus:text-sm focus:font-semibold focus:text-(--color-on-accent) focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 print:hidden"
      >
        Skip to content
      </a>
      <main
        lang={lang}
        className={classNames(
          "relative flex-1 overflow-hidden bg-background text-foreground print:bg-white",
          className,
        )}
      >
        <GridGlow />
        <div
          className={classNames(
            "relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-10 sm:px-8 lg:px-10",
            contentClassName,
          )}
        >
          <GlobalNav />
          {/* The skip link's target. tabIndex -1 so it can take focus from the
              link without joining the tab order. `gap: inherit` keeps the
              spacing between sections identical to when they were direct
              children of the container above (the CV overrides that gap). */}
          <div id="main-content" tabIndex={-1} className="flex flex-col [gap:inherit] outline-none">
            {children}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
