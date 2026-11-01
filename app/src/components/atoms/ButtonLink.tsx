import { sanitizeUrl } from "@patorsiang/utils";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

import { buttonClassName, type ButtonVariant } from "./button-styles";

type ButtonLinkProps = {
  readonly href: string;
  readonly children: string;
  readonly variant?: ButtonVariant;
  readonly className?: string;
  readonly target?: ComponentPropsWithoutRef<"a">["target"];
  readonly rel?: ComponentPropsWithoutRef<"a">["rel"];
  /** Filename for a download link. Renders a plain anchor so the browser handles it. */
  readonly download?: string;
};

export function ButtonLink({
  href,
  children,
  variant = "secondary",
  className,
  target,
  rel,
  download,
}: ButtonLinkProps) {
  const safeHref = href.startsWith("/") ? href : sanitizeUrl(href);
  const styles = buttonClassName(variant, className);

  // A download must not be intercepted by the client router, so it stays a
  // plain anchor rather than a next/link.
  if (download) {
    return (
      <a href={safeHref} download={download} className={styles}>
        {children}
      </a>
    );
  }

  return (
    <Link href={safeHref} target={target} rel={rel} className={styles}>
      {children}
    </Link>
  );
}
