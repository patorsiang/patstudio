import type { Metadata } from "next";

import { ButtonLink } from "@/components/atoms/ButtonLink";

export const metadata: Metadata = {
  title: "Offline",
  robots: { index: false, follow: false },
};

export default function Offline() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="text-base font-semibold text-(--color-accent)">Offline</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
          You&rsquo;re offline
        </h1>
        <p className="mt-6 max-w-prose text-base leading-7 text-(--color-text-muted)">
          This page was not saved for offline reading. Pages you have already visited are still
          available, and everything comes back when the connection does.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <ButtonLink href="/" variant="primary">
            Go to the homepage
          </ButtonLink>
          <ButtonLink href="/en/cv/fullstack-engineer">Open the CV</ButtonLink>
        </div>
      </div>
    </main>
  );
}
