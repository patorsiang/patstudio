import { describe, expect, test } from "bun:test";
import { experiences, type Experience, type TranslatableText } from "@patorsiang/content";
import { generateCV, getRoleConfig, type CvRoleConfig, type CvSectionId } from "./index";
import { selectBridgingExperiences, selectExperiencesForRole } from "./experience-selection";

const sectionOrder: readonly CvSectionId[] = [
  "header",
  "summary",
  "skills",
  "experience",
  "projects",
  "education",
  "awards",
  "languages",
];

const templateExperience = experiences.find(
  (experience) => experience.id === "experience.freelance-frontend-developer",
) as Experience;

const t = (value: string): TranslatableText => ({ en: value });

function makeExperience(overrides: Partial<Experience> & { readonly id: string }): Experience {
  return {
    ...templateExperience,
    id: overrides.id,
    type: overrides.type ?? templateExperience.type,
    title: overrides.title ?? t("Fixture Experience"),
    organization: overrides.organization ?? t("Fixture Organization"),
    location: overrides.location ?? t("Fixture Location"),
    startDate: overrides.startDate ?? "2024-01",
    endDate: overrides.endDate,
    current: overrides.current,
    summary: overrides.summary ?? t("Built a fixture experience."),
    highlights: overrides.highlights ?? [t("Built and maintained a fixture system.")],
    skills: overrides.skills ?? ["React", "Go"],
    tags: overrides.tags ?? ["required-a"],
    locale: overrides.locale ?? "en",
    visibility: overrides.visibility ?? "public",
  };
}

function makeRoleConfig(overrides: Partial<CvRoleConfig> = {}): CvRoleConfig {
  return {
    id: "fullstack_engineer",
    label: "Fixture Role",
    targetTitle: "Fixture Target",
    summaryIntent: "Fixture summary",
    requiredTags: ["required-a", "required-b"],
    preferredTags: ["preferred-a", "preferred-b"],
    excludedTags: ["excluded-a"],
    atsKeywords: ["GraphQL", "Next.js", "React"],
    prioritySkillGroups: [],
    priorityProjectCategories: [],
    priorityExperienceTypes: ["work", "internship"],
    sectionOrder,
    limits: {
      maxPages: 2,
      maxProjects: 10,
      maxExperienceItems: 10,
      maxBulletsPerExperience: 3,
      maxSkillsPerGroup: 5,
      maxEducationItems: 2,
    },
    ...overrides,
  };
}

describe("selectExperiencesForRole", () => {
  test("includes matching public work and internship experiences", () => {
    const work = makeExperience({
      id: "fixture.work",
      type: "work",
      tags: ["required-a"],
    });
    const internship = makeExperience({
      id: "fixture.internship",
      type: "internship",
      tags: ["preferred-a"],
    });

    const result = selectExperiencesForRole([work, internship], makeRoleConfig(), "en", 2025);

    expect(result.map((item) => item.experience.id)).toEqual([
      "fixture.work",
      "fixture.internship",
    ]);
  });

  test("excludes education, award, and activity experiences from work selection", () => {
    const education = makeExperience({
      id: "fixture.education",
      type: "education",
      tags: ["required-a"],
    });
    const award = makeExperience({
      id: "fixture.award",
      type: "award",
      tags: ["required-a"],
    });
    const activity = makeExperience({
      id: "fixture.activity",
      type: "activity",
      tags: ["required-a"],
    });
    const work = makeExperience({
      id: "fixture.work",
      type: "work",
      tags: ["required-a"],
    });

    const result = selectExperiencesForRole(
      [education, award, activity, work],
      makeRoleConfig(),
      "en",
      2025,
    );

    expect(result.map((item) => item.experience.id)).toEqual(["fixture.work"]);
  });

  test("excludes private, other-locale, excluded-tag, and irrelevant experiences", () => {
    const privateExperience = makeExperience({
      id: "fixture.private",
      visibility: "private",
      tags: ["required-a"],
    });
    const otherLocale = makeExperience({
      id: "fixture.other-locale",
      locale: "th",
      tags: ["required-a"],
    });
    const excludedTag = makeExperience({
      id: "fixture.excluded-tag",
      tags: ["required-a", "excluded-a"],
    });
    const irrelevant = makeExperience({
      id: "fixture.irrelevant",
      tags: ["other-tag"],
    });

    const result = selectExperiencesForRole(
      [privateExperience, otherLocale, excludedTag, irrelevant],
      makeRoleConfig(),
      "en",
      2025,
    );

    expect(result).toEqual([]);
  });

  test("normalizes equivalent role tag formatting consistently", () => {
    const normalizedRole = makeRoleConfig({
      requiredTags: ["software-engineering"],
      preferredTags: [],
      excludedTags: [],
    });
    const experience = makeExperience({
      id: "fixture.normalized",
      tags: ["Software Engineering"],
    });

    const result = selectExperiencesForRole([experience], normalizedRole, "en", 2025);

    expect(result.map((item) => item.experience.id)).toEqual(["fixture.normalized"]);
  });

  test("scores stronger required-tag overlap higher", () => {
    const roleConfig = makeRoleConfig({
      requiredTags: ["required-a", "required-b"],
      preferredTags: [],
      atsKeywords: [],
      priorityExperienceTypes: [],
    });
    const weak = makeExperience({
      id: "fixture.weak-required",
      tags: ["required-a"],
    });
    const strong = makeExperience({
      id: "fixture.strong-required",
      tags: ["required-a", "required-b"],
    });

    const result = selectExperiencesForRole([weak, strong], roleConfig, "en", 2025);

    expect(result[0].experience.id).toBe("fixture.strong-required");
    expect(result[0].scoreBreakdown.requiredTagMatch).toBe(1);
    expect(result[1].scoreBreakdown.requiredTagMatch).toBe(0.5);
  });

  test("scores stronger impact wording higher when other factors are equal", () => {
    const roleConfig = makeRoleConfig({
      requiredTags: ["required-a"],
      preferredTags: [],
      atsKeywords: [],
      priorityExperienceTypes: [],
    });
    const weak = makeExperience({
      id: "fixture.weak-impact",
      tags: ["required-a"],
      summary: t("General project summary."),
      highlights: [t("Worked on a fixture project.")],
    });
    const strong = makeExperience({
      id: "fixture.strong-impact",
      tags: ["required-a"],
      summary: t("Built, designed, and delivered a fixture project."),
      highlights: [t("Developed and deployed a fixture system.")],
    });

    const result = selectExperiencesForRole([weak, strong], roleConfig, "en", 2025);

    expect(result[0].experience.id).toBe("fixture.strong-impact");
    expect(result[0].scoreBreakdown.impactScore).toBeGreaterThan(
      result[1].scoreBreakdown.impactScore,
    );
  });

  test("ATS keyword coverage contributes to ranking", () => {
    const roleConfig = makeRoleConfig({
      requiredTags: ["required-a"],
      preferredTags: [],
      atsKeywords: ["GraphQL", "Next.js"],
      priorityExperienceTypes: [],
    });
    const weak = makeExperience({
      id: "fixture.weak-keywords",
      tags: ["required-a"],
      summary: t("General project summary."),
    });
    const strong = makeExperience({
      id: "fixture.strong-keywords",
      tags: ["required-a"],
      summary: t("Built a GraphQL and Next.js fixture project."),
    });

    const result = selectExperiencesForRole([weak, strong], roleConfig, "en", 2025);

    expect(result[0].experience.id).toBe("fixture.strong-keywords");
    expect(result[0].scoreBreakdown.keywordMatch).toBeGreaterThan(
      result[1].scoreBreakdown.keywordMatch,
    );
  });

  test("a more recent experience ranks above an older otherwise equal experience", () => {
    const roleConfig = makeRoleConfig({
      requiredTags: ["required-a"],
      preferredTags: [],
      atsKeywords: [],
      priorityExperienceTypes: [],
    });
    const older = makeExperience({
      id: "fixture.older",
      tags: ["required-a"],
      endDate: "2021-05",
    });
    const newer = makeExperience({
      id: "fixture.newer",
      tags: ["required-a"],
      endDate: "2025-05",
    });

    const result = selectExperiencesForRole([older, newer], roleConfig, "en", 2025);

    expect(result[0].experience.id).toBe("fixture.newer");
    expect(result[0].scoreBreakdown.recencyScore).toBe(1);
    expect(result[1].scoreBreakdown.recencyScore).toBe(0.5);
  });

  test("a current experience ranks above a completed otherwise equal experience", () => {
    const roleConfig = makeRoleConfig({
      requiredTags: ["required-a"],
      preferredTags: [],
      atsKeywords: [],
      priorityExperienceTypes: [],
    });
    const current = makeExperience({
      id: "fixture.current",
      tags: ["required-a"],
      current: true,
      endDate: undefined,
    });
    const completed = makeExperience({
      id: "fixture.completed",
      tags: ["required-a"],
      current: false,
      endDate: "2025-05",
    });

    const result = selectExperiencesForRole([completed, current], roleConfig, "en", 2025);

    expect(result[0].experience.id).toBe("fixture.current");
  });

  test("tie-breaking uses date first and then id", () => {
    const roleConfig = makeRoleConfig({
      requiredTags: ["required-a"],
      preferredTags: [],
      atsKeywords: [],
      priorityExperienceTypes: [],
    });
    const alpha = makeExperience({
      id: "fixture.alpha",
      tags: ["required-a"],
      startDate: "2023-01",
      endDate: "2025-05",
    });
    const beta = makeExperience({
      id: "fixture.beta",
      tags: ["required-a"],
      startDate: "2023-01",
      endDate: "2025-05",
    });
    const older = makeExperience({
      id: "fixture.older",
      tags: ["required-a"],
      startDate: "2021-01",
      endDate: "2021-12",
    });

    const result = selectExperiencesForRole([older, beta, alpha], roleConfig, "en", 2025);

    expect(result.map((item) => item.experience.id)).toEqual([
      "fixture.alpha",
      "fixture.beta",
      "fixture.older",
    ]);
  });

  test("scores are rounded to two decimals and capped at 1.0", () => {
    const roleConfig = makeRoleConfig({
      requiredTags: ["required-a", "required-b"],
      preferredTags: ["preferred-a", "preferred-b"],
      atsKeywords: ["Next.js", "React"],
      priorityExperienceTypes: ["work"],
    });
    const perfect = makeExperience({
      id: "fixture.perfect",
      type: "work",
      tags: ["required-a", "required-b", "preferred-a", "preferred-b"],
      skills: ["React", "Next.js"],
      summary: t(
        "Built, designed, developed, deployed, delivered, automated, contributed, supported, maintained, translated a fixture system.",
      ),
      highlights: [
        t("Built and designed the fixture system."),
        t("Developed, deployed, and delivered the fixture system."),
      ],
      current: true,
    });

    const [result] = selectExperiencesForRole([perfect], roleConfig, "en", 2025);

    expect(result.relevanceScore).toBe(1);
    expect(result.relevanceScore.toFixed(2)).toBe("1.00");
  });
});

describe("selectBridgingExperiences", () => {
  const referenceDate = new Date(2025, 0, 1);

  /**
   * Every case below selects from one set of experiences, bridges over another, and
   * asserts on the ids that came back. Only those two sets and the role config vary.
   */
  function bridgedIds(
    selectedFrom: readonly Experience[],
    all: readonly Experience[],
    roleConfig = makeRoleConfig({ requiredTags: ["required-a"] }),
  ): readonly string[] {
    const selected = selectExperiencesForRole(selectedFrom, roleConfig, "en", 2025);

    return selectBridgingExperiences(all, selected, roleConfig, "en", referenceDate).map(
      (item) => item.experience.id,
    );
  }

  test("backfills a work experience that closes a gap wider than the threshold", () => {
    const early = makeExperience({
      id: "fixture.early",
      startDate: "2018-01",
      endDate: "2019-01",
    });
    const recent = makeExperience({
      id: "fixture.recent",
      startDate: "2021-01",
      current: true,
      endDate: undefined,
    });
    const bridge = makeExperience({
      id: "fixture.bridge",
      startDate: "2019-02",
      endDate: "2020-12",
      tags: ["unrelated"],
    });

    expect(bridgedIds([early, recent], [early, recent, bridge])).toEqual(["fixture.bridge"]);
  });

  test("adds nothing when the selected timeline has no gap over the threshold", () => {
    const early = makeExperience({ id: "fixture.early", startDate: "2018-01", endDate: "2019-01" });
    const recent = makeExperience({
      id: "fixture.recent",
      startDate: "2019-04",
      current: true,
      endDate: undefined,
    });
    const unused = makeExperience({
      id: "fixture.unused",
      startDate: "2019-06",
      endDate: "2020-01",
    });

    expect(bridgedIds([early, recent], [early, recent, unused])).toEqual([]);
  });

  test("treats an education period as already-explained time", () => {
    const early = makeExperience({ id: "fixture.early", startDate: "2018-01", endDate: "2019-01" });
    const recent = makeExperience({
      id: "fixture.recent",
      startDate: "2021-01",
      current: true,
      endDate: undefined,
    });
    const masters = makeExperience({
      id: "fixture.masters",
      type: "education",
      startDate: "2018-09",
      endDate: "2020-09",
    });
    const wouldOtherwiseBridge = makeExperience({
      id: "fixture.would-otherwise-bridge",
      startDate: "2019-02",
      endDate: "2020-12",
    });

    expect(bridgedIds([early, recent], [early, recent, masters, wouldOtherwiseBridge])).toEqual([]);
  });

  test("reads a year-only start date as January of that year", () => {
    const early = makeExperience({ id: "fixture.early", startDate: "2018-01", endDate: "2018-12" });
    const recent = makeExperience({
      id: "fixture.recent",
      startDate: "2021-01",
      current: true,
      endDate: undefined,
    });
    const yearOnlyStudy = makeExperience({
      id: "fixture.year-only-study",
      type: "education",
      startDate: "2019",
      endDate: "2020-12",
    });
    const wouldOtherwiseBridge = makeExperience({
      id: "fixture.would-otherwise-bridge",
      startDate: "2019-02",
      endDate: "2020-12",
    });

    expect(
      bridgedIds([early, recent], [early, recent, yearOnlyStudy, wouldOtherwiseBridge]),
    ).toEqual([]);
  });

  test("stops explaining time at December of a year-only end date", () => {
    const early = makeExperience({ id: "fixture.early", startDate: "2018-01", endDate: "2018-12" });
    const recent = makeExperience({
      id: "fixture.recent",
      startDate: "2024-01",
      current: true,
      endDate: undefined,
    });
    const yearOnlyStudy = makeExperience({
      id: "fixture.year-only-study",
      type: "education",
      startDate: "2019-01",
      endDate: "2020",
    });
    const bridge = makeExperience({
      id: "fixture.bridge",
      startDate: "2021-01",
      endDate: "2023-12",
    });

    expect(bridgedIds([early, recent], [early, recent, yearOnlyStudy, bridge])).toEqual([
      "fixture.bridge",
    ]);
  });

  test("ignores an education period that ran concurrently with a job", () => {
    const early = makeExperience({ id: "fixture.early", startDate: "2018-01", endDate: "2018-12" });
    const recent = makeExperience({
      id: "fixture.recent",
      startDate: "2024-01",
      current: true,
      endDate: undefined,
    });
    const partTimeDegree = makeExperience({
      id: "fixture.part-time-degree",
      type: "education",
      startDate: "2018-01",
      endDate: "2023-12",
    });
    const bridge = makeExperience({
      id: "fixture.bridge",
      startDate: "2019-06",
      endDate: "2023-12",
      tags: ["unrelated"],
    });

    expect(bridgedIds([early, recent], [early, recent, partTimeDegree, bridge])).toEqual([
      "fixture.bridge",
    ]);
  });

  test("still counts an education period that only briefly overlaps an internship", () => {
    const early = makeExperience({ id: "fixture.early", startDate: "2018-01", endDate: "2018-03" });
    const recent = makeExperience({
      id: "fixture.recent",
      startDate: "2024-01",
      current: true,
      endDate: undefined,
    });
    const summerInternship = makeExperience({
      id: "fixture.summer-internship",
      type: "internship",
      startDate: "2020-06",
      endDate: "2020-08",
      tags: ["unrelated"],
    });
    const fullTimeDegree = makeExperience({
      id: "fixture.full-time-degree",
      type: "education",
      startDate: "2018-04",
      endDate: "2023-12",
    });
    const wouldOtherwiseBridge = makeExperience({
      id: "fixture.would-otherwise-bridge",
      startDate: "2019-01",
      endDate: "2023-12",
      tags: ["unrelated"],
    });

    expect(
      bridgedIds(
        [early, recent],
        [early, recent, summerInternship, fullTimeDegree, wouldOtherwiseBridge],
      ),
    ).toEqual([]);
  });

  test("does not re-offer an experience that is already selected", () => {
    const early = makeExperience({ id: "fixture.early", startDate: "2018-01", endDate: "2019-01" });
    const recent = makeExperience({
      id: "fixture.recent",
      startDate: "2019-04",
      current: true,
      endDate: undefined,
    });

    expect(bridgedIds([early, recent], [early, recent])).toEqual([]);
  });

  test("skips a candidate whose tags are excluded by the role", () => {
    const roleConfig = makeRoleConfig({
      requiredTags: ["required-a"],
      excludedTags: ["excluded-a"],
    });
    const early = makeExperience({ id: "fixture.early", startDate: "2018-01", endDate: "2019-01" });
    const recent = makeExperience({
      id: "fixture.recent",
      startDate: "2021-01",
      current: true,
      endDate: undefined,
    });
    const excludedBridge = makeExperience({
      id: "fixture.excluded-bridge",
      startDate: "2019-02",
      endDate: "2020-12",
      tags: ["excluded-a"],
    });

    expect(bridgedIds([early, recent], [early, recent, excludedBridge])).toEqual([]);
  });
});

describe("generateCV experience integration", () => {
  test("fullstack_engineer returns relevant work/internship experiences in score order", () => {
    const cv = generateCV("fullstack_engineer", "en");

    expect(
      cv.experience.every((item) => item.rankDebug.score === item.rankDebug.relevanceScore),
    ).toBe(true);

    for (let index = 1; index < cv.experience.length; index += 1) {
      expect(cv.experience[index - 1].rankDebug.relevanceScore).toBeGreaterThanOrEqual(
        cv.experience[index].rankDebug.relevanceScore,
      );
    }

    const source = experiences.find((experience) => experience.id === cv.experience[0].id);
    expect(source).toBeDefined();
    if (!source) {
      return;
    }

    expect(cv.experience[0].id).toBe("experience.sec-playground-fullstack-developer");
    expect(cv.experience[0].title).toBe(source.title.en);
    expect(cv.experience[0].organization).toBe(source.organization.en);
    expect(cv.experience[0].location).toBe(source.location.en);
    expect(cv.experience[0].startDate).toBe(source.startDate);
    expect(cv.experience[0].endDate).toBe(
      source.current ? "present" : (source.endDate ?? "present"),
    );
    expect(cv.experience[0].summary).toBe(source.summary.en);
    expect(cv.experience[0].bullets.length).toBeLessThanOrEqual(3);
    expect(cv.experience[0].bullets.join(" ")).toContain("Vue.js");
    expect(cv.experience[0].bullets.join(" ")).toContain("Node.js");
    expect(cv.experience[0].skills).toEqual(source.skills);
  });

  test("ai_ml_engineer does not include unrelated public experiences in the main section", () => {
    const cv = generateCV("ai_ml_engineer", "en");
    const unrelatedIds = new Set([
      "experience.freelance-frontend-developer",
      "experience.datawow-frontend-developer",
      "experience.beid-frontend-developer-internship",
    ]);

    expect(cv.experience.some((item) => unrelatedIds.has(item.id))).toBe(false);
  });

  test("security_engineer keeps the experience selection driven by tags and content", () => {
    const cv = generateCV("security_engineer", "en");
    const orderedIds = cv.experience.map((item) => item.id);

    expect(
      cv.experience.every((item) => item.rankDebug.score === item.rankDebug.relevanceScore),
    ).toBe(true);
    expect(orderedIds.length).toBeLessThanOrEqual(
      getRoleConfig("security_engineer").limits.maxExperienceItems,
    );
    expect(new Set(orderedIds).has("experience.sec-playground-fullstack-developer")).toBe(true);
    expect(new Set(orderedIds).has("experience.bank-of-thailand-system-analyst")).toBe(true);
    // The PDPA/GDPR consent work is the most security-adjacent employment on the
    // record, and the summary leans on it, so it has to be visible in the body rather
    // than demoted to a bare Additional Experience line.
    expect(new Set(orderedIds).has("experience.datawow-frontend-developer")).toBe(true);
  });

  test("ai_ml_engineer backfills the frontend roles as additional experience to close the gap", () => {
    const cv = generateCV("ai_ml_engineer", "en");

    expect(cv.additionalExperience.map((item) => item.id)).toEqual([
      "experience.freelance-frontend-developer",
      "experience.datawow-frontend-developer",
    ]);
    expect(cv.additionalExperience.every((item) => item.title && item.organization)).toBe(true);
  });

  test("security_engineer leaves no unexplained gap in its timeline", () => {
    // Asserting the invariant rather than naming whichever role happens to be bridged:
    // which one that is changes whenever ranking changes, but "no unexplained gap" is
    // the thing the bridging exists to guarantee.
    const cv = generateCV("security_engineer", "en");
    const months = (value: string) => {
      const [year, month] = value.split("-");
      return Number(year) * 12 + (month ? Number(month) - 1 : 0);
    };
    const now = new Date().getFullYear() * 12 + new Date().getMonth();
    const end = (value: string) => (/^\d{4}(-\d{2})?$/.test(value) ? months(value) : now);

    const covered = [
      ...cv.experience.map((item) => [months(item.startDate), end(item.endDate)] as const),
      ...cv.additionalExperience.map((item) => {
        const [from, to] = item.dateRange.split(" - ");
        return [months(from), end(to)] as const;
      }),
      ...cv.education.map((item) => [months(item.startDate), end(item.endDate)] as const),
    ].sort((a, b) => a[0] - b[0]);

    let reach = covered[0][1];
    for (const [start, finish] of covered.slice(1)) {
      expect(start - reach, `gap before month ${start}`).toBeLessThanOrEqual(6);
      reach = Math.max(reach, finish);
    }
  });

  test("apple_specialist backfills Bank of Thailand to close the pre-2021 gap", () => {
    const cv = generateCV("apple_specialist", "en");

    expect(cv.additionalExperience.map((item) => item.id)).toEqual([
      "experience.bank-of-thailand-system-analyst",
    ]);
  });

  test("fullstack_engineer needs no bridging since its timeline already has no gap", () => {
    const cv = generateCV("fullstack_engineer", "en");

    expect(cv.additionalExperience).toEqual([]);
  });
});
