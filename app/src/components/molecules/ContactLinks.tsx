import { ButtonLink } from "@/components/atoms/ButtonLink";

export type ContactLink = {
  readonly label: string;
  readonly href: string;
  readonly variant?: "primary" | "secondary";
  readonly external?: boolean;
};

type ContactLinksProps = {
  readonly links: readonly ContactLink[];
  readonly "aria-label"?: string;
};

export function ContactLinks({
  links,
  "aria-label": ariaLabel = "Contact links",
}: ContactLinksProps) {
  return (
    <nav aria-label={ariaLabel} className="flex flex-wrap gap-3">
      {links.map((link) => (
        <ButtonLink
          key={`${link.label}-${link.href}`}
          href={link.href}
          variant={link.variant}
          target={link.external ? "_blank" : undefined}
          rel={link.external ? "noreferrer" : undefined}
        >
          {link.label}
        </ButtonLink>
      ))}
    </nav>
  );
}
