import { describe, expect, test } from "bun:test";
import { skills, type SkillGroup, type SkillGroupId } from "@patorsiang/content";
import { generateCV, type CvRoleConfig, type CvSectionId } from "./index";
import { groupSkillsForRole } from "./skill-grouping";

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

const templateSkillGroup = skills.find(
  (skillGroup) => skillGroup.groupId === "frontend",
) as SkillGroup;

function makeSkillGroup(
  overrides: Partial<SkillGroup> & { readonly id: string; readonly groupId: SkillGroupId },
): SkillGroup {
  return {
    ...templateSkillGroup,
    id: overrides.id,
    groupId: overrides.groupId,
    locale: overrides.locale ?? "en",
    visibility: overrides.visibility ?? "public",
    label: overrides.label ?? { en: "Fixture Skills" },
    items: overrides.items ?? ["Alpha", "Beta", "Gamma"],
    source: overrides.source ?? templateSkillGroup.source,
  };
}

function makeRoleConfig(overrides: Partial<CvRoleConfig> = {}): CvRoleConfig {
  return {
    id: "fullstack_engineer",
    label: "Fixture Role",
    targetTitle: "Fixture Target",
    summaryIntent: "Fixture summary",
    requiredTags: ["react"],
    preferredTags: ["next.js"],
    excludedTags: ["private-only"],
    atsKeywords: ["GraphQL", "TypeScript", "JavaScript", "Next.js"],
    prioritySkillGroups: ["frontend", "backend-tools", "databases"],
    priorityProjectCategories: [],
    priorityExperienceTypes: [],
    sectionOrder,
    limits: {
      maxPages: 2,
      maxProjects: 10,
      maxExperienceItems: 10,
      maxBulletsPerExperience: 3,
      maxSkillsPerGroup: 3,
      maxEducationItems: 2,
    },
    ...overrides,
  };
}

describe("groupSkillsForRole", () => {
  test("includes public groups for the selected language and excludes languages", () => {
    const frontend = makeSkillGroup({
      id: "skills.frontend.fixture",
      groupId: "frontend",
      items: ["Next.js", "Angular"],
    });
    const backend = makeSkillGroup({
      id: "skills.backend.fixture",
      groupId: "backend-tools",
      items: ["Node.js"],
    });
    const languages = makeSkillGroup({
      id: "skills.languages.fixture",
      groupId: "languages",
      items: ["Thai: Native"],
    });
    const privateGroup = makeSkillGroup({
      id: "skills.private.fixture",
      groupId: "databases",
      visibility: "private",
      items: ["PostgreSQL"],
    });
    const otherLocale = makeSkillGroup({
      id: "skills.other-locale.fixture",
      groupId: "databases",
      locale: "th",
      items: ["PostgreSQL"],
    });

    const result = groupSkillsForRole(
      [frontend, backend, languages, privateGroup, otherLocale],
      makeRoleConfig(),
      "en",
    );

    expect(result.map((group) => group.category)).toEqual(["frontend", "backend-tools"]);
  });

  test("includes only categories present in prioritySkillGroups and orders them exactly", () => {
    const frontend = makeSkillGroup({
      id: "skills.frontend.fixture",
      groupId: "frontend",
      items: ["Next.js"],
    });
    const backend = makeSkillGroup({
      id: "skills.backend.fixture",
      groupId: "backend-tools",
      items: ["Node.js"],
    });
    const databases = makeSkillGroup({
      id: "skills.databases.fixture",
      groupId: "databases",
      items: ["PostgreSQL"],
    });
    const security = makeSkillGroup({
      id: "skills.security.fixture",
      groupId: "security-blockchain",
      items: ["RSA cryptography"],
    });

    const result = groupSkillsForRole(
      [databases, security, frontend, backend],
      makeRoleConfig({
        prioritySkillGroups: ["backend-tools", "frontend", "databases"],
      }),
      "en",
    );

    expect(result.map((group) => group.category)).toEqual([
      "backend-tools",
      "frontend",
      "databases",
    ]);
  });

  test("orders ATS matches before required, preferred, and remaining items", () => {
    const group = makeSkillGroup({
      id: "skills.frontend.fixture",
      groupId: "frontend",
      items: ["Angular", "Next.js", "React.js", "JavaScript/TypeScript"],
    });
    const result = groupSkillsForRole(
      [group],
      makeRoleConfig({
        requiredTags: ["react"],
        preferredTags: ["angular"],
        atsKeywords: ["TypeScript", "Next.js"],
        prioritySkillGroups: ["frontend"],
        limits: {
          maxPages: 2,
          maxProjects: 10,
          maxExperienceItems: 10,
          maxBulletsPerExperience: 3,
          maxSkillsPerGroup: 4,
          maxEducationItems: 2,
        },
      }),
      "en",
    );

    expect(result[0].items).toEqual(["JavaScript/TypeScript", "Next.js", "React.js", "Angular"]);
  });

  test("keeps supporting unmatched items until the configured item limit is reached", () => {
    const group = makeSkillGroup({
      id: "skills.frontend.fixture",
      groupId: "frontend",
      items: ["GraphQL", "Next.js", "React.js", "Angular", "PWA"],
    });
    const result = groupSkillsForRole(
      [group],
      makeRoleConfig({
        requiredTags: ["react"],
        preferredTags: [],
        atsKeywords: ["Next.js"],
        prioritySkillGroups: ["frontend"],
        limits: {
          maxPages: 2,
          maxProjects: 10,
          maxExperienceItems: 10,
          maxBulletsPerExperience: 3,
          maxSkillsPerGroup: 3,
          maxEducationItems: 2,
        },
      }),
      "en",
    );

    expect(result[0].items).toHaveLength(3);
    expect(result[0].items).toEqual(["Next.js", "React.js", "Angular"]);
  });

  test("normalizes token-aware skill matches consistently", () => {
    const group = makeSkillGroup({
      id: "skills.programming.fixture",
      groupId: "programming-fundamentals",
      items: ["JavaScript/TypeScript", "Machine Learning", "Next.js", "Ruby"],
    });
    const result = groupSkillsForRole(
      [group],
      makeRoleConfig({
        requiredTags: ["machine-learning"],
        preferredTags: ["software engineering"],
        atsKeywords: ["JavaScript", "NEXT.JS"],
        prioritySkillGroups: ["programming-fundamentals"],
        limits: {
          maxPages: 2,
          maxProjects: 10,
          maxExperienceItems: 10,
          maxBulletsPerExperience: 3,
          maxSkillsPerGroup: 4,
          maxEducationItems: 2,
        },
      }),
      "en",
    );

    expect(result[0].items).toEqual([
      "JavaScript/TypeScript",
      "Next.js",
      "Machine Learning",
      "Ruby",
    ]);
  });

  test("does not mutate the source group or item arrays", () => {
    const group = makeSkillGroup({
      id: "skills.frontend.fixture",
      groupId: "frontend",
      items: ["Angular", "Next.js", "React.js"],
    });
    const groups = [group];
    const originalGroups = [...groups];
    const originalItems = [...group.items];

    const resultOne = groupSkillsForRole(groups, makeRoleConfig(), "en");
    const resultTwo = groupSkillsForRole(groups, makeRoleConfig(), "en");

    expect(groups).toEqual(originalGroups);
    expect(group.items).toEqual(originalItems);
    expect(resultOne).toEqual(resultTwo);
    expect(resultOne[0].items).not.toBe(group.items);
  });
});

describe("generateCV skill grouping", () => {
  test("fullstack_engineer returns only configured technical categories and keeps languages separate", () => {
    const cv = generateCV("fullstack_engineer", "en");

    expect(cv.skills.map((group) => group.category)).toEqual([
      "programming-fundamentals",
      "frontend",
      "backend-tools",
      "databases",
      "cloud-infrastructure",
      "security-blockchain",
    ]);
    expect(
      cv.skills.every((group) => "category" in group && "group" in group && "items" in group),
    ).toBe(true);
    expect(cv.languages.length).toBeGreaterThan(0);
    expect(cv.languages.map((language) => language.name)).toContain("Thai");
  });

  test("ai_ml_engineer returns only its configured categories", () => {
    const cv = generateCV("ai_ml_engineer", "en");

    expect(cv.skills.map((group) => group.category)).toEqual([
      "machine-learning-ai",
      "programming-fundamentals",
      "backend-tools",
      "databases",
      "cloud-infrastructure",
    ]);
  });

  test("security_engineer returns the configured security category first", () => {
    const cv = generateCV("security_engineer", "en");

    expect(cv.skills.map((group) => group.category)).toEqual([
      "security-blockchain",
      "programming-fundamentals",
      "backend-tools",
      "cloud-infrastructure",
      "databases",
    ]);
  });

  test("repeated calls return stable skill ordering", () => {
    const first = generateCV("fullstack_engineer", "en");
    const second = generateCV("fullstack_engineer", "en");

    expect(first.skills).toEqual(second.skills);
    expect(first.languages).toEqual(second.languages);
  });
  test("a one-character skill does not match unrelated keywords by substring", () => {
    // normalizeTag("C++") is "c", and the substring test then finds it inside
    // "machinelearning", "scikitlearn", "computervision" and "dataprocessing" - so C++
    // was ranked as an AI/ML priority skill and printed ahead of Python. Short terms
    // have to match a whole token, not appear anywhere inside one.
    const group = generateCV("ai_ml_engineer", "en").skills.find(
      (item) => item.category === "programming-fundamentals",
    );

    expect(group?.items[0]).toBe("Python");
    expect(group?.items.indexOf("Python")).toBeLessThan(group?.items.indexOf("C++") ?? -1);
  });
  test("a shorter language name does not inherit a longer keyword's priority", () => {
    // "javascript".includes("java") is true, so Java was matching the JavaScript ATS
    // keyword and printing ahead of JavaScript/TypeScript on the full-stack CV. The
    // legitimate version of this - React matching "React.js" - differs by a two-letter
    // suffix, not by a whole word.
    const group = generateCV("fullstack_engineer", "en").skills.find(
      (item) => item.category === "programming-fundamentals",
    );
    const items = group?.items ?? [];

    expect(items[0]).toBe("JavaScript/TypeScript");
    expect(items.indexOf("JavaScript/TypeScript")).toBeLessThan(items.indexOf("Java"));
  });
});
