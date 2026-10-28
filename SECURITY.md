# Security policy

This is the source of a personal portfolio site, https://patstudio.vercel.app. It has no accounts, no forms and no database, so the realistic problems are in the site's code, its dependencies and its configuration.

## Reporting a problem

Email **napatchol.tha@gmail.com**. English or Thai is fine.

Please include:

- what you found and where (a URL, a file, or a package name),
- the steps to reproduce it,
- what you think an attacker could do with it.

Please do not open a public issue or pull request for a security problem before it is fixed. Do not test with real personal data, and do not run scans that could slow the site for other visitors.

This is a one-person project with no bug bounty. I will acknowledge a report as soon as I can, fix real problems, and credit you if you want.

## What is in scope

- The live site and the code in this repository.
- Dependencies that this repository ships, when the flaw can be reached from the site.

## What is not in scope

- Vercel's own platform. Report that to Vercel.
- Reports that only say a header or setting could be stricter, with no way to use the gap.
- Missing rate limiting or denial-of-service tests.

## Machine-readable contact

The same contact is published as `/.well-known/security.txt` ([RFC 9116](https://www.rfc-editor.org/rfc/rfc9116)). Its `Expires` date is renewed once a year, and a test fails once the date has passed.
