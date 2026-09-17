import type { CvSectionId } from "@patorsiang/cv-engine";

/** Every section the CV body can render. `header` is laid out separately, above the stack. */
export type CvBodySection = Exclude<CvSectionId, "header">;

/**
 * Which body sections to render, in the order this role asked for.
 *
 * Each role's `sectionOrder` is what decides both order and presence: a role that leaves
 * `skills` out of its order does not get a skills section at all. That matters for roles
 * whose reader is not an engineer — an Apple Retail manager reading a wall of frameworks
 * sees an overqualified applicant, and languages are the signal worth leading with instead.
 *
 * Sections with nothing to show are dropped regardless, so an empty awards list never
 * renders a bare heading.
 */
export function orderedBodySections(
  sectionOrder: readonly CvSectionId[],
  hasContent: Readonly<Record<CvBodySection, boolean>>,
): readonly CvBodySection[] {
  return sectionOrder.filter(
    (section): section is CvBodySection => section !== "header" && hasContent[section],
  );
}
