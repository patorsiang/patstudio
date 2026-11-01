"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import { classNames } from "@/lib/classnames";

type RevealOnViewProps = {
  readonly children: ReactNode;
};

/**
 * Reveals its children once, the first time they scroll into view - or
 * leaves them alone if they're already in view when this mounts, or if
 * prefers-reduced-motion is set (motion-guidelines.md: "Disable section
 * reveals," not "make them instant").
 *
 * Defaults to visible: the hidden state only exists once this effect has
 * run and found the element off-screen, never in the server-rendered
 * HTML, so content never depends on JavaScript to become visible - only
 * to animate. IntersectionObserver always delivers its initial
 * observation asynchronously, so a below-the-fold section is briefly
 * painted visible before this effect can hide it, regardless of which
 * effect hook sets the observer up - that transition-out is never meant
 * to be seen, though, so it has no transition at all (see the
 * `transition-none` on the hidden branch below): a hard cut, not a
 * fade, so nothing visibly flashes.
 */
export function RevealOnView({ children }: RevealOnViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Sampled once at mount; not a live matchMedia listener. If the user
    // toggles OS reduced-motion mid-session, this component won't notice -
    // but the sitewide `@media (prefers-reduced-motion: reduce)` override
    // (transition-duration: 0.01ms) still applies to any future reveal, so
    // the worst case is a snap instead of a fade, not a broken page.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries.at(-1);
        if (!entry) return;

        if (entry.isIntersecting) {
          setHidden(false);
          observer.disconnect();
        } else {
          setHidden(true);
        }
      },
      // rootMargin shrinks the effective viewport by 15% from the bottom, so
      // "intersecting" isn't reported the instant a single pixel touches the
      // real viewport edge - it waits until the section has scrolled some
      // real distance into view. Without this, threshold: 0 alone fires (and
      // the 200ms transition finishes) before a person's eyes, mid-scroll,
      // have actually reached the section - so the reveal completes off in
      // their peripheral vision and is never perceived as animating at all,
      // even though every value is technically correct the whole time.
      { threshold: 0, rootMargin: "0px 0px -15% 0px" },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={classNames(
        hidden
          ? "transition-none opacity-0 translate-y-2"
          : "transition-[opacity,translate] duration-200 opacity-100 translate-y-0",
      )}
    >
      {children}
    </div>
  );
}
