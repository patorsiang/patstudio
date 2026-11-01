import { Card } from "@/components/atoms/Card";
import { Tag } from "@/components/atoms/Tag";
import { TextLink } from "@/components/atoms/TextLink";
import { classNames } from "@/lib/classnames";

type ProjectLink = {
  readonly label: string;
  readonly href: string;
};

type ProjectCardProps = {
  readonly title: string;
  readonly summary: string;
  readonly technologies: readonly string[];
  readonly links?: readonly ProjectLink[];
  readonly meta?: readonly string[];
  readonly subtitle?: string;
  /** 2-3 outcomes. Longer lists are the sign a card is the wrong surface. */
  readonly highlights?: readonly string[];
  /** Testing notes or limitations, for technical credibility. */
  readonly note?: string;
  readonly variant?: "card" | "plain";
};

export function ProjectCard({
  title,
  summary,
  technologies,
  links = [],
  meta = [],
  subtitle,
  highlights = [],
  note,
  variant = "card",
}: ProjectCardProps) {
  const content = (
    <>
      {meta.length > 0 ? (
        <div className="flex flex-wrap gap-2 text-xs font-medium uppercase tracking-[0.12em] text-(--color-accent)">
          {meta.map((item, index) => (
            <span key={item}>
              {index > 0 ? <span aria-hidden="true">/ </span> : null}
              {item}
            </span>
          ))}
        </div>
      ) : null}
      <div
        className={classNames(
          "flex flex-col gap-1",
          variant === "plain" && "sm:flex-row sm:items-baseline sm:justify-between",
        )}
      >
        <h3
          className={classNames(
            "font-semibold text-foreground",
            variant === "card" ? "mt-3 text-xl" : "text-base",
          )}
        >
          {title}
        </h3>
        {subtitle ? (
          <p className="text-sm font-medium text-(--color-text-subtle)">{subtitle}</p>
        ) : null}
      </div>
      <p
        className={classNames(
          "text-sm text-(--color-text-muted)",
          variant === "card" ? "mt-3 leading-7" : "mt-2 leading-6",
        )}
      >
        {summary}
      </p>
      {variant === "card" ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {technologies.map((tech) => (
            <Tag key={tech}>{tech}</Tag>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm leading-6 text-(--color-text-muted)">
          {technologies.join(", ")}
        </p>
      )}
      {highlights.length > 0 ? (
        <ul
          className={classNames(
            "list-disc space-y-1.5 pl-5 text-sm text-(--color-text-muted)",
            variant === "card" ? "mt-5 leading-6" : "mt-2 leading-5",
          )}
        >
          {highlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
      ) : null}
      {note ? (
        <p
          className={classNames(
            "text-sm leading-6 text-(--color-text-subtle)",
            variant === "card" ? "mt-5" : "mt-2",
          )}
        >
          <span className="font-medium text-(--color-text-muted)">Limitations: </span>
          {note}
        </p>
      ) : null}
      {links.length > 0 ? (
        <div
          className={classNames(
            "cv-print-project-links flex flex-wrap gap-3 text-sm",
            variant === "card" ? "mt-5" : "mt-2",
          )}
        >
          {links.map((link) => (
            <TextLink
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              // Seven cards each have a "GitHub" link, and a screen reader's list
              // of links shows names only. The plain variant already spells out
              // the address, so it needs nothing more.
              aria-label={variant === "card" ? `${link.label}: ${title}` : undefined}
              // The row is a flex container, so these are blockified either
              // way; only the height needs undoing for the dense CV print
              // sheet, where nothing is tappable anyway.
              className="inline-flex h-10 items-center print:h-auto"
            >
              {formatLinkText(link, variant)}
            </TextLink>
          ))}
        </div>
      ) : null}
    </>
  );

  if (variant === "plain") {
    return <section>{content}</section>;
  }

  return <Card className="p-6">{content}</Card>;
}

function formatLinkText(link: ProjectLink, variant: ProjectCardProps["variant"]): string {
  if (variant === "plain") {
    return `${link.label}: ${formatShortUrl(link.href)}`;
  }

  return link.label;
}

function formatShortUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);
    const host = parsedUrl.hostname.replace(/^www\./, "");
    const pathname = parsedUrl.pathname.replace(/\/$/, "");

    return `${host}${pathname}`;
  } catch {
    return url
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\/$/, "");
  }
}
