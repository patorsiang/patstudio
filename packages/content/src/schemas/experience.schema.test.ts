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
  test("accepts a YYYY-MM start date", () => {
    expect(experienceSchema.safeParse(makeRawExperience({ startDate: "2024-01" })).success).toBe(
      true,
    );
  });

  test("accepts a year-only start date", () => {
    expect(experienceSchema.safeParse(makeRawExperience({ startDate: "2015" })).success).toBe(true);
  });

  test("accepts a year-only end date", () => {
    expect(
      experienceSchema.safeParse(makeRawExperience({ startDate: "2015", endDate: "2023" })).success,
    ).toBe(true);
  });

  test("accepts an omitted end date", () => {
    expect(experienceSchema.safeParse(makeRawExperience({ endDate: undefined })).success).toBe(
      true,
    );
  });

  test("rejects a start date with a single-digit month", () => {
    expect(experienceSchema.safeParse(makeRawExperience({ startDate: "2015-7" })).success).toBe(
      false,
    );
  });

  test("rejects a start date with a month outside 01-12", () => {
    expect(experienceSchema.safeParse(makeRawExperience({ startDate: "2015-13" })).success).toBe(
      false,
    );
  });

  test("rejects a day-precision start date", () => {
    expect(experienceSchema.safeParse(makeRawExperience({ startDate: "2015-07-01" })).success).toBe(
      false,
    );
  });

  test("rejects a free-text start date", () => {
    expect(experienceSchema.safeParse(makeRawExperience({ startDate: "March 2015" })).success).toBe(
      false,
    );
  });

  test("rejects a malformed end date", () => {
    expect(experienceSchema.safeParse(makeRawExperience({ endDate: "present" })).success).toBe(
      false,
    );
  });

  test("explains the accepted format when a date is rejected", () => {
    const result = experienceSchema.safeParse(makeRawExperience({ startDate: "March 2015" }));

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain("YYYY-MM");
  });
});
