# The admin and job tracker live in a separate private repo, not in `apps/admin`

Date: 2026-10-13
Status: accepted 2026-10-13

## Problem

An admin app and job tracker was once planned as `apps/admin` in this monorepo. This
repository is public, and an admin tool accumulates private working data that must never be
published here.

## Decisions

| Decision           | Choice                                                                                         | Reasoning                                                                                                                                     |
| ------------------ | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Where it lives     | A separate private repo, `career-admin`. There is no `apps/admin` here and none will be added. | A public repo cannot hold private material, and history cannot be un-published once pushed (see `0004`). Separation makes leaking structural. |
| How it reuses code | `career-admin` consumes patstudio as a read-only git submodule (cv-engine, ui tokens)          | Shared code stays in one place and flows one way: private depends on public, never the reverse.                                               |
| What comes back    | Nothing private goes into patstudio                                                            | Generic improvements (for example to cv-engine) may land here as ordinary public changes.                                                     |

## Follow-on

- Revisit only if the admin becomes public-safe, or the submodule coupling becomes costly.
