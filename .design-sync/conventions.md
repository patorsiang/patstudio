# Conventions - read before building

## Setup (no provider, no wrapper)

Components need **no provider**. Load the stylesheet, then the bundle (React must already be on the page). The bundle itself defines `--font-geist-sans` / `--font-geist-mono` when it loads; `styles.css` ships the Geist `@font-face` files.

```html
<html data-theme="light" class="antialiased">
  <link rel="stylesheet" href="styles.css" />
  <script src="_ds_bundle.js"></script>
```

- `body` is already styled by `styles.css` (page background, text colour, Geist). Do not restyle it.
- **Theme:** set `data-theme="light"` or `data-theme="dark"` on `<html>` (`document.documentElement.dataset.theme = "dark"`). With no attribute the theme follows `prefers-color-scheme`. Every colour below flips with it; never hard-code a hex.
- `class="antialiased"` on `<html>` matches the real app's font smoothing.
- All components are on `window.PortfolioUI`. Links render plain `<a>` (no router); pass real `href`s.

## Styling idiom: CSS custom properties, not utility classes

The component CSS is a **fixed compiled stylesheet** - it only contains the utility classes the components themselves use. Tailwind classes you invent (`gap-4`, `bg-zinc-100`) will silently not exist. For your own layout glue use inline `style` with the tokens:

| Need | Tokens (all verified in `_ds_bundle.css`) |
|---|---|
| Surfaces | `--color-page`, `--color-surface`, `--color-surface-muted` |
| Text | `--color-text`, `--color-text-muted`, `--color-text-subtle` |
| Borders | `--color-border`, `--color-border-strong` |
| Accent | `--color-accent` (teal), `--color-accent-soft`, `--color-accent-strong`, `--color-accent-warm` |
| State | `--color-focus`, `--color-danger` |
| Radius | `--radius-md`, `--radius-lg`, `--radius-2xl` (cards use 2xl) |
| Type | `--text-xs` ... `--text-6xl`, `--font-weight-medium` / `-semibold` / `-bold`, `--font-geist-sans`, `--font-geist-mono` |
| Spacing | `calc(var(--spacing) * N)` (4px unit) |

Interactive targets should be at least 40px tall.

## Where the truth lives

- `styles.css` and its imports (`fonts/fonts.css`, `_ds_bundle.css`) - the real tokens and every compiled class. Read the `:root` blocks in `_ds_bundle.css` before inventing a value.
- `components/<group>/<Name>/<Name>.d.ts` - prop contract; `<Name>.prompt.md` - usage. Note the `.prompt.md` "Examples" are raw Storybook story code (`export const X: Story = {...}`): take the `args` from them, not the wrapper.

## Prop shapes the `.d.ts` files reference but do not define

- `Crumb` = `{ href: string; label: string }` (used by `Breadcrumbs`; `trail` is ordered root to current page, and the last crumb renders as plain text with `aria-current="page"`, not a link)
- `ContactLink` = `{ label: string; href: string; variant?: "primary" | "secondary"; external?: boolean }` (used by `ContactLinks`, `ProfileHeader`; `ProfileHeader` prepends `~/` to `handle` itself)
- `SegmentedLinkItem` = `{ id: string; href: string; label: string; fullLabel?: string; active: boolean }` (used by `SegmentedLinks`; exactly one item has `active: true`)
- `ProjectLink` = `{ label: string; href: string }` (used by `ProjectCard`)

## Composition rules

- `Card` content is for repeated items (projects, experience, skills). **Never nest a Card inside a Card.** `ProjectCard`, `ExperienceCard` and `SkillGroup` already are cards (`variant="card"`, the default); use `variant="plain"` / `"inline"` for a borderless list row.
- `Button` is for actions (`onClick` required); `ButtonLink` / `TextLink` are for navigation (`href`). `variant`: `"primary"` (filled) or `"secondary"` (outlined, default).
- `Breadcrumbs` is a page-level trail (Home / Posts / current page). Place it once above the page title, not inside a Card.
- `GridGlow` is a decorative backdrop pinned to the top of its container (`position: absolute`, full width, 32rem tall, fades out downward): put it inside a `position: relative` container, behind content.
- `RevealOnView` fades its children in once on scroll; it does nothing under `prefers-reduced-motion`.

## One idiomatic build

```jsx
const { ProfileHeader, SkillGroup, ProjectCard } = window.PortfolioUI;

function Page() {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "calc(var(--spacing) * 10) calc(var(--spacing) * 6)" }}>
      <ProfileHeader
        handle="patorsiang"
        name="Napatchol Thaipanich"
        role="Full-Stack Developer"
        headline="I build practical software across frontend, backend, cloud, data, and security-focused product workflows."
        links={[
          { label: "GitHub", href: "https://github.com/patorsiang", external: true },
          { label: "Email", href: "mailto:hello@example.com", variant: "primary" },
        ]}
      />
      <section style={{ display: "grid", gap: "calc(var(--spacing) * 4)", marginTop: "calc(var(--spacing) * 8)" }}>
        <SkillGroup title="Frontend" items={["React", "Next.js", "Tailwind CSS"]} />
        <ProjectCard
          title="Portfolio Content Engine"
          subtitle="Personal platform"
          summary="A structured content and CV generation system."
          technologies={["TypeScript", "Next.js", "Bun"]}
          links={[{ label: "Repository", href: "https://github.com/patorsiang/patstudio" }]}
        />
      </section>
    </main>
  );
}
```
