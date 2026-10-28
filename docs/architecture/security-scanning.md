# Security Scanning

This repository includes security scanning foundations but no real tokens.

## Snyk

Snyk can be used later for dependency vulnerability scanning and remediation tracking.

Do not commit `SNYK_TOKEN`. Store real tokens in GitHub Actions secrets or Snyk organization settings.

## Dependabot

`.github/dependabot.yml` is configured for:

- GitHub Actions updates
- npm/Bun workspace dependency updates

## Dependency Audit

Future CI can add Bun or npm audit checks once the expected policy is defined.

## Secrets Scanning

Real secrets must not be committed. Use `.env.example` files for names only and configure real values in:

- GitHub Actions secrets
- Vercel project environment variables
- New Relic account settings
- SonarCloud/SonarQube project settings
- Snyk organization settings

## Reporting a vulnerability

`SECURITY.md` at the repository root tells a researcher where to send a report, and `apps/portfolio-web/public/.well-known/security.txt` publishes the same contact for tools (RFC 9116). Both use the owner's public email.

`security.txt` carries an `Expires` date, and readers are told to ignore the file after it. Renew the date once a year, before it passes. `e2e/security-txt.e2e.ts` fails once the date is in the past, and also if it is set more than a year ahead.
