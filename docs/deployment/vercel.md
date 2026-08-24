# Vercel Deployment

This document outlines the deployment setup for the Patorsiang Portfolio Platform on Vercel.

## Status

- **Development Deployment**: Active
- **Production Deployment**: Cut over. `legacy-v1`'s GitHub Pages workflow (`nextjs.yml`) was removed; `apps/portfolio-web` is the only app built and deployed. `legacy-v1`'s source stays in the repo (`bun run build:legacy` etc. still work locally); only the automated deploy stopped.
- The `patorsiang.github.io` GitHub Pages site has been taken down (repo Settings → Pages disabled). The repo and Vercel project were both renamed to `patstudio`.

## Deployment URLs

- **Production URL**: `https://patstudio.vercel.app` (no custom domain configured yet)
- **Preview URL**: generated per-deploy by `deploy-preview`

## App Deployed

- **Project**: `patstudio`
- **Location**: `apps/portfolio-web`

## Package Manager

- **Bun**: The project uses Bun for installations and builds.

## Vercel Project Settings

| Setting                | Value                          |
| :--------------------- | :----------------------------- |
| **Framework Preset**   | Next.js                        |
| **Root Directory**     | `apps/portfolio-web`           |
| **Build Command**      | `bun run build:portfolio`      |
| **Install Command**    | `bun install`                  |
| **Output Directory**   | Next.js default (`.next`)      |
| **Production Branch**  | `main`                         |
| **Development Branch** | `feat/portfolio-platform-2026` |

## GitHub Actions Workflows

The repository uses automated workflows for deployment:

### Production (`deploy-production.yml`)

- **Trigger**: Push to `main`.
- **Environment**: Pulls settings from the **Production** environment.
- **Build**: Runs `bun run build:portfolio` locally.
- **Result**: Updates the live site (`--prod`).

### Staging / Preview (`ci.yml`, `deploy-preview` job)

- **Trigger**: Push to `feat/portfolio-platform-2026`, Pull Request to `main`, or manual dispatch. Runs after the `checks` job passes.
- **Environment**: Pulls settings from the **Preview** environment.
- **Build**: Runs `bun run build:portfolio` locally.
- **Result**: Generates a temporary Preview URL.

## Monorepo Configuration

The Vercel project is configured as a monorepo. It automatically resolves the following workspace packages:

- `@patorsiang/content`
- `@patorsiang/cv-engine`

These packages are transpiled by Next.js as configured in `apps/portfolio-web/next.config.ts`.

## Environment Variables

The following environment variables should be configured in the Vercel Dashboard:

| Variable                       | Scope      | Required    | Description                                                                                                                                                  |
| :----------------------------- | :--------- | :---------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_APP_ENV`          | Production | Yes         | Set to `production`. Configured.                                                                                                                             |
| `NEXT_PUBLIC_SITE_URL`         | Production | Recommended | `https://patstudio.vercel.app`. Configured (was left pointing at the pre-rename domain `patorsiang-github-io.vercel.app` for a while; corrected 2026-08-24). |
| `NEW_RELIC_LICENSE_KEY`        | Production | Optional    | Private license key for New Relic.                                                                                                                           |
| `NEXT_PUBLIC_NEW_RELIC_APP_ID` | Production | Optional    | Public application ID for New Relic Browser.                                                                                                                 |
| `GOOGLE_SITE_VERIFICATION`     | Production | Recommended | Google Search Console HTML-tag verification code; provided by whoever registers the property, never fabricated.                                              |

Only the Production environment is configured so far - Preview builds still fall back to the defaults in `src/lib/seo.ts`, which is correct: a preview deploy's real URL is different on every run, so a fixed `NEXT_PUBLIC_SITE_URL` would be wrong there.

## Secrets Policy

- **Do NOT commit** `.env` files or `.vercel/` directory to the repository.
- **Do NOT commit** Vercel tokens or deployment secrets.
- Real values must be managed via the **Vercel Dashboard** or **GitHub Actions Secrets**.
- Use `.env.example` files for documenting required variable names with placeholders.

## Deployment Verification

- **Last Checked**: 2026-08-24
- **Result**: Production deployment is active and reachable at `https://patstudio.vercel.app`. Canonical/OG/vCard URLs confirmed pointing at the live domain after correcting `NEXT_PUBLIC_SITE_URL` (see below).
- **Notes**: SEO metadata now falls back to the current production origin.

## Production Cutover TODO

- [ ] Choose a custom domain, if any - currently shipping on the Vercel-assigned `patstudio.vercel.app`.
- [x] Configure production-specific environment variables in Vercel: `NEXT_PUBLIC_APP_ENV`, `NEXT_PUBLIC_SITE_URL`.
- [x] Update `NEXT_PUBLIC_SITE_URL` to the current production domain (had drifted to the pre-rename `patorsiang-github-io.vercel.app`, a dead domain; corrected 2026-08-24, redeployed via `deploy-production.yml`'s `workflow_dispatch`).
- [x] Verify SEO and Open Graph metadata on the live deployment: canonical tags, OG image URLs, and the `/card` vCard's `URL:` field all confirmed pointing at `patstudio.vercel.app`.
- [x] Finalize the `legacy-v1` fallback and archival plan: its GitHub Pages workflow is removed, source stays in the repo unbuilt by default.
- [x] Decide what happens to the already-live GitHub Pages site at `patorsiang.github.io`: disabled in repo Settings. Repo and Vercel project both renamed to `patstudio`.
