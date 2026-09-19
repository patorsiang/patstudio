# Architecture Decision Records

An ADR records **one decision that a competent reader would otherwise second-guess** — the
problem, the option taken, the options rejected, and the evidence. The valuable half is the
rejected alternative: what the code does is already visible, why the obvious thing wasn't done
is not.

## Where a piece of reasoning belongs

This repo has four places that reasoning can live. Pick by what the reasoning _is_, not by how
important it feels.

| The reasoning is…                                                   | It goes in                |
| ------------------------------------------------------------------- | ------------------------- |
| A rejected plausible alternative, on something hard to reverse      | An ADR here               |
| A rule to follow while writing code, with no live alternative       | `CLAUDE.md`               |
| Scoped to building one feature, and expires when that feature ships | `docs/superpowers/specs/` |
| An explanation of one specific line or function                     | A code comment            |

Two consequences worth stating outright:

- **Not everything with a reason is an ADR.** "Use `bg-(--color-x)`, not `bg-[var(--color-x)]`"
  is a convention — nobody is weighing the alternative. It stays in `CLAUDE.md`.
- **If a `CLAUDE.md` bullet names a rejected alternative and a failure mode, it is an ADR in
  disguise.** Promote it here and leave a one-line pointer behind.

## Format

- One file per decision: `NNNN-kebab-slug.md`, numbered in order, never renumbered.
- Header block: date, status, branch — see `0001-namecard-in-portfolio-web.md` for the house
  shape (`## Problem`, a Decision/Choice/Reasoning table, `## Scope`, `## Follow-on`).
- Reasoning cites something checkable — a file, a count, a commit, a measured output. "It felt
  cleaner" is not a reason; "all five consumers read it by fixed field name" is.
- State the expiry condition. A decision with no trip-wire becomes dogma.

## ADRs are immutable

**Never edit an accepted ADR to reflect a changed mind.** Write a new one that supersedes it,
and mark the old one `superseded by NNNN`. The record of how the thinking changed is the asset;
overwriting it destroys exactly the thing the directory exists for.

Fixing a typo or adding a cross-reference is fine. Rewriting the reasoning is not.

## Retroactive ADRs

Writing one from memory sands off the messy real constraint — the deadline, the thing you
didn't know yet — which is usually the most useful part. If an ADR is written after the fact,
say so in the header and source it from the commit, the code and the tests rather than
recollection. Mark reconstructed reasoning as reconstructed.

## Trip-wire

This directory is worth keeping only if it gets used. **If a year passes and no new ADR has
been written, that is evidence the routing rule above isn't working** — fold the content back
into `CLAUDE.md` and delete the directory rather than leave a dead process looking official.
