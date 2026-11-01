# Portfolio Web (2026)

This is the main web application for the **2026 Portfolio Platform**, built with [Next.js](https://nextjs.org) (App Router).

## Purpose

`portfolio-web` provides the user interface for the portfolio and the dynamic CV engine. It is designed to be fast, SEO-friendly, and capable of rendering role-specific content from structured data.

## Core Responsibilities

- **Portfolio Rendering**: Showcasing projects, skills, and professional history.
- **Dynamic CVs**: Generating role-targeted CV pages based on URL parameters.
- **Exporting**: Providing API routes for exporting CV data in JSON and Markdown formats.
- **Internationalization (i18n)**: Supporting multiple languages (English and Thai).

## Commands

From the root:

```bash
bun run dev:portfolio
bun run build:portfolio
```

From this directory:

```bash
bun run dev
bun run build
bun run lint
bun run typecheck
```

## Routing Structure

The application uses Next.js App Router with the following key routes:

| Path                  | Description                                                            |
| :-------------------- | :--------------------------------------------------------------------- |
| `/`                   | Main landing page (Root)                                               |
| `/cv`                 | Default CV view (Role: Full-Stack Engineer, Lang: English)             |
| `/cv/[role]`          | Role-specific CV view                                                  |
| `/[lang]/cv/[role]`   | Language and role-specific CV view (e.g., `/th/cv/fullstack_engineer`) |
| `/cv/export/json`     | API route to download CV data as JSON                                  |
| `/cv/export/markdown` | API route to download CV data as Markdown                              |

## Integration

This application consumes two primary internal packages:

- **[`@patorsiang/content`](../packages/content)**: Provides the structured data (JSON) and Zod schemas.
- **[`@patorsiang/cv-engine`](../packages/cv-engine)**: Provides the logic for filtering, ranking, and building the CV output.

## Styling

The project uses **Tailwind CSS v4** for styling, following a clean and modern aesthetic.

## Development Notes

- Routing parameters `lang` and `role` are validated using the `cv-engine` logic.
- Metadata is dynamically generated for each role/language combination to optimize SEO.
- The project follows the [Code Quality](../docs/architecture/code-quality.md) and [Architecture](../docs/architecture/monitoring.md) guidelines established in the `docs/` folder.
