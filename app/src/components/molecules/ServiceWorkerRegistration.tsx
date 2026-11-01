"use client";

import { useEffect } from "react";

/**
 * Registers the worker in production only. A service worker under `next dev`
 * caches aggressively and produces "why is my change not showing" confusion;
 * the e2e suite runs against a production build, so it is still exercised.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch((error: unknown) => {
      // Never swallow this silently — a failed registration is the difference
      // between an offline-capable site and one that only looks like it.
      console.error("Service worker registration failed", error);
    });
  }, []);

  return null;
}
