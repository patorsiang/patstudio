"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Tells the visitor that what they are reading came from cache.
 *
 * This is the honest half of a full offline shell: the service worker will
 * happily serve a page saved days ago, and without this there is no way to
 * tell that from a live one.
 *
 * No dismiss control on purpose — a button would need a 40px tap target to
 * satisfy the design system, for no benefit. No transition either: the
 * reduced-motion suite forbids motion a user did not ask for, and a banner
 * that slides in while you are trying to read is exactly that.
 */
export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const sync = () => setIsOffline(!navigator.onLine);

    // Read once on mount: the browser may already be offline before any event
    // fires, and rendering nothing in that case is the bug this exists to fix.
    sync();

    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);

    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  // Not on /offline. That page exists *because* you are offline, and the
  // banner's copy - "showing a saved copy" - is wrong there: the fallback is
  // not a saved copy of anything you asked for.
  if (!isOffline || pathname === "/offline") {
    return null;
  }

  return (
    <div
      role="status"
      className="border-b border-(--color-border) bg-(--color-surface-muted) px-6 py-2 text-center text-sm text-(--color-text-muted) print:hidden sm:px-8 lg:px-10"
    >
      You&rsquo;re offline &mdash; showing a saved copy, which may be out of date.
    </div>
  );
}
