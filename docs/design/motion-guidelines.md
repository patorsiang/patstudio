# Portfolio Motion Guidelines

## Purpose

Motion in the portfolio should improve clarity, state recognition, and interaction feedback. It should never make the portfolio feel flashy, slow, or harder to read.

The default approach is CSS and Tailwind transitions. No motion library is currently used, and one should not be added unless a future interaction genuinely needs it.

## Motion Principles

- Content first: text and evidence should be readable immediately.
- Subtle: motion should be felt as polish, not noticed as spectacle.
- Fast: interactions should respond quickly and avoid delaying navigation.
- Purposeful: every animation should explain state, focus, loading, or continuity.
- Accessible: motion must respect `prefers-reduced-motion`.
- Predictable: similar components should move in similar ways.

## When Motion Is Allowed

Motion is allowed when it supports one of these purposes:

- Hover, focus, active, and selected states.
- Button, link, card, and tag interaction feedback.
- Small state changes such as opening a compact menu or switching CV role/language controls.
- Loading or skeleton states when content is genuinely pending.
- Page or section entrance only when it does not delay reading.
- Export/download feedback if a future action needs status confirmation.

## When Motion Is Not Allowed

Avoid motion that competes with the portfolio content.

Forbidden patterns:

- Heavy scroll-linked animation.
- Parallax effects.
- Large page entrance animations that delay reading.
- Animated hero backgrounds.
- Decorative bouncing, floating, pulsing, or looping elements.
- Text animation that reveals words or letters over time (the one-shot brand-mark stroke-draw is a distinct, named exception - see above; this still forbids revealing actual text content).
- Animations required to understand content.
- Long staggered reveals across lists of projects, experience, or CV sections.
- Motion that moves large layout regions after content has loaded.
- Animation that causes layout shift.

## Timing And Easing

### Duration

| Motion type                                       |        Duration |
| ------------------------------------------------- | --------------: |
| Hover/focus feedback                              |       100-150ms |
| Button active/pressed feedback                    |        75-120ms |
| Small menu or disclosure open/close               |       150-200ms |
| Section reveal, if used                           |       180-240ms |
| Loading shimmer, if used                          | 900-1400ms loop |
| Toast or temporary status entry                   |       150-220ms |
| One-shot brand-mark reveal (named exception)      |           500ms |
| Namecard flip, `/card` (named exception)          |           560ms |
| Namecard entrance peek, `/card` (named exception) | 1100ms one-shot |

Rules:

- Prefer shorter durations.
- Do not exceed 250ms for normal UI transitions.
- Loading animations may loop, but they must be visually quiet.
- Never delay content appearance just to play an animation.
- Exception: a one-shot brand-mark stroke-draw (e.g. the homepage hero mark) may run up to 500ms, since a self-drawing stroke at 250ms reads as a glitch rather than a draw. Scoped narrowly to that one moment - every other transition on this page keeps the 250ms cap above.
- Exception: the `/card` namecard flip may run up to 560ms, and its one-shot entrance peek up to 1100ms. Both are scoped to that single route and are covered in detail under "Namecard (`/card`)" below.

### Easing

Use simple, predictable easing:

- Default transition: `ease-out`.
- Entering content: `cubic-bezier(0.16, 1, 0.3, 1)` or Tailwind `ease-out`.
- Exiting content: `ease-in` with shorter duration.
- State changes: `ease-in-out` only when both start and end need equal emphasis.

Avoid springy, elastic, bounce, or overshoot easing for portfolio UI.

## Component-Level Rules

### Links

- Allowed: text colour change, underline appearance, subtle underline offset change.
- Duration: 100-150ms.
- Focus state must be visible and should not rely on animation alone.

### Buttons

- Allowed: background, border, text colour, and slight opacity changes.
- Optional: tiny pressed-state transform such as `translateY(1px)`, only if consistent.
- Avoid scaling buttons on hover.
- Duration: 100-150ms.

### Cards

- Allowed: border colour change, subtle background change, or very small shadow change.
- Avoid card lift, 3D tilt, scaling, or image zoom as default behavior.
- Project cards should not animate content in a way that hides details.
- These rules govern **content cards** - project cards, post cards, CV blocks. The namecard on `/card` is a different thing: it is a depiction of a physical object rather than a container for content, and it has its own named exception below. Do not read that exception as permission to tilt or flip a project card.

### Namecard (`/card`)

A named exception, scoped to this one route. `/card` renders a 55x90mm business card at the same ratio as the printed one, and turning it over is the interaction.

Allowed here and nowhere else:

- **Flip:** `rotateY(0 -> 180deg)`, 560ms, `cubic-bezier(0.2, 0, 0.2, 1)`. Below roughly 200ms a flip reads as a glitch rather than a card turning, which is the same reasoning as the brand-mark exception.
- **Entrance peek:** one shot, 1100ms, starting 650ms after load - the card turns 17 degrees and settles. It is the only flip affordance that needs no hover and no reading, which matters because this route is opened mostly by scanning a QR on a phone. It runs **once**; a looping wiggle would be the forbidden decorative loop.
- **Hover lean:** `rotateY(-9deg)`, 220ms, on a separate wrapper from the flip so the lean never inherits the 560ms duration.

Constraints that come with the exception:

- The peek must carry `animation-fill-mode: none`. With `both`, the final keyframe pins the transform and permanently defeats the hover rule.
- Hover state changes must animate `transform`, never `padding` - animating padding relayouts every frame and leaves the resting and hover states on different axes.
- Under `prefers-reduced-motion: reduce` the flip becomes an instant swap and the peek does not run at all. Because the peek is pure motion, it must be **replaced** rather than shortened: the always-visible page dots and corner pill carry the same message statically.
- The face-down side stays in the DOM, so it must be made `inert` (or equivalent) while hidden, or keyboard focus lands on invisible links and screen readers announce both faces.

### Navigation

- Allowed: active underline, border, or text colour transition.
- Mobile menus may fade or slide a short distance if content remains accessible.
- Avoid complex navigation choreography.

### CV Role And Language Controls

- Allowed: selected state colour, border, or background transition.
- Switching role/language should prioritize fast content replacement.
- Avoid animating the entire CV document on every role or language change.

### Page And Section Reveals

Reveals are optional and should be rare.

Allowed reveal pattern:

- Opacity from `0` to `1`.
- Vertical offset no more than 8px.
- Duration 180-240ms.
- No more than one short stagger group per page section.

Rules:

- Main page content should be readable without waiting.
- Do not reveal every card in a long list one by one.
- Do not use scroll-triggered reveals for core CV content.

### Loading And Skeleton States

Most portfolio content should be statically rendered and should not need skeletons.

If loading states are needed:

- Use neutral skeleton blocks that match final layout dimensions.
- Avoid layout shift when content appears.
- Use a quiet shimmer only for genuinely pending content.
- Respect reduced motion by disabling shimmer and showing static placeholders.

## Reduced-Motion Behavior

Respect `prefers-reduced-motion: reduce`.

When reduced motion is enabled:

- Remove non-essential transitions and animations.
- Disable section reveals.
- Disable loading shimmer.
- Keep instant state changes for hover, focus, selected, and navigation states.
- Preserve visible focus indicators.

Suggested CSS baseline:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
```

Use this carefully: if a future component needs an exception for accessibility, document the reason.

## Motion Library Guidance

No motion library is currently installed. Keep motion in CSS or Tailwind for the first version.

If a library such as Framer Motion is introduced later:

- Use it only for interactions that CSS cannot handle cleanly.
- Centralize duration and easing values.
- Always wire reduced-motion behavior.
- Avoid scroll-based animation primitives for core portfolio sections.
- Keep animation variants small and reusable.

## Acceptance Criteria

- Motion supports clarity, state feedback, or loading feedback.
- No animation delays reading key portfolio or CV content.
- Hover, focus, active, selected, and loading states are consistent across components.
- Normal UI transitions stay under 250ms (see the one-shot brand-mark reveal and `/card` namecard exceptions above).
- Scroll animation, parallax, decorative loops, and large text reveals are not used.
- Reduced-motion users receive instant or near-instant state changes with no non-essential animation.
- Future UI work can implement motion with CSS/Tailwind without adding a heavy dependency.
