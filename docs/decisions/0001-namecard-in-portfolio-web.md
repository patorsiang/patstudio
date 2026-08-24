# Digital namecard: scope and shape

Date: 2026-08-22
Status: approved 2026-08-22
Branch: `main`

This is the repo's first ADR — `docs/decisions/` previously held only a `.gitkeep`. The
format follows the closest existing precedent, `docs/superpowers/specs/2026-08-16-section-reveal-design.md`'s
Decision/Choice/Reasoning table, adapted here as the house ADR shape going forward.

## Problem

A shareable digital namecard was requested — something to hand someone after meeting them,
distinct from the full portfolio/CV. Three open questions needed deciding before
implementation: where the feature lives, how its contact data is modeled, and how far to
take LINE/WhatsApp messaging integration.

## Decisions

| Decision                    | Choice                                                                                                                                                             | Reasoning                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Repo / app placement        | New routes inside `apps/portfolio-web`, not a new app or repo                                                                                                      | `apps/admin` and `apps/playground` are empty `.gitkeep` placeholders with no real precedent for a second app. CI and prod deploy (`.github/workflows/*.yml`) are hardcoded to a single Vercel project and `bun run build:portfolio`. `packages/ui` is tokens-only — the actual components the card needs live behind an ESLint-enforced atomic-design boundary inside `apps/portfolio-web/src/components`, so a second app couldn't reuse them without first promoting components into `packages/ui`, which nothing today requires. Splitting out is worth revisiting only if the namecard grows its own domain, release cadence, or incompatible stack. |
| Contact schema shape        | Extend the existing closed `profile.contact` object with **optional** keys (`phone?`, `line?`, `whatsapp?`), not a new generic `channels: {platform, url}[]` array | All five existing consumers (`contact/page.tsx`, `SiteFooter.tsx`, `CvPageContent.tsx`, `person-json-ld.ts`, `llms.txt/route.ts`) read `contact` by fixed field name and never iterate it generically, so optional additions are non-breaking. A generic array would require touching every consumer's rendering logic for no present benefit — revisit only if a future channel makes named fields awkward.                                                                                                                                                                                                                                             |
| Phone number visibility     | Rendered only inside the downloaded `.vcf`, never in `/card`'s HTML; `/card/vcard` added to `robots.ts`'s disallow list                                            | Keeps the number off the crawl/scrape surface reachable by an unauthenticated visitor or bot, while still handing it to anyone who deliberately saves the contact. This narrows the _crawl_ surface only — the `.vcf` URL itself remains publicly fetchable by anyone who guesses it, same class of exposure as the existing `/cv/export/json` route.                                                                                                                                                                                                                                                                                                    |
| vCard version               | vCard 3.0, not 4.0                                                                                                                                                 | 3.0 has the most reliable import behavior across both iOS Contacts and Android, which matters more here than 4.0's newer feature set.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| LINE identity               | The `PatOrSiangAssistant` Official Account (channel `2005472166`, Basic ID `@766wwbir`), not Napatchol's personal LINE                                             | Keeps personal LINE private, and puts the deep link on the same channel a future bot (if ever built) would use — no migration needed later.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Messaging integration depth | Deep links only (`line.me/R/ti/p/@766wwbir`, `wa.me/66959390164`, `mailto:`) for this phase. No WhatsApp Cloud API. LINE Messaging API bot explicitly deferred.    | WhatsApp Cloud API requires Meta Business verification, a dedicated number, and template-message approval — weeks of lead time and ongoing cost, disproportionate to a personal namecard. A LINE bot adds nothing a static greeting message can't already do for the "someone just added the OA" case; build it only when there's a concrete need to react to what people actually type.                                                                                                                                                                                                                                                                 |
| Chrome / layout             | `/card` skips `PageShell` (no `GlobalNav`/`SiteFooter`) but renders its own `<main>`                                                                               | Verified against `e2e/contrast.e2e.ts`, which walks `document.querySelectorAll("*")` and asserts nothing about landmark structure — so skipping `PageShell` doesn't break the a11y sweeps. But `PageShell` is what renders the `<main>` landmark elsewhere, so the card page must supply its own or screen-reader users lose it.                                                                                                                                                                                                                                                                                                                         |

## Scope

### In

- `docs/requirements/namecard.md` (full requirements).
- `packages/content` schema/type/data changes for `contact.{phone,line,whatsapp}`.
- `src/lib/vcard.ts` + `src/app/card/vcard/route.ts`.
- `src/app/card/page.tsx`, `src/app/card/opengraph-image.tsx`.
- `public/card-qr.svg` (generated, committed, not built in CI — same convention as `public/portfolio-qr.svg`).
- Entries in `robots.ts`, `sitemap.ts`, `e2e/support/routes.ts`.

### Out

- A new app or repo (see Decisions).
- Any LINE/WhatsApp bot backend — tracked as future work in `docs/requirements/namecard.md` §7, not built here.
- Physical/print card production — a design direction is explored (Phase 0) but not shipped.
- Changes to the five existing `profile.contact` consumers' rendered output — they keep working unchanged because the schema change is additive.

## Non-Functional (carried forward if the deferred LINE bot is ever built)

If `src/app/api/line/webhook/route.ts` is built later, it must, from the first commit:

- Verify `X-Line-Signature` as HMAC-SHA256 over the **raw** request body with the channel
  secret, compared via `crypto.timingSafeEqual` — meaning `await request.text()` before any
  JSON parsing, since parsing first destroys the raw bytes needed to reproduce the signature.
- Keep `LINE_CHANNEL_SECRET` / `LINE_CHANNEL_ACCESS_TOKEN` server-only — never
  `NEXT_PUBLIC_`-prefixed, never committed with real values to `.env.example`.
- Return 200 quickly and do work after, idempotent on `webhookEventId` — LINE retries
  non-2xx responses, so a slow or non-idempotent handler risks duplicate replies.
- Not be `force-static` (the app's first genuinely dynamic route) and be listed in the
  `robots.ts` disallow set.

## Follow-on

None anticipated for this phase. Revisit LINE bot scope only after the card has shipped and
there's a concrete reason a static greeting message can't cover.
