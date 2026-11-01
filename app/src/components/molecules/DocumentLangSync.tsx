"use client";

import { useEffect } from "react";

/**
 * The root layout renders a single `<html lang="en">` - Next.js App Router
 * has no supported way to vary it per segment without either multiple root
 * layouts (a routing restructure, out of scope) or forcing this page to
 * dynamic rendering (the same trade-off next.config.ts's CSP comment already
 * rejects, for a different header). This patches `document.documentElement`
 * after hydration instead.
 *
 * Real limitation: the raw server-rendered HTML - curl, View Source, a
 * non-JS crawler - still reads lang="en" on every Thai CV route. Googlebot
 * executes JavaScript before indexing and sees the corrected value once this
 * effect runs, so this still helps Google and any live-DOM tool; it does not
 * help simpler parsers. Tracked deliberately, not treated as a bug to hide.
 */
export function DocumentLangSync({ lang }: { readonly lang: "en" | "th" }) {
  useEffect(() => {
    document.documentElement.lang = lang;

    return () => {
      document.documentElement.lang = "en";
    };
  }, [lang]);

  return null;
}
