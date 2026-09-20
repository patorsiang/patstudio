import type { Post } from "../types/post";

export type PostSummary = Omit<Post, "body">;

/**
 * Enough to render the index when GitHub is unreachable.
 *
 * Committed rather than fetched on purpose: without it, a GitHub outage during
 * a deploy produces an empty /posts, and a build that depends on a third party
 * being up is not reproducible. Bodies are not included - a stale body is worse
 * than a link to the source.
 *
 * Update when a post is added. The e2e suite asserts every slug here still
 * resolves, so a deleted or renamed post fails loudly rather than 404ing for
 * readers.
 */
export const POST_FALLBACK: readonly PostSummary[] = [
  {
    slug: "four-frameworks-one-question-2026",
    title:
      "TH-AI Passport Gave Me Four Prompt Frameworks. A 20-Minute Talk Gave Me the Better Question",
    date: "2026-09-06",
    summary:
      "Reviewing TH-AI Passport, Anthropic's free courses and the 4Ds; prompt frameworks vs. delegation; a first-hand test of Thai text rendering.",
    tags: ["ai", "prompt-engineering", "ai-literacy", "events"],
    maturity: "published",
    lang: ["en", "th"],
    elsewhere: [
      "https://medium.com/@napatcholthaipanich_6231/th-ai-passport-gave-me-four-prompt-frameworks-a-20-minute-talk-gave-me-the-better-question-0d2714578e21",
    ],
  },
  {
    slug: "four-months-without-ai-2026",
    title: "What I Learned from 4 Months Without AI Coding Tools (and 2 Months with Them)",
    date: "2026-08-01",
    summary:
      "Probation without any agentic AI, then Claude and Antigravity — and what actually changed.",
    tags: ["ai", "career", "learning"],
    maturity: "published",
    lang: ["en", "th"],
    elsewhere: [
      "https://medium.com/@napatcholthaipanich_6231/what-i-learned-from-4-months-without-ai-coding-tools-and-2-months-with-them-a1f656f0535a",
    ],
  },
  {
    slug: "bkkjs-summer-2026",
    title: "Insights from BKK.js Summer 2026",
    date: "2026-06-14",
    summary:
      "Web performance, WebAssembly, WebMCP, AI-assisted engineering, and event reflections.",
    tags: ["events", "web-performance", "ai"],
    maturity: "published",
    lang: ["en", "th"],
    elsewhere: [
      "https://medium.com/@napatcholthaipanich_6231/insights-from-bkk-js-summer-2026-3da45118d868",
    ],
  },
  {
    slug: "gdg-buildwithai-2026",
    title: "Vibe Coding & Agentic AI: Key Takeaways from ChaiyoGCP & Build with AI Bangkok 2026",
    date: "2026-03-22",
    summary: "AI-assisted development, agentic systems, GenUI, and event reflections.",
    tags: ["events", "ai", "genui"],
    maturity: "published",
    lang: ["en", "th"],
    elsewhere: [
      "https://medium.com/@napatcholthaipanich_6231/vibe-coding-agentic-ai-key-takeaways-from-chaiyogcp-build-with-ai-bangkok-2026-2d8397b79e09",
    ],
  },
  {
    slug: "sec-girl-6-2025",
    title: "สรุปงาน Sec-Girl #6",
    date: "2025-12-14",
    summary:
      "AI in Cybersecurity — ช่วง AI Governance และ AI Workshop จากงาน Sec-Girl ครั้งที่ 6 ที่ ม.เกษตรศาสตร์ บางเขน",
    tags: ["events", "security", "ai", "governance"],
    maturity: "raw-note",
    lang: ["th"],
    canonical:
      "https://medium.com/@napatcholthaipanich_6231/%E0%B8%AA%E0%B8%A3%E0%B8%B8%E0%B8%9B%E0%B8%87%E0%B8%B2%E0%B8%99-sec-girl-6-327174c79b59",
    elsewhere: [],
  },
  {
    slug: "css-meetup-2023",
    title: "Overall of CSS Meetup 16.08.2023",
    date: "2023-08-17",
    summary:
      "Notes from CSS Meetup Bangkok: aspect-ratio against layout shift, content-visibility for render performance, and what CSS in 2023 was worth knowing.",
    tags: ["events", "css", "web-development"],
    maturity: "raw-note",
    lang: ["en", "th"],
    canonical:
      "https://medium.com/@napatcholthaipanich_6231/overall-of-css-meetup-16-08-2023-1289d8b615f2",
    elsewhere: [],
  },
  {
    slug: "react-meetup-2023",
    title: "Overall of React Meetup 21.06.2023",
    date: "2023-06-22",
    summary:
      "Notes from React Meetup Bangkok: Redux-Saga for side effects and testability, headless components, Astro, and Next.js.",
    tags: ["events", "react", "nextjs", "web-development"],
    maturity: "raw-note",
    lang: ["en", "th"],
    canonical:
      "https://medium.com/@napatcholthaipanich_6231/overall-of-react-meetup-21-06-2023-70530e4898d0",
    elsewhere: [],
  },
  {
    slug: "design-system-book-summary-2023",
    title: "My First Book Summary — Design System (2023.05)",
    date: "2023-05-30",
    summary:
      "สรุป Design Systems Handbook (DesignBetter.co) — จากการเป็นผู้ใช้ MUI / Ant / Chakra UI มาสนใจการทำ design system เอง",
    tags: ["design-system", "frontend", "book-summary"],
    maturity: "raw-note",
    lang: ["th"],
    canonical:
      "https://medium.com/@napatcholthaipanich_6231/my-first-book-summary-design-system-2023-05-828e123f6ed",
    elsewhere: [],
  },
];
