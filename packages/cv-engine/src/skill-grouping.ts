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

const MIN_SUBSTRING_MATCH_LENGTH = 3;

/**
 * How much longer a keyword may be than the skill it is said to match.
 *
 * A skill containing the keyword is safe - "JavaScript/TypeScript" really does cover
 * "TypeScript". The other direction is where false positives live: "javascript"
 * contains "java", and "machinelearning" contains "c". The genuine cases there differ
 * only by a short suffix, as "React.js" does from "React", so anything longer is
 * treated as a different term rather than the same one.
 */
const MAX_KEYWORD_SUFFIX_SLACK = 2;

function containsAsRelatedTerm(value: string, candidate: string): boolean {
  if (Math.min(value.length, candidate.length) < MIN_SUBSTRING_MATCH_LENGTH) {
    return false;
  }

  if (value.includes(candidate)) {
    return true;
  }

  return candidate.includes(value) && candidate.length - value.length <= MAX_KEYWORD_SUFFIX_SLACK;
}

function matchesSkillTerm(value: string, candidate: string): boolean {
  const normalizedValue = normalizeTag(value);
  const normalizedCandidate = normalizeTag(candidate);

  if (!normalizedValue || !normalizedCandidate) {
    return false;
  }

  if (normalizedValue === normalizedCandidate) {
    return true;
  }

  if (containsAsRelatedTerm(normalizedValue, normalizedCandidate)) {
    return true;
  }

  // Every comparison passes the skill first and the keyword second. Previously the
  // middle one swapped them, which put "javascript" in the skill slot and "java" in the
  // keyword slot - the one direction the guard deliberately leaves open - so Java
  // matched the JavaScript keyword through the back door.
  const skillTokens = tokenize(value).map(normalizeTag);
  const keywordTokens = tokenize(candidate).map(normalizeTag);

  return (
    skillTokens.some((token) => containsAsRelatedTerm(token, normalizedCandidate)) ||
    keywordTokens.some((token) => containsAsRelatedTerm(normalizedValue, token)) ||
    skillTokens.some((skillToken) =>
      keywordTokens.some((keywordToken) => containsAsRelatedTerm(skillToken, keywordToken)),
    )
  );
}

function tokenize(value: string): readonly string[] {
  // Split on separators only. Splitting camel case as well turned "JavaScript" into
  // "Java" + "Script", so the skill "Java" matched that keyword exactly and outranked
  // JavaScript/TypeScript on the full-stack CV. "JavaScript" is one term, not two, and
  // the separator split still gives "Node.js" -> Node, js and
  // "JavaScript/TypeScript" -> JavaScript, TypeScript.
  return value
    .split(/[^A-Za-z0-9]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}
