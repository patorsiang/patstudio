/**
 * Public WhatsApp short link used by the namecard.
 *
 * Keep this value in one place so changing the public WhatsApp destination does not
 * require editing the card component or content data.
 */
const WHATSAPP_SHORT_LINK = "https://wa.me/message/FHMNDGUQGKJNE1";

export function GET(): Response {
  return Response.redirect(WHATSAPP_SHORT_LINK, 302);
}
