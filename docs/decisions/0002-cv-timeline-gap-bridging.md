# Bridging experience to keep a generated CV's timeline continuous

Date: 2026-09-15
Status: accepted 2026-08-18 — recorded retroactively 2026-09-15
Branch: `main`
Refined by: `0003-content-date-format-and-concurrent-study.md` (limitation 2 below is fixed there)
Implemented by: `5bee83f` (`fix(cv-engine): close employment-timeline gaps and add real metrics to CV bullets`)

**Provenance.** This ADR is retroactive. The problem statement and the intent behind the
threshold are sourced from `5bee83f`'s commit message; everything else is reconstructed from
`packages/cv-engine/src/experience-selection.ts`, its tests, and the generated output measured
on 2026-09-15. Where a row records reconstruction rather than a reason stated at the time, it
says so. Previously this lived as a prose bullet in `CLAUDE.md`; that bullet named a rejected
alternative and a failure mode, which makes it an ADR (see `README.md` in this directory).

## Problem

Two independent, relevance-driven steps decide which jobs reach a generated CV, and neither
knows anything about time:

1. `selectExperiencesForRole` keeps a `work` or `internship` experience only if its tags
   overlap the role's `requiredTags` or `preferredTags` (and miss its `excludedTags`).
2. `buildCVOutput` then truncates that ranked list to `roleConfig.limits.maxExperienceItems`.

Together they can remove a real job from the middle of an employment history. Measured for
`ai_ml_engineer` (en, 2026-09-15), selection alone yields SEC Playground (2026-02 – present),
Bank of Thailand (2019-11 – 2021-11) and the KBTG internship (2019-06 – 2019-08) — leaving
roughly **51 months** between 2021-11 and 2026-02 with nothing in them. The two omitted roles,
Data Wow and Freelance, are real jobs. They were dropped for being insufficiently ML-flavoured,
not for being absent.

The asymmetry that makes this worth solving: **a CV is not a relevance ranking.** Cutting a weak
project is editing. Cutting a job without saying so produces a document that misrepresents the
candidate's history to the one audience — recruiters, ATS screens — that reads a gap as a
question to answer.

## Decisions

| Decision                        | Choice                                                                                                                                                                     | Reasoning                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| How to close the gap            | A separate additive pass (`selectBridgingExperiences`) that runs **after** selection — not relaxing the tag filters, and not raising `maxExperienceItems`                  | Relaxing the filter trades away the role targeting that is the engine's entire purpose (`role → filter → rank → group → output`, `docs/requirements/cv-engine.md` §2), and would pull off-target work into the _ranked_ section where it competes for bullets and page budget. Keeping it additive means relevance selection is unchanged and still testable in isolation. |
| What a bridged entry renders as | Its own "Additional Experience" section. `GeneratedCvAdditionalExperience` carries **only** `id`, `title`, `organization`, `dateRange` — no summary, no bullets, no skills | These entries exist to account for time, not to argue for the candidate. Bullets would spend page budget on the least relevant work, and merging them into the main list would contradict the engine's own relevance judgement. Enforced by the narrower _type_, not by convention: a reviewer cannot add bullets without changing the type.                               |
| Gap threshold                   | 6 months (`EMPLOYMENT_GAP_THRESHOLD_MONTHS`), strict `>`                                                                                                                   | Short gaps between jobs are unremarkable; roughly six months is where one starts reading as something to explain. **Reconstructed** — the specific number is a judgement call, not derived from anything. It is deliberately one named constant with direct test coverage, so revising it is a one-line change.                                                            |
| Education counts as explained   | Education intervals are merged into the coverage set, even though education renders in a separate CV section                                                               | A year at Kent is not an employment gap, and the reader can see the education section. Without this, `ai_ml_engineer` would backfill a job across 2024-09 – 2025-09 purely to cover time already accounted for — noise added to explain something that needs no explaining.                                                                                                |
| What may be used as a bridge    | `work` and `internship` only; `excludedTags` still honoured; required/preferred tag relevance deliberately **not** applied                                                 | An excluded tag (`private-only`, `tutorial-learning`) says the item must never be published, which outranks continuity. Relevance is the opposite case: it has already been overruled on purpose — the entry appears because the job happened, not because it fits the role.                                                                                               |
| How many to add                 | Greedy minimum: close the oldest remaining over-threshold gap with one candidate, recompute, stop when no gap remains or nothing overlaps                                  | The section is an explanation, not a second CV. Adding the minimum keeps it short and keeps the reader's attention on the ranked experience above it.                                                                                                                                                                                                                      |

## Verified behaviour

All four roles, `en`, generated 2026-09-15:

| Role                 | `maxExperienceItems` / `maxPages` | Bridged in          |
| -------------------- | --------------------------------- | ------------------- |
| `fullstack_engineer` | 4 / 2                             | — (no gap)          |
| `ai_ml_engineer`     | 3 / 2                             | Freelance, Data Wow |
| `security_engineer`  | 4 / 2                             | Data Wow            |
| `apple_specialist`   | 3 / 1                             | Bank of Thailand    |

`ai_ml_engineer` still leaves 2024-05 → 2024-09 (4 months) and 2025-09 → 2026-02 (5 months)
uncovered. That is correct: both are under threshold and both sit either side of the Kent MSc.

## Known limitations

Recorded because each is a silent wrong answer rather than a visible failure.

1. **Which candidate bridges a gap depends on array order in `experiences.ts`.** The loop takes
   the first candidate overlapping the gap via `findIndex` over source order; it is the closing
   `.sort(compareRankedExperiences)` that is relevance-ordered, which the function's docstring
   currently blurs. Source order happens to be reverse-chronological today, so the most recent
   overlapping role wins — the sensible answer, but incidental. Reordering `experiences.ts`
   could change which job appears on a CV with no test failing.
2. **Year-only dates collapse to today.** `toMonthIndex` requires `^\d{4}-\d{2}$`, and
   `experienceInterval` falls back to `referenceMonthIndex` when parsing fails.
   `education.ramkhamhaeng-laws` (`startDate: "2015"`, `endDate: "2023"`) is the one record
   affected: its eight-year span contributes a zero-length interval at today instead of
   covering 2015 – 2023. `packages/content/src/schemas/experience.schema.ts` types both fields
   as bare `z.string()`, so nothing prevents it. Currently harmless — it errs toward bridging
   more, and no role's timeline reaches before 2019 — but it is wrong, silently, and waiting
   for a role that does. **Fixed in `0003`.**
3. **Bridging is uncapped and runs after the `maxExperienceItems` slice**, so it can push a CV
   past its page budget. `apple_specialist` is `maxPages: 1` and currently takes one bridged
   entry. There is no automated page-fit check anywhere in the repo (see `CLAUDE.md` on CV
   print CSS).

## Follow-on

Not decided here:

- Constrain the date format in the schema, or widen the parser to read a year-only date as its
  full Jan–Dec span.
- Make bridge-candidate ordering explicit instead of inherited from source array order, and
  correct the docstring either way.
- Some signal — a warning in `meta.warnings`, or a test — when bridging pushes a `maxPages: 1`
  role over budget.

## When to revisit

If adding a role produces an "Additional Experience" section longer than the ranked experience
above it, the role's tag filters are wrong and bridging is masking it. Fix the filters; don't
raise the threshold.
