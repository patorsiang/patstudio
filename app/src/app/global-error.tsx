"use client";

import { logger } from "@patorsiang/utils";
import { useEffect } from "react";

import { Button } from "@/components/atoms/Button";
import { applyStoredTheme } from "@/lib/theme";

import { geistMono, geistSans } from "./fonts";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  useEffect(() => {
    logger.error("Global error boundary triggered", error);
  }, [error]);

  useEffect(() => {
    // global-error.tsx replaces the root layout, so its inline theme bootstrap
    // script never runs (React doesn't execute <script> tags it renders itself);
    // re-apply the stored theme here instead.
    applyStoredTheme();
  }, []);

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-24 sm:py-32 lg:px-8">
        <div className="text-center">
          <p className="text-base font-semibold text-(--color-danger)">Critical Error</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            A critical error occurred
          </h1>
          <p className="mt-6 text-base leading-7 text-(--color-text-muted)">
            The application encountered a serious problem. Please try refreshing the page.
          </p>
          <div className="mt-10 flex items-center justify-center">
            <Button variant="primary" onClick={() => reset()}>
              Try again
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
