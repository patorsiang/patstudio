import { classNames } from "@/lib/classnames";

export type ButtonVariant = "primary" | "secondary";

/**
 * Shared by Button and ButtonLink so a control looks the same whether it is a
 * <button> or an <a>. Height is 44px, the top of the design system's 40-44px
 * range for common controls.
 */
export function buttonClassName(variant: ButtonVariant = "secondary", className?: string) {
  return classNames(
    "inline-flex h-11 items-center justify-center rounded-full px-4 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus) motion-safe:active:translate-y-px",
    variant === "primary"
      ? "bg-(--color-accent-strong) text-(--color-on-accent-strong) hover:bg-(--color-accent) hover:text-(--color-on-accent)"
      : "border border-(--color-border-strong) bg-(--color-surface) text-foreground hover:border-(--color-accent) hover:text-(--color-accent)",
    className,
  );
}
