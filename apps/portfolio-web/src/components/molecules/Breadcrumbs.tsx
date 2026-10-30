import { TextLink } from "@/components/atoms/TextLink";
import { markThaiText } from "@/lib/thai-text";

type Crumb = {
  readonly href: string;
  readonly label: string;
};

/**
 * The last crumb is the current page - rendered as text with aria-current,
 * not a link to itself, matching GlobalNav's active-link convention.
 */
export function Breadcrumbs({ trail }: { readonly trail: readonly Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-(--color-text-muted) print:hidden">
      <ol className="flex flex-wrap items-center gap-2">
        {trail.map((crumb, index) => {
          const isCurrent = index === trail.length - 1;

          return (
            <li key={crumb.href} className="flex items-center gap-2">
              {index > 0 ? <span aria-hidden="true">/</span> : null}
              {isCurrent ? (
                <span aria-current="page" className="text-foreground">
                  {markThaiText(crumb.label)}
                </span>
              ) : (
                <TextLink
                  href={crumb.href}
                  // tap-reach rather than a real 40px box: this sits inline
                  // in a single-line trail, and giving it a height would
                  // open a gap above/below the row.
                  className="tap-reach"
                >
                  {crumb.label}
                </TextLink>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
