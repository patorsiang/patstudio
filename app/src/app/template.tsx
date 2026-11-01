import type { ReactNode } from "react";

/** Remounts on every navigation, unlike layout.tsx - needed for .page-transition's @starting-style to fire on route change. */
export default function Template({ children }: Readonly<{ children: ReactNode }>) {
  return <div className="page-transition">{children}</div>;
}
