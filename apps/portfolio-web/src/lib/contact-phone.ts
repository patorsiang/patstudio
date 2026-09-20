/**
 * The personal mobile number, held in the environment rather than in
 * `packages/content`.
 *
 * It used to live in `profile.ts` as a literal, which put it three places it was never
 * meant to be: in a public repository, in `/card`'s pre-rendered HTML, and in the client
 * JS bundle that every visitor downloads. The WhatsApp card link now uses a public short
 * link, while this value remains server-side for vCard generation.
 *
 * The guard is the variable name: without a `NEXT_PUBLIC_` prefix Next never inlines it
 * into the browser bundle, so even a mistaken import from a client component reads
 * `undefined` rather than leaking the value.
 *
 * Absent env is a supported state, not a failure. Locally and in previews the number
 * simply is not published: the vCard omits its TEL line while `/card/whatsapp` still works.
 */
export function getContactPhoneE164(): string | undefined {
  const raw = process.env.CONTACT_PHONE_E164?.trim();

  if (!raw) {
    return undefined;
  }

  // E.164: a leading + and 8-15 digits. Anything else is a configuration mistake and
  // is treated as unset rather than published in a vCard.
  return /^\+[1-9]\d{7,14}$/.test(raw) ? raw : undefined;
}
