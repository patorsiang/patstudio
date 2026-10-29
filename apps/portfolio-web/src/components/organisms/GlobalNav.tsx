"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { isCvLanguage, type CvLanguage } from "@patorsiang/cv-engine";
import { buildCanonicalCvHref, cvRoleSlugToId } from "@/lib/cv-routes";
import { classNames } from "@/lib/classnames";
import { getStoredTheme, type Theme, themeStorageKey, themes } from "@/lib/theme";

/**
 * `matches` is per-link because CV is reached through several paths: /cv and
 * /cv/[role] redirect to the canonical /[lang]/cv/[role], so an exact compare
 * against the href would never mark it active on the page it links to.
 */
const primaryLinks = [
  { href: "/", label: "Home", matches: (pathname: string) => pathname === "/" },
  { href: "/about", label: "About", matches: (pathname: string) => pathname === "/about" },
  {
    href: "/experience",
    label: "Experience",
    matches: (pathname: string) => pathname === "/experience",
  },
  { href: "/projects", label: "Projects", matches: (pathname: string) => pathname === "/projects" },
  {
    href: "/posts",
    label: "Posts",
    matches: (pathname: string) => pathname === "/posts" || pathname.startsWith("/posts/"),
  },
  { href: "/cv", label: "CV", matches: isCvRoute },
  { href: "/contact", label: "Contact", matches: (pathname: string) => pathname === "/contact" },
] as const;

/**
 * Each language names itself, so the control reads the same whichever page you are on.
 * The accessible name starts with the visible short label ("TH, ภาษาไทย"), because
 * WCAG 2.5.3 Label in Name needs the visible text inside the name.
 */
const languageOptions = [
  { id: "en", short: "EN", name: "English" },
  { id: "th", short: "TH", name: "ภาษาไทย" },
] as const satisfies readonly { id: CvLanguage; short: string; name: string }[];

export function GlobalNav() {
  const pathname = usePathname();
  const [activeTheme, setActiveTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const mediaQuery = globalThis.matchMedia("(prefers-color-scheme: dark)");
    const applyPreferredTheme = () => {
      const nextTheme = getStoredTheme() ?? getSystemTheme();

      setActiveTheme(nextTheme);
    };
    const handleChange = () => {
      if (!getStoredTheme()) {
        applyPreferredTheme();
      }
    };
    const timeoutId = globalThis.setTimeout(applyPreferredTheme, 0);

    mediaQuery.addEventListener("change", handleChange);
    return () => {
      globalThis.clearTimeout(timeoutId);
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    if (activeTheme) {
      document.documentElement.dataset.theme = activeTheme;
    }
  }, [activeTheme]);

  function selectTheme(nextTheme: Theme) {
    globalThis.localStorage.setItem(themeStorageKey, nextTheme);
    setActiveTheme(nextTheme);
  }

  const languageLinks = useMemo(() => buildLanguageLinks(pathname), [pathname]);

  return (
    <nav
      aria-label="Global navigation"
      // The chrome is English on every route, including the Thai CV, so it does
      // not inherit the surrounding page language. Drop this once it localizes.
      lang="en"
      className="flex flex-col gap-3 border-b border-(--color-border) pb-4 print:hidden sm:flex-row sm:items-center sm:justify-between"
    >
      {/* The IA's primary nav, now that every page in it exists. */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {primaryLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={link.matches(pathname) ? "page" : undefined}
            className={classNames(
              "inline-flex h-10 items-center text-sm font-semibold underline-offset-4 transition hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
              link.matches(pathname) ? "text-foreground underline" : "text-(--color-accent)",
            )}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {languageLinks ? (
          <div className="flex items-center gap-1" role="group" aria-label="Language">
            {languageOptions.map((option) => (
              <Link
                key={option.id}
                href={languageLinks.hrefs[option.id]}
                aria-current={languageLinks.active === option.id ? "page" : undefined}
                aria-label={`${option.short}, ${option.name}`}
                lang={option.id}
                hrefLang={option.id}
                className={controlClassName(languageLinks.active === option.id)}
              >
                {option.short}
              </Link>
            ))}
          </div>
        ) : null}

        <div className="flex items-center gap-1" role="group" aria-label="Theme">
          {themes.map((themeOption) => (
            <button
              key={themeOption}
              type="button"
              aria-pressed={activeTheme === themeOption}
              aria-label={`Use ${themeOption} theme`}
              className={controlClassName(activeTheme === themeOption)}
              onClick={() => selectTheme(themeOption)}
            >
              {themeOption === "light" ? "Light" : "Dark"}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

function getSystemTheme(): Theme {
  if (globalThis.window === undefined) {
    return "light";
  }

  return globalThis.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** Every route the CV is served or redirected from: /cv, /cv/[role], /[lang]/cv/[role]. */
function isCvRoute(pathname: string) {
  const [, first, second] = pathname.split("/");

  return first === "cv" || (isCvLanguage(first) && second === "cv");
}

/**
 * Only /[lang]/cv/[role] exists in more than one language, so the switcher is
 * offered there and nowhere else. Returns null off those routes rather than
 * pointing at a CV the reader was not looking at.
 */
function buildLanguageLinks(pathname: string) {
  const [, maybeLang, maybeCv, maybeRole] = pathname.split("/");

  if (maybeCv !== "cv" || !maybeRole || !isCvLanguage(maybeLang)) {
    return null;
  }

  const role = cvRoleSlugToId(maybeRole);

  if (!role) {
    return null;
  }

  return {
    active: maybeLang,
    hrefs: {
      en: buildCanonicalCvHref(role, "en"),
      th: buildCanonicalCvHref(role, "th"),
    },
  };
}

function controlClassName(active: boolean) {
  return classNames(
    "inline-flex h-10 min-w-12 items-center justify-center rounded-full border px-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:active:translate-y-px",
    active
      ? "border-(--color-accent) bg-(--color-accent) text-(--color-on-accent)"
      : "border-(--color-border-strong) bg-(--color-surface) text-foreground hover:border-(--color-accent)",
  );
}
