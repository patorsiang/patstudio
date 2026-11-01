import type { ReactNode } from "react";

import { classNames } from "@/lib/classnames";

type CVSectionProps = {
  readonly title: string;
  readonly children: ReactNode;
  readonly className?: string;
};

export function CVSection({ title, children, className }: CVSectionProps) {
  return (
    <section className={classNames("cv-print-section", className)}>
      <h2 className="border-b border-(--color-border) pb-2 text-sm font-semibold uppercase tracking-[0.16em] text-foreground">
        {title}
      </h2>
      <div className="mt-4 print:mt-3">{children}</div>
    </section>
  );
}
