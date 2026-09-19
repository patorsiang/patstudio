import type { Project } from "@patorsiang/content";
import type { CvLanguage, CvRoleConfig } from "./config";
import { isContentAvailableForLanguage } from "./content-language";
import { normalizeTag } from "./normalize";

/**
 * Whether a project reaches a CV is an editorial decision, so it keys off `placement` —
 * the field that already means "where does this show" — and not off `status`, which
 * describes the development lifecycle. Those are separate concerns: an archived project
 * can still be the strongest evidence on a CV (a finished dissertation), and an actively
 * developed one can be a scratch experiment nobody should see. Conflating them meant
 * editing a project's lifecycle silently removed it from every generated CV.
 */
const CV_PLACEMENTS = new Set<Project["placement"]>(["featured-project", "project"]);

export function filterProjectsForRole(
  projects: readonly Project[],
  roleConfig: CvRoleConfig,
  lang: CvLanguage,
): readonly Project[] {
  const requiredTags = normalizedTagSet(roleConfig.requiredTags);
  const preferredTags = normalizedTagSet(roleConfig.preferredTags);
  const excludedTags = normalizedTagSet(roleConfig.excludedTags ?? []);

  return projects.filter((project) => {
    if (project.visibility !== "public") {
      return false;
    }

    if (!isContentAvailableForLanguage(project.locale, lang)) {
      return false;
    }

    if (!CV_PLACEMENTS.has(project.placement)) {
      return false;
    }

    if (project.tags.some((tag) => excludedTags.has(normalizeTag(tag)))) {
      return false;
    }

    return hasOverlap(project.tags, requiredTags) || hasOverlap(project.tags, preferredTags);
  });
}

function normalizedTagSet(values: readonly string[]): ReadonlySet<string> {
  return new Set(values.map(normalizeTag));
}

function hasOverlap(tags: readonly string[], criteria: ReadonlySet<string>): boolean {
  return tags.some((tag) => criteria.has(normalizeTag(tag)));
}
