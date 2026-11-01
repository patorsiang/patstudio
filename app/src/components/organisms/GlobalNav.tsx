"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";

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
  // Phone menu. Closed on the server and on first paint, so there is nothing to
  // mismatch at hydration. From the sm breakpoint up the links are always shown.
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const linksId = useId();

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

  // Escape closes the menu from wherever focus is, and hands focus back to the
  // button. A listener on the document rather than on <nav>, which is not an
  // interactive element and should not carry key handlers of its own. It exists
  // only while the menu is open.
  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    }

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  return (
    <nav
      aria-label="Global navigation"
      // The chrome is English on every route, including the Thai CV, so it does
      // not inherit the surrounding page language. Drop this once it localizes.
      lang="en"
      // A wrapping row, so the Menu button and the theme buttons share a line
      // when they fit and the opened link list takes a line of its own between
      // them. Reading order and visual order stay the same either way.
      className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-(--color-border) pb-4 print:hidden sm:flex-nowrap"
    >
      {/* Below sm the links sit behind this button: at 200% text they wrapped
          into a block that filled most of a phone screen (audit O5). */}
      <button
        ref={menuButtonRef}
        type="button"
        aria-expanded={menuOpen}
        aria-controls={linksId}
        className={classNames(controlClassName(menuOpen), "sm:hidden")}
        onClick={() => setMenuOpen((open) => !open)}
      >
        Menu
      </button>

      {/* The IA's primary nav, now that every page in it exists. */}
      <div
        id={linksId}
        className={classNames(
          "flex-wrap items-center gap-x-4 gap-y-2 max-sm:basis-full sm:flex",
          menuOpen ? "flex" : "hidden",
        )}
      >
        {primaryLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={link.matches(pathname) ? "page" : undefined}
            onClick={() => setMenuOpen(false)}
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
