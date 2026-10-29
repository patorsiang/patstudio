// Browser stand-in for next/navigation. Only usePathname is used by synced
// components. Outside a Next app the current path is the page's own location;
// wrap a subtree in <PathnameProvider path="/about"> to pick the route it
// should react to (a preview or prototype with no real router).
import { createContext, createElement, useContext, type ReactNode } from "react";

const PathnameContext = createContext<string | null>(null);

export function PathnameProvider({ path, children }: { path: string; children?: ReactNode }) {
  return createElement(PathnameContext.Provider, { value: path }, children);
}

export function usePathname(): string {
  const fromContext = useContext(PathnameContext);
  if (fromContext !== null) return fromContext;
  return typeof window === "undefined" ? "/" : window.location.pathname;
}
