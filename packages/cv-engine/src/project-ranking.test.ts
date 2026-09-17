import { describe, expect, test } from "bun:test";
import { projects, type Project } from "@patorsiang/content";
import { filterProjectsForRole } from "./project-filter";
import { type CvRoleConfig, generateCV } from "./index";
import { rankProjectsForRole } from "./project-ranking";

const sectionOrder: CvRoleConfig["sectionOrder"] = [
  "header",
  "summary",
  "skills",
  "experience",
  "projects",
  "education",
  "awards",
  "languages",
];

const baseProject = projects[0];

const baseRoleConfig: CvRoleConfig = {
  id: "fullstack_engineer",
  label: "Fixture Role",
  targetTitle: "Fixture Target",
  summaryIntent: "Fixture summary",
  requiredTags: ["required-a", "required-b"],
  preferredTags: ["preferred-a", "preferred-b"],
  excludedTags: [],
  atsKeywords: ["graphql", "next.js", "javascript"],
  prioritySkillGroups: [],
  priorityProjectCategories: ["web", "ai-ml"],
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

function t(en: string) {
  return { en } as Project["title"];
}

function makeProject(overrides: Partial<Project> & { id: string }): Project {
  return {
    ...baseProject,
    id: overrides.id,
    slug: overrides.slug ?? overrides.id.replaceAll(".", "-"),
    title: overrides.title ?? t("Fixture Project"),
    summary: overrides.summary ?? t("Fixture summary"),
    role: overrides.role ?? t("Fixture role"),
    techStack: overrides.techStack ?? [],
    tags: overrides.tags ?? [],
    highlights: overrides.highlights ?? [],
    links: overrides.links ?? baseProject.links,
    placement: overrides.placement ?? "project",
    contributionType: overrides.contributionType ?? "solo",
    category: overrides.category ?? "academic",
    status: overrides.status ?? "prototype",
    locale: overrides.locale ?? "en",
    visibility: overrides.visibility ?? "public",
    source: overrides.source ?? baseProject.source,
    timeframe: overrides.timeframe ?? t("2025"),
    problem: overrides.problem ?? baseProject.problem,
    audience: overrides.audience ?? baseProject.audience,
    keyLearning: overrides.keyLearning ?? baseProject.keyLearning,
    testingNotes: overrides.testingNotes ?? baseProject.testingNotes,
  };
}

function githubLinks(): Project["links"] {
  return [
    {
      label: t("GitHub"),
      url: "https://github.com/patorsiang/example",
    },
  ];
}

function externalLinks(): Project["links"] {
  return [
    {
      label: t("Demo"),
      url: "https://example.com",
    },
  ];
}

describe("rankProjectsForRole", () => {
  test("scores stronger required-tag overlap higher", () => {
    const weak = makeProject({
      id: "project.weak-required",
      tags: ["required-a"],
      links: [],
      category: "academic",
      placement: "project",
      timeframe: t("2025"),
    });
    const strong = makeProject({
      id: "project.strong-required",
      tags: ["required-a", "required-b"],
      links: [],
      category: "academic",
      placement: "project",
      timeframe: t("2025"),
    });

    const result = rankProjectsForRole([weak, strong], baseRoleConfig, 2025);

    expect(result[0].project.id).toBe("project.strong-required");
    expect(result[0].scoreBreakdown.requiredTagMatch).toBe(1);
    expect(result[1].scoreBreakdown.requiredTagMatch).toBe(0.5);
  });

  test("scores stronger preferred-tag overlap higher when required overlap is equal", () => {
    const weak = makeProject({
      id: "project.weak-preferred",
      tags: ["required-a", "preferred-a"],
      links: [],
      category: "academic",
      placement: "project",
      timeframe: t("2025"),
    });
    const strong = makeProject({
      id: "project.strong-preferred",
      tags: ["required-a", "preferred-a", "preferred-b"],
      links: [],
      category: "academic",
      placement: "project",
      timeframe: t("2025"),
    });

    const result = rankProjectsForRole([weak, strong], baseRoleConfig, 2025);

    expect(result[0].project.id).toBe("project.strong-preferred");
    expect(result[0].scoreBreakdown.preferredTagMatch).toBe(1);
    expect(result[1].scoreBreakdown.preferredTagMatch).toBe(0.5);
  });

  test("scores keyword coverage higher when other factors are equal", () => {
    const weak = makeProject({
      id: "project.weak-keyword",
      tags: ["required-a"],
      summary: t("Fixture summary"),
      links: [],
      category: "academic",
      placement: "project",
      timeframe: t("2025"),
    });
    const strong = makeProject({
      id: "project.strong-keyword",
      tags: ["required-a"],
      summary: t("Fixture summary with GraphQL and Next.js"),
      links: [],
      category: "academic",
      placement: "project",
      timeframe: t("2025"),
    });

    const result = rankProjectsForRole([weak, strong], baseRoleConfig, 2025);

    expect(result[0].project.id).toBe("project.strong-keyword");
    expect(result[0].scoreBreakdown.keywordMatch).toBeGreaterThan(
      result[1].scoreBreakdown.keywordMatch,
    );
  });

  test("scores prioritized categories higher", () => {
    const weak = makeProject({
      id: "project.weak-category",
      tags: ["required-a"],
      category: "academic",
      links: [],
      placement: "project",
      timeframe: t("2025"),
    });
    const strong = makeProject({
      id: "project.strong-category",
      tags: ["required-a"],
      category: "web",
      links: [],
      placement: "project",
      timeframe: t("2025"),
    });

    const result = rankProjectsForRole([weak, strong], baseRoleConfig, 2025);

    expect(result[0].project.id).toBe("project.strong-category");
    expect(result[0].scoreBreakdown.categoryMatch).toBe(1);
    expect(result[1].scoreBreakdown.categoryMatch).toBe(0);
  });

  test("scores GitHub evidence higher than other external links and no links", () => {
    const none = makeProject({
      id: "project.no-links",
      tags: ["required-a"],
      links: [],
      category: "academic",
      placement: "project",
      timeframe: t("2025"),
    });
    const external = makeProject({
      id: "project.external-links",
      tags: ["required-a"],
      links: externalLinks(),
      category: "academic",
      placement: "project",
      timeframe: t("2025"),
    });
    const github = makeProject({
      id: "project.github-links",
      tags: ["required-a"],
      links: githubLinks(),
      category: "academic",
      placement: "project",
      timeframe: t("2025"),
    });

    const result = rankProjectsForRole([none, external, github], baseRoleConfig, 2025);

    expect(result.map((project) => project.project.id)).toEqual([
      "project.github-links",
      "project.external-links",
      "project.no-links",
    ]);
    expect(result[0].scoreBreakdown.evidenceScore).toBe(0.7);
    expect(result[1].scoreBreakdown.evidenceScore).toBe(0.5);
    expect(result[2].scoreBreakdown.evidenceScore).toBe(0.2);
  });

  test("applies the featured placement boost", () => {
    const regular = makeProject({
      id: "project.regular",
      tags: ["required-a"],
      links: [],
      category: "academic",
      placement: "project",
      timeframe: t("2025"),
    });
    const featured = makeProject({
      id: "project.featured",
      tags: ["required-a"],
      links: [],
      category: "academic",
      placement: "featured-project",
      timeframe: t("2025"),
    });

    const result = rankProjectsForRole([regular, featured], baseRoleConfig, 2025);

    expect(result[0].project.id).toBe("project.featured");
    expect(result[0].scoreBreakdown.placementBoost).toBe(0.05);
  });

  test("gives newer projects a higher freshness score than older ones", () => {
    const older = makeProject({
      id: "project.older",
      tags: ["required-a"],
      links: [],
      category: "academic",
      placement: "project",
      timeframe: t("2021"),
    });
    const newer = makeProject({
      id: "project.newer",
      tags: ["required-a"],
      links: [],
      category: "academic",
      placement: "project",
      timeframe: t("2025"),
    });

    const result = rankProjectsForRole([older, newer], baseRoleConfig, 2025);

    expect(result[0].project.id).toBe("project.newer");
    expect(result[0].scoreBreakdown.freshnessScore).toBe(1);
    expect(result[1].scoreBreakdown.freshnessScore).toBe(0.5);
  });

  test("sorts by priority score descending", () => {
    const lower = makeProject({
      id: "project.lower",
      tags: ["required-a"],
      links: [],
      category: "academic",
      placement: "project",
      timeframe: t("2021"),
    });
    const higher = makeProject({
      id: "project.higher",
      tags: ["required-a", "required-b", "preferred-a", "preferred-b"],
      summary: t("Fixture summary with GraphQL and Next.js"),
      links: githubLinks(),
      category: "web",
      placement: "featured-project",
      timeframe: t("2025"),
    });

    const result = rankProjectsForRole([lower, higher], baseRoleConfig, 2025);

    expect(result[0].project.id).toBe("project.higher");
    expect(result[0].priorityScore).toBeGreaterThan(result[1].priorityScore);
  });

  test("uses deterministic tie-breaking for featured placement, timeframe, and project id", () => {
    const featured = makeProject({
      id: "project.featured-tie",
      tags: ["required-a"],
      links: [],
      category: "academic",
      placement: "featured-project",
      timeframe: t("2025"),
    });
    const newer = makeProject({
      id: "project.z-newer-tie",
      tags: ["required-a"],
      links: [],
      category: "academic",
      placement: "project",
      timeframe: t("2025"),
    });
    const older = makeProject({
      id: "project.a-older-tie",
      tags: ["required-a"],
      links: [],
      category: "academic",
      placement: "project",
      timeframe: t("2021"),
    });
    const alpha = makeProject({
      id: "project.alpha",
      tags: ["required-a"],
      links: [],
      category: "academic",
      placement: "project",
      timeframe: t("2025"),
    });
    const beta = makeProject({
      id: "project.beta",
      tags: ["required-a"],
      links: [],
      category: "academic",
      placement: "project",
      timeframe: t("2025"),
    });

    const ranked = rankProjectsForRole([beta, older, alpha, featured, newer], baseRoleConfig, 2025);

    expect(ranked.map((project) => project.project.id)).toEqual([
      "project.featured-tie",
      "project.alpha",
      "project.beta",
      "project.z-newer-tie",
      "project.a-older-tie",
    ]);
  });

  test("rounds scores to two decimals and caps them at 1.0", () => {
    const perfect = makeProject({
      id: "project.perfect",
      tags: ["required-a", "required-b", "preferred-a", "preferred-b"],
      summary: t("Fixture summary with GraphQL and Next.js"),
      links: githubLinks(),
      category: "web",
      placement: "featured-project",
      timeframe: t("2025"),
    });

    const [result] = rankProjectsForRole([perfect], baseRoleConfig, 2025);

    expect(result.priorityScore).toBe(0.92);
    expect(result.priorityScore).toBeLessThanOrEqual(1);
    expect(result.priorityScore.toFixed(2)).toBe("0.92");
  });
});

describe("rankProjectsForRole integration", () => {
  test("generateCV orders projects by descending project priority score for each role", () => {
    for (const roleId of ["fullstack_engineer", "ai_ml_engineer", "security_engineer"] as const) {
      const cv = generateCV(roleId, "en");

      for (let index = 1; index < cv.projects.length; index += 1) {
        expect(
          cv.projects[index - 1].rankDebug.priorityScore ?? cv.projects[index - 1].rankDebug.score,
        ).toBeGreaterThanOrEqual(
          cv.projects[index].rankDebug.priorityScore ?? cv.projects[index].rankDebug.score,
        );
      }
    }
  });

  test("generateCV only ranks filtered projects", () => {
    const roleConfig = baseRoleConfig;
    const archived = makeProject({
      id: "project.archived",
      tags: ["required-a"],
      status: "archived",
      links: githubLinks(),
      category: "web",
      placement: "hidden",
      timeframe: t("2025"),
    });
    const publicProject = makeProject({
      id: "project.public",
      tags: ["required-a"],
      links: githubLinks(),
      category: "web",
      placement: "featured-project",
      timeframe: t("2025"),
    });

    const filtered = filterProjectsForRole([archived, publicProject], roleConfig, "en");
    const ranked = rankProjectsForRole(filtered, roleConfig, 2025);

    expect(filtered.map((project) => project.id)).toEqual(["project.public"]);
    expect(ranked.map((project) => project.project.id)).toEqual(["project.public"]);
  });
});
