# Keep the phone number out of the repository and the client bundle

Date: 2026-09-17
Status: accepted 2026-09-17
Branch: `fix/cv-timeline-date-handling`
Supersedes part of: `0001-namecard-in-portfolio-web.md` ("Phone number visibility")

## Problem

`0001` decided the phone number would be "rendered only inside the downloaded `.vcf`,
never in `/card`'s HTML", with `/card/vcard` added to `robots.ts`'s disallow list to keep
it off the crawl surface. `robots.ts` still described the vCard as "the one place the
phone number is published".

That was not true, and had not been true since the WhatsApp affordance was added. The
namecard linked directly to `wa.me/<CONTACT_PHONE_E164 without +>`, so the number was:

- a literal in `packages/content/src/data/profile.ts`, in a public repository, indexed by
  GitHub code search — no URL to guess;
- in `/card`'s pre-rendered HTML, which `robots.ts` does **not** disallow (verified live:
  `curl https://patstudio.vercel.app/card | grep wa.me` returned the number);
- in `.next/static/chunks/*.js`, shipped to every visitor of the site.

The measure in `0001` was sound; a later feature walked around it, and the comment
asserting the property was never rechecked.

## Decisions

| Decision                 | Choice                                                                                    | Reasoning                                                                                                                                                                                                                                                                |
| ------------------------ | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Where the number lives   | `CONTACT_PHONE_E164`, read only by `src/lib/contact-phone.ts`                             | Out of the content package, so it is not in the repository, the HTML, or the bundle. The absent `NEXT_PUBLIC_` prefix is the enforcement: Next never inlines such a variable into the browser, so even a mistaken client import reads `undefined` instead of leaking it. |
| How WhatsApp still works | The card links to `/card/whatsapp`, a `force-dynamic` route that 302s to `wa.me/<number>` | Keeps the one-tap affordance `0001` wanted while the number stays server-side. `force-dynamic` matters: pre-rendering would bake it back into build output, which is the thing being avoided.                                                                            |
| Unset environment        | Supported. The vCard omits its `TEL` line; `/card/whatsapp` returns 404                   | Local development and previews should not need the real number, and a missing contact detail is a better failure than a build error or a placeholder that looks real.                                                                                                    |
| Malformed environment    | Treated as unset                                                                          | A value that is not E.164 is a configuration mistake. Publishing it in a vCard or a redirect would be worse than not publishing it at all.                                                                                                                               |

## Known limitations

- **This does not un-publish anything.** The number was in a public repository from
  2026-08-24, in `/card`'s HTML, and in the deployed bundle. Assume it has been scraped.
  This stops further publication; it does not undo past publication. Rewriting git history
  would not change that either, and is not worth the cost.
- The vCard remains publicly fetchable by anyone with the URL. That is unchanged from
  `0001` and still the accepted trade.

## Follow-on

- Set `CONTACT_PHONE_E164` in Vercel production (`vercel env add CONTACT_PHONE_E164
production`). Until then the deployed vCard carries no `TEL` line and the WhatsApp link
  404s.
- A test now fails if a phone-shaped literal reappears in the content package
  (`vcard.test.ts`, "no phone number is committed to the content source").
