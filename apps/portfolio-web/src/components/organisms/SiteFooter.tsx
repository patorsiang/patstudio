import { profile } from "@patorsiang/content";
import { sanitizeUrl } from "@patorsiang/utils";
import Link from "next/link";

import { buildCanonicalCvHref, defaultCvLanguage, defaultCvRole } from "@/lib/cv-routes";

/**
 * Utility links only, per docs/design/information-architecture.md: GitHub,
 * LinkedIn, Email, CV.
 *
 * Deliberately not a second navigation. About/Experience/Projects/Contact are
 * one scroll away in GlobalNav on every page, and the IA rules out repeating
 * them here - a footer that mirrors the nav doubles the maintenance and gives a
 * screen reader user two identical link lists to tell apart.
 *
 * The CV link points at the canonical `/[lang]/cv/[role]` rather than `/cv`,
 * which would redirect. GlobalNav uses `/cv` on purpose, because that is the
 * stable entry point the IA names for primary navigation; here there is nothing
 * to gain from the extra hop.
 */

const links = [
  { label: "GitHub", href: sanitizeUrl(profile.contact.github.url), external: true },
  { label: "LinkedIn", href: sanitizeUrl(profile.contact.linkedin.url), external: true },
  { label: "Email", href: sanitizeUrl(profile.contact.email.url), external: false },
  { label: "CV", href: buildCanonicalCvHref(defaultCvRole, defaultCvLanguage), external: false },
];

const linkClassName =
  "inline-flex h-10 items-center text-sm font-semibold text-(--color-accent) underline-offset-4 transition hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

/**
 * What the site's analytics do, in both languages (PDPA, QA card c25). Vercel Web
 * Analytics and Speed Insights run on every page, so every footer says so. The claims
 * are Vercel's own, from its privacy pages read 2026-10-28, which is why the text says
 * "Vercel says": the capture in QA-patstudio-s9-pdpa-02 confirms only that no cookie or
 * browser storage is used. Retention and processing region are not stated by Vercel, so
 * the line does not claim them.
 *
 * Plain text, not links, so the footer's link count stays within the IA's limit of six.
 * Each language is its own element with its own `lang`, since the footer is lang="en".
 */
const email = profile.contact.email.label.en;

const privacyLines = [
  {
    lang: "en",
    text: `This site uses Vercel Web Analytics and Speed Insights to count page views and measure loading speed. They set no cookies. Vercel says it does not store your IP address and discards its anonymous visitor identifier after 24 hours. Questions about your data: ${email}.`,
  },
  {
    lang: "th",
    text: `เว็บไซต์นี้ใช้ Vercel Web Analytics และ Speed Insights เพื่อนับจำนวนการเข้าชมหน้าและวัดความเร็วในการโหลด ทั้งสองไม่ตั้งคุกกี้ โดย Vercel ระบุว่าไม่เก็บที่อยู่ IP ของคุณ และลบตัวระบุผู้เข้าชมแบบนิรนามภายใน 24 ชั่วโมง หากมีคำถามเกี่ยวกับข้อมูลของคุณ ติดต่อ ${email}`,
  },
];

export function SiteFooter() {
  return (
    <footer
      // The chrome is English on every route, including the Thai CV, matching
      // GlobalNav. Drop this once it localizes.
      lang="en"
      className="border-t border-(--color-border) bg-background print:hidden"
    >
      <nav
        aria-label="Utility links"
        className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-6 gap-y-1 px-6 py-6 sm:px-8 lg:px-10"
      >
        {links.map((link) =>
          link.external ? (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className={linkClassName}
            >
              {link.label}
            </a>
          ) : (
            <Link key={link.label} href={link.href} className={linkClassName}>
              {link.label}
            </Link>
          ),
        )}
      </nav>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 pb-6 sm:px-8 lg:px-10">
        {privacyLines.map((line) => (
          <p
            key={line.lang}
            lang={line.lang}
            data-testid="privacy-line"
            className="max-w-prose text-xs leading-relaxed text-(--color-text-muted)"
          >
            {line.text}
          </p>
        ))}
      </div>
    </footer>
  );
}
