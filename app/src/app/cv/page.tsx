import { redirect } from "next/navigation";
import { buildCanonicalCvHref, resolveLegacyCvRouteSelection } from "@/lib/cv-routes";

type SearchParams =
  | Record<string, string | string[] | undefined>
  | URLSearchParams
  | Promise<Record<string, string | string[] | undefined> | URLSearchParams>;

export default async function CvPage({
  searchParams,
}: Readonly<{
  searchParams?: SearchParams;
}>) {
  const resolvedSearchParams = await Promise.resolve(searchParams ?? {});
  const selection = resolveLegacyCvRouteSelection(resolvedSearchParams);

  redirect(buildCanonicalCvHref(selection.role, selection.lang));
}
