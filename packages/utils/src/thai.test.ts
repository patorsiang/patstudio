import { describe, expect, test } from "bun:test";

import { splitThai } from "./thai";

describe("splitThai", () => {
  test("returns one non-Thai part for plain English", () => {
    expect(splitThai("Hello world")).toEqual([{ text: "Hello world", thai: false }]);
  });

  test("returns one Thai part for a Thai sentence, spaces included", () => {
    expect(splitThai("สวัสดี ครับ")).toEqual([{ text: "สวัสดี ครับ", thai: true }]);
  });

  test("splits English words out of a mixed sentence", () => {
    expect(splitThai("ช่วง AI Governance และ AI Workshop")).toEqual([
      { text: "ช่วง", thai: true },
      { text: " AI Governance ", thai: false },
      { text: "และ", thai: true },
      { text: " AI Workshop", thai: false },
    ]);
  });

  test("keeps punctuation and digits between two Thai words in the Thai part", () => {
    expect(splitThai("ครั้งที่ 6 (ไทย)")).toEqual([
      { text: "ครั้งที่ 6 (ไทย", thai: true },
      { text: ")", thai: false },
    ]);
  });

  test("leaves punctuation after the last Thai word outside the Thai part", () => {
    expect(splitThai("สรุปงาน — ok")).toEqual([
      { text: "สรุปงาน", thai: true },
      { text: " — ok", thai: false },
    ]);
  });

  test("returns no parts for an empty string", () => {
    expect(splitThai("")).toEqual([]);
  });

  test("the parts always join back to the input", () => {
    const input = "Sec-Girl #6 — ช่วง AI และ ม.เกษตรศาสตร์ บางเขน.";

    expect(
      splitThai(input)
        .map((part) => part.text)
        .join(""),
    ).toBe(input);
  });
});
