import type { ReactNode } from "react";

type SectionProps = {
  readonly eyebrow?: string;
  readonly title?: string;
  /**
   * 1 for the section that names the page, 2 (the default) for the rest. Each
   * page has exactly one h1, so only the first Section of a page sets this;
   * the look is the same either way.
   */
  readonly headingLevel?: 1 | 2;
  readonly children: ReactNode;
};

export function Section({ eyebrow, title, headingLevel = 2, children }: SectionProps) {
  const Heading = headingLevel === 1 ? "h1" : "h2";

  return (
    <section>
      {eyebrow || title ? (
        <div>
          {eyebrow ? (
            <p className="font-mono text-sm font-medium uppercase tracking-[0.16em] text-(--color-accent)">
              {eyebrow}
            </p>
          ) : null}
          {title ? (
            <Heading className="mt-3 text-2xl font-semibold text-foreground sm:text-3xl">
              {title}
            </Heading>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
