import type { Experience } from "@patorsiang/content";
import type { CvLanguage, CvRoleConfig } from "./config";
import { isContentAvailableForLanguage } from "./content-language";
import { normalizeTag } from "./normalize";
import type { BaseCvRankDebug } from "./types";

export type ExperienceScoreBreakdown = {
  readonly requiredTagMatch: number;
  readonly preferredTagMatch: number;
  readonly keywordMatch: number;
  readonly impactScore: number;
  readonly recencyScore: number;
  readonly typeBoost: number;
};

export type ExperienceRankDebug = BaseCvRankDebug & {
  readonly relevanceScore: number;
  readonly scoreBreakdown: ExperienceScoreBreakdown;
};

export type RankedExperience = {
  readonly experience: Experience;
  readonly relevanceScore: number;
  readonly matchedKeywords: readonly string[];
  readonly scoreBreakdown: ExperienceScoreBreakdown;
};

type RankedExperienceDetail = RankedExperience & {
  readonly isCurrent: boolean;
  readonly endYear: number | null;
  readonly startYear: number | null;
};

export function selectExperiencesForRole(
  experiences: readonly Experience[],
  roleConfig: CvRoleConfig,
  lang: CvLanguage,
  referenceYear = new Date().getFullYear(),
): readonly RankedExperience[] {
  return [...experiences]
    .filter((experience) => isEligibleExperience(experience, roleConfig, lang))
    .map((experience) => scoreExperience(experience, roleConfig, referenceYear))
    .sort(compareRankedExperiences)
    .map(
      ({ isCurrent: _isCurrent, endYear: _endYear, startYear: _startYear, ...experience }) =>
        experience,
    );
}

const EMPLOYMENT_GAP_THRESHOLD_MONTHS = 6;

type DateInterval = { readonly start: number; readonly end: number };

/**
 * Roles filter to relevant experiences by tag, which can drop a real job
 * from the timeline and leave what reads as an unexplained employment gap.
 * This backfills just enough of the omitted work/internship experiences
 * (chosen by relevance, not just chronological order) to close any gap
 * wider than the threshold, treating education periods as already-explained
 * time even though they're rendered in a separate CV section.
 */
export function selectBridgingExperiences(
  allExperiences: readonly Experience[],
  selected: readonly RankedExperience[],
  roleConfig: CvRoleConfig,
  lang: CvLanguage,
  referenceDate: Date = new Date(),
): readonly RankedExperience[] {
  const referenceMonthIndex = referenceDate.getFullYear() * 12 + referenceDate.getMonth();
  const selectedIds = new Set(selected.map((item) => item.experience.id));
  const visible = allExperiences.filter(
    (experience) =>
      experience.visibility === "public" && isContentAvailableForLanguage(experience.locale, lang),
  );

  const employmentIntervals = selected.map((item) =>
    experienceInterval(item.experience, referenceMonthIndex),
  );

  const explainedIntervals = [
    ...employmentIntervals,
    ...visible
      .filter((experience) => experience.type === "education")
      .map((experience) => experienceInterval(experience, referenceMonthIndex))
      .filter((interval) => !isConcurrentWithEmployment(interval, employmentIntervals)),
  ];

  const excludedTags = normalizedTagSet(roleConfig.excludedTags ?? []);
  const remainingCandidates = visible.filter(
    (experience) =>
      (experience.type === "work" || experience.type === "internship") &&
      !selectedIds.has(experience.id) &&
      !hasOverlap(normalizedTagSet(experience.tags), excludedTags),
  );

  const bridged: Experience[] = [];
  let coverage = mergeCoverage(explainedIntervals);

  for (let guard = 0; guard < remainingCandidates.length; guard += 1) {
    const gap = findUncoveredGaps(coverage, EMPLOYMENT_GAP_THRESHOLD_MONTHS)[0];
    if (!gap) {
      break;
    }

    const fillerIndex = remainingCandidates.findIndex((candidate) => {
      const interval = experienceInterval(candidate, referenceMonthIndex);
      return interval.start < gap.end && interval.end > gap.start;
    });
    if (fillerIndex === -1) {
      break;
    }

    const [filler] = remainingCandidates.splice(fillerIndex, 1);
    bridged.push(filler);
    coverage = mergeCoverage([...coverage, experienceInterval(filler, referenceMonthIndex)]);
  }

  return bridged
    .map((experience) => scoreExperience(experience, roleConfig, referenceDate.getFullYear()))
    .sort(compareRankedExperiences)
    .map(
      ({ isCurrent: _isCurrent, endYear: _endYear, startYear: _startYear, ...experience }) =>
        experience,
    );
}

const JANUARY = 0;
const DECEMBER = 11;

/**
 * Content dates are `YYYY-MM`, or `YYYY` when only the year is known. A year-only date
 * stands for the whole year, so `yearOnlyMonth` widens it to whichever end of the year
 * the caller needs: January to open an interval, December to close one.
 */
function toMonthIndex(value: string, yearOnlyMonth: number): number | null {
  const match = value.match(/^(\d{4})(?:-(\d{2}))?$/);

  if (!match) {
    return null;
  }

  const month = match[2] === undefined ? yearOnlyMonth : Number.parseInt(match[2], 10) - 1;

  return Number.parseInt(match[1], 10) * 12 + month;
}

function experienceInterval(experience: Experience, referenceMonthIndex: number): DateInterval {
  const start = toMonthIndex(experience.startDate, JANUARY) ?? referenceMonthIndex;
  const end = experience.current
    ? referenceMonthIndex
    : ((experience.endDate ? toMonthIndex(experience.endDate, DECEMBER) : null) ??
      referenceMonthIndex);

  return { start, end };
}

/**
 * A degree taken alongside a job explains no time away from work, so it must not suppress
 * bridging — treating it as explained time would hide a real employment gap behind study
 * the person was doing *while* employed. Overlap up to the gap threshold is ordinary
 * (a placement or summer internship during a full-time degree), so only a longer overlap
 * counts as concurrent study.
 *
 * Compared against the roles already on the CV, not every role in the content set: if the
 * reader can see a job running through the degree, the degree plainly isn't explaining
 * absence from work. Comparing against unselected roles instead would be circular — the
 * very candidate that could bridge a gap would disqualify the education covering it.
 */
function isConcurrentWithEmployment(
  interval: DateInterval,
  employmentIntervals: readonly DateInterval[],
): boolean {
  return employmentIntervals.some(
    (employment) =>
      Math.min(interval.end, employment.end) - Math.max(interval.start, employment.start) >
      EMPLOYMENT_GAP_THRESHOLD_MONTHS,
  );
}

function mergeCoverage(intervals: readonly DateInterval[]): DateInterval[] {
  const sorted = [...intervals].sort((a, b) => a.start - b.start);
  const merged: DateInterval[] = [];

  for (const interval of sorted) {
    const last = merged[merged.length - 1];

    if (last && interval.start <= last.end) {
      merged[merged.length - 1] = { start: last.start, end: Math.max(last.end, interval.end) };
    } else {
      merged.push(interval);
    }
  }

  return merged;
}

function findUncoveredGaps(
  coverage: readonly DateInterval[],
  thresholdMonths: number,
): DateInterval[] {
  const gaps: DateInterval[] = [];

  for (let index = 1; index < coverage.length; index += 1) {
    const gapMonths = coverage[index].start - coverage[index - 1].end;

    if (gapMonths > thresholdMonths) {
      gaps.push({ start: coverage[index - 1].end, end: coverage[index].start });
    }
  }

  return gaps;
}

function isEligibleExperience(
  experience: Experience,
  roleConfig: CvRoleConfig,
  lang: CvLanguage,
): boolean {
  if (experience.visibility !== "public") {
    return false;
  }

  if (!isContentAvailableForLanguage(experience.locale, lang)) {
    return false;
  }

  if (experience.type !== "work" && experience.type !== "internship") {
    return false;
  }

  const excludedTags = normalizedTagSet(roleConfig.excludedTags ?? []);
  const requiredTags = normalizedTagSet(roleConfig.requiredTags);
  const preferredTags = normalizedTagSet(roleConfig.preferredTags);
  const experienceTags = normalizedTagSet(experience.tags);

  if (hasOverlap(experienceTags, excludedTags)) {
    return false;
  }

  return hasOverlap(experienceTags, requiredTags) || hasOverlap(experienceTags, preferredTags);
}

function scoreExperience(
  experience: Experience,
  roleConfig: CvRoleConfig,
  referenceYear: number,
): RankedExperienceDetail {
  const requiredTagMatch = overlapRatio(experience.tags, roleConfig.requiredTags);
  const preferredTagMatch = overlapRatio(experience.tags, roleConfig.preferredTags);
  const searchText = normalizeSearchText([
    experience.title.en,
    experience.organization.en,
    experience.summary.en,
    ...experience.highlights.map((highlight) => highlight.en),
    ...experience.skills,
    ...experience.tags,
  ]);
  const keywordMatch = overlapScore(searchText, roleConfig.atsKeywords);
  const matchedKeywords = matchedKeywordsForSearch(searchText, roleConfig.atsKeywords);
  const impactScore = calculateImpactScore(experience);
  const recencyScore = calculateRecencyScore(experience, referenceYear);
  const typeBoost = roleConfig.priorityExperienceTypes.includes(experience.type) ? 1 : 0;
  const weightedScore =
    requiredTagMatch * 0.3 +
    preferredTagMatch * 0.15 +
    keywordMatch * 0.15 +
    impactScore * 0.2 +
    recencyScore * 0.1 +
    typeBoost * 0.1;
  const relevanceScore = roundScore(weightedScore);

  return {
    experience,
    relevanceScore,
    matchedKeywords,
    scoreBreakdown: {
      requiredTagMatch: roundScore(requiredTagMatch),
      preferredTagMatch: roundScore(preferredTagMatch),
      keywordMatch: roundScore(keywordMatch),
      impactScore: roundScore(impactScore),
      recencyScore: roundScore(recencyScore),
      typeBoost: roundScore(typeBoost),
    },
    isCurrent: Boolean(experience.current),
    endYear: experience.endDate ? extractYear(experience.endDate) : null,
    startYear: extractYear(experience.startDate),
  };
}

function compareRankedExperiences(a: RankedExperienceDetail, b: RankedExperienceDetail): number {
  if (a.relevanceScore !== b.relevanceScore) {
    return b.relevanceScore - a.relevanceScore;
  }

  if (a.isCurrent !== b.isCurrent) {
    return a.isCurrent ? -1 : 1;
  }

  if (a.endYear !== null && b.endYear !== null && a.endYear !== b.endYear) {
    return b.endYear - a.endYear;
  }

  if (a.endYear !== null && b.endYear === null) {
    return -1;
  }

  if (a.endYear === null && b.endYear !== null) {
    return 1;
  }

  if (a.startYear !== null && b.startYear !== null && a.startYear !== b.startYear) {
    return b.startYear - a.startYear;
  }

  if (a.startYear !== null && b.startYear === null) {
    return -1;
  }

  if (a.startYear === null && b.startYear !== null) {
    return 1;
  }

  return a.experience.id.localeCompare(b.experience.id);
}

function calculateImpactScore(experience: Experience): number {
  const impactTerms = [
    "built",
    "designed",
    "developed",
    "deployed",
    "delivered",
    "automated",
    "contributed",
    "supported",
    "maintained",
    "translated",
  ];

  const searchText = normalizeSearchText([
    experience.summary.en,
    ...experience.highlights.map((highlight) => highlight.en),
  ]);
  const matchedTerms = new Set(
    impactTerms.filter((term) => searchText.includes(normalizeTag(term))),
  );

  return Math.min(matchedTerms.size / 3, 1);
}

function calculateRecencyScore(experience: Experience, referenceYear: number): number {
  if (experience.current) {
    return 1;
  }

  if (!experience.endDate) {
    return 0.4;
  }

  const endYear = extractYear(experience.endDate);

  if (endYear === null) {
    return 0.4;
  }

  const age = referenceYear - endYear;

  if (age <= 1) {
    return 1;
  }

  if (age <= 2) {
    return 0.8;
  }

  if (age <= 5) {
    return 0.5;
  }

  return 0.2;
}

function overlapRatio(values: readonly string[], criteria: readonly string[]): number {
  if (criteria.length === 0) {
    return 0;
  }

  const criteriaSet = normalizedTagSet(criteria);
  const matches = values.filter((value) => criteriaSet.has(normalizeTag(value))).length;

  return matches / criteria.length;
}

function overlapScore(searchText: string, keywords: readonly string[]): number {
  if (keywords.length === 0) {
    return 0;
  }

  const matchedCount = keywords.filter((keyword) =>
    searchText.includes(normalizeTag(keyword)),
  ).length;

  return matchedCount / keywords.length;
}

function matchedKeywordsForSearch(
  searchText: string,
  keywords: readonly string[],
): readonly string[] {
  const matched = keywords.filter((keyword) => searchText.includes(normalizeTag(keyword)));

  return [...new Set(matched)];
}

function normalizeSearchText(values: readonly string[]): string {
  return values.map(normalizeTag).join("");
}

function normalizedTagSet(values: readonly string[]): ReadonlySet<string> {
  return new Set(values.map(normalizeTag));
}

function hasOverlap(left: ReadonlySet<string>, right: ReadonlySet<string>): boolean {
  for (const value of left) {
    if (right.has(value)) {
      return true;
    }
  }

  return false;
}

function extractYear(value: string): number | null {
  const match = value.match(/\d{4}/);

  if (!match) {
    return null;
  }

  return Number.parseInt(match[0], 10);
}

function roundScore(value: number): number {
  return Math.round(Math.min(value, 1) * 100) / 100;
}
