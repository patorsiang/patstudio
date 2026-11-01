import { isCvLanguage } from "@patorsiang/cv-engine";
import { notFound, redirect } from "next/navigation";
import { buildCanonicalCvHref, cvRoleSlugToId, defaultCvLanguage } from "@/lib/cv-routes";

type Params = { role: string } | Promise<{ role: string }>;
type SearchParams =
  | Record<string, string | string[] | undefined>
  | URLSearchParams
  | Promise<Record<string, string | string[] | undefined> | URLSearchParams>;

export default async function LegacyCvRolePage({
  params,
  searchParams,
}: Readonly<{
  params: Params;
  searchParams?: SearchParams;
}>) {
  const [{ role: roleSlug }, resolvedSearchParams] = await Promise.all([
    Promise.resolve(params),
    Promise.resolve(searchParams ?? {}),
  ]);
  const role = cvRoleSlugToId(roleSlug);

  if (!role) {
    notFound();
  }

  const lang = getFirstValue(resolvedSearchParams, "lang");

  redirect(buildCanonicalCvHref(role, lang && isCvLanguage(lang) ? lang : defaultCvLanguage));
}

function getFirstValue(
  source: Record<string, string | string[] | undefined> | URLSearchParams,
  key: string,
): string | undefined {
  if (source instanceof URLSearchParams) {
    return source.get(key) ?? undefined;
  }

  const value = source[key];
  return Array.isArray(value) ? value[0] : value;
}
