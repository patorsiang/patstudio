import type { Metadata } from "next";
import { sanitizeUrl } from "@patorsiang/utils";

import { ButtonLink } from "@/components/atoms/ButtonLink";

/**
 * The root layout's title template turns this into "Page not found | <owner>".
 * Without it the 404 inherits the home page's title (WCAG 2.4.2 Page Titled).
 */
export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="text-base font-semibold text-(--color-accent)">404</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
          Page not found
        </h1>
        <p className="mt-6 text-base leading-7 text-(--color-text-muted)">
          Sorry, we couldn&apos;t find the page you&apos;re looking for.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <ButtonLink href="/" variant="primary">
            Go back home
          </ButtonLink>
          <a
            href={sanitizeUrl("mailto:napatchol.tha@gmail.com")}
            className="inline-flex h-10 items-center text-sm font-semibold text-(--color-accent) underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus)"
          >
            Contact support <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </div>
    </main>
  );
}
