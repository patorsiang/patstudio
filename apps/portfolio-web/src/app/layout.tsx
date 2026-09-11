import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { OfflineBanner } from "@/components/molecules/OfflineBanner";
import { ServiceWorkerRegistration } from "@/components/molecules/ServiceWorkerRegistration";
import { buildWebsiteJsonLd, toJsonLdScript } from "@/lib/json-ld";
import { personJsonLdScript } from "@/lib/person-json-ld";
import { defaultDescription, defaultTitle, ownerName, siteMetadataBase, siteName } from "@/lib/seo";
import { themeBootstrapScript } from "@/lib/theme";

const websiteJsonLdScript = toJsonLdScript(buildWebsiteJsonLd());

import { geistMono, geistSans } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: siteMetadataBase,
  title: {
    default: defaultTitle,
    template: `%s | ${ownerName}`,
  },
  description: defaultDescription,
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
  openGraph: {
    title: defaultTitle,
    description: defaultDescription,
    url: "/",
    siteName,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      {/*
       * suppressHydrationWarning here is for other people's code, not ours.
       * Password managers, Grammarly, ColorZilla and friends all stamp their
       * own attributes onto <body> (`data-gr-ext-installed`,
       * `cz-shortcut-listen`, ...) between the HTML arriving and React
       * hydrating, which React then reports as a mismatch on every page. The
       * app itself never touches <body> pre-hydration - hydration.e2e.ts
       * proves that, in a browser with no extensions, on every route.
       *
       * It suppresses mismatch reporting for <body>'s OWN attributes and text
       * only, never its descendants, so it cannot hide a real bug in a
       * component. That one-level scope is the whole reason this is safe;
       * don't move it to a wrapper element hoping for broader cover.
       */}
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: themeBootstrapScript,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: personJsonLdScript,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: websiteJsonLdScript,
          }}
        />
        <OfflineBanner />
        <ServiceWorkerRegistration />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
