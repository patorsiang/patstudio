"use client";

import { logger } from "@patorsiang/utils";
import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/atoms/Button";
import { applyStoredTheme } from "@/lib/theme";

export default function ErrorBoundary({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  useEffect(() => {
    // Log the error to our shared utility
    logger.error("Application error boundary triggered", error);
  }, [error]);

  useEffect(() => {
    // Error-boundary rendering can bypass the root layout's inline theme
    // bootstrap script, so re-apply the user's stored theme here too.
    applyStoredTheme();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="text-base font-semibold text-(--color-danger)">Error</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
          Something went wrong
        </h1>
        <p className="mt-6 text-base leading-7 text-(--color-text-muted)">
          An unexpected error occurred. We&apos;ve been notified and are looking into it.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button variant="primary" onClick={() => reset()}>
            Try again
          </Button>
          <Link
            href="/"
            className="inline-flex h-10 items-center text-sm font-semibold text-(--color-accent) underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus)"
          >
            Go back home <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
