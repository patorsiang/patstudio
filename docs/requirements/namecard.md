# Namecard Requirements

## 0. Document Status

**Project:** Digital Namecard (`/card`)
**Owner:** Napatchol Thaipanich
**Version:** v1.0
**Status:** Approved for Phase 1–4 implementation (deep links only; LINE/WhatsApp bot integration deferred, see §7)
**Primary Goal:** Give someone a fast, shareable way to save Napatchol's real contact details and social links after meeting in person or over a link — a single mobile-first page, not a second portfolio.

---

## 1. Product Summary

The namecard is a standalone, chrome-less page at `/card` inside `apps/portfolio-web`. It is not a new app and not a new repo (see ADR `docs/decisions/0001-namecard-in-portfolio-web.md`) — it reuses the existing `profile` content, design tokens, OG-image pipeline, and QR script already in this repo.

Unlike the rest of the site, `/card` is optimized for a single moment: someone has just met Napatchol (in person, at a conference, over a shared link) and wants to save contact info or start a conversation in one of a few clicks. It is not meant to explain her career story — that's `/about` and `/cv`.

---

## 2. Audience

- People met in person who scan a printed/physical QR code or a phone-to-phone share.
- People who receive the link directly (chat, email signature, conference badge).
- Not optimized for recruiters or search engines — `/card` is excluded from the sitemap's primary crawl priority and the `.vcf` export is disallowed in `robots.ts`, matching the existing `/cv/export/` precedent.

---

## 3. Content

The card is a **two-faced object at print proportions** (55 x 90 mm, 0.611 ratio), which the visitor
turns over. Full visual spec in `docs/design/namecard.md`.

**Front — identity:**

- Brand mark (top-left), name (`profile.name.en`).
- Role and handle, monospace lowercase.
- QR code (`public/card-qr.svg`) encoding the canonical `/card` URL — the front's main subject.
- Canonical URL, monospace.

**Back — contact:**

- Portrait: `/avataaars.svg` (the same illustrated portrait already used by `ProfileHeader` on the homepage — not a new asset).
- Email (`profile.contact.email`) and location, monospace.
- Hairline rule, then a bare icon row on four equal columns:
  1. **LINE** — `https://line.me/R/ti/p/@766wwbir` (the `PatOrSiangAssistant` Official Account).
  2. **WhatsApp** — `https://wa.me/66959390164`.
  3. **GitHub** and **LinkedIn** — existing `profile.contact` links.
- **Save Contact** — downloads `/card/vcard` (a `.vcf` file). The primary action; see `docs/design/namecard.md` §6 for its treatment.

**Share** uses the Web Share API where supported, with a copy-link fallback that swaps the control's
label rather than raising a toast.

**Not included:** a contact form (matches the existing `/contact` page's explicit "no form" stance),
and the phone number is **not rendered in the page HTML** on either face — see §5.

**Accepted cost:** the contact actions sit behind one flip. That trade, the research against it, and
the escape hatch are recorded in `docs/design/namecard.md` §8.

---

## 4. Channel Fields (schema)

`packages/content/src/schemas/profile.schema.ts`'s `contact` object gains three **optional** keys, additive to the existing closed `{email, github, linkedin}` shape:

```ts
contact: z.object({
  email: linkSchema,
  github: linkSchema,
  linkedin: linkSchema,
  phone: linkSchema.optional(),
  line: linkSchema.optional(),
  whatsapp: linkSchema.optional(),
});
```

Confirmed values (real data, not fixtures — see CLAUDE.md):

| Field | URL | Source |
|---|---|---|
| `phone` | `tel:+66959390164` | Confirmed current by Napatchol, 2026-08-22 |
| `whatsapp` | `https://wa.me/66959390164` | Same number as `phone` |
| `line` | `https://line.me/R/ti/p/@766wwbir` | LINE Official Account `PatOrSiangAssistant`, channel `2005472166` |

All five existing consumers of `profile.contact` (`contact/page.tsx`, `SiteFooter.tsx`, `CvPageContent.tsx`, `person-json-ld.ts`, `llms.txt/route.ts`) reference fields by fixed name (`.email`, `.github`, `.linkedin`) and never iterate the object generically — adding these optional keys does not change their output. Only the new `/card` page and the vCard builder read the new fields.

---

## 5. Privacy Decision: Phone Number

**Decided:** the phone number appears **only** inside the downloaded `.vcf`, never in `/card`'s rendered HTML.

- `/card/vcard` is added to the `Disallow` list in `src/app/robots.ts`, exactly as `/cv/export/` already is.
- This keeps the number off the page's crawl/scrape surface. It does **not** make the number secret — `/card/vcard` is still a publicly fetchable URL for anyone who guesses it, same class of exposure as `/cv/export/json`.
- WhatsApp is still reachable from the visible page via the `wa.me` link, independent of whether the raw number is shown as text.

---

## 6. vCard Requirements

- **Format:** vCard 3.0 (not 4.0) — most reliable import behavior across iOS Contacts and Android.
- **Encoding:** UTF-8 throughout, to correctly round-trip the Thai name `ณภัทรชล ไทพาณิชย์`.
- **Line format:** CRLF line endings; fold any line exceeding 75 octets with a leading space on the continuation, per the vCard spec.
- **Escaping:** `\`, `;`, `,`, and embedded newlines escaped in every field value.
- **Field mapping:** `FN`/`N` ← `profile.name`; `TITLE` ← `profile.role`; `EMAIL` ← `profile.contact.email`; `TEL` ← `profile.contact.phone`; `URL` ← portfolio link; `X-SOCIALPROFILE` ← GitHub/LinkedIn; `ADR`/`NOTE` ← `profile.location`.
- **Delivery:** static route handler `src/app/card/vcard/route.ts`, `text/vcard; charset=utf-8`, `Content-Disposition: attachment`, `export const dynamic = "force-static"` (the underlying data is build-time constant, same as `/cv/export/json`).

---

## 7. Messaging Integration Scope

**In scope now:** deep links only — LINE add-friend URL, `wa.me` link, `mailto:`. Zero backend, zero third-party review process.

**Deferred, revisit only after the card is live:**

- **WhatsApp Cloud API** — rejected for now. Meta Business verification, a dedicated phone number, and template-message approval represent weeks of lead time and ongoing per-conversation cost, disproportionate to a personal namecard's actual job.
- **LINE Messaging API bot** on the already-provisioned `PatOrSiangAssistant` channel (`2005472166`) — worth reconsidering once there's a concrete need for something a static greeting message can't do (replying to what people actually type, or routing messages back to Napatchol). Build only then, and only with the security requirements in the ADR (§ Non-Functional, webhook signature verification) satisfied from day one.
- In the meantime, enabling the channel's **greeting message** (LINE OA Manager, no code) to point at the live `/card` URL closes the "OA that never replies" expectation gap for free.

---

## 8. Non-Functional Requirements

- **Accessibility:** `/card` skips `PageShell` (no site nav/footer — it's a standalone artifact) but must render its own `<main>` landmark. It is added to `e2e/support/routes.ts` so it's automatically covered by the existing contrast, tap-target, focus-visible, and reduced-motion sweeps.
- **Design tokens:** `bg-(--color-x)` token syntax only, matching the rest of the site — no ad hoc colors, no `bg-[var(--color-x)]`.
- **URL safety:** every outbound link passes through `sanitizeUrl` from `@patorsiang/utils/sanitize-url` (subpath import, not the barrel — the barrel pulls in `isomorphic-dompurify`/jsdom and has broken production routes before).
- **SEO:** per-page OG image at `src/app/card/opengraph-image.tsx` (Satori/`next/og`, no Tailwind, no CSS vars — literal colors from `src/lib/brand.ts`), so pasting the `/card` link into LINE/WhatsApp/Slack renders a real preview card. Added to `src/app/sitemap.ts`.
- **Testing:** vCard builder is a pure function with a fiddly, well-specified format — the correct target for unit tests written before implementation (TDD). The card page itself is layout — covered by the existing e2e a11y sweeps, not unit tests.

---

## 9. Out of Scope (v1)

- Physical/printed card production (Phase 0 explores a print-face design direction; not built in this pass).
- Any LINE/WhatsApp bot backend (§7).
- A generic/iterable `channels: {platform, url}[]` array — the closed `contact` object with named optional keys was chosen over this; revisit only if a sixth channel makes the named-field approach awkward.
