import { legacyProfileSource } from "./shared";
import type { SkillGroup } from "../types";

export const skills = [
  {
    id: "skills.programming-fundamentals",
    locale: "en",
    source: legacyProfileSource,
    visibility: "public",
    groupId: "programming-fundamentals",
    label: {
      en: "Programming & Fundamentals",
      translated: { th: { value: "Programming & Fundamentals", status: "reviewed" } },
    },
    items: ["Java", "Python", "JavaScript/TypeScript", "C++", "Go", "SQL", "CSS", "HTML", "OOP"],
  },
  {
    id: "skills.frontend",
    locale: "en",
    source: legacyProfileSource,
    visibility: "public",
    groupId: "frontend",
    label: { en: "Frontend", translated: { th: { value: "Frontend", status: "reviewed" } } },
    items: ["React.js", "Next.js", "Angular", "Vue.js", "Nuxt.js", "PWA"],
  },
  {
    id: "skills.backend-tools",
    locale: "en",
    source: legacyProfileSource,
    visibility: "public",
    groupId: "backend-tools",
    label: {
      en: "Backend & Tools",
      translated: { th: { value: "Backend & Tools", status: "reviewed" } },
    },
    items: ["Node.js", "Express.js", "FastAPI", "Git", "Docker", "UiPath"],
  },
  {
    id: "skills.machine-learning-ai",
    locale: "en",
    source: legacyProfileSource,
    visibility: "public",
    groupId: "machine-learning-ai",
    label: {
      en: "Machine Learning & AI",
      translated: { th: { value: "Machine Learning & AI", status: "reviewed" } },
    },
    // Competencies, not just library names: an ML reader wants to know what was done,
    // and each of these is demonstrated in projects.ts - transfer learning and model
    // evaluation in food101 (0.8493 accuracy / 0.8488 macro F1 on 25,250 samples),
    // computer vision in the same, feature engineering and the multi-model pipeline in
    // rugpull-detection.
    items: [
      "Transfer learning",
      "Model evaluation",
      "Computer vision",
      "Feature engineering",
      "TensorFlow",
      "scikit-learn",
      "Pandas",
      "NumPy",
    ],
  },
  {
    id: "skills.cloud-infrastructure",
    locale: "en",
    source: legacyProfileSource,
    visibility: "public",
    groupId: "cloud-infrastructure",
    label: {
      en: "Cloud & Infrastructure",
      translated: { th: { value: "Cloud & Infrastructure", status: "reviewed" } },
    },
    // Scoped 2026-09-15 to what is evidenced elsewhere in this repo and current enough to
    // be interviewed on. Vercel: `.github/workflows/deploy-production.yml` drives the Vercel
    // CLI against a real project, documented in `docs/deployment/vercel.md`. Redis:
    // `projects.ts` rug-pull detection techStack, with a bullet on coordinating backend
    // services. Removed: GCP, Azure, Firebase, IBM Cloud, RabbitMQ (no supporting experience
    // or project anywhere in this data) and AWS (real, but Data Wow only, ended Apr 2023 —
    // it stays on that role's own `skills` list, which is the honest place for it).
    items: ["Vercel", "Redis"],
  },
  {
    id: "skills.security-blockchain",
    locale: "en",
    source: legacyProfileSource,
    visibility: "public",
    groupId: "security-blockchain",
    label: {
      en: "Security, Blockchain & Systems",
      translated: { th: { value: "Security, Blockchain & Systems", status: "reviewed" } },
    },
    items: [
      "RSA cryptography",
      "Blockchain development",
      "Stellar",
      "Hyperledger Fabric",
      "Linux command line",
    ],
  },
  {
    id: "skills.databases",
    locale: "en",
    source: legacyProfileSource,
    visibility: "public",
    groupId: "databases",
    label: { en: "Databases", translated: { th: { value: "Databases", status: "reviewed" } } },
    items: ["PostgreSQL", "MongoDB", "MSSQL", "ER modeling & query optimization"],
  },
  {
    id: "skills.languages",
    locale: "en",
    source: legacyProfileSource,
    visibility: "public",
    groupId: "languages",
    label: { en: "Languages", translated: { th: { value: "ภาษา", status: "reviewed" } } },
    items: [
      "Thai: Native",
      "English: IELTS 6 / CEFR B2",
      "Korean: Elementary (TOPIK 1 / Sejong 2A)",
      "Chinese: HSK 2",
    ],
  },
] as const satisfies readonly SkillGroup[];
