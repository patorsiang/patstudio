import type { ReactNode } from "react";

import { classNames } from "@/lib/classnames";

type CardProps = {
  readonly children: ReactNode;
  readonly className?: string;
  readonly as?: "article" | "section" | "div";
};

export function Card({ children, className, as: Component = "article" }: CardProps) {
  return (
    <Component
      className={classNames(
        "rounded-2xl border border-(--color-border) bg-(--color-surface) shadow-[0_0_20px_-12px_color-mix(in_srgb,var(--color-accent)_35%,transparent)] transition duration-150 hover:border-(--color-accent) hover:shadow-[0_0_24px_-8px_color-mix(in_srgb,var(--color-accent)_60%,transparent)]",
        className,
      )}
    >
      {children}
    </Component>
  );
}
