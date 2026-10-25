import { describe, expect, test } from "bun:test";
import { translatableTextSchema } from "./translation.schema";

const entry = (value: string) => ({ value, status: "ai_draft" as const });

describe("translatableTextSchema translated locales", () => {
  // Content ships with a subset of locales translated; zod 4 made z.record() with an enum key
  // exhaustive, which rejected all of it. Each row pins one shape the content actually uses.
  const cases: ReadonlyArray<readonly [string, Record<string, unknown>, boolean]> = [
    ["no translations at all", {}, true],
    ["a single locale", { th: entry("สวัสดี") }, true],
    ["two of three locales", { th: entry("สวัสดี"), ko: entry("안녕하세요") }, true],
    ["every locale", { th: entry("a"), ko: entry("b"), "zh-CN": entry("c") }, true],
    ["a locale that is not supported", { fr: entry("bonjour") }, false],
    ["an entry with an unknown status", { th: { value: "x", status: "done" } }, false],
  ];

  for (const [description, translated, accepted] of cases) {
    test(`${accepted ? "accepts" : "rejects"} ${description}`, () => {
      const result = translatableTextSchema.safeParse({ en: "Hello", translated });
      expect(result.success).toBe(accepted);
    });
  }

  test("accepts text with the translated field omitted", () => {
    expect(translatableTextSchema.safeParse({ en: "Hello" }).success).toBe(true);
  });
});
