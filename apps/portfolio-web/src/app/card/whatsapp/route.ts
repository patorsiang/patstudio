import { getContactPhoneE164 } from "@/lib/contact-phone";

/**
 * Redirect to WhatsApp without putting the number on the page.
 *
 * The namecard used to link straight to `wa.me/<number>`, which meant the number was
 * rendered into `/card`'s HTML and inlined into the client bundle - crawlable, and
 * published to every visitor. The card now links here, and the number is only ever
 * read server-side.
 *
 * `force-dynamic` because the value comes from the environment: pre-rendering this
 * would bake the number back into the build output, which is the problem it exists to
 * avoid.
 */
export const dynamic = "force-dynamic";

export function GET(): Response {
  const phone = getContactPhoneE164();

  if (!phone) {
    return new Response("WhatsApp contact is not configured.", { status: 404 });
  }

  return Response.redirect(`https://wa.me/${phone.replace(/^\+/, "")}`, 302);
}
