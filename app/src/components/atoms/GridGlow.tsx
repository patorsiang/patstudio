import { classNames } from "@/lib/classnames";

type GridGlowProps = {
  readonly className?: string;
};

/** Decorative grid + two corner glows, masked to fade out before body content. Gradients live in .grid-glow, globals.css. */
export function GridGlow({ className }: GridGlowProps) {
  return (
    <div
      aria-hidden="true"
      className={classNames(
        "grid-glow absolute inset-x-0 top-0 h-[32rem] [mask-image:linear-gradient(to_bottom,black,transparent)] print:hidden",
        className,
      )}
    />
  );
}
