import { Card } from "@/components/atoms/Card";
import { classNames } from "@/lib/classnames";

type ExperienceCardProps = {
  readonly title: string;
  readonly organization: string;
  readonly location: string;
  readonly dateRange: string;
  readonly summary: string;
  readonly bullets?: readonly string[];
  readonly skills?: readonly string[];
  readonly variant?: "card" | "plain";
};

export function ExperienceCard({
  title,
  organization,
  location,
  dateRange,
  summary,
  bullets = [],
  skills = [],
  variant = "card",
}: ExperienceCardProps) {
  const content = (
    <>
      <div
        className={classNames(
          "flex flex-col gap-1",
          variant === "plain" && "sm:flex-row sm:items-baseline sm:justify-between",
        )}
      >
        {variant === "card" ? (
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-(--color-text-subtle) tabular-nums">
            {dateRange}
          </p>
        ) : null}
        <h3
          className={classNames(
            "font-semibold text-foreground",
            variant === "card" ? "mt-3 text-lg" : "text-base",
          )}
        >
          {title}
        </h3>
        {variant === "plain" ? (
          <p className="text-sm font-medium text-(--color-text-subtle) tabular-nums">{dateRange}</p>
        ) : null}
      </div>
      <p className="mt-1 text-sm font-medium text-(--color-text-muted)">
        {organization} · {location}
      </p>
      <p
        className={classNames(
          "text-sm text-(--color-text-muted)",
          variant === "card" ? "mt-3 leading-7" : "mt-2 leading-6",
        )}
      >
        {summary}
      </p>
      {bullets.length > 0 ? (
        <ul
          className={classNames(
            "text-sm text-(--color-text-muted)",
            variant === "card" ? "mt-4 space-y-2 leading-6" : "mt-2 space-y-1 leading-6",
          )}
        >
          {bullets.map((bullet) => (
            <li key={bullet}>- {bullet}</li>
          ))}
        </ul>
      ) : null}
      {skills.length > 0 ? (
        <p className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-(--color-text-subtle)">
          {skills.join(" · ")}
        </p>
      ) : null}
    </>
  );

  if (variant === "plain") {
    return <section>{content}</section>;
  }

  return <Card className="p-5">{content}</Card>;
}
