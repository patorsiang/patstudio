import type { Metadata } from "next";

import { profile } from "@patorsiang/content";

import { NamecardFlip } from "@/components/organisms/NamecardFlip";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Namecard",
  description: `Save ${profile.name.en}'s contact card, or reach her on LINE, WhatsApp, GitHub, or LinkedIn.`,
  path: "/card",
  type: "profile",
});

/**
 * The digital namecard - a standalone shareable artifact, not a site page.
 * Deliberately skips PageShell (no GlobalNav/SiteFooter): someone lands here
 * from a QR scan or a shared link expecting a business card, not the rest of
 * the site's chrome.
 *
 * Still renders its own <main> rather than nothing, though - PageShell is
 * what supplies that landmark everywhere else, and skipping it here must not
 * cost screen reader users the landmark too. Full rationale in
 * docs/design/namecard.md.
 */
export default function CardPage() {
  return (
    <main className="relative flex min-h-dvh flex-1 items-center justify-center overflow-hidden bg-background px-6 py-10 text-foreground">
      {/* min-h-dvh, not just flex-1: flex-1 only centers within whatever
          height body's flex layout actually hands this element, which is not
          reliably a full viewport once real content/scripts are in the mix.
          An explicit height floor makes the centering correct regardless of
          that. dvh over vh accounts for mobile browser chrome
          (address bar) shrinking the real viewport - this page is opened
          from a QR scan, so it is mobile-first by definition. */}
      <NamecardFlip />
    </main>
  );
}
