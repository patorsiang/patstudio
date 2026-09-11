# Portfolio Web Requirements

## 0. Document Status

**Project:** Personal Portfolio Web + CV Generator
**Owner:** Napatchol Thaipanich
**Version:** v1.0
**Status:** Final requirements draft for MVP planning
**Primary Goal:** Build a minimal, professional, recruiter-readable portfolio for global software engineering opportunities, especially AI full-stack roles.

---

## 1. Product Summary

This project is a personal portfolio website that presents Napatchol as an **AI full-stack developer** with strong web engineering skills, product thinking, design awareness, technical curiosity, and international career ambition.

The website should not feel like a static resume page only. It should act as a living professional hub that can show:

* Work experience
* Academic background
* Featured side projects
* Playground/tutorial-based learning projects
* Technical writing / think-in-public notes
* Game-related experiments, tools, and interactive systems
* Open-source/public learning activity
* Certificates and external professional profiles
* Hobbies and personality
* CV generation from structured portfolio data
* Future multi-language support

The portfolio should communicate both professionalism and personality: easy to work with, serious about engineering, creative, interactive, and still human.

Games and open source should not look like random interests. They should be framed as part of the same engineering story: building interactive systems, learning from public communities, sharing knowledge, and improving through visible practice.

---

## 2. Main Goals

## 2.1 Career Goals

Primary focus: **global software engineering jobs**, especially **AI full-stack roles**.

The site should help with:

* Applying to full-stack / frontend / AI full-stack / software engineering roles
* Showing readiness for international opportunities
* Showing growth toward stronger engineering, AI, cybersecurity, game, open-source, and product skills
* Supporting freelance opportunities as a secondary benefit
* Presenting selected work without exposing proprietary company details
* Building a public technical profile through selected repositories, writeups, certificates, profile links, and contribution history
* Showing long-term interest in game-related technology, interactive products, and creative engineering

## 2.2 Product Goals

The website should:

* Be clean, fast, responsive, and easy to navigate
* Be minimal for the first public version, with subtle interactivity only
* Apply SEO and make it easy for AI-assisted search/readers to understand, including clear metadata and `llms.txt`
* Show professional credibility quickly on the homepage
* Allow deeper exploration through selected project case studies
* Make side projects look intentional, not random
* Present games as an engineering/product interest, not only as entertainment
* Present open source as evidence of learning, communication, collaboration, and public engineering discipline
* Present certificates and external profiles in a curated, customizable way
* Generate or export a CV based on the same structured data
* Support multiple languages in later versions

---

## 3. Target Audience

## 3.1 Primary Audience

* Recruiters
* Hiring managers
* Engineering managers
* Technical interviewers
* Potential freelance clients

## 3.2 Secondary Audience

* Hackathon judges
* Tech community members
* Collaborators
* Open-source maintainers
* Game / interactive media teams
* Friends and network contacts
* Future scholarship or postgraduate reviewers

---

## 4. Personal Positioning

## 4.1 Core Message

> AI full-stack developer who can design, build, and ship practical software across web, native apps, AI, security, games, open source, and product-focused systems.

Shorter homepage version:

> AI full-stack developer building practical, human-centred software across web, AI, security, and interactive systems.

## 4.2 Name and Identity

Use both names intentionally:

* **Napatchol Thaipanich** — professional name for recruiters, CV, LinkedIn, and formal identity
* **patorsiang** — developer handle / sub-brand for GitHub, side projects, writing, and public learning

Recommended homepage framing:

> Napatchol Thaipanich, also known as patorsiang, is an AI full-stack developer focused on practical software, product thinking, and learning in public.

## 4.3 Supporting Pillars

Napatchol’s portfolio positioning should be grouped into five clear pillars instead of a flat list of interests.

### 1. Engineering Core

This is the foundation of the portfolio.

* Full-stack engineering
* Frontend craft and interaction design
* UX/UI design
* Maintainable software architecture
* Practical product delivery

Public-facing message:

> I design and build practical software that connects frontend experience, backend logic, and real user needs.

### 2. AI, Security, and Technical Depth

This pillar shows technical curiosity and depth beyond standard web development.

* AI and machine learning projects
* Cybersecurity and CTF interest
* Blockchain and financial system experience
* Data-driven and system-level thinking

Public-facing message:

> I am interested in technical systems where software, data, security, and real-world trust meet.

### 3. Games and Interactive Systems

Games should be presented as a serious creative-technical interest that connects to software engineering, not only as entertainment.

This pillar may include:

* Game training tools
* Simulation tools
* Interactive learning systems
* Game UI/UX experiments
* Mechanics prototypes
* Web-based mini-games
* Game analytics or strategy tools
* CTF-style gamified learning systems

Public-facing message:

> I am interested in games because they combine systems thinking, interaction design, feedback loops, performance, storytelling, and user motivation.

This supports future opportunities in:

* Game tech
* Gamified education
* Interactive product design
* Simulation tools
* Training platforms
* Entertainment technology

### 4. Open Source and Learning in Public

Open source should be presented as evidence of public learning, consistency, collaboration, and engineering maturity.

This pillar may include:

* Public repositories
* Reusable components
* Small developer tools
* Documentation improvements
* CTF writeups
* Learning notes
* Issue/PR participation
* Project templates
* Experiment logs

Public-facing message:

> I use open source to learn in public, document my engineering decisions, share useful tools, and build a visible technical profile.

Open source should not only mean “many GitHub repos.” It should show:

* Clear README files
* Good commit history
* Thoughtful documentation
* Reasonable project structure
* Useful issue tracking where appropriate
* Honest project status labels
* Safe public visibility rules

### 5. Unique Background and Global Direction

This pillar makes the portfolio more memorable and personal.

* Law background as a unique perspective
* International education and global ambition
* Side-project builder mindset
* Cross-domain curiosity
* Ability to connect technical, product, legal, and human contexts

Public-facing message:

> My background helps me look at software from multiple angles: engineering, product, risk, learning, and people.

## 4.4 Personal Learning Philosophy

The portfolio should subtly reflect a personal learning philosophy inspired by family wisdom, without directly presenting it as a private quote.

Core ideas to disguise:

* Everyone can be a teacher in some context
* Skills are learnable when observed, practised, and repeated
* If someone else can build something, it means the path is possible to study and follow

Possible public-facing wording:

> I believe useful lessons can come from anyone, anywhere, and that difficult skills become reachable when they are broken down, practised, and rebuilt step by step.

This philosophy can appear through:

* About page copy
* Learning timeline
* Think in Public posts
* Project reflection sections
* Small visual motifs, such as three passing dots, three path lines, or mentor/learner nodes
* Playground framing that shows learning from tutorials, peers, communities, and open-source examples

The site should not mention private family details too directly unless intentionally added later.

## 4.5 Personality to Show

The site should feel:

* Professional
* Thoughtful
* Creative
* Curious
* Reliable
* Friendly
* Slightly playful, but not childish

Tone target:

> Balanced: professional enough for recruiters, personal enough to feel like a real builder.

---

## 5. Site Structure

## 5.1 Main Navigation

Navigation:

1. **Home:** Overview + Highlights + CTA
2. **Work:** Work + Academic
3. **Side Project:** Projects + Playground
4. **Think in Public:** Writing
5. **About:** Me + Hobby
6. **CV:** Web CV + PDF + Role-based Variants

## 5.2 Project Sub-Categories

The Side Project section should support tags/categories such as:

* Web
* AI / ML
* Security / CTF
* Blockchain / FinTech
* Game / Interactive Systems
* Open Source
* Product Experiment
* Academic Project
* Tutorial / Learning

## 5.3 Open Source Placement Decision

Open source should **not** be a separate top-level page for MVP.

For MVP, open-source/public learning should appear through:

* Project tags
* GitHub links
* Project detail pages
* Think in Public posts
* CV/profile links

---

## 6. Page Requirements

Page requirements should follow the main navigation structure.

---

## 6.1 Home: Overview + Highlights + CTA

**Purpose:**

Give a fast, memorable first impression and explain who Napatchol is within 5–10 seconds.

**Content:**

* Hero section
* Short positioning statement
* Professional name + developer handle
* Current role / current focus
* Highlighted skills
* Featured side projects preview
* Work and academic preview
* GitHub / LinkedIn / professional profile links
* Open-source/public learning preview if useful
* Game or interactive systems preview if there is a strong project ready
* CTA buttons

### Suggested CTAs

* View Side Projects
* Download CV
* Contact Me
* Read My Notes
* Explore GitHub
* View LinkedIn

### Requirement

The homepage should quickly answer:

* Who is Napatchol?
* What kind of developer is she?
* What can she build?
* What proof points support her profile?
* What should the visitor click next?

---

## 6.2 Work: Work + Academic

**Purpose:**

Show professional experience and academic background in one coherent career story.

### Content

#### Work Experience

* Secure-D / current full-stack developer role
* Data Wow frontend developer role
* Bank of Thailand system analyst role
* Freelance frontend work
* Internships

#### Academic Background

* MSc Advanced Computer Science, University of Kent
* B.Sc. Information and Communication Technology, Mahidol University
* LL.B. Bachelor of Laws, Ramkhamhaeng University
* High school science-math background

#### Certificates and Profiles

* LinkedIn profile
* GitHub profile
* Public certificate links, if useful
* External learning/coding profiles, if useful
* Competition or hackathon proof links, if useful

**Requirement:**

Each work item should include:

* Company/organisation
* Role
* Time period
* Short context
* Main responsibilities
* Technologies
* Safe public achievements
* What skills the role demonstrates

Each academic item should include:

* Institution
* Degree/programme
* Time period
* Focus areas
* Selected projects
* Relevant skills demonstrated

Each certificate/profile item should include:

* Title
* Provider/platform
* Category
* Date earned or date range, if available
* Credential URL, profile URL, or proof URL
* Visibility: show / hide
* Priority/order
* Related skill tags
* CV relevance: default / role-specific / hidden from CV

### Secure-D Visibility Rule

Current Secure-D work should be shown only as a role description for now.

An anonymised case study may be considered later, after around four months, when it is safer and clearer what can be shared publicly.

### Important Rule

Do not expose proprietary code, private client information, internal architecture, confidential metrics, or private certificate links.

---

## 6.3 Side Project: Projects + Playground

### Purpose

Show serious project work, product thinking, experiments, and learning momentum without making every small project look equal.

This section should separate polished/important projects from smaller experiments.

### Structure

The Side Project page should contain two main areas:

1. **Projects** — selected, stronger case studies or meaningful builds
2. **Playground** — tutorial-following projects, experiments, prototypes, and learning logs

### Project Categories

* Main Projects
* AI / ML Projects
* Security / CTF Projects
* Blockchain / FinTech Projects
* Game / Interactive Systems Projects
* Open Source / Developer Tools
* Product Experiments
* Academic Projects

### Candidate Featured Projects

Final featured projects are not decided yet. A GitHub audit is required first.

Possible candidates:

* Portfolio Web + CV Generator
* SyncHealth / Health Guide App
* Cryptocurrency Rug Pull Detection
* Smart Shoe Prototype
* Food101 Image Classification
* CHI Cultural Heritage PWA
* CTF Writeups / Training System
* HOK Training / Skill Drill Tool Concept
* WatchMap / Drama Schedule Concept
* JoyShape / Pain-aware Fitness App Concept
* Open-source project templates or reusable components

### Project Card Fields

Each project card should include:

* Project name
* Category
* Status
* Short description
* Role
* Tech stack
* Key learning
* Link to GitHub, demo, or write-up if available
* Visibility: public / private / case-study only
* Contribution type: solo / team / open source / academic / tutorial
* Testing notes, if available

### Playground Item Fields

Each playground item should include:

* What I tried
* Why I tried it
* What I learned
* What I would improve next
* Current status
* Link to repo/demo/write-up if available
* Whether tests were added, skipped, or planned

### Requirement for Game Projects

Game-related projects should clearly explain the engineering value, such as:

* Interaction design
* State management
* Real-time feedback
* Simulation logic
* Scoring systems
* Game loops
* Data tracking
* UX motivation design
* Performance considerations

For game experiments, also include:

* What mechanic or interaction was tested
* What made it fun, useful, or difficult
* What technical challenge appeared

### Requirement for Open-Source Projects

Open-source projects should clearly show:

* Why the project exists
* Who it helps
* How to run it
* Current status
* What is planned next
* Whether contributions are welcome
* License, if applicable

For open-source experiments, also include:

* What was shared publicly
* What documentation was added
* What could be useful to other developers

**Requirement:**

The Side Project page should make the visitor feel that Napatchol has range and judgment. It should not look like a random dump of every repo.

---

## 6.4 Think in Public: Writing

### Purpose

Show learning process, technical reflection, communication skills, and engineering maturity.

### Possible Sources

* GitHub repo markdown files
* Local MDX files
* Blog posts
* Notes converted from learning sessions

### Content Types

* Technical notes
* CTF writeups
* Project retrospectives
* Course summaries
* Architecture decisions
* Design decisions
* Learning logs
* Game development logs
* Open-source contribution notes
* Repo cleanup/refactoring notes
* Testing/TDD learning notes

**Requirement:**

Each post should have:

* Title
* Date
* Category
* Tags
* Summary
* Reading time
* Source link if relevant

Writing should show how Napatchol thinks, learns, makes decisions, and improves over time.

---

## 6.5 About: Me + Hobby

### Purpose

Tell a coherent personal story and make the site feel human without distracting from professional goals.

### Content

#### Me

* Short personal introduction
* Education background summary
* Career journey
* Why software engineering
* Why AI/security/product
* Why games and interactive systems are interesting
* Why open source matters to personal growth
* Why testing and maintainable code matter
* Personal learning philosophy: learning from people, examples, communities, and practice
* Law background as a differentiator
* Future direction
* Contact links

#### Hobby

* Cooking
* Photography
* Travel
* Piano
* Concerts
* Badminton / swimming / table tennis
* Games as inspiration for interaction, systems, and creativity

### Optional Integrations

* Instagram feed for photography/cooking
* Manually curated gallery first

**Requirement:**

Hobby content should support the personal brand, not distract from professional goals.

Games may appear here as personal inspiration, but serious game-related builds should live under Side Project.

### Tone

Professional, honest, warm, and not overly dramatic.

---

## 6.6 CV: Web CV + PDF + Role-based Variants

### Purpose

Generate a clean CV from structured portfolio data.

### Core Features

* Web CV page
* Downloadable PDF CV
* Print-friendly CV layout
* Role-specific CV variants
* Language-specific CV variants in the future
* Customizable certificate/profile links
* Optional inclusion/exclusion of selected projects, certificates, and external links

### CV Variants

Potential variants:

1. Full-stack Developer CV
2. Frontend Developer CV
3. AI / ML Project CV
4. Security / CTF-oriented CV
5. Game / Interactive Systems CV
6. Open Source / Developer Tools CV
7. Academic/postgraduate CV
8. Freelance profile CV

**Requirement:**

The CV should be generated from structured data rather than manually duplicated in multiple places.

The CV page should make it easy for recruiters or hiring managers to quickly access the most relevant version.

The CV generator should support customizing which certificates, profiles, projects, and links appear in each CV variant.

---

## 7. Content Data Model

Recommended structured content files:

```txt
/content
  /profile
    profile.en.json
    profile.th.json
  /work
    work.en.json
  /projects
    projects.en.json
  /education
    education.en.json
  /skills
    skills.en.json
  /certificates
    certificates.en.json
  /external-profiles
    profiles.en.json
  /open-source
    contributions.en.json
  /game
    game-projects.en.json
  /posts
    example-post.mdx
  /cv
    cv-config.en.json
```

## 7.1 Project Data Fields

```ts
type ProjectItem = {
  title: string
  slug: string
  category: 'web' | 'ai-ml' | 'security-ctf' | 'blockchain-fintech' | 'game-interactive' | 'open-source' | 'product-experiment' | 'academic' | 'tutorial-learning'
  status: 'idea' | 'prototype' | 'in-progress' | 'launched' | 'paused' | 'archived'
  summary: string
  problem?: string
  audience?: string
  role: string
  techStack: string[]
  highlights: string[]
  keyLearning?: string[]
  repoUrl?: string
  demoUrl?: string
  writeupUrl?: string
  imageUrl?: string
  visibility: 'public' | 'private' | 'case-study-only'
  placement: 'featured-project' | 'project' | 'playground' | 'hidden'
  contributionType: 'solo' | 'team' | 'open-source' | 'academic' | 'tutorial'
  testingNotes?: string
}
```

## 7.2 Game Project Data Fields

```ts
type GameProject = {
  title: string
  status: 'idea' | 'prototype' | 'in-progress' | 'launched' | 'paused'
  type: 'mini-game' | 'training-tool' | 'simulation' | 'gamified-learning' | 'game-ui-experiment'
  problem: string
  audience: string
  coreMechanic: string
  technicalFocus: string[]
  techStack: string[]
  demoUrl?: string
  repoUrl?: string
  writeupUrl?: string
  visibility: 'public' | 'private' | 'case-study-only'
  testingNotes?: string
}
```

## 7.3 Open Source Data Fields

```ts
type OpenSourceItem = {
  title: string
  repoUrl: string
  contributionType: 'owner' | 'maintainer' | 'contributor' | 'documentation' | 'learning-repo'
  status: 'active' | 'maintenance' | 'archived' | 'learning'
  description: string
  techStack: string[]
  highlights: string[]
  license?: string
  contributionGuide?: string
  testingNotes?: string
}
```

## 7.4 Certificate Data Fields

```ts
type CertificateItem = {
  title: string
  provider: string
  category: 'course' | 'certification' | 'competition' | 'award' | 'workshop' | 'other'
  date?: string
  credentialUrl?: string
  proofUrl?: string
  skills: string[]
  priority: number
  visibility: 'show' | 'hide'
  cvVisibility: 'default' | 'role-specific' | 'hide'
  relatedRoles?: string[]
}
```

## 7.5 External Profile Data Fields

```ts
type ExternalProfile = {
  platform: 'LinkedIn' | 'GitHub' | 'Credly' | 'LeetCode' | 'Kaggle' | 'Medium' | 'Dev.to' | 'Other'
  label: string
  url: string
  priority: number
  visibility: 'show' | 'hide'
  showOnHome: boolean
  showOnAbout: boolean
  showOnCV: boolean
  relatedRoles?: string[]
}
```

---

## 8. Functional Requirements

## 8.1 Core Website

| ID   | Requirement                                                                                | Priority |
| ---- | ------------------------------------------------------------------------------------------ | -------- |
| F001 | The user can view the homepage                                                             | Must     |
| F002 | The user can view work and academic background                                             | Must     |
| F003 | The user can view side project cards                                                       | Must     |
| F004 | The user can open project detail pages                                                     | Should   |
| F005 | The user can view writing posts                                                            | Should   |
| F006 | The user can view the about page                                                           | Must     |
| F007 | The user can access contact links                                                          | Must     |
| F008 | The user can download the CV PDF                                                           | Must     |
| F009 | The user can switch languages                                                              | Should   |
| F010 | The user can change the theme: dark, light, or follow OS settings                          | Should   |
| F011 | The user can filter side projects by category                                              | Should   |
| F012 | The user can view the hobby gallery                                                        | Could    |
| F013 | The user can view game/interactive project category                                        | Should   |
| F014 | The user can view open-source/public learning category through project tags/details        | Should   |
| F015 | The user can open GitHub links from relevant project cards                                 | Should   |
| F016 | The user can view certificate and external profile links                                   | Should   |
| F017 | The site owner can customize which certificates/profiles are shown through structured data | Should   |
| F018 | The site can show testing notes or quality practices for selected projects                 | Could    |

## 8.2 CV Generator

| ID    | Requirement                                     | Priority |
| ----- | ----------------------------------------------- | -------- |
| CV001 | Generate CV from structured JSON/MDX data       | Must     |
| CV002 | Export/download CV as PDF                       | Must     |
| CV003 | Support one default English CV                  | Must     |
| CV004 | Support role-specific sections                  | Should   |
| CV005 | Support Thai CV version                         | Should   |
| CV006 | Support Korean / Chinese versions               | Could    |
| CV007 | Allow hiding/showing selected projects          | Could    |
| CV008 | Allow CV preview before export                  | Should   |
| CV009 | Support game/interactive systems CV variant     | Could    |
| CV010 | Support open-source/developer tools CV variant  | Could    |
| CV011 | Allow hiding/showing selected certificates      | Should   |
| CV012 | Allow hiding/showing selected external profiles | Should   |

---

## 9. Non-Functional Requirements

The portfolio should feel interactive, dynamic, and modern, while still staying fast, accessible, maintainable, tested, and professional.

## 9.1 Performance

* Fast initial load
* Optimized images
  * Post images are not committed to this repo. They stay at their origin and reach the
    reader through `/_next/image`, which resizes them, re-encodes to AVIF/WebP, and serves
    the result same-origin — so `img-src 'self'` needs no widening and
    `images.remotePatterns` is the allowlist instead.
  * The allowed hosts live in `packages/content/src/posts/image-hosts.ts`, read by both
    `next.config.ts` and `render.ts`. An image from a host not listed there renders as a
    link, not a broken image; adding a host is a one-entry change.
  * `width`/`height` come from `src/lib/post-image-sizes.ts`, generated by
    `bun run --cwd apps/portfolio-web post-images:manifest`. **Run it when a post gains an
    image.** Skipping it costs that image its layout reservation (CLS), nothing more.
  * See `docs/decisions/0002-post-images-through-the-next-optimizer.md`.
* Lighthouse performance target: 90+
* Avoid heavy animation on first load
* Use caching or static generation where possible

## 9.2 Accessibility

* Keyboard navigable
* Good color contrast
* Alt text for images
* Semantic HTML
* Visible focus states
* Theme switcher should be accessible

## 9.3 SEO and AI Readability

* Metadata per page
* Open Graph image: a site-wide default, plus a dynamic per-post image on `/posts/[slug]`
* Sitemap, with `lastModified` on post entries sourced from each post's real publish date
* Robots.txt
* Structured data: `Person` and `WebSite` site-wide, `BreadcrumbList` and `BlogPosting` on post pages
* Google Search Console verification (`GOOGLE_SITE_VERIFICATION`, see `docs/deployment/vercel.md`)
* `llms.txt` for an AI-readable site summary
* Clear project summaries for AI search and retrieval
* Public project pages should explain context without requiring the reader to open GitHub first

## 9.4 Maintainability

* Content should be easy to update
* Project cards should come from data files
* CV should reuse the same data source
* Avoid hardcoding repeated content
* Certificates, profiles, open-source items, and game projects should use reusable schemas

## 9.5 Privacy / Safety

* Do not publish private company information
* Do not publish personal sensitive details beyond intended contact information
* Do not expose private repositories accidentally
* Review every external link before publishing
* Avoid publishing write-ups that reveal private target details or employer-sensitive security information
* Do not publish private certificate links or non-shareable proof links
* Avoid copyrighted assets in game-related demos

## 9.6 Interactivity

* The site should feel interactive, not like a static online resume
* Interactions should support storytelling, navigation, and project exploration
* Animations should be subtle, purposeful, and not distracting
* Interactive elements should work well on desktop and mobile
* Interactivity should not harm performance, accessibility, or readability
* Possible interactive features include project filters, hover states, command palette, timeline interactions, CV preview, theme switcher, language switcher, and small game-like progress indicators

## 9.7 Testing and Quality Engineering

The portfolio should show good engineering practice, not only visual polish.

Testing does not need to be perfect from day one, but the project should move toward a maintainable test strategy.

### Unit Testing

Unit tests should cover:

* Content data parsing and validation
* CV generation logic
* Filtering logic for projects, certificates, and profiles
* Utility functions
* Important UI components where logic exists

### TDD Usage

TDD should be used selectively where it provides value.

Good candidates for TDD:

* CV data transformation
* Role-specific CV filtering
* Project/category filtering
* Certificate/profile visibility rules
* Theme preference logic
* Language routing helpers

TDD is not required for every visual component, especially early design prototypes.

### Suggested Tools

* Vitest for unit tests
* React Testing Library for component behaviour tests
* Playwright for important end-to-end flows later
* GitHub Actions for automated checks later

### Quality Targets

* Important logic should have tests before launch
* UI should be manually tested on desktop and mobile
* Broken links should be checked before publishing
* Build, lint, and test commands should be documented in the README

---

## 10. Technical Direction

## 10.1 Recommended Stack

* Framework: Next.js
* Language: TypeScript
* Styling: Tailwind CSS
* Content: hybrid approach using JSON for structured data and Markdown/MDX for long-form writing or project case studies
* Deployment: Vercel
* Optional CMS later: Contentlayer / Velite / Sanity / Notion-based pipeline
* PDF generation: print CSS for MVP v1, then Playwright print-to-PDF for automated export in a later version
* GitHub data: GitHub API for live or semi-live repository/contribution data, with caching or build-time fallback where needed
* Unit testing: Vitest
* Component testing: React Testing Library
* E2E testing later: Playwright

## 10.2 Rendering Strategy

* SSG for public portfolio pages
* Static generation for projects and posts
* Client-side interactivity only where needed
* Avoid SSR unless there is dynamic/private data
* For GitHub repository/contribution data, prefer API-based fetching with caching rather than fully manual updates
* If live fetching creates reliability or rate-limit issues, fall back to build-time snapshots

## 10.3 Hosting

* Vercel for main portfolio
* GitHub Pages only for static experiment/demo projects where SSR is unnecessary

## 10.4 CV Export Strategy

Recommended approach:

1. **MVP v1:** print CSS and browser print/save-as-PDF
2. **Later version:** Playwright print-to-PDF for automated export
3. **Avoid initially:** React PDF, unless a fully separate PDF layout becomes necessary

Reason:

* Print CSS is fastest to ship
* Playwright gives better automation later
* React PDF can become extra work because it often requires maintaining a separate layout

## 10.5 Quality Workflow

Recommended local workflow:

1. Write or update requirement
2. Write/adjust content schema
3. Add or update unit tests for logic
4. Implement feature
5. Run lint, type check, test, and build
6. Manually check UI on desktop and mobile
7. Update README or notes if behaviour changed

---

## 11. Design Requirements

## 11.1 Visual Direction

The first public version should be **minimal**, not highly interactive.

The design should be:

* Minimal but not boring
* Clean but warm
* Interactive but not noisy
* Balanced between professional and creative-builder tone
* Suitable for an AI full-stack developer identity
* Professional with small playful details

## 11.2 Possible Design Motifs

* Command palette/developer console
* Timeline journey
* Project cards with layered case-study depth
* Small motion interactions
* Language switcher
* Skill constellation/map
* CV preview panel
* Game-like progress indicators used subtly
* Achievement-style badges for learning milestones, without making the site feel childish
* GitHub-style contribution/activity section
* Certificate/profile proof links shown as clean badges or cards
* Subtle three-node or three-path motif representing learning from others
* Step-by-step growth pattern showing that difficult skills can be learned through practice

## 11.3 Avoid

* Too many colours
* Too many animations
* Overly cute design
* Arcade/game-heavy visual direction
* Generic template feeling
* Dumping every project without curation
* Making game interest look unserious
* Showing open-source as a separate empty page or forced homepage section
* Showing empty open-source sections with no explanation
* Showing too many certificates without context

## 11.4 Playfulness Rule

Game-inspired design should be subtle and controlled.

Recommended level:

* 80–90% professional and readable
* 10–20% playful through microinteractions, progress indicators, small badges, hover states, or hidden details

Use game-inspired elements only when they support navigation, learning, progress, or project storytelling.

Avoid making the portfolio look like a game website unless the visitor is viewing a specific game-related project.

---

## 12. Project and GitHub Visibility Rules

## 12.1 Public Repo Candidates

Good for public:

* Portfolio website
* CV generator
* Academic projects already public
* Tutorial playground projects
* CTF writeups without sensitive target info
* Open-source utilities
* Reusable UI components
* Game mechanic prototypes
* Simulation/training tools without copyrighted assets

## 12.2 Private Repo Candidates

Keep private:

* Employer-related code
* Contract/freelance client code
* Projects with private data
* Projects that may conflict with the employment contract
* Early messy prototypes that are not ready to represent the brand
* Game projects using copyrighted assets, ripped resources, or private inspiration boards

## 12.3 Case Study Only

Use case-study-only format when:

* Code cannot be public
* The project is unfinished but conceptually strong
* The main value is product thinking or architecture
* A game-related idea is based on an existing commercial game and should avoid IP problems
* The work shows useful design/engineering thinking, even if the repo stays private

## 12.4 GitHub Audit Requirement

Before selecting featured projects, perform a GitHub audit.

Each repository should be classified as one of:

* Public and feature-worthy
* Public but needs README cleanup
* Public but should move to Playground
* Private
* Case-study only
* Archive
* Needs a new replacement project

Audit criteria:

* Does the repo support the AI full-stack direction?
* Is the README clear enough for recruiters?
* Is the code safe to publish?
* Does it contain private/company/client information?
* Does it have a demo, screenshots, or explanation?
* Does it show engineering quality or learning value?
* Should it appear in Projects, Playground, Writing, or nowhere?

---

## 13. MVP Scope and Version Plan

## 13.1 What “Future Version” Means

“Future Version” means features that are valuable but not needed for the first usable public portfolio.

A feature should go to a future version when:

* It is not required for the first public launch
* It may take extra time or research
* It depends on having more content first
* It adds complexity that could delay the MVP
* It is nice for long-term polish, but not needed for recruiters to understand the profile

To make the roadmap clearer, future ideas are listed below as later MVP versions instead of one vague “future” bucket.

## 13.2 MVP Version 1 — Public Foundation

Goal: launch a minimal, professional portfolio for global software engineering job applications.

Must include:

* Home
* Work
* Side Project
* About
* CV download
* English content only
* Responsive design
* Deployed public URL
* Minimal design with subtle interactivity
* Print-CSS-based CV export or download
* Basic GitHub/LinkedIn profile links
* Theme setting: dark, light, and follow OS
* Basic certificate/profile link structure, even if only a few items are shown
* Basic unit tests for content/schema utilities or CV helper functions
* README with setup, lint, test, build, and deployment instructions

## 13.3 MVP Version 2 — Project Depth and Writing

Goal: make the portfolio stronger through case studies, writing, and better project exploration.

Add:

* Project detail pages
* Playground area inside Side Project
* Think in Public section
* Basic project filters
* Better animation
* First CV generator pipeline
* Open-source/public learning shown only as project tags/filter items, not as a separate top-level page
* Game/interactive systems project category
* GitHub API integration for repository or contribution data
* Initial GitHub audit results: public/private/case-study/new-project classification
* Certificate/profile customization through structured data
* Unit tests for filtering logic and CV visibility rules
* Basic link checking before deploy

## 13.4 MVP Version 3 — Localization and Role-Specific CV

Goal: make the site more useful for different audiences and applications.

Add:

* Thai language
* Role-specific CV variants
* Hobby area inside About
* GitHub/MDX content fetching
* SEO improvements
* Analytics
* GitHub contribution summary
* Game/devlog-style posts
* Customizable certificates per CV variant
* Customizable external profiles per CV variant
* Component tests for key interactive UI components

## 13.5 MVP Version 4 — Advanced Portfolio System

Goal: turn the portfolio into a more complete personal system for public profile, content, and CV.

Add:

* Korean and Chinese language support
* Admin/editor workflow
* More automated CV builder
* Public project roadmap
* Interactive career timeline
* Open-source contribution tracker
* Interactive mini-demo embedded in project pages
* Playwright E2E tests for critical flows
* Automated CI checks using GitHub Actions

## 13.6 MVP Version 5 — Long-Term Expansion

Goal: add advanced polish only after the core portfolio is stable.

Add:

* More advanced AI-readable site metadata
* Better content recommendation between projects/posts
* More automated GitHub activity import
* More advanced certificate/profile verification display
* More polished interactive demos
* Optional CMS integration
* Optional dashboard for editing content without touching code

---

## 14. Definition of Done

## 14.1 MVP v1 Definition of Done

The project is considered done for MVP v1 when:

* Site is deployed
* Homepage clearly explains identity and direction
* Work page is complete and safe to publish
* Side Project page shows 2–4 selected projects or case studies, with weaker/in-progress work placed in Playground
* CV is downloadable
* LinkedIn and GitHub links are visible and correct
* Basic certificate/profile link structure exists, even if only a few items are shown
* Theme setting works: dark, light, and follow OS
* Mobile layout works well
* Contact links work
* No private/confidential information is exposed
* README explains setup, testing, and deployment
* At least a small set of unit tests exists for important logic or data transformation

## 14.2 MVP v2 Definition of Done

For MVP v2, the project is considered stronger when:

* At least 1 open-source/public learning project is presented clearly
* At least 1 game/interactive systems project or concept is presented professionally
* Project filters include game and open-source categories
* Project detail pages explain engineering value, not only screenshots
* Certificate/profile visibility can be controlled from structured data
* CV visibility rules have basic tests

---

## 15. Initial Project Priority

Recommended build order:

1. Define content data model
2. Define certificate and external profile data model
3. Create homepage wireframe
4. Create work and education data
5. Create project data
6. Create CV data/config
7. Add basic unit test setup
8. Build layout and navigation
9. Build theme switcher: dark, light, follow OS
10. Build homepage
11. Build work page
12. Build side project page
13. Build about page
14. Add CV page/download
15. Add certificate/profile links
16. Deploy to Vercel
17. Polish design and animation
18. Add project detail pages
19. Add Think in Public writing section
20. Add open-source/public learning category through tags/details
21. Add game/interactive systems category
22. Add multilingual support
23. Add stronger tests and CI

---

## 16. Decisions and Remaining Questions

## 16.1 Product Decisions

| Question                                                                                                 | Decision                                                                                                                                                       |
| -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Should the portfolio focus more on software engineering jobs, freelance, or a global tech profile first? | Focus on global software engineering jobs first, especially AI full-stack roles.                                                                               |
| Should the first public version be minimal or highly interactive?                                        | Minimal first public version, with subtle interactivity only.                                                                                                  |
| Which 4–6 projects should be featured first?                                                             | Not decided yet. A GitHub audit is required first.                                                                                                             |
| Should current Secure-D work be shown only as role description, or also as an anonymised case study?     | Show only as a role description for now. Consider an anonymised case study after around 4 months, when it is safer to discuss publicly.                        |
| Which game-related idea is safest and strongest to show first?                                           | Not decided yet. Keep game-related work as a future candidate until a safe and strong project is chosen.                                                       |
| Should open-source be shown as a separate page, as a project filter, or as a homepage section?           | Do not create a separate open-source page or homepage section for MVP. Show open-source only through relevant project tags, GitHub links, and project details. |

## 16.2 Technical Decisions

| Question                                                                    | Decision                                                                                                                                                     |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Should CV export use print CSS, Playwright, or React PDF?                   | Use print CSS for MVP v1. Consider Playwright print-to-PDF later for automated export. Avoid React PDF unless a fully separate PDF layout becomes necessary. |
| Should content be JSON, MDX, or a hybrid?                                   | Hybrid. Use JSON for structured data and Markdown/MDX for posts, notes, and project case studies.                                                            |
| Should GitHub repo data be fetched live or manually curated first?          | Prefer live or semi-live GitHub API integration, with caching or fallback snapshots if needed.                                                               |
| Should the first version support only English?                              | Yes. English only for MVP v1.                                                                                                                                |
| Should GitHub contribution data be fetched through API or manually curated? | API.                                                                                                                                                         |
| Should game prototypes be embedded directly or linked as separate demos?    | Both are acceptable depending on design. Embed small/simple demos; link larger demos separately.                                                             |

## 16.3 Branding Decisions

| Question                                                                              | Decision                                                                                                                         |
| ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Should the site use the name “Napatchol Thaipanich” or “patorsiang” more prominently? | Use both. “Napatchol Thaipanich” should be the professional name. “patorsiang” should be the developer handle/sub-brand.         |
| Should the tone be corporate-professional, creative-builder, or balanced?             | Balanced.                                                                                                                        |
| What visual identity best fits the long-term dream?                                   | AI full-stack developer.                                                                                                         |
| How playful can the game-inspired design be before it becomes less professional?      | Keep it 80–90% professional and 10–20% playful. Use playful details only as subtle microinteractions or project-specific motifs. |

## 16.4 Remaining Questions

* Which repositories should be public, private, archived, or case-study only?
* Which 2–4 projects are strong enough for MVP v1 after the GitHub audit?
* Should a new AI full-stack project be created to better match the target identity?
* Which game-related idea is safest to show without copyright/IP concerns?
* What exact homepage copy should introduce “Napatchol Thaipanich / patorsiang”?

---

## 17. Next Writing Tasks

* Finalize homepage copy
* Select first 2–4 featured projects after GitHub audit
* Decide first game/interactive project to show
* Decide first open-source/public learning project to show
* List certificates and external profiles to show first
* Rewrite work experience into portfolio-safe case-study language
* Finalize CV data schema
* Finalize certificate/profile schema
* Define project card template
* Define testing strategy for MVP v1
* Define MVP task backlog
