import { describe, expect, test } from "bun:test";
import { experienceSchema } from "./experience.schema";

const t = (value: string) => ({ en: value });

function makeRawExperience(overrides: Record<string, unknown> = {}) {
  return {
    id: "fixture.experience",
    locale: "en",
    source: { type: "manual", label: t("Fixture") },
    visibility: "public",
    type: "work",
    title: t("Fixture Title"),
    organization: t("Fixture Organization"),
    location: t("Fixture Location"),
    startDate: "2024-01",
    summary: t("Built a fixture."),
    highlights: [t("Built a fixture system.")],
    skills: [],
    tags: [],
    ...overrides,
  };
}

describe("experienceSchema date format", () => {
  // One assertion repeated eleven ways is a table, not eleven tests. Each row is still
  // its own case in the report, so a failure names the exact format that broke.
  const cases: ReadonlyArray<readonly [string, Record<string, unknown>, boolean]> = [
    ["a YYYY-MM start date", { startDate: "2024-01" }, true],
    ["a year-only start date", { startDate: "2015" }, true],
    ["a year-only end date", { startDate: "2015", endDate: "2023" }, true],
    ["an omitted end date", { endDate: undefined }, true],
    ["a single-digit month", { startDate: "2015-7" }, false],
    ["a month outside 01-12", { startDate: "2015-13" }, false],
    ["a day-precision date", { startDate: "2015-07-01" }, false],
    ["free text", { startDate: "March 2015" }, false],
    ["a malformed end date", { endDate: "present" }, false],
  ];

  for (const [description, overrides, accepted] of cases) {
    test(`${accepted ? "accepts" : "rejects"} ${description}`, () => {
      expect(experienceSchema.safeParse(makeRawExperience(overrides)).success).toBe(accepted);
    });
  }

  test("explains the accepted format when a date is rejected", () => {
    const result = experienceSchema.safeParse(makeRawExperience({ startDate: "March 2015" }));

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain("YYYY-MM");
  });
});
