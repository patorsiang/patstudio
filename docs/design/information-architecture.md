# Portfolio Information Architecture

## Purpose

This document defines the first-version information architecture for the portfolio system. It covers pages, routes, navigation, content structure, and the placement of dynamic CV pages.

The IA should support a minimal, content-first developer portfolio that can grow into localized English and Thai pages without adding unnecessary sections or decorative page types.

## Sitemap

```text
/
├── /about
├── /experience
├── /projects
├── /cv
│   └── /cv/[role]
├── /[lang]/cv/[role]
└── /contact
```

Current implementation note: the app already has `/`, `/cv`, `/cv/[role]`, `/[lang]/cv/[role]`, and CV export routes. The canonical CV route is currently localized as `/[lang]/cv/[role]`, for example `/en/cv/fullstack-engineer` and `/th/cv/fullstack-engineer`. The unlocalized `/cv` and `/cv/[role]` routes should remain compatibility or redirect routes unless the product direction changes.

## Route Table

| Route                 | Status                           | Purpose                                                     | Notes                                                                                                                            |
| --------------------- | -------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `/`                   | Current                          | Minimal portfolio homepage and primary entry point.         | Should summarize profile, role direction, featured experience, featured projects, skills, CV links, and contact path.            |
| `/about`              | Planned                          | Focused profile page.                                       | Use when homepage summary is not enough. Keep concise and evidence-based.                                                        |
| `/experience`         | Planned                          | Work, internship, education, awards, and activity timeline. | Should support recruiter scanning by dates, roles, organizations, summaries, highlights, and relevant tags.                      |
| `/projects`           | Planned                          | Project index.                                              | Should list selected public projects with filtering or grouping only when content volume requires it.                            |
| `/cv`                 | Current redirect / planned index | CV entry point.                                             | Current behavior redirects to the canonical default CV. Future version may become a minimal CV role selector.                    |
| `/cv/[role]`          | Current redirect                 | Legacy or convenience CV role route.                        | Redirects to canonical localized CV using default or selected language.                                                          |
| `/[lang]/cv/[role]`   | Current canonical CV             | Dynamic role-specific CV page.                              | Supports `en` and `th` language variants and role slugs such as `fullstack-engineer`, `ai-ml-engineer`, and `security-engineer`. |
| `/contact`            | Planned                          | Direct contact page.                                        | Keep simple: email, professional links, location/time-zone context if useful.                                                    |
| `/cv/export/json`     | Current API                      | CV JSON export.                                             | Utility route, not part of primary navigation.                                                                                   |
| `/cv/export/markdown` | Current API                      | CV Markdown export.                                         | Utility route, not part of primary navigation.                                                                                   |

## Navigation Model

### Primary Navigation

Primary navigation should stay short and stable:

- Home: `/`
- About: `/about`
- Experience: `/experience`
- Projects: `/projects`
- CV: `/cv`
- Contact: `/contact`

For the first public version, it is acceptable for the homepage to contain the core content sections while planned detail pages are introduced later. Do not add navigation items for pages that do not have a clear content purpose.

### CV Navigation

CV navigation should expose role variants without making the main navigation busy.

- The primary nav item should be `CV`.
- `/cv` may present a compact role selector in the future.
- Role pages should use canonical localized URLs: `/[lang]/cv/[role]`.
- Supported first-version role slugs:
  - `fullstack-engineer`
  - `ai-ml-engineer`
  - `security-engineer`
- Supported first-version languages:
  - `en`
  - `th`

The CV page should make language switching and export actions available in context, not in the global primary navigation.

### Secondary And Footer Navigation

Footer navigation should provide utility access without duplicating every page interaction:

- GitHub
- LinkedIn
- Email
- CV
- Optional: source repository or project links when useful

Footer links should be direct, readable, and keyboard accessible. Avoid large footer sections, marketing copy, or repeated content blocks.

The one exception to "avoid large footer sections" is a short privacy line in English and Thai, stating that the site uses Vercel Web Analytics and Speed Insights and giving the email for data questions (Thailand PDPA, QA card c25). It is plain text, not links.

## Page Purposes And Content Sections

### Homepage `/`

Purpose: provide the fastest complete read of the candidate.

Main sections:

- Profile header: name, role, location, short headline, primary contact links.
- Role direction: concise statement of software engineering focus and global tech readiness.
- About preview: 1-3 short paragraphs from profile content.
- Featured experience: small set of recent or role-relevant work and internship items.
- Featured projects: selected project cards ranked by relevance.
- Core skills: grouped technical skills from the CV/content model.
- CV call-to-action: link to the default canonical CV and role-specific variants when appropriate.
- Contact call-to-action: email and professional links.

Homepage content should remain scannable. It should not become a long version of every detail page.

### About `/about`

Purpose: explain professional profile, working style, and background in more depth.

Main sections:

- Short biography.
- Engineering focus.
- Interests relevant to software work, such as AI, cybersecurity, product systems, and reliable web applications.
- Location and global work context.
- Professional links.

Avoid personal storytelling that does not support hiring decisions or professional context.

### Experience `/experience`

Purpose: show work history, education, and relevant activities in a structured timeline.

Main sections:

- Work experience.
- Internships.
- Education.
- Awards or activities when relevant.
- Role, organization, location, dates, summary, highlights, and tags for each item.

Experience should be easy to scan by date and role. Keep long descriptions out of the first view unless there is a strong reason.

### Projects `/projects`

Purpose: show engineering evidence through selected work.

Main sections:

- Project index header with concise context.
- Featured or role-relevant projects first.
- Project cards or rows.
- Optional filters by role, category, or technology only when project count requires them.

Project structure:

- Title.
- Short summary.
- Role or contribution.
- Category and status.
- Tech stack.
- 2-3 key highlights or outcomes.
- Links, prioritizing source code, live demo, paper, or artifact.
- Optional testing notes or limitations for technical credibility.

Project cards should optimize for scanning. A card should answer what it is, what was built, what technologies were used, and where evidence can be reviewed.

### CV Index `/cv`

Purpose: route users to the most relevant CV.

Current behavior: redirects to the default canonical CV.

Future minimal version:

- Default CV link.
- Role variant links.
- Language selection.
- Export options if useful.

Do not make `/cv` a large marketing page. It should be a practical entry point into generated CV outputs.

### Dynamic CV `/[lang]/cv/[role]`

Purpose: provide role-specific, language-specific CV output generated from the content and CV engine.

Main sections:

- Header: name, target title, location, contact links.
- Summary: role-specific intent plus profile summary.
- Skills: role-ranked skill groups.
- Experience: role-ranked work and internship entries.
- Projects: role-ranked project evidence.
- Education.
- Languages.
- Optional awards or activities.
- Export actions.

Behavior:

- Invalid language or role should return not found.
- Canonical URLs should include language.
- Unlocalized CV routes should redirect to canonical localized routes.
- CV content should remain aligned with shared content data and role configuration.

### Contact `/contact`

Purpose: provide clear ways to reach the candidate.

Main sections:

- Email.
- GitHub.
- LinkedIn.
- Location.
- Short professional contact note if needed.

Avoid forms unless there is a concrete reason to own form handling and spam prevention.

## Future Expansion Notes

- Add localized non-CV routes only when the content model supports English and Thai consistently.
- Consider route aliases such as `/en` or `/th` only after the homepage and main pages have localized versions.
- Add project detail pages only if project content grows beyond what cards or rows can explain.
- Add filtering for projects and experience only when content volume makes it useful.
- Keep CV role variants driven by the CV engine rather than hand-authored one-off pages.
- Keep utility export routes out of primary navigation.
- Avoid adding blog, services, testimonials, gallery, or case-study sections until there is enough high-quality content and a clear user need.

## Acceptance Criteria

- Main public pages are limited to Home, About, Experience, Projects, CV, and Contact.
- Primary navigation remains short and recruiter-friendly.
- Footer navigation exposes only useful utility and professional links.
- CV routes have a clear canonical model with localized dynamic pages.
- `/cv` and `/cv/[role]` behavior is documented as redirect or compatibility behavior unless redesigned.
- Homepage content supports fast screening without duplicating every detail page.
- Project cards have a consistent evidence-first structure.
- The IA supports English and Thai growth without requiring immediate full localization of every page.
- The first public version remains minimal and avoids unnecessary pages.
