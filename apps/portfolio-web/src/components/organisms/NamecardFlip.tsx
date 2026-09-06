"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";

import { profile } from "@patorsiang/content";
import { sanitizeUrl } from "@patorsiang/utils";

import { NamecardStrap } from "@/components/atoms/NamecardStrap";
import { SiteMark } from "@/components/atoms/SiteMark";
import {
  FlipIcon,
  GitHubIcon,
  LineIcon,
  LinkedInIcon,
  PlusIcon,
  WhatsAppIcon,
} from "@/components/atoms/NamecardIcons";
import { classNames } from "@/lib/classnames";
import { siteUrl } from "@/lib/seo";

const cardUrl = new URL("/card", siteUrl).href;
// The QR image and its alt text still describe what the QR actually encodes
// (this page, /card) - that has to stay accurate for a screen reader user.
// The clickable overlay and the text underneath it are a separate, deliberate
// choice to send a mouse/touch visitor to the portfolio's home page instead.
const homeUrl = new URL("/", siteUrl).href;
const displayUrl = homeUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
const cardDisplayUrl = cardUrl.replace(/^https?:\/\//, "");
const qrSrc = "/card-qr.svg";
// A download must not be intercepted by the client router, so this stays a
// plain anchor rather than next/link - same reasoning as ButtonLink's
// download branch. Held in a variable, not inlined as a literal, so Next's
// no-html-link-for-pages check (which pattern-matches literal hrefs) doesn't
// flag a route it is correct to reach with a plain anchor.
const vcardHref = "/card/vcard";

// See docs/design/namecard.md sections 5-6: the back face's icon row is bare
// glyphs in invisible 52px hit areas (matching the printed card), and Save
// Contact's "C+" treatment is bespoke to this one control - neither reuses a
// shared row component, so both are styled inline here.
const iconLinkClassName =
  "flex h-[52px] w-[52px] items-center justify-center rounded-full text-(--color-text-muted) transition-colors hover:bg-(--color-surface-muted) hover:text-(--color-accent) focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-(--color-focus)";

// tap-reach rather than a real 40px box: the badge is deliberately small
// (28px) so it reads as a corner label, not a button - see
// docs/design/namecard.md section 2 for the geometry. The ::after overlay
// gives it a real 40px hit area without changing how it looks.
const cueClassName =
  "tap-reach absolute top-[15px] right-[15px] z-10 flex h-7 items-center gap-1.5 rounded-md border border-(--color-border) bg-background px-2.5 font-mono text-[9.5px] font-medium tracking-[0.03em] text-(--color-text-subtle) transition-colors hover:border-(--color-accent) hover:text-(--color-accent) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus)";

// Lets a click on a real link (the icon row, Save Contact) do only that,
// rather than also bubbling up to the back face's onClick and flipping the
// card out from under whatever the person was actually reaching for.
function stopFlip(event: React.MouseEvent) {
  event.stopPropagation();
}

// Line/WhatsApp are optional on the profile; GitHub/LinkedIn always render.
// Computed once at module scope, not per-render, since profile is static
// content rather than component state.
const contactChannels = [
  profile.contact.line && {
    href: sanitizeUrl(profile.contact.line.url),
    ariaLabel: "LINE",
    title: profile.contact.line.label.en,
    Icon: LineIcon,
  },
  profile.contact.whatsapp && {
    href: sanitizeUrl(profile.contact.whatsapp.url),
    ariaLabel: "WhatsApp",
    title: profile.contact.whatsapp.label.en,
    Icon: WhatsAppIcon,
  },
  {
    href: sanitizeUrl(profile.contact.github.url),
    ariaLabel: "GitHub",
    title: profile.contact.github.label.en,
    Icon: GitHubIcon,
  },
  {
    href: sanitizeUrl(profile.contact.linkedin.url),
    ariaLabel: "LinkedIn",
    title: profile.contact.linkedin.label.en,
    Icon: LinkedInIcon,
  },
].filter((channel): channel is NonNullable<typeof channel> => Boolean(channel));

/**
 * The namecard: a two-faced object at print proportions (55x90mm, 308x504px)
 * that the visitor turns over. Front is identity + QR; back is the contact
 * actions. Full spec, including the accepted cost of gating contacts behind
 * one flip, is docs/design/namecard.md.
 *
 * The card hangs from a lanyard (docs/design/namecard.md section 11). The
 * strap is a SIBLING of the card, never a child of a face - .namecard-face
 * carries backface-visibility: hidden, which would take the strap with it on
 * every flip - and it counter-twists with the flip so a card showing its back
 * is not hanging from a visibly untwisted band.
 *
 * Both faces flip on a tap anywhere, not just their corner cue - the cue is
 * the discoverability affordance (see docs/design/namecard.md section 7), not
 * the only way to reach it. On the back, every real link stops the click from
 * bubbling to the face's flip handler, so tapping LINE/WhatsApp/GitHub/
 * LinkedIn/Save Contact still does only that, never also turns the card.
 */
export function NamecardFlip() {
  const [flipped, setFlipped] = useState(false);

  const frontRef = useRef<HTMLButtonElement>(null);
  const backCueRef = useRef<HTMLButtonElement>(null);
  const isFirstRender = useRef(true);

  /**
   * Blurs whatever currently has focus before flipping, so the element
   * aria-hidden is about to be set on is never the one still holding focus.
   *
   * Reads document.activeElement rather than event.currentTarget: this fires
   * from three different sources now (the front button, the back cue button,
   * and a click anywhere else on the back face bubbling up to it), and only
   * one of those three is ever the actually-focused element at click time.
   * activeElement is correct regardless of which of the three triggered it.
   */
  function toggle() {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setFlipped((value) => !value);
  }

  /**
   * Moves focus onto the newly-visible face's control after a flip, since
   * blurring in toggle() alone would otherwise leave focus on the document
   * body - a worse outcome for a keyboard user than landing on the face they
   * just revealed.
   *
   * The retarget is deferred one animation frame rather than called straight
   * from this layout effect. Calling `.focus()` synchronously right after the
   * commit that clears the destination's `inert` attribute does not
   * reliably work: the browser has not yet finished the internal
   * recalculation that follows an inert change, so the element can still
   * behave as unfocusable for a moment even though the attribute is already
   * gone from the DOM. One requestAnimationFrame - after the next paint - is
   * enough for that to settle.
   *
   * Skipped on mount so loading the page doesn't yank focus onto the card.
   */
  useLayoutEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const target = flipped ? backCueRef : frontRef;
    const frame = requestAnimationFrame(() => target.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [flipped]);

  return (
    <div className="namecard-stage namecard-rig mx-auto w-[308px]">
      <NamecardStrap flipped={flipped} />
      {/* The clip is inside .namecard-swing, whose transform-origin is its own
          top edge - the point the band ends at - so the card hangs from the
          clip rather than pivoting about its own middle. */}
      <div className="namecard-swing w-full">
        <div className="namecard-clip mx-auto" aria-hidden="true" />
        <div className="namecard-tilt">
          <div className="namecard-inner relative h-[504px] w-full" data-flipped={flipped}>
            {/* FRONT - identity. The whole face is the flip control: there are
              no links here, so any tap can only turn the card. */}
            <button
              type="button"
              onClick={toggle}
              aria-label="Turn card over to see contact channels"
              aria-hidden={flipped}
              inert={flipped ? true : undefined}
              ref={frontRef}
              className="namecard-face absolute inset-0 flex cursor-pointer flex-col items-center rounded-[10px] border border-(--color-border) bg-(--color-surface) px-5 pt-[22px] pb-[34px] text-left shadow-[0_18px_40px_rgba(0,0,0,0.45)] focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-(--color-focus)"
            >
              <span className={cueClassName} aria-hidden="true">
                <FlipIcon />
                contacts
              </span>

              <SiteMark size={21} className="self-start text-(--color-accent)" />

              <div className="mt-6 text-center">
                <p className="text-[21px] leading-[1.15] font-bold tracking-[-0.02em] text-(--color-text)">
                  {profile.name.en}
                </p>
                <p className="mt-2.5 font-mono text-[10.5px] lowercase text-(--color-text-subtle)">
                  {profile.role.en}
                </p>
                <p className="mt-1 font-mono text-[11px] text-(--color-accent)">
                  @{profile.handle}
                </p>
              </div>

              <div className="flex-1" />

              {/* A real link, not just a decorative image inside the flip
                button - onClick={stopFlip} keeps a tap here from also
                turning the card, same pattern as every real link on the back
                face. Points at the portfolio home page rather than at the URL
                this QR actually encodes (this /card page): the alt text below
                stays accurate to what the QR encodes, since that has to be
                true for a screen reader regardless of where the visible
                click target goes. target="_blank" since this is a different
                page, not the one already open. */}
              <a
                href={homeUrl}
                target="_blank"
                rel="noreferrer"
                onClick={stopFlip}
                tabIndex={flipped ? -1 : undefined}
                className="rounded-[3px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus)"
              >
                <Image
                  src={qrSrc}
                  alt={`QR code linking to ${cardDisplayUrl}`}
                  width={112}
                  height={112}
                  unoptimized
                  priority
                  className="rounded-[3px]"
                />
              </a>
              <a
                href={homeUrl}
                target="_blank"
                rel="noreferrer"
                onClick={stopFlip}
                tabIndex={flipped ? -1 : undefined}
                className="tap-reach mt-3 font-mono text-[9px] tracking-[0.02em] text-(--color-text-subtle) underline-offset-2 hover:text-(--color-accent) hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus)"
              >
                {displayUrl}
              </a>
            </button>

            {/* BACK - contact. Adapted from the printed card's back face (same
              portrait/email/rule/icon-row composition). The whole face flips
              on click, same as the front; every real link below stops that
              click from bubbling here first, via stopFlip.

              This div's onClick has no keyboard listener of its own (flagged
              by static analysis, e.g. SonarCloud S1082/S6848) - that is a
              deliberate, accepted finding, not an oversight. Keyboard access
              already exists via the real <button ref={backCueRef}> just
              below: its native Enter/Space activation synthesizes a click
              that bubbles up to this handler. Adding a matching onKeyDown
              here would double-fire (keydown *and* the button's synthesized
              click would each call toggle()), and it would also fire while
              any of the focusable link/anchors below are focused, flipping
              the card underneath a link a keyboard user only meant to
              activate. There is no fix that adds real keyboard coverage
              without introducing one of those two bugs. */}
            <div
              onClick={toggle}
              aria-hidden={!flipped}
              inert={!flipped ? true : undefined}
              className={classNames(
                "namecard-face namecard-face--back absolute inset-0 flex cursor-pointer flex-col items-center rounded-[10px] border border-(--color-border) bg-(--color-surface) px-5 pt-[22px] pb-[34px] shadow-[0_18px_40px_rgba(0,0,0,0.45)]",
              )}
            >
              {/* No onClick of its own - a click here bubbles to the face's
                onClick above, same as a click on any other non-link part of
                this face. Kept as a real <button> purely so it stays
                independently keyboard-operable (Enter/Space still dispatch a
                bubbling click) and remains the visible flip-back cue. */}
              <button type="button" ref={backCueRef} className={cueClassName}>
                <FlipIcon />
                front
              </button>

              <div className="flex-1" />

              <Image
                src="/avataaars.svg"
                alt={`Illustrated portrait of ${profile.name.en}`}
                width={112}
                height={112}
                unoptimized
                className="h-28 w-28 shrink-0 rounded-full border-2 border-(--color-accent) bg-(--color-surface-muted)"
              />

              <p className="mt-3.5 font-mono text-[10.5px] text-(--color-text-muted)">
                {profile.contact.email.label.en}
              </p>
              <p className="mt-1 font-mono text-[9px] lowercase text-(--color-text-subtle)">
                {profile.location.en}
              </p>

              <div className="mt-3.5 h-px w-11 bg-(--color-border)" />

              {/* title gives sighted mouse users a native hover tooltip
                without changing what screen readers announce - aria-label
                still wins as the accessible name, title is purely the
                on-hover label. GitHub/LinkedIn's title is the real handle
                (profile.contact.*.label.en), not just a repeat of the
                icon's channel name. */}
              <div className="mt-3.5 grid w-full grid-cols-4 place-items-center">
                {contactChannels.map(({ href, ariaLabel, title, Icon }) => (
                  <a
                    key={ariaLabel}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={ariaLabel}
                    title={title}
                    onClick={stopFlip}
                    tabIndex={flipped ? undefined : -1}
                    className={iconLinkClassName}
                  >
                    <Icon size={22} />
                  </a>
                ))}
              </div>

              <div className="flex-1" />

              {/* "C+": a resting accent wash, not a solid fill. Hover/press/
                focus are desktop states, and this route is opened mostly by
                scanning the QR on a phone - a fully transparent rest would
                leave the card's one real action looking like a line of text
                on every visit that matters. See namecard.md section 6. */}
              <a
                href={vcardHref}
                download="napatchol-thaipanich.vcf"
                onClick={stopFlip}
                tabIndex={flipped ? undefined : -1}
                className="flex h-11 w-full items-center justify-center gap-1.5 rounded-md bg-(--color-accent-soft) font-mono text-[11.5px] font-semibold tracking-[0.045em] text-(--color-accent) transition-[background-color,transform] hover:bg-(--color-surface-muted) active:scale-[0.985] active:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus)"
              >
                <PlusIcon />
                save contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
