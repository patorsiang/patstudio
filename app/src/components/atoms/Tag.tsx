import { classNames } from "@/lib/classnames";

type TagProps = {
  readonly children: string;
  readonly className?: string;
};

export function Tag({ children, className }: TagProps) {
  return (
    <span
      className={classNames(
        "rounded-full bg-(--color-surface-muted) px-2.5 py-1 text-xs font-medium text-(--color-text-muted)",
        className,
      )}
    >
      {children}
    </span>
  );
}
