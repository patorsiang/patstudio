# Portfolio Design System

## Purpose

This document defines a small visual system for the portfolio. It should guide future implementation of navigation, page layouts, CV sections, project cards, buttons, links, and content sections.

The system is intentionally restrained: native CSS, Tailwind utilities, and existing project conventions are preferred over a heavy component library.

## Current Styling Setup

The portfolio web app currently uses:

- Tailwind CSS v4 through `@import "tailwindcss"` in `apps/portfolio-web/src/app/globals.css`.
- CSS variables for `--background`, `--foreground`, `--font-sans`, and `--font-mono`.
- Geist Sans and Geist Mono loaded through `next/font`.
- Existing page styles using Tailwind utility classes, mostly `stone`, `zinc`, and `teal`.
- Automatic dark-mode variables through `prefers-color-scheme`, but the current page UI is primarily light-themed.

Future tokens should fit this setup and can be added through CSS variables and Tailwind v4 `@theme` values.

## Design Tokens

### Colour Tokens

Transcribed from `apps/portfolio-web/src/app/globals.css`, which is the source of truth. Every screen style in the app resolves through these; no component uses a raw palette class.

| Token                      | Light value            | Dark value            | Tailwind reference        | Usage                                                                                                                                                |
| -------------------------- | ---------------------- | --------------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--color-page`             | `#fafaf9`              | `#111110`             | `stone-50` / near black   | Page background.                                                                                                                                     |
| `--color-surface`          | `#ffffff`              | `#18181b`             | `white` / `zinc-900`      | Cards, panels, CV sections.                                                                                                                          |
| `--color-surface-muted`    | `#f4f4f5`              | `#27272a`             | `zinc-100` / `zinc-800`   | Tags, segmented-control tracks, grouped areas.                                                                                                       |
| `--color-text`             | `#18181b`              | `#f4f4f5`             | `zinc-900` / `zinc-100`   | Primary text.                                                                                                                                        |
| `--color-text-muted`       | `#3f3f46`              | `#d4d4d8`             | `zinc-700` / `zinc-300`   | Secondary text, body copy, metadata.                                                                                                                 |
| `--color-text-subtle`      | `#71717a`              | `#a1a1aa`             | `zinc-500` / `zinc-400`   | Dates, helper text, eyebrow labels.                                                                                                                  |
| `--color-border`           | `#d4d4d8`              | `#3f3f46`             | `zinc-300` / `zinc-700`   | Decorative borders and separators only.                                                                                                              |
| `--color-border-strong`    | `#71717a`              | `#71717a`             | `zinc-500` both           | Boundaries of interactive controls. See below.                                                                                                       |
| `--color-accent`           | `#0f766e`              | `#5eead4`             | `teal-700` / `teal-300`   | Links, focus, selected states, small emphasis.                                                                                                       |
| `--color-accent-soft`      | `rgba(15,118,110,.07)` | `rgba(94,234,212,.1)` | teal wash                 | Resting-state background for a bare control with no hover to lean on. `/card`'s Save Contact only, so far - see `docs/design/namecard.md` section 6. |
| `--color-accent-strong`    | `#18181b`              | `#0f766e`             | `zinc-900` / `teal-700`   | Primary button background.                                                                                                                           |
| `--color-accent-warm`      | `#b45309`              | `#fcd34d`             | `amber-700` / `amber-300` | Second accent, scoped to the GridGlow decorative layer. Not used for text elsewhere.                                                                 |
| `--color-focus`            | `#0d9488`              | `#2dd4bf`             | `teal-600` / `teal-400`   | Focus ring.                                                                                                                                          |
| `--color-on-accent`        | `#ffffff`              | `#111110`             | `white` / near black      | Text on `--color-accent`.                                                                                                                            |
| `--color-on-accent-strong` | `#ffffff`              | `#ffffff`             | `white` both              | Text on `--color-accent-strong`.                                                                                                                     |
| `--color-danger`           | `#be123c`              | `#fb7185`             | `rose-700` / `rose-400`   | Error text on the error and not-found pages.                                                                                                         |

Colour direction:

- Use neutral colours for most surfaces and text.
- Use teal as the functional accent for links, focus, and selected states everywhere.
- `--color-accent-warm` (amber) is scoped to GridGlow only. Not for text or borders.
- GridGlow (below) is the one exception to "avoid decorative colour blocks."
- Prefer border and spacing for structure before using strong colour anywhere outside GridGlow.

Two border tokens, deliberately:

- `--color-border` is decorative — card outlines, section rules, dividers. It is intentionally low-contrast (1.5:1 light, 1.7:1 dark) and must not be the only thing identifying a control, because it does not meet the 3:1 that WCAG 1.4.11 requires for that.
- `--color-border-strong` is for anything whose boundary _is_ its affordance: secondary buttons, nav controls, the segmented-control track. Same `zinc-500` in both themes, which clears 3:1 against every surface in both.

### GridGlow, the decorative layer

`GridGlow` (`components/atoms/GridGlow.tsx`, `.grid-glow` in `globals.css`): a faint accent grid plus two corner glows, mounted once per page by `PageShell`, behind the nav and hero. The one place this system spends colour on mood instead of function.

- Built from `color-mix()` against `--color-accent` and `--color-accent-warm`. No hex values of its own.
- `aria-hidden`, `pointer-events-none`. Masked (`mask-image: linear-gradient(to bottom, black, transparent)`) to fade out before a page's prose or CV content.
- Hidden under `print:`.
- Not gated behind `prefers-reduced-motion` — it's static, nothing animates.
- Same in both themes. See "Dark And Light Mode Approach" below.

### Typography Tokens

| Token             |              Size |      Line height | Usage                                                        |
| ----------------- | ----------------: | ---------------: | ------------------------------------------------------------ |
| `text-caption`    |  `0.75rem` / 12px |    `1rem` / 16px | Tags, compact metadata.                                      |
| `text-small`      | `0.875rem` / 14px | `1.25rem` / 20px | Buttons, nav, secondary metadata.                            |
| `text-body`       |     `1rem` / 16px | `1.75rem` / 28px | Default prose and card text.                                 |
| `text-body-large` | `1.125rem` / 18px |    `2rem` / 32px | Intro summaries and important body copy.                     |
| `text-heading-sm` |  `1.25rem` / 20px | `1.75rem` / 28px | Card titles and subsection headings.                         |
| `text-heading-md` |   `1.5rem` / 24px |    `2rem` / 32px | Section headings.                                            |
| `text-heading-lg` |  `2.25rem` / 36px | `2.75rem` / 44px | Page title on mobile and compact pages.                      |
| `text-heading-xl` |  `3.75rem` / 60px |           `1.05` | Homepage name or top-level hero title on large screens only. |

Typography rules:

- Use Geist Sans for interface and content.
- Use Geist Mono for code-like labels, technical IDs, export/debug contexts, and the terminal accents (section eyebrows, the profile handle).
- Keep letter spacing at `0` for normal text.
- Uppercase labels may use modest tracking, but only for short metadata.
- Do not scale font size with viewport width.
- Use `font-semibold` for headings and `font-medium` for metadata or buttons.
- Keep paragraphs comfortable: 16-18px text with generous line height.

### Spacing Tokens

| Token      | Value | Usage                                    |
| ---------- | ----: | ---------------------------------------- |
| `space-1`  |   4px | Tight icon/text gaps.                    |
| `space-2`  |   8px | Tags, compact internal gaps.             |
| `space-3`  |  12px | Button gaps, small stack spacing.        |
| `space-4`  |  16px | Default element spacing.                 |
| `space-5`  |  20px | Card internal spacing on mobile.         |
| `space-6`  |  24px | Card internal spacing on desktop.        |
| `space-8`  |  32px | Section internal groups.                 |
| `space-10` |  40px | Header/footer padding.                   |
| `space-12` |  48px | Mobile section spacing.                  |
| `space-16` |  64px | Desktop section spacing.                 |
| `space-20` |  80px | Large page-level separation when needed. |

Spacing rules:

- Use spacing to clarify grouping before adding dividers or backgrounds.
- Keep section spacing predictable across pages.
- Use smaller gaps inside cards and larger gaps between content sections.
- Avoid large empty hero spacing that pushes useful content too far down.

### Radius Tokens

| Token         |    Value | Usage                                       |
| ------------- | -------: | ------------------------------------------- |
| `radius-full` | `9999px` | Buttons, nav/theme/language controls, tags. |
| `radius-lg`   |     16px | Cards and section panels (`rounded-2xl`).   |

Radius rules:

- Pills (`rounded-full`) for buttons, nav controls, and tags.
- 16px (`rounded-2xl`) for cards and panels.
- Keep radius consistent within each category.

### Shadow Tokens

| Token           | Value                         | Usage                                                    |
| --------------- | ----------------------------- | -------------------------------------------------------- |
| `shadow-none`   | none                          | Default for most layout surfaces.                        |
| `shadow-subtle` | `0 1px 2px rgb(0 0 0 / 0.04)` | Optional card lift where borders alone are insufficient. |

Shadow rules:

- Prefer borders over shadows for structure.
- Cards carry a faint accent-tinted glow (`color-mix()` against `--color-accent`) at rest, stronger on `:hover`. Replaces the flat `shadow-subtle` this token used to describe.
- Avoid deep, floating, or glossy shadows.

### Layout Tokens

| Token                  |            Value | Usage                                       |
| ---------------------- | ---------------: | ------------------------------------------- |
| `container-page`       | `72rem` / 1152px | Main portfolio content width.               |
| `container-reading`    |  `42rem` / 672px | About text, CV summary, long prose.         |
| `container-narrow`     |  `56rem` / 896px | Focused lists and CV content.               |
| `container-wide`       | `80rem` / 1280px | Project grids or dense comparison sections. |
| `page-padding-mobile`  |             24px | Default horizontal page padding.            |
| `page-padding-tablet`  |             32px | Tablet page padding.                        |
| `page-padding-desktop` |             40px | Desktop page padding.                       |

Layout rules:

- Center page content in a max-width container.
- Use one column by default on mobile.
- Use two-column layouts only when comparison or sidebar context improves scanning.
- Keep CV content readable; do not stretch long text across wide screens.

## Colour Usage

Use the palette this way:

- Page background: warm neutral `stone-50` or `--color-page`.
- Primary text: `zinc-950` or `--color-text`.
- Secondary text: `zinc-600` or `--color-text-muted`.
- Borders: `zinc-200` for default, `zinc-300` for interactive edges.
- Accent: `teal-700` for links, labels, focus states, and selected controls.
- Strong actions: dark neutral background with white text, or teal when the action is directly related to navigation or CV.

Avoid:

- Large teal sections.
- Purple/blue gradients.
- Decorative colour anywhere outside GridGlow.
- The amber accent used for text, borders, or tag backgrounds — GridGlow's glow only.
- Low-contrast grey text on pale backgrounds.

## Component Styling Rules

### Navbar

- Minimal horizontal nav on desktop.
- Compact menu or wrapped links on mobile.
- Use text links or simple buttons with clear labels.
- Keep primary nav to Home, About, Experience, Projects, CV, and Contact.
- Active state may use accent text, underline, or subtle border.

### Page Sections

- Use full-width page flow with constrained inner content.
- Prefer simple section headings with optional short eyebrow labels.
- Separate major sections with spacing and occasional borders.
- Do not wrap entire page sections in floating cards.

### Cards

Default card style:

- Background: `--color-surface`.
- Border: `1px solid --color-border`, brightening to `--color-accent` on hover.
- Radius: `radius-lg` / 16px (`rounded-2xl`).
- Padding: 20px mobile, 24px desktop.
- Shadow: faint accent glow at rest, stronger on hover.

Cards should be used for repeated items such as projects, experience entries, skill groups, and CV export options. Avoid cards inside cards.

### Project Cards

Project cards should show:

- Category/status metadata.
- Title.
- Short summary.
- Tech stack tags.
- 2-3 highlights when space allows.
- Evidence links such as GitHub, demo, paper, or artifact.

Project cards should optimize for fast reading. Images are optional and should only be used when they clarify the project.

### CV Sections

CV sections should prioritize readability and export usefulness:

- Clear section heading.
- Compact metadata rows for dates, organizations, locations, and role labels.
- Bulleted highlights with enough spacing for scanning.
- Role-specific project and skill ordering.
- Export controls grouped near the CV header or toolbar.

### Buttons

Button types:

- Primary: dark neutral background, inverse text.
- Secondary: white or surface background, neutral border, primary text.
- Text link: accent colour with underline on hover/focus.

Button rules:

- Height: 40-44px for common controls.
- Radius: `radius-full` (pill) — matches nav controls and tags.
- Padding: 12-16px horizontal.
- Use clear labels.
- Keep hover, focus, active, and disabled states visible.
- Do not use animated or oversized call-to-action styles.

### Tags And Badges

- Use muted neutral backgrounds.
- Radius: `radius-full` (pill).
- Keep labels short.
- Use small text with adequate contrast.
- Do not rely on tag colour alone to communicate meaning.

## Dark And Light Mode Approach

Dark mode is implemented and shipped. This section previously said to keep the project light-first and to withhold a manual theme switcher until dark surfaces were finished; the code moved past that, and the position below replaces it.

How it works:

- Three sources, in order: `:root` / `[data-theme="light"]` for light, `[data-theme="dark"]` for an explicit choice, and a `prefers-color-scheme: dark` block for visitors who have expressed no choice. The dark values are duplicated between the last two, so a change to one must be made in both.
- `GlobalNav` writes the choice to `localStorage` and sets `data-theme` on the document element. An inline bootstrap script in the root layout applies the stored theme before first paint, which is what prevents a light flash on load.
- Error boundaries can render outside the root layout, so they call `applyStoredTheme()` themselves rather than relying on that script.

Rules:

- Components use semantic tokens only. No component may use a raw Tailwind palette class (`bg-zinc-900`, `text-white`) for screen styles — audited 2026-08-03, zero remaining.
- `print:` overrides are the one exception, since print is always dark-on-white regardless of theme.
- Any new token must be defined in all three blocks above, and checked for contrast in both themes before use.

## Accessibility Notes

- Text contrast should meet WCAG AA at minimum. Verified 2026-08-03 across every token pair the app actually uses, in both themes: all text pairs clear 4.5:1, all control boundaries and focus rings clear the 3:1 that WCAG 1.4.11 requires for non-text. The tightest margins are subtle text on page in light (4.63:1) and the segmented-control track border in dark (3.08:1) — treat those two as the constraint when adjusting neutrals.
- Focus states must be visible on all links, buttons, and controls.
- Interactive targets should be at least 40px tall, with 44px preferred for mobile.
- Use semantic headings in document order.
- Do not use colour alone for selected, active, warning, or status states.
- Respect `prefers-reduced-motion`.
- Keep text readable on mobile and avoid cramped multi-column layouts.
- Ensure all external links have clear labels and safe behavior.

## Acceptance Criteria

- The system uses native CSS, Tailwind utilities, and existing project styling conventions.
- Tokens are small enough to implement in `globals.css` or Tailwind v4 theme values without a heavy UI library.
- Typography supports recruiter scanning and comfortable long-form CV reading.
- Colours remain neutral, professional, and calm, with teal used only as a controlled accent.
- Spacing and layout rules support mobile-first pages and readable desktop widths.
- Card, button, link, navbar, project, and CV section styles are defined clearly enough for future implementation.
- Shadows are intentionally minimal: a faint accent glow, not deep or decorative.
- Light and dark mode carry the same signature identity (GridGlow, radius, second accent). Neither is the plain fallback for the other.
- Accessibility requirements are part of the visual system, not an afterthought.
