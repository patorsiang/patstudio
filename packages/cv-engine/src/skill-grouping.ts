import type { SkillGroup, SkillGroupId } from "@patorsiang/content";
import type { CvLanguage, CvRoleConfig } from "./config";
import { isContentAvailableForLanguage, text } from "./content-language";
import { normalizeTag } from "./normalize";

export type GroupedSkillCategory = {
  readonly id: string;
  readonly category: SkillGroupId;
  readonly label: string;
  readonly items: readonly string[];
  readonly priorityIndex: number;
};

type RankedSkillGroup = {
  readonly skillGroup: SkillGroup;
  readonly priorityIndex: number;
};

export function groupSkillsForRole(
  skills: readonly SkillGroup[],
  roleConfig: CvRoleConfig,
  lang: CvLanguage,
): readonly GroupedSkillCategory[] {
  const priorityGroups = new Map(
    roleConfig.prioritySkillGroups.map((groupId, index) => [groupId, index]),
  );

  return skills
    .filter(
      (skillGroup) =>
        skillGroup.visibility === "public" &&
        isContentAvailableForLanguage(skillGroup.locale, lang) &&
        skillGroup.groupId !== "languages" &&
        priorityGroups.has(skillGroup.groupId),
    )
    .map((skillGroup): RankedSkillGroup => ({
      skillGroup,
      priorityIndex: priorityGroups.get(skillGroup.groupId) ?? Number.POSITIVE_INFINITY,
    }))
    .sort((a, b) => {
      if (a.priorityIndex !== b.priorityIndex) {
        return a.priorityIndex - b.priorityIndex;
      }

      return a.skillGroup.id.localeCompare(b.skillGroup.id);
    })
    .map(({ skillGroup, priorityIndex }) => ({
      id: skillGroup.id,
      category: skillGroup.groupId,
      label: text(skillGroup.label, lang),
      items: orderSkillItems(skillGroup.items, roleConfig).slice(
        0,
        roleConfig.limits.maxSkillsPerGroup,
      ),
      priorityIndex,
    }));
}

function orderSkillItems(items: readonly string[], roleConfig: CvRoleConfig): readonly string[] {
  return [...items].sort((a, b) => {
    const priorityDiff = skillItemPriority(a, roleConfig) - skillItemPriority(b, roleConfig);

    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    return a.localeCompare(b);
  });
}

function skillItemPriority(item: string, roleConfig: CvRoleConfig): number {
  if (matchesAny(item, roleConfig.atsKeywords)) {
    return 0;
  }

  if (matchesAny(item, roleConfig.requiredTags)) {
    return 1;
  }

  if (matchesAny(item, roleConfig.preferredTags)) {
    return 2;
  }

  return 3;
}

function matchesAny(value: string, candidates: readonly string[]): boolean {
  return candidates.some((candidate) => matchesSkillTerm(value, candidate));
}

function matchesSkillTerm(value: string, candidate: string): boolean {
  const normalizedValue = normalizeTag(value);
  const normalizedCandidate = normalizeTag(candidate);

  if (!normalizedValue || !normalizedCandidate) {
    return false;
  }

  if (
    normalizedValue === normalizedCandidate ||
    normalizedValue.includes(normalizedCandidate) ||
    normalizedCandidate.includes(normalizedValue)
  ) {
    return true;
  }

  const valueTokens = tokenize(value);
  const candidateTokens = tokenize(candidate);

  return (
    valueTokens.some((token) => tokenMatchesNormalized(token, normalizedCandidate)) ||
    candidateTokens.some((token) => tokenMatchesNormalized(token, normalizedValue)) ||
    valueTokens.some((valueToken) =>
      candidateTokens.some((candidateToken) => tokenMatchesNormalized(valueToken, candidateToken)),
    )
  );
}

function tokenMatchesNormalized(token: string, candidateNormalized: string): boolean {
  const normalizedToken = normalizeTag(token);

  if (!normalizedToken || !candidateNormalized) {
    return false;
  }

  return (
    normalizedToken === candidateNormalized ||
    normalizedToken.includes(candidateNormalized) ||
    candidateNormalized.includes(normalizedToken)
  );
}

function tokenize(value: string): readonly string[] {
  return value
    .split(/[^A-Za-z0-9]+/)
    .flatMap((part) => part.split(/(?<=[a-z])(?=[A-Z])/g))
    .map((part) => part.trim())
    .filter(Boolean);
}
