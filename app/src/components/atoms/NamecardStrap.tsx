/**
 * The lanyard the namecard hangs from - the taut band, the twist zone, and
 * the clip. Purely decorative: it carries no information and no controls, so
 * the whole thing is aria-hidden and a screen reader never hears about it.
 *
 * Everything except the per-slab transform lives in globals.css under
 * ".namecard-strap". The transform and its delay are set here because both
 * are a function of the slab's index, which CSS cannot express without 28
 * hand-written nth-child rules.
 *
 * Full rationale, including why the twist is needed at all, is in
 * docs/design/namecard.md section 11.
 */

/**
 * 28 slabs of ~5px. This number is a resolution dial and it was measured, not
 * guessed: at 12 the twist is a visible staircase of rectangles. Raising it
 * costs 28 cheap composited elements that only animate on a flip.
 */
const TWIST_SLABS = 28;

/**
 * The twist starts at the card and travels UP the band. Lower slabs lead,
 * upper slabs lag, which is what makes the twist read as caused by the card
 * turning rather than choreographed alongside it. 3ms x 27 = 81ms of lag
 * across the zone, well inside the flip's own 560ms.
 */
const SLAB_STAGGER_MS = 3;

export function NamecardStrap({ flipped }: { flipped: boolean }) {
  return (
    <div className="namecard-strap" aria-hidden="true">
      {Array.from({ length: TWIST_SLABS }, (_, index) => {
        // Bottom slab reaches a full 180deg to match the card it is attached
        // to; the top of the zone is barely turned at all.
        const share = (index + 1) / TWIST_SLABS;
        return (
          <i
            key={index}
            className="namecard-seg"
            style={{
              transform: `rotateY(${flipped ? 180 * share : 0}deg)`,
              transitionDelay: `${(TWIST_SLABS - 1 - index) * SLAB_STAGGER_MS}ms`,
            }}
          />
        );
      })}
    </div>
  );
}
