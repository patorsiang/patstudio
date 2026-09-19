import { isCvLanguage, isCvRoleId, type CvLanguage, type CvRoleId } from "@patorsiang/cv-engine";

export const defaultCvRole: CvRoleId = "fullstack_engineer";
export const defaultCvLanguage: CvLanguage = "en";
export const cvRoleSlugs = [
  "fullstack-engineer",
  "ai-ml-engineer",
  "security-engineer",
  "apple-specialist",
] as const;
export const cvLanguages = ["en", "th"] as const satisfies readonly CvLanguage[];

export type CvSelection = {
  readonly role: CvRoleId;
  readonly lang: CvLanguage;
};

export type CvRouteSelection = {
  readonly role: CvRoleId;
  readonly lang: CvLanguage;
};

type SearchParamSource = Record<string, string | string[] | undefined> | URLSearchParams;

const roleSlugById = {
  fullstack_engineer: "fullstack-engineer",
  ai_ml_engineer: "ai-ml-engineer",
  security_engineer: "security-engineer",
  apple_specialist: "apple-specialist",
} as const satisfies Record<CvRoleId, string>;

const roleIdBySlug: Readonly<Record<string, CvRoleId | undefined>> = {
  "fullstack-engineer": "fullstack_engineer",
  "ai-ml-engineer": "ai_ml_engineer",
  "security-engineer": "security_engineer",
  "apple-specialist": "apple_specialist",
};

export function resolveCvSelection(source: SearchParamSource): CvSelection {
  return (
    parseCvSelection(source) ?? {
      role: defaultCvRole,
      lang: defaultCvLanguage,
    }
  );
}

export function resolveLegacyCvRouteSelection(source: SearchParamSource): CvRouteSelection {
  const role = getFirstValue(source, "role");
  const lang = getFirstValue(source, "lang");

  return {
    role: role && isCvRoleId(role) ? role : defaultCvRole,
    lang: lang && isCvLanguage(lang) ? lang : defaultCvLanguage,
  };
}

export function parseCvSelection(source: SearchParamSource): CvSelection | null {
  const role = getFirstValue(source, "role");
  const lang = getFirstValue(source, "lang");

  if (!role || !lang) {
    return null;
  }

  if (!isCvRoleId(role) || !isCvLanguage(lang)) {
    return null;
  }

  return { role, lang };
}

export function cvRoleSlugToId(slug: string): CvRoleId | null {
  // Object.hasOwn, not `?? null`: a plain object literal answers `constructor`,
  // `toString` and friends with an inherited, truthy value, which would slip
  // past the `notFound()` guard in app/cv/[role]/page.tsx and redirect
  // /cv/constructor to /en/cv/undefined instead of 404ing.
  return Object.hasOwn(roleIdBySlug, slug) ? (roleIdBySlug[slug] ?? null) : null;
}

export function cvRoleIdToSlug(role: CvRoleId): (typeof roleSlugById)[CvRoleId] {
  return roleSlugById[role];
}

export function buildCanonicalCvHref(role: CvRoleId, lang: CvLanguage): string {
  return `/${lang}/cv/${cvRoleIdToSlug(role)}`;
}

export function buildCvExportFilename(role: CvRoleId, lang: CvLanguage, extension: "json" | "md") {
  return `napatchol-thaipanich-${role}-${lang}.cv.${extension}`;
}

function getFirstValue(source: SearchParamSource, key: string): string | undefined {
  if (source instanceof URLSearchParams) {
    return source.get(key) ?? undefined;
  }

  const value = source[key];
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}
