import { sanitizeUrl } from "@patorsiang/utils";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

import { classNames } from "@/lib/classnames";

type TextLinkProps = {
  readonly href: string;
  readonly children: string;
  readonly className?: string;
  /**
   * A name for the link when the visible text alone is ambiguous in a list of
   * links ("GitHub" on seven cards). Start it with the visible text, so it
   * still satisfies WCAG 2.5.3 Label in Name.
   */
  readonly "aria-label"?: string;
  readonly target?: ComponentPropsWithoutRef<"a">["target"];
  readonly rel?: ComponentPropsWithoutRef<"a">["rel"];
};

export function TextLink({
  href,
  children,
  className,
  target,
  rel,
  "aria-label": ariaLabel,
}: TextLinkProps) {
  const isInternal = href.startsWith("/");
  const sharedClassName = classNames(
    "relative font-semibold text-(--color-accent) underline-offset-4 transition hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus) motion-safe:active:top-px print:text-zinc-800",
    className,
  );

  if (isInternal) {
    return (
      <Link href={href} aria-label={ariaLabel} className={sharedClassName}>
        {children}
      </Link>
    );
  }

  return (
    <a
      href={sanitizeUrl(href)}
      target={target}
      rel={rel}
      aria-label={ariaLabel}
      className={sharedClassName}
    >
      {children}
    </a>
  );
}
