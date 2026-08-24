# CLAUDE.md

Project-specific instructions for AI agents working in this repo. Read `README.md` first — it already covers architecture, workspaces, commands, core packages, the `legacy-v1` policy, and env/secrets. This file only covers what isn't written down there or in `docs/`.

## Where things are documented

- `README.md` — architecture, setup, commands, core packages, legacy-v1 policy, env/secrets, deployment.
- `docs/architecture/code-quality.md` — ESLint/Prettier, security sanitization (`sanitizeUrl`, `sanitizeHTML`), naming conventions, the "Requirement-First" workflow.
- `docs/design/design-system.md` — the full design system: colour/typography/spacing/radius tokens, dark-mode implementation, accessibility requirements. Read this before touching any UI in `apps/portfolio-web`.
- `docs/design/ux-principles.md`, `docs/design/information-architecture.md`, `docs/design/motion-guidelines.md` — supporting design docs.
- `docs/design/namecard.md` — the `/card` digital namecard's full spec: geometry, flip mechanics, the four discoverability affordances, and the accepted trade-off of gating contact actions behind one flip.
- `docs/requirements/` — per-package requirements (`cv-engine.md`, `data-models.md`, `portfolio-web.md`, `namecard.md`).
- `docs/decisions/` — architecture decision records.

Don't duplicate any of the above here — update the relevant doc instead, and keep this file to conventions that live nowhere else yet.

## Verification before claiming done

```bash
bun test && bun run typecheck && bun run lint && bun run format:check
```

`legacy-v1` and `docs/requirements` are excluded from Prettier on purpose — don't reformat them.

## Hard-won conventions not written elsewhere

- **Tailwind custom-property syntax**: use `bg-(--color-x)`, not `bg-[var(--color-x)]`. That's the project convention for referencing the `--color-*` tokens defined in `apps/portfolio-web/src/app/globals.css` (see `docs/design/design-system.md` for the token table).
- **CV print CSS**: whenever you touch anything under `apps/portfolio-web/src/app/cv/` or its print rules in `globals.css`, manually verify (a) dark-mode print contrast and (b) that content still fits the page. Printed output breaks silently and there's no automated check for it.
- **CV content is a real document, not fixture data.** `packages/content/src/data/experiences.ts` and `projects.ts` feed the user's actual job-search CVs. Never add a number, stat, or claim that isn't sourced from something verifiable — the user directly, a linked repo/README, or an official source. A fabricated metric on a real CV is a correctness bug with real-world consequences, not a style nit. Mark AI-authored Thai translations `status: "ai_draft"`, not `"reviewed"` or `"approved"`.
- **`cv-engine` experience selection** (`packages/cv-engine/src/experience-selection.ts`): each CV role filters experience by tag relevance (`selectExperiencesForRole`), which can silently drop a real job and leave what reads as an unexplained multi-year employment gap. `selectBridgingExperiences` backfills the minimum needed to keep the timeline continuous, rendered as a compact "Additional Experience" section. If you add a role or change tag filters, check the resulting timeline for gaps — not just relevance scores.
- **Local QA on `apps/portfolio-web` can lie to you.** It registers a service worker (`ServiceWorkerRegistration`) that precaches pages and chunks. Rebuilding and restarting `bun run start` does not guarantee the browser fetches the new build — the already-open tab stays controlled by whatever service worker it loaded with, and unregistering it plus clearing `caches` from that tab still isn't enough, since the app re-registers a worker on the very next page load and browsers can hand control back before you've verified anything. The only way to be sure you're testing the current build is a **fresh origin with no prior visit history** (a new port is the easy way) — otherwise you can spend a long time debugging a fix that already works, against a page that was never actually running it.
- **Satori (`next/og`'s `ImageResponse`, used by every `opengraph-image.tsx`) requires an explicit `display` on any `<div>` with more than one child.** `{a} · {b}` compiles to three JSX children — two expressions plus the literal `" · "` string — not one, and fails the production build with `Expected <div> to have explicit "display"...`. Use a single template-literal child instead: ``{`${a} · ${b}`}``.
