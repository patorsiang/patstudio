# design-sync notes

**Sync target: the Design System artifact** https://claude.ai/artifact/E9TbrB6w7JjsDAbPSkBCEX (the user's choice, 2026-10-25). Standalone Claude Design closes 2026-12-14, so do not upload to the old project `patorsiang-portfolio` (`39b548d6-83ec-46e1-a940-3235402d67e9`); `projectId` stays in `config.json` only so a run is not treated as a first sync (no pin would create a new standalone project).

Artifact sync, short form (the artifact holds the new Design System layout under `project/`, not the converter's layout):
- Run the usual driver build, then publish only changed files with the Artifact tool (`url`, `root`, `files`), index `project/design-system.json` last with a new `lastChange`.
- `components/bundle.js` = `ds-bundle/_ds_bundle.js` with line 1 replaced by `/* @ds-bundle: {"format":4,"namespace":"PortfolioUI","components":[{"name":"..."}]} */` (names alphabetical).
- `components/<Name>/preview.html` = the card html with its CSS links/script tags removed, `#e5e7eb` -> `var(--color-border)`, `#6b7280` -> `var(--color-text-muted)`, `_preview/<Name>.js` inlined. `README.md` = `<Name>.prompt.md` with the bundle path and "(see `preview.html`)" fixed. Both transforms reproduced the existing SkillGroup/Button files byte for byte.
- `.d.ts` files publish with `contentType: "text/plain"`. `components/index.d.ts` and `project/README.md` (Crumb shape, composition rules, component list) need a hand edit per new component.
- Legacy-layout files were moved to `project/archived/` on 2026-10-29 (c19); this flow does not touch them.
- Script: the staging script that did all of the above on 2026-10-29 is `qa/tools/design-sync-stage.py` in life-planning (`drafts/design-to-delivery-2026/evidence/patstudio-10-28/`). It reproduced the 16 published components byte for byte before it was used for the new ones. It also rewrites `bundle.css` (token blocks removed, they live in `tokens.css`), builds `index.d.ts`, and needs `project/README.md` and `tokens.json` edited by hand for new tokens or components.
- Publish order that worked: content files, then `project/design-system.json` alone with a new `lastChange`. Send `.d.ts` with `contentType: "text/plain"`.
- NamecardFlip's QR code and portrait (`/card-qr.svg`, `/avataaars.svg`) are app `public/` files. They load in the synced previews since 2026-10-30 (card c27): `build-dist.mjs` inlines them as data URIs and the `next/image` shim looks them up. A new `public/` image used by a component must be added to the list in `build-dist.mjs`; `src/components/design-sync-docs.test.ts` fails until it is.

Old target (standalone, closing): Claude Design project `patorsiang-portfolio`, https://claude.ai/design/p/39b548d6-83ec-46e1-a940-3235402d67e9

## How this repo differs from the converter's default

The design system is **not a library package**: components live in the Next app (`apps/portfolio-web/src/components`), import through `@/`, and use `next/link`, `next/image`. `packages/ui` is tokens only. So the converter reads a package we build ourselves:

- `.design-sync/build-dist.mjs` (run it first; it is `cfg.buildCmd`) bundles `.design-sync/ds-package/src/index.ts` (the 15 storied components, re-exported from app source) into `ds-package/dist/index.js` with esbuild and emits `.d.ts` with tsc. Nothing in app source is touched.
- `ds-package/shims/next-link.tsx`, `next-image.tsx`: plain `<a>` / `<img>` stand-ins for the two `next/*` modules in scope. `@patorsiang/utils` is mapped to `shims/utils.ts`, which re-exports only `sanitize-url` and `thai` (the barrel's logger reads `process.env`, which a browser bundle lacks). A component that starts using another helper fails the bundle build with "No matching export" until it is added there; PR #67 (`splitThai`) did exactly that.
- To add a component: add a story, add one line to `ds-package/src/index.ts`, add it to `cfg.componentSrcMap`. A story whose module exports several things and no component named like the story (`NamecardIcons`: 8 icon functions) is dropped with `[TITLE_UNMAPPED]` and is not synced.
- `next/navigation` is a shim too (`shims/next-navigation.tsx`): `usePathname` reads a `PathnameProvider` context, else `location.pathname`. `PathnameProvider` is exported on `window.PortfolioUI` (not a component). Owned previews `previews/GlobalNav.tsx` and `PageShell.tsx` wrap each story in it; `previews/OfflineBanner.tsx` fakes `navigator.onLine = false`; `previews/NamecardFlip.tsx` clicks "Turn card over" for the Back story.
- `@patorsiang/content` and `@patorsiang/cv-engine` are mapped to their `src/index.ts`; `process.env.NEXT_PUBLIC_SITE_URL` is defined away in `build-dist.mjs` (a browser bundle has no `process`; without it the whole bundle throws on load and `window.PortfolioUI` is undefined).
- The bundle is 948 KB since GlobalNav, PostCard and NamecardFlip pulled in zod and the content data (it was 29 KB).
- Run the converter with `--node-modules apps/portfolio-web/node_modules --entry .design-sync/ds-package/dist/index.js` (React lives only there; Bun does not hoist).

## Fixes (symptom -> cause -> fix)

- [GENERAL] `[DTS_REACT]`, and prop types wrong (`onClick: ComponentPropsWithoutRef<"button">`, dropped `["onClick"]`) -> converter finds `@types/react` by walking up from the package dir; Bun keeps it only under `apps/portfolio-web/node_modules` -> `build-dist.mjs` symlinks `ds-package/node_modules` to it. Without this the **`.d.ts` contract is silently wrong**.
- [GENERAL] Text in Arial -> `next/font/google` defines `--font-geist-sans/mono`; outside Next nothing does -> Geist woff2 vendored in `.design-sync/fonts/` (`cfg.extraFonts`), variables set by `ds-package/src/font-vars.ts` (the converter keeps only `@font-face` from extra font CSS, so `:root` vars there are dropped).
- [GENERAL] Reference Storybook never loaded Geist offline -> `patch-sb-reference.mjs` injects the same `@font-face` into `sb-reference/iframe.html`. **Re-run it after every `storybook build`** (idempotent).
- `.d.ts` references `ContactLink`, `SegmentedLinkItem`, `ProjectLink` without defining them (tsc emits them as unexported locals) -> spelled out in `conventions.md`.
- `! preview decorator bundle failed: Could not resolve "tailwindcss"` -> `.storybook/preview.ts` imports `globals.css` (`@import "tailwindcss"`) and `next/font`. Accepted: the decorators only set `data-theme` and the font classes; default light + font vars from the bundle cover both. No `cfg.provider` needed.
- `[RENDER_THIN]` on HeroMark -> false positive (SVG stroke, no text; paints fine in the compare sheet).
- Cards show a soft accent glow in previews but not in the reference -> reference element screenshots crop tight and clip the `box-shadow`. Not a defect.
- Reference buttons looked lighter than previews -> only the real app's `antialiased` class on `<html>` (font smoothing). Computed family/weight/size are identical. `conventions.md` tells the agent to set it.

## Re-sync risks (watch-list)

- **Story args are the only source of the generated `.prompt.md` "Examples"** - they ship as raw `export const X: Story = {...}` code. Usable but ugly; own `previews/` or a fork would be needed to change it.
- `MouseEventHandler<HTMLButtonElement>` (Button) and similar React type names appear unqualified in the emitted `.d.ts`; fine for the agent to read, but not valid standalone TypeScript.
- `build-dist.mjs` assumes `@/` -> `apps/portfolio-web/src`, the `node_modules` symlink, and the two `next/*` shims. A new component using `next/navigation`, `next/font`, or a workspace package other than `@patorsiang/utils` needs a shim/mapping first or the esbuild step fails.
- Geist files are a vendored snapshot (Google Fonts v5 / Mono v6, latin + latin-ext). If `app/fonts.ts` changes family, update `.design-sync/fonts/geist.css` and `font-vars.ts`.
- `conventions.md` enumerates token names and prop shapes by hand; re-validate against the fresh build (names in `_ds_bundle.css`, components under `components/`) every sync.
- Compare caps at 6 stories per component; none here exceed it (max 4). All 32 stories were graded image-by-image, none sibling-trusted.
- Needs network only for `storybook build` (none at capture time once `patch-sb-reference.mjs` has run). Chromium via `.ds-sync` (`npx playwright install chromium`).
- Previews embed story args, which include the real name/handle/email from `ProfileHeader.stories.tsx`. The project is private; keep that in mind before sharing it.

## Fresh clone checklist

1. `bun install --frozen-lockfile`
2. Stage scripts into `.ds-sync/` (storybook SKILL §2.4) and `npm i esbuild ts-morph @types/react playwright && npx playwright install chromium` inside it
3. `cd apps/portfolio-web && npx storybook build -c .storybook -o ../../.design-sync/sb-reference`, then `node .design-sync/patch-sb-reference.mjs`
4. `node .design-sync/build-dist.mjs`, then the §7 driver with `--remote` after fetching `_ds_sync.json`
