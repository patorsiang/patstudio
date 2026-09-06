# Namecard Design (`/card`)

Final design spec. Requirements live in `docs/requirements/namecard.md`; the decision record is
`docs/decisions/0001-namecard-in-portfolio-web.md`; the motion exception is in
`docs/design/motion-guidelines.md` under "Namecard (`/card`)".

**Status:** final, 2026-08-24. Ready to build.

---

## 1. The idea

`/card` renders Napatchol's business card as an object on screen, at the same proportions as the
printed one, and turning it over is the interaction. It is not a page that lists contact details;
it is the card.

- **Front** — identity: mark, name, role, handle, QR, URL.
- **Back** — contact: portrait, email, location, hairline rule, channel icons, Save Contact.

One extra tap sits between arrival and the contact actions. That cost was accepted deliberately —
see §8.

---

## 2. Geometry

|               |                                                                         |
| ------------- | ----------------------------------------------------------------------- |
| Card          | **308 x 504 px** — 55 x 90 mm at the same 0.611 ratio as the print card |
| Corner radius | 10px (card), 6px (Save, corner cue), 3px (QR)                           |
| Face padding  | `22px 20px 34px`                                                        |
| Page          | centred, `padding: 24px`, card vertically centred                       |
| Strap         | 26px band; twist zone `clamp(48px, 100dvh - 620px, 140px)`; clip 30x26  |

The card is fixed-size in the mockups. **In the build it must scale proportionally** — roughly
`min(308px, calc(100vw - 48px))` with the height derived from the 0.611 ratio — or it overflows a
320px phone.

## 3. Type

Everything except the name is monospace and lowercase. Monospace is the cheapest honest signal that
this person writes software: it costs no extra element and adds no ornament.

| Element       | Font       | Size   | Weight | Tracking  |
| ------------- | ---------- | ------ | ------ | --------- |
| Name          | Geist      | 21px   | 700    | `-0.02em` |
| Role          | Geist Mono | 10.5px | 400    | `0.01em`  |
| Handle        | Geist Mono | 11px   | 400    | —         |
| Email         | Geist Mono | 10.5px | 400    | —         |
| Location, URL | Geist Mono | 9px    | 400    | `0.02em`  |
| Corner cue    | Geist Mono | 9.5px  | 500    | `0.03em`  |
| Save label    | Geist Mono | 11.5px | 600    | `0.045em` |

Copy is lowercase: `full-stack developer`, `@patorsiang`, `bangkok · th`, `save contact`,
`contacts` / `front`.

## 4. Colour

All values come from `packages/ui/tokens.css`. No in-between values were invented.

Two additions the card needs, to be added to the token file:

```css
--color-accent-soft: rgba(94, 234, 212, 0.1); /* dark  */
--color-accent-soft: rgba(15, 118, 110, 0.07); /* light */
```

Three things that are **not** a straight token swap between themes:

1. **The QR never inverts.** Dark modules on a light patch in both themes. Inverting it for dark
   mode breaks scanning on readers that expect dark-on-light. In dark theme the QR is a bright
   rectangle — correct, not an oversight.
2. **Shadow is a different recipe.** Dark `0 18px 40px rgba(0,0,0,0.45)`; light
   `0 10px 26px rgba(24,24,27,0.10)`. The dark drop on a near-white page reads as grime; on light
   the border separates and the shadow only lifts.
3. **The soft wash differs by more than opacity.** 10% in dark, **7% in light** — the deeper light
   accent registers with less, and at 10% the light Save button drops under 4.5:1.

## 5. The action row

The shared component. Also used by the print card's back.

```
[20px icon slot][11px gap][label] ....... [meta, right-aligned][chevron]
```

- Icon slot is a **fixed 20px**. Sizing it to the glyph lets a narrow icon pull its label left of a
  wide one — this was the actual cause of the misalignment found during review.
- Trailing glyph is a **horizontal chevron**, never a diagonal arrow. A column of 45° arrows reads
  as tilted.
- Row height 58px on list variants; the back face uses bare icons in **52px invisible hit areas**
  instead, so the printed look survives while clearing the 44px tap minimum.

## 6. Save Contact — "C+"

Bare, but not invisible.

| State  | Treatment                                               |
| ------ | ------------------------------------------------------- |
| Rest   | `--color-accent-soft` wash, accent text, 44px, radius 6 |
| Hover  | `--color-surface-muted`, 120ms                          |
| Active | `scale(.985)` + `brightness(.94)`                       |
| Focus  | 2px `--color-focus` outline, offset 2                   |

A fully transparent rest was rejected: hover, press and focus are all **desktop** states, and this
route is opened mostly by QR on a phone. Transparent would leave the card's one real action
permanently looking like a line of text.

The height is 44px in **every** state — the bareness is paint, not geometry, so the tap-target
sweep passes regardless.

Contrast, checked because accent-on-accent-wash compresses the ratio from both sides:
**dark 9.7:1, light 5.0:1.**

## 7. Flip affordances

Four layers, deliberately overlapping, because each one fails somewhere.

| Layer                           | Reaches                  | Fails when           |
| ------------------------------- | ------------------------ | -------------------- |
| Entrance peek (one shot)        | everyone, no interaction | reduced-motion is on |
| Page dots, on the card          | everyone, always visible | needs a glance       |
| Corner pill naming the far side | everyone                 | needs reading        |
| Hover lean, 9°                  | desktop                  | no hover on phones   |

Timing and constraints are in `motion-guidelines.md`.

**Both faces flip on a tap anywhere**, not only their corner cue — the cue is the discoverability
affordance from the table above, not the sole control. On the back, every real link
(LINE/WhatsApp/GitHub/LinkedIn, Save Contact) stops its click from bubbling to the face's flip
handler first, so tapping one of them does only that: it never also turns the card. The corner cue
remains a real, independently-focusable `<button>` so keyboard users always have an explicit,
labelled way to flip regardless of where else a click would land.

## 8. Accepted cost

Research is consistent that gating a primary action behind an interaction is this pattern's weak
point — flip cards are discouraged for large cards, hover-driven flips fail on mobile, and no major
digital business card product (Blinq, HiHello, Popl) hides Save Contact behind a flip. Nielsen's own
caveat applies: hiding is only acceptable if people can still find it.

It was chosen anyway, knowing that. Everything in §7 exists to make the turn cheap enough that the
cost is affordable.

**Escape hatch:** if it ever tests badly, default to the **back** face. That keeps the card and
removes the gate without a redesign. Do not remove the flip.

## 9. Fallbacks

- **No JavaScript** — the flip is JS-driven, so without it the back is unreachable and contacts
  would be lost entirely. Server-render **both faces stacked** and let the flip collapse them. Same
  fail-open principle as `RevealOnView`.
- **Reduced motion** — flip becomes an instant swap; the peek does not run. Dots and pill carry the
  message statically.
- **Save Contact** — no in-page success toast. The OS contact sheet is the confirmation; a toast
  would duplicate a system UI the user is already looking at.
- **Share without `navigator.share`** — copy the URL and swap the row's label to "Link copied" for
  ~1.5s. No toast component needed, and the feedback lands where the finger already is.

## 10. Known gap

The four channel icons are **generic outline glyphs, not real brand marks**. Unlabelled, a chat
bubble does not read as LINE. On web there are tooltips and accessible names; on touch and on paper
there is nothing. Swapping in the official LINE / WhatsApp / GitHub / LinkedIn SVGs is the highest
-value asset change left, and it fixes both media at once.

The illustrated avatar (`/avataaars.svg`) is also the least "technical" element on an otherwise
mono, minimal card. Kept because it is the established portrait across the site; revisit only as a
deliberate brand decision.

---

## 11. The lanyard (`/card` only)

The card hangs from a strap that runs up and off the top of the viewport. Added 2026-09-06 after
`?v=` prototyping; the prototype's findings are the source of everything below.

### Why it does not violate section 3

Section 3's "no ornament" rule is about what is **printed on the face**. The lanyard leaves the
face untouched and works on the space around it, so the card itself is unchanged. It reinforces
section 1's premise — _it is not a page that lists contact details; it is the card_ — rather than
negotiating with it.

### The three things that make it work

1. **The pivot is at the clip, not the card's centre.** `.namecard-swing` carries
   `transform-origin: 50% 0%`, which is the top of the clip — the point the band actually ends at.
   With the default `50% 50%`, the same rotation swings the clip sideways off the end of the band
   and the card reads as a rectangle spinning _next to_ a strap rather than hanging from one. This
   is not subtle and it is the first thing to check if the strap ever stops looking right.

2. **The band counter-twists on the flip.** 28 slabs, each `rotateY` interpolated `0 → 180deg` down
   the stack, sharing the flip's 560ms curve, with the delay _decreasing_ downward so the twist
   starts at the card and travels up. A rigid band above a card showing its back reads instantly as
   two unrelated objects.

3. **The ribbon has thickness.** Each slab carries a 3px `::after` plane at right angles to the
   band. Without it the slab passing through 90° is zero-width and the strap **visibly tears in
   half** at the midpoint of the flip — precisely the moment being looked at. Do not remove it.

### Constraints

- **The strap is a sibling of the card, never a child of a face.** `.namecard-face` carries
  `backface-visibility: hidden`, which takes the strap with it on every flip.
- **The taut band is out of flow** (`position: absolute; bottom: 100%`), growing upward. In normal
  flow it pushed the card down by its own length and off the bottom of the viewport — the card's
  position must not depend on how long the strap is. The page's `overflow: hidden` then clips it,
  which _is_ the "runs off the top of the screen" effect. **No neck loop is ever drawn**, and none
  is wanted: a lanyard goes up to a neck that is not in frame.
- **The twist zone is the strap's entire cost in vertical space**, and it shrinks on short
  viewports so the strap can never push Save Contact off a phone — the device this route is opened
  on (section 6). At the 48px floor the column measures 658px against an iPhone SE's 667px.
- **Slab count is a resolution dial and it was measured, not guessed.** At 12 the twist is a
  visible staircase of rectangles. The 1px overlap (`+1px` height, `-1px` margin) matters as much
  as the count — it fills the notch at each step.
- **The strap colour is deliberately not themed.** Same reasoning as the QR in section 4: it is a
  physical object, and inverting it would read as the strap changing material when the page changes
  theme. `--color-strap`, `--color-strap-shade`, `--color-strap-edge` are defined once in
  `packages/ui/tokens.css`.

### Deliberately not shipped

- **Idle sway.** A permanent pendulum loop is the decorative loop `motion-guidelines.md` forbids —
  the same rule that keeps the entrance peek to one shot. It is a one-shot settle instead.
- **Drag.** Pointer-drag with a spring return works and is roughly 40 lines with no library, but it
  needs a movement threshold or a slow tap registers as a drag and the card never flips. The flip
  is already this design's accepted weak point (section 8); adding gesture ambiguity to it is a
  separate, later decision. Spring/overshoot easing is also currently disallowed by
  `motion-guidelines.md`.

### Open

- **Safari is unverified.** The 3D chain is `perspective` → `preserve-3d` ×3 →
  `backface-visibility: hidden`, and Safari flattens more eagerly than Chromium. Verified in
  Chrome only.
- **The print card has no punched slot**, so the physical and digital cards now diverge at the top
  edge. Section 1's premise says they should be the same object. Either the print card gains a
  slot or this is an accepted, documented divergence.
- **Section 2's scaling gap is still open and is now tighter.** The card is still a fixed 308x504
  in the build, not the proportional scale section 2 asks for. The strap does not cause this, but
  it spends the remaining vertical slack.
