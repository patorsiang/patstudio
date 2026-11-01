import { describe, expect, test } from "bun:test";
import type { CvSectionId } from "@patorsiang/cv-engine";
import { orderedBodySections, type CvBodySection } from "./cv-sections";

const allPresent: Record<CvBodySection, boolean> = {
  summary: true,
  skills: true,
  experience: true,
  projects: true,
  education: true,
  awards: true,
  languages: true,
};

describe("orderedBodySections", () => {
  test("drops the header, which the body never renders", () => {
    const order: readonly CvSectionId[] = ["header", "summary", "languages"];

    expect(orderedBodySections(order, allPresent)).toEqual(["summary", "languages"]);
  });

  test("follows the role's configured order rather than a fixed one", () => {
    const order: readonly CvSectionId[] = [
      "header",
      "summary",
      "languages",
      "experience",
      "education",
    ];

    expect(orderedBodySections(order, allPresent)).toEqual([
      "summary",
      "languages",
      "experience",
      "education",
    ]);
  });

  test("omits a section the role leaves out of its order entirely", () => {
    const order: readonly CvSectionId[] = ["header", "summary", "experience", "languages"];

    expect(orderedBodySections(order, allPresent)).not.toContain("skills");
  });

  test("omits sections that have no content to show", () => {
    const order: readonly CvSectionId[] = ["header", "summary", "awards", "languages"];

    expect(orderedBodySections(order, { ...allPresent, awards: false })).toEqual([
      "summary",
      "languages",
    ]);
  });
});
