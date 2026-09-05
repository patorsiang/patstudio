# Code Quality

## ESLint

ESLint is used for correctness, React, TypeScript, and Next.js rules.

Run:

```bash
bun run lint
```

## Prettier

Prettier is used for formatting. Linting and formatting are intentionally separate.

Run:

```bash
bun run format
bun run format:check
```

`legacy-v1` is ignored by Prettier to avoid formatting churn in the preserved production app.

## Security

This project follows a "Security in Depth" approach to prevent HTML injection and XSS.

### 1. Data Validation

All content is validated using Zod in `packages/content/src/schemas/`.
URLs are restricted to safe protocols (`http`, `https`, `mailto`, `tel`) at the schema level to prevent malicious data from entering the system.

### 2. Sanitization Utilities

Standardized security utilities are provided in `@patorsiang/utils`:

- `sanitizeUrl(url)`: Rejects dangerous protocols like `javascript:` and `data:`. Use this for all dynamic `href` attributes.
- `sanitizeHTML(html)`: Uses `DOMPurify` to strip dangerous tags. Use this before rendering any raw HTML content.

### 3. Rendering Standards

- **React Escaping**: Rely on React's default escaping for plain text.
- **HTML Content**: Use the `<SanitizedHTML />` component in `apps/portfolio-web` or `sanitizeHTML` with `dangerouslySetInnerHTML` for trusted HTML from data files.
- **Dynamic Links**: Always wrap dynamic URLs with `sanitizeUrl`.

### 4. Dependency Auditing

`bun run security:audit` fails on any **high**-severity advisory in the dependency tree, and CI runs it on every push (`Audit dependencies`, in the `checks` job). Treat a red audit as a build failure like any other — do not merge past it.

Transitive versions are pinned through the `overrides` block in the root `package.json`. Reach for an override only when a dependent pins a vulnerable version it will not update on its own; prefer `bun update` first.

> **Never `bunx` a tool in CI.** `bunx <tool>` resolves npm's `latest`, not the version in `bun.lock`, so the tool CI runs can change with no commit. `bunx playwright install` installed browsers for whatever Playwright shipped that morning while the pinned runner looked for a different build id — CI went red on an unchanged repo the day 1.63.0 was published. Call the workspace binary through a package script (`bun run test:e2e:install`) so the lockfile decides. The same rule killed `bun-types: "latest"`: a floating version is an unpinned input, and unpinned inputs fail on someone else's release schedule.

> **`bun.lock` is the only lockfile.** CI rejects any committed `yarn.lock`, `package-lock.json` or `pnpm-lock.yaml` (`Reject stray lockfiles`). This is not tidiness. A stray lockfile changes nothing about what gets installed, so it drifts silently and forever — and security scanners read it as the truth. `legacy-v1/yarn.lock` outlived the migration to bun workspaces still pinning `next@14.2.1`, which carries a critical middleware auth bypass (`GHSA-f82v-jwr5-mffw`) and a dozen highs, while the workspace actually resolved `next@15.5.x`. Snyk failed the PR on a version nobody had installed. A phantom lockfile is worse than no lockfile: it gives confident, specific, wrong answers, and the noise trains you to dismiss the scanner.
>
> Snyk cannot read `bun.lock`, so with the stray file gone it scans manifests directly. If it ever needs a lockfile it can parse, generate one in CI as a throwaway artifact — never commit it.

> **Bun caveat:** bun (as of 1.3.11) supports only **flat** overrides. Scoped keys — `"minimatch/brace-expansion"`, in either `overrides` or `resolutions` — are silently ignored, not rejected. If you write one, nothing will warn you; it simply will not apply. Always confirm an override landed by checking `bun.lock`.

#### Why there is no dependabot for npm

`.github/dependabot.yml` covers **github-actions only**. Dependabot edits `package.json` but cannot write `bun.lock`, and CI installs with `--frozen-lockfile` — so every npm PR it opened failed at the install step with `error: lockfile had changes, but lockfile is frozen`. Four accumulated over three weeks, none mergeable by anyone.

Dependency security is covered better without it: `bun run security:audit` fails the build on any high advisory on **every push**, not weekly, and the register below records what is deliberately not fixed. Version currency is a deliberate `bun update`, which writes the lockfile the way the rest of the repo expects.

If npm updates are ever re-enabled, the lockfile write has to be solved first — otherwise the PRs are dead on arrival again.

#### Accepted dependency risks

Each ID below is in the `--ignore` list of the `security:audit` script. Every one is **DoS-class, dev/build-time only, and unreachable from the deployed application** — none of these packages ship in the production bundle or run on a request path.

**Do not add an ID to that list without adding its entry here, including why it cannot be fixed.** Re-check this table whenever the toolchain is upgraded; entries should be removed as fixes become available.

> **A suppression is a claim, and claims go stale.** This table once carried a `js-yaml` row asserting that `4.1.1` was the final `4.x` release and that only `5.x` was patched. Both were false — `4.3.2` ships under the `v4-legacy` dist-tag, and `bun audit` itself reported the vulnerable range as `>=4.0.0 <4.3.0`. Two live high advisories were suppressed on that reasoning. Before accepting a risk, check the advisory's own **fixed range** against every published dist-tag (`bun pm view <pkg> dist-tags`), not just `latest`.

| Package           | Advisories                                                          | Reached via                                                                        | Why it is not fixed                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| :---------------- | :------------------------------------------------------------------ | :--------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `brace-expansion` | `GHSA-mh99-v99m-4gvg`, `GHSA-rgw5-rvv9-x895`, `GHSA-3jxr-9vmj-r5cp` | `eslint`, `eslint-config-next`, `@storybook/nextjs-vite` — all via `minimatch@3.x` | Two major lines are installed. The fix (`1.1.18`) applies only to the `minimatch@3.x` → `brace-expansion@1.x` path, but `minimatch@10.x` needs `brace-expansion@5.x` and imports the **named** `expand` export, which `1.x` (CJS, default export only) does not provide. A flat override would break `typescript-eslint` and `glob`, and bun ignores scoped overrides (see caveat above). Fixable only when the upstream toolchain drops `minimatch@3.x`. |
| `image-size`      | `GHSA-w3rx-r6r6-pgpr`, `GHSA-5p2g-fcmc-qvqq`                        | `@storybook/nextjs-vite`                                                           | **No fixed version exists.** The latest published release (`2.0.2`) is itself inside the vulnerable range. Nothing to upgrade to.                                                                                                                                                                                                                                                                                                                         |

## SonarQube / SonarCloud

`sonar-project.properties` provides the foundation for future SonarQube or SonarCloud analysis.

The intended checks are:

- Code smell tracking
- Maintainability review
- Duplication tracking
- Security hotspot review

No real `SONAR_TOKEN` is committed. Add scan tokens through GitHub Actions secrets or Sonar project settings.

## Coding Conventions

### Naming Standards

- **Files & Folders**: Use `kebab-case` for all files and directories (e.g., `code-quality.md`, `portfolio-web/`).
- **React Components**: Use `PascalCase` for component files and function names (e.g., `CvPageContent.tsx`).
- **Types & Interfaces**: Use `PascalCase` for TypeScript types and interfaces.
- **Variables & Functions**: Use `camelCase` for general logic, variables, and utility functions.
- **Constants**: Use `UPPER_SNAKE_CASE` for global constants.

### Project Structure

- **Monorepo**: Powered by Bun Workspaces. Shared logic belongs in `packages/`.
- **Apps**: Next.js applications live in `apps/`. They follow the App Router structure.
- **Packages**:
  - `src/index.ts`: Public API entry point.
  - `src/schemas/`: Zod validation schemas.
  - `src/types/`: TypeScript definitions.
- **Documentation**: All architectural and requirement documents live in `docs/`.

### Development Workflow

The project follows a "Requirement-First" workflow to ensure technical integrity:

1.  **Requirement**: Update or create requirements in `docs/requirements/`.
2.  **Schema**: Define or adjust data models in `packages/content/src/schemas/`.
3.  **Tests**: Add unit tests for logic or data transformation in `packages/cv-engine/`.
4.  **Implementation**: Build the feature in the relevant app or package.
5.  **Validation**: Run the "Safety Check" before pushing:
    ```bash
    bun run lint && bun run typecheck && bun run build:portfolio
    ```
