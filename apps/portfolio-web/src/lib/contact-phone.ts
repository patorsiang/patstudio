/**
 * The personal mobile number, held in the environment rather than in
 * `packages/content`.
 *
 * It used to live in `profile.ts` as a literal, which put it three places it was never
 * meant to be: in a public repository, in `/card`'s pre-rendered HTML (via the
 * `wa.me/<number>` deep link), and in the client JS bundle that every visitor
 * downloads. `robots.ts` disallowed `/card/vcard` on the understanding that the vCard
 * was "the one place the phone number is published" - the WhatsApp link had quietly
 * made that untrue.
 *
 * The guard is the variable name: without a `NEXT_PUBLIC_` prefix Next never inlines it
 * into the browser bundle, so even a mistaken import from a client component reads
 * `undefined` rather than leaking the value.
 *
 * Absent env is a supported state, not a failure. Locally and in previews the number
 * simply is not published: the vCard omits its TEL line and `/card/whatsapp` 404s.
 */
export function getContactPhoneE164(): string | undefined {
  const raw = process.env.CONTACT_PHONE_E164?.trim();

  if (!raw) {
    return undefined;
  }

  // E.164: a leading + and 8-15 digits. Anything else is a configuration mistake and
  // is treated as unset rather than published in a vCard or a redirect.
  return /^\+[1-9]\d{7,14}$/.test(raw) ? raw : undefined;
}
