import { describe, expect, test } from "bun:test";
import { projects, type Project } from "@patorsiang/content";
import { type CvRoleConfig, type CvSectionId, generateCV } from "./index";
import { filterProjectsForRole } from "./project-filter";

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

const baseRoleConfig: CvRoleConfig = {
  id: "fullstack_engineer",
  label: "Fixture Role",
  targetTitle: "Fixture Target",
  summaryIntent: "Fixture summary",
  requiredTags: ["required-tag"],
  preferredTags: ["preferred-tag"],
  excludedTags: ["excluded-tag"],
  atsKeywords: [],
  prioritySkillGroups: [],
  priorityProjectCategories: [],
  priorityExperienceTypes: [],
  sectionOrder,
  limits: {
    maxPages: 2,
    maxProjects: 10,
    maxExperienceItems: 0,
    maxBulletsPerExperience: 0,
    maxSkillsPerGroup: 0,
    maxEducationItems: 0,
  },
};

const baseProject = projects[0];

function makeProject(overrides: Partial<Project>): Project {
  return {
    ...baseProject,
    id: `project.fixture.${overrides.slug ?? "base"}`,
    slug: overrides.slug ?? "fixture-base",
    title: overrides.title ?? { en: "Fixture Project" },
    summary: overrides.summary ?? { en: "Fixture summary" },
    role: overrides.role ?? { en: "Developer" },
    techStack: overrides.techStack ?? [],
    tags: overrides.tags ?? [],
    highlights: overrides.highlights ?? [],
    links: overrides.links ?? [],
    placement: overrides.placement ?? "project",
    contributionType: overrides.contributionType ?? "solo",
    category: overrides.category ?? baseProject.category,
    status: overrides.status ?? "prototype",
    locale: overrides.locale ?? "en",
    visibility: overrides.visibility ?? "public",
    source: overrides.source ?? baseProject.source,
    timeframe: overrides.timeframe ?? baseProject.timeframe,
    problem: overrides.problem ?? baseProject.problem,
    audience: overrides.audience ?? baseProject.audience,
    keyLearning: overrides.keyLearning ?? baseProject.keyLearning,
    testingNotes: overrides.testingNotes ?? baseProject.testingNotes,
  };
}

describe("filterProjectsForRole", () => {
  test("includes required and preferred tag matches", () => {
    const required = makeProject({
      slug: "required",
      tags: ["required-tag"],
    });
    const preferred = makeProject({
      slug: "preferred",
      tags: ["preferred-tag"],
    });
    const noMatch = makeProject({
      slug: "no-match",
      tags: ["other-tag"],
    });

    const result = filterProjectsForRole([required, preferred, noMatch], baseRoleConfig, "en");

    expect(result.map((project) => project.slug)).toEqual(["required", "preferred"]);
  });

  test("excludes excluded tags even when the project also matches preferred tags", () => {
    const excluded = makeProject({
      slug: "excluded",
      tags: ["preferred-tag", "excluded-tag"],
    });

    const result = filterProjectsForRole([excluded], baseRoleConfig, "en");

    expect(result).toEqual([]);
  });

  test("excludes private and other-locale projects", () => {
    const privateProject = makeProject({
      slug: "private",
      tags: ["required-tag"],
      visibility: "private",
    });
    const otherLocale = makeProject({
      slug: "other-locale",
      tags: ["required-tag"],
      locale: "th",
    });

    const result = filterProjectsForRole([privateProject, otherLocale], baseRoleConfig, "en");

    expect(result).toEqual([]);
  });

  test("excludes playground and hidden placements", () => {
    const playground = makeProject({
      slug: "playground",
      tags: ["required-tag"],
      placement: "playground",
    });
    const hidden = makeProject({
      slug: "hidden",
      tags: ["required-tag"],
      placement: "hidden",
    });

    const result = filterProjectsForRole([playground, hidden], baseRoleConfig, "en");

    expect(result).toEqual([]);
  });

  test("keeps both project-list placements", () => {
    const featured = makeProject({
      slug: "featured",
      tags: ["required-tag"],
      placement: "featured-project",
    });
    const listed = makeProject({ slug: "listed", tags: ["required-tag"], placement: "project" });

    const result = filterProjectsForRole([featured, listed], baseRoleConfig, "en");

    expect(result.map((project) => project.slug)).toEqual(["featured", "listed"]);
  });

  test("keeps an archived project that is still placed on a project list", () => {
    const archived = makeProject({
      slug: "archived",
      tags: ["required-tag"],
      status: "archived",
      placement: "project",
    });

    const result = filterProjectsForRole([archived], baseRoleConfig, "en");

    expect(result.map((project) => project.slug)).toEqual(["archived"]);
  });

  test("normalizes tag forms consistently", () => {
    const normalizedRole: CvRoleConfig = {
      ...baseRoleConfig,
      requiredTags: ["software-engineering"],
      preferredTags: [],
      excludedTags: [],
    };
    const project = makeProject({
      slug: "normalized",
      tags: ["Software Engineering"],
    });

    const result = filterProjectsForRole([project], normalizedRole, "en");

    expect(result.map((item) => item.slug)).toEqual(["normalized"]);
  });
});

describe("generateCV project filtering", () => {
  test("ai_ml_engineer only keeps eligible projects before ranking and limiting", () => {
    const cv = generateCV("ai_ml_engineer", "en");

    // Both are ML work and the dissertation leads. CHI is eligible but ranks third and
    // is cut by the limit, which is the intent: a cultural-heritage PWA is not evidence
    // for an AI/ML role.
    expect(cv.projects.map((project) => project.id)).toEqual([
      "project.rugpull-detection",
      "project.food101-classification",
    ]);
  });

  test("security_engineer does not reintroduce playground or hidden projects", () => {
    const cv = generateCV("security_engineer", "en");
    const offCvIds = new Set(
      projects
        .filter((project) => project.placement === "playground" || project.placement === "hidden")
        .map((project) => project.id),
    );

    expect(cv.projects.length).toBeGreaterThan(0);
    expect(cv.projects.every((project) => !offCvIds.has(project.id))).toBe(true);
  });

  test("an archived status does not by itself keep a project off a CV", () => {
    const cv = generateCV("security_engineer", "en");
    const archivedOnCv = cv.projects.filter((generated) =>
      projects.some((project) => project.id === generated.id && project.status === "archived"),
    );

    expect(archivedOnCv.length).toBeGreaterThan(0);
  });
});
