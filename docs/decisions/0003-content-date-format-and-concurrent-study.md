# Content date format, and education that ran alongside a job

Date: 2026-09-15
Status: accepted 2026-09-15
Branch: `main`
Refines: `0002-cv-timeline-gap-bridging.md` (closes its limitation 2; adds a rule to its
"education counts as explained" decision)

## Problem

`0002` recorded that a year-only date silently collapses to today:
`packages/content/src/schemas/experience.schema.ts` typed `startDate`/`endDate` as bare
`z.string()`, `toMonthIndex` matched only `^\d{4}-\d{2}$`, and `experienceInterval` fell back to
the reference date when parsing failed. `education.ramkhamhaeng-laws` (`"2015"` – `"2023"`) was
the one affected record: an eight-year span contributing a zero-length interval at today.

Three layers each behaved reasonably and the result was a silent wrong answer — the schema
accepted the data, the parser rejected it, and the fallback made the rejection look like a
valid interval.

Fixing the parse then exposed a second defect underneath it. Once the law degree parsed as
2015-01 – 2023-12, it counted as eight years of "explained time" and suppressed bridging
entirely for `ai_ml_engineer`, `security_engineer` and `apple_specialist` — restoring the exact
51-month hole `0002` exists to prevent. That degree was part-time study taken **alongside**
full-time jobs (Bank of Thailand 2019-11 – 2021-11, Data Wow 2021-12 – 2023-04). Education
concurrent with employment explains no absence from work.

## Decisions

| Decision                        | Choice                                                                                                                             | Reasoning                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Where the date format is pinned | A `regex` on the schema, `^\d{4}(-(0[1-9]\|1[0-2]))?$`, not a guard in `cv-engine`                                                 | `packages/content/src/index.ts` runs `z.array(experienceSchema).parse(...)` at module load, so malformed data fails every build, test and dev boot at the point it is introduced — rather than reaching timeline maths that has to invent a fallback. Also catches `2015-13` and `2015-7`, which the old parser would have turned into a plausible-looking index or a silent null. |
| Year-only dates stay legal      | `YYYY` remains valid alongside `YYYY-MM`                                                                                           | The precision genuinely isn't known for some older records. Rejecting them would force a fabricated month into CV content, which `CLAUDE.md` forbids for exactly this document.                                                                                                                                                                                                    |
| How a year-only date widens     | To the whole year — January when opening an interval, December when closing one                                                    | `"2015"` means all of 2015, not an instant. An asymmetric widening is what makes a `"2019"` – `"2020"` record cover 24 months instead of 1.                                                                                                                                                                                                                                        |
| Concurrent study                | Education overlapping a role **already on the CV** by more than `EMPLOYMENT_GAP_THRESHOLD_MONTHS` does not count as explained time | A degree taken while employed explains no time away from work; counting it hides a real gap behind study the person did _while_ working. Reuses the existing threshold rather than introducing a second magic number, and leaves ordinary overlap — a placement or summer internship during a degree — still counting.                                                             |
| What it is compared against     | The selected roles, not every role in the content set                                                                              | Comparing against unselected roles is circular: the very candidate that could bridge a gap would disqualify the education covering it, so no education would ever count. Selected roles are also what the reader can actually see — if a job visibly runs through the degree, the degree plainly isn't explaining absence.                                                         |

## Verified

- `bun test`: 166 pass, 0 fail (was 152 — 14 new tests). `typecheck`, `lint`, `format:check` clean.
- Generated output for all four roles, `en`, is **byte-identical** to the pre-change baseline —
  same ranked experience, same "Additional Experience" entries. These changes correct the
  mechanism without changing the document.

## Known limitations

- The concurrency rule is binary per education record: an education period overlapping a
  selected role by seven months is discarded whole, including the years it legitimately
  explains. Subtracting only the overlapping months would be more precise; it is not worth the
  complexity until a record actually needs it.
- `0002`'s limitation 1 (bridge-candidate choice inherited from array order in
  `experiences.ts`) and limitation 3 (bridging uncapped against `maxPages`) are unchanged.

## When to revisit

If a real education record is a genuine study break that nonetheless overlaps a job by more
than six months — a sabbatical taken mid-contract, say — the binary rule will wrongly discard
it. At that point model it in the data (an explicit "concurrent study" flag) rather than tuning
the threshold, which would silently move every other record too.
