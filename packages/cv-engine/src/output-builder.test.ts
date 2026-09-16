import { describe, expect, test } from "bun:test";
import { buildCVOutput, generateCV, isCvLanguage, isCvRoleId } from "./index";
import { isMissingTranslation, text } from "./content-language";

function stripGeneratedAt<T extends { readonly meta: { readonly generatedAt: string } }>(value: T) {
  const { generatedAt, ...meta } = value.meta;

  return {
    ...value,
    meta,
  };
}

describe("output builder", () => {
  test("buildCVOutput returns a complete structured CV", () => {
    const cv = buildCVOutput("fullstack_engineer", "en");

    expect(cv.meta.roleId).toBe("fullstack_engineer");
    expect(cv.header.name).toBe("Napatchol Thaipanich");
    expect(cv.summary.text.length).toBeGreaterThan(0);
    expect(cv.skills.map((group) => group.category)).toEqual([
      "programming-fundamentals",
      "frontend",
      "backend-tools",
      "databases",
      "cloud-infrastructure",
      "security-blockchain",
    ]);
    expect(cv.experience.length).toBeGreaterThan(0);
    expect(cv.projects.length).toBeGreaterThan(0);
    expect(cv.education.length).toBeGreaterThan(0);
    expect(cv.languages.length).toBeGreaterThan(0);
  });

  test("full-stack CV names the current role and covers its ATS keywords document-wide", () => {
    const cv = buildCVOutput("fullstack_engineer", "en");

    // The summary names where he works now and the stack he is in day to day. It no
    // longer repeats the whole ATS keyword list: coverage is a document-wide property,
    // asserted below via meta.warnings, and the skills section sits directly underneath.
    expect(cv.summary.text).toContain("SEC Playground");
    expect(cv.summary.text).toContain("Vue.js");
    expect(cv.summary.text).toContain("Nuxt.js");
    expect(cv.summary.text).toContain("Node.js");
    expect(cv.summary.text).toContain("TypeScript");
    expect(cv.summary.text.length).toBeLessThan(420);

    expect(cv.meta.warnings.some((warning) => warning.includes("Missing ATS keyword"))).toBe(false);
  });

  test("full-stack CV stays within the ATS page budget", () => {
    const cv = buildCVOutput("fullstack_engineer", "en");

    expect(cv.meta.maxPages).toBe(1);
    expect(cv.experience).toHaveLength(4);
    expect(cv.projects).toHaveLength(1);
    expect(cv.education.map((education) => education.id)).toEqual([
      "education.university-of-kent-msc-advanced-computer-science",
      "education.mahidol-ict-bsc",
    ]);
    expect(cv.skills.every((group) => group.items.length <= 7)).toBe(true);
    expect(cv.experience.every((experience) => experience.bullets.length <= 3)).toBe(true);
    expect(cv.education.every((education) => education.bullets.length <= 1)).toBe(true);
  });

  test("full-stack experience and project copy is action-led and role-targeted", () => {
    const cv = buildCVOutput("fullstack_engineer", "en");
    const dataWow = cv.experience.find(
      (experience) => experience.id === "experience.datawow-frontend-developer",
    );
    const rugPull = cv.projects.find((project) => project.id === "project.rugpull-detection");

    expect(dataWow?.bullets[0]).toMatch(/^Built React and Next\.js interfaces/);
    expect(dataWow?.bullets.join(" ")).toContain("Agile");
    expect(rugPull?.summary).toContain("React");
    expect(rugPull?.summary).toContain("FastAPI");
    expect(rugPull?.summary).toContain("Docker");
  });

  test("generateCV stays compatible with buildCVOutput apart from generatedAt", () => {
    const built = buildCVOutput("ai_ml_engineer", "en");
    const generated = generateCV("ai_ml_engineer", "en");

    expect(stripGeneratedAt(generated)).toEqual(stripGeneratedAt(built));
  });

  test("supports explicit role and language guards", () => {
    expect(isCvRoleId("fullstack_engineer")).toBe(true);
    expect(isCvRoleId("security-engineer")).toBe(false);
    expect(isCvLanguage("en")).toBe(true);
    expect(isCvLanguage("th")).toBe(true);
    expect(isCvLanguage("es")).toBe(false);
  });

  test("throws for unsupported language input", () => {
    expect(() => buildCVOutput("fullstack_engineer", "es" as never)).toThrow(
      /Unsupported CV language/,
    );
  });

  test("buildCVOutput supports Thai reviewed output", () => {
    const cv = buildCVOutput("fullstack_engineer", "th");

    expect(cv.meta.language).toBe("th");
    expect(cv.header.location).toBe("กรุงเทพฯ ประเทศไทย");
    expect(cv.header.targetTitle).toBe("Full-Stack Developer");
    expect(cv.summary.text).toContain("นักพัฒนา Full-Stack");
    expect(cv.skills.length).toBeGreaterThan(0);
    expect(cv.experience.length).toBeGreaterThan(0);
    expect(cv.projects.length).toBeGreaterThan(0);
    expect(cv.languages.map((language) => language.name)).toContain("ไทย");
  });

  test("Thai text resolution falls back to English when translation is missing", () => {
    const value = { en: "English source" };

    expect(text(value, "th")).toBe("English source");
    expect(isMissingTranslation(value, "th")).toBe(true);
  });

  test("throws for unsupported role input through the existing role validation", () => {
    expect(() => generateCV("unknown-role" as never, "en")).toThrow(/Unsupported role/);
  });
  test("apple_specialist summary stays customer-facing and drops the engineering tail", () => {
    const summary = generateCV("apple_specialist", "en").summary.text;

    // A retail hiring manager reading central-bank blockchain work sees an
    // overqualified applicant, not a stronger one.
    expect(summary).not.toContain("Hyperledger");
    expect(summary).not.toContain("central-bank");

    // The point is that it is about people, not which noun it uses for them.
    expect(/\b(customers?|clients?|people)\b/i.test(summary)).toBe(true);
    // And that it is not a stack listing wearing a retail title.
    expect(/\b(Vue|Nuxt|Node|TypeScript|SQL|React)\b/.test(summary)).toBe(false);
  });
  test("no two roles share a closing sentence", () => {
    // Every CV is public on the portfolio at once, so a shared closing paragraph is
    // visible as templating the moment someone opens two of them.
    const closings = (
      ["fullstack_engineer", "ai_ml_engineer", "security_engineer", "apple_specialist"] as const
    ).map((role) => {
      const sentences = generateCV(role, "en").summary.text.trim().split(". ");
      return sentences[sentences.length - 1];
    });

    expect(new Set(closings).size).toBe(closings.length);
  });

  test("a summary does not restate the skills section", () => {
    // The skills section is directly below the summary. Repeating it wholesale spends
    // the most valuable lines on the page listing what the reader is about to read.
    for (const role of ["fullstack_engineer", "ai_ml_engineer", "security_engineer"] as const) {
      const cv = generateCV(role, "en");
      const restated = cv.skills
        .flatMap((group) => group.items)
        .filter((item) => cv.summary.text.includes(item));

      expect(restated.length).toBeLessThanOrEqual(3);
    }
  });
  test("work experience reads newest first on every role", () => {
    // Relevance decides which experiences are selected; it must not decide the order
    // they are read in. Ranking by score alone produced 2023 -> 2026 -> 2021 on the
    // Apple CV, which reads as a mistake rather than as emphasis.
    for (const role of [
      "fullstack_engineer",
      "ai_ml_engineer",
      "security_engineer",
      "apple_specialist",
    ] as const) {
      const starts = generateCV(role, "en").experience.map((item) => item.startDate);
      const sorted = [...starts].sort().reverse();

      expect(starts, `${role} work experience is out of order`).toEqual(sorted);
    }
  });
  test("the AI/ML summary does not claim production Python or ML tenure", () => {
    const cv = generateCV("ai_ml_engineer", "en");
    const summary = cv.summary.text;

    // Python and FastAPI appear in no employment entry's `skills` - only in the MSc
    // dissertation - so the summary must not attach them to the five years of work.
    expect(/five years[^.]*\b(Python|FastAPI|machine learning|ML)\b/i.test(summary)).toBe(false);
  });

  test("the security summary claims nothing the rest of that CV cannot show", () => {
    const cv = generateCV("security_engineer", "en");
    const summary = cv.summary.text.toLowerCase();

    // No CTF entry exists in the content source, and the only cryptography item is an
    // RSA assignment placed off-CV. Claiming either leaves the summary unsupported by
    // the document under it.
    expect(summary).not.toContain("ctf");
    expect(summary).not.toContain("cryptography");
  });
});
