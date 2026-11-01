import type { ComponentPropsWithoutRef } from "react";

import { buttonClassName, type ButtonVariant } from "./button-styles";

type ButtonProps = {
  readonly children: string;
  readonly variant?: ButtonVariant;
  readonly className?: string;
  readonly title?: string;
  readonly "aria-label"?: string;
  readonly onClick: ComponentPropsWithoutRef<"button">["onClick"];
};

export function Button({
  children,
  variant = "secondary",
  className,
  title,
  "aria-label": ariaLabel,
  onClick,
}: ButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={ariaLabel}
      className={buttonClassName(variant, className)}
    >
      {children}
    </button>
  );
}
