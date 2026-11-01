import { Card } from "@/components/atoms/Card";
import { Tag } from "@/components/atoms/Tag";
import { classNames } from "@/lib/classnames";

type SkillGroupProps = {
  readonly title: string;
  readonly items: readonly string[];
  readonly variant?: "card" | "inline";
};

export function SkillGroup({ title, items, variant = "card" }: SkillGroupProps) {
  if (variant === "inline") {
    return (
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-(--color-text-muted)">{items.join(", ")}</p>
      </div>
    );
  }

  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-foreground">{title}</h3>
      <ul className="mt-4 flex flex-wrap gap-2">
        {items.map((item) => (
          <li key={item}>
            <Tag className={classNames("bg-(--color-surface-muted)")}>{item}</Tag>
          </li>
        ))}
      </ul>
    </Card>
  );
}
