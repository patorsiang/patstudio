import type { Experience, Project, SkillGroupId } from "@patorsiang/content";
import type { ExperienceRankDebug } from "./experience-selection";
import type { ProjectRankDebug } from "./project-ranking";
import type { BaseCvRankDebug } from "./types";

export type { BaseCvRankDebug } from "./types";
export type { ExperienceRankDebug } from "./experience-selection";
export type { ProjectRankDebug } from "./project-ranking";

export type CvRoleId =
  "fullstack_engineer" | "ai_ml_engineer" | "security_engineer" | "apple_specialist";
export type CvLanguage = "en" | "th";

export type CvSectionId =
  | "header"
  | "summary"
  | "skills"
  | "experience"
  | "projects"
  | "education"
  | "awards"
  | "languages";

export type CvRankDebug = BaseCvRankDebug;

export type CvLink = {
  readonly label: string;
  readonly url: string;
};

export type CvHeader = {
  readonly name: string;
  readonly targetTitle: string;
  readonly location: string;
  readonly email: string;
  readonly links: readonly CvLink[];
};

export type GeneratedCvSkillGroup = {
  readonly id: string;
  readonly category: SkillGroupId;
  readonly group: string;
  readonly items: readonly string[];
};

export type GeneratedCvExperience = {
  readonly id: string;
  readonly title: string;
  readonly organization: string;
  readonly location: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly summary: string;
  readonly bullets: readonly string[];
  readonly skills: readonly string[];
  readonly rankDebug: ExperienceRankDebug;
};

export type GeneratedCvProject = {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly summary: string;
  readonly technologies: readonly string[];
  readonly links: readonly CvLink[];
  readonly rankDebug: ProjectRankDebug;
};

export type GeneratedCvAdditionalExperience = {
  readonly id: string;
  readonly title: string;
  readonly organization: string;
  readonly dateRange: string;
};

export type GeneratedCvEducation = {
  readonly id: string;
  readonly degree: string;
  readonly organization: string;
  readonly location: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly summary: string;
  readonly bullets: readonly string[];
};

export type GeneratedCvAward = {
  readonly id: string;
  readonly title: string;
  readonly organization: string;
  readonly summary: string;
};

export type GeneratedCvLanguage = {
  readonly name: string;
  readonly level: string;
};

export type GeneratedCVMeta = {
  readonly generatedAt: string;
  readonly roleId: CvRoleId;
  readonly language: CvLanguage;
  readonly maxPages: number;
  readonly sourceVersion: "portfolio-content-v1";
  readonly sectionOrder: readonly CvSectionId[];
  readonly warnings: readonly string[];
};

export type GeneratedCV = {
  readonly meta: GeneratedCVMeta;
  readonly header: CvHeader;
  readonly summary: {
    readonly text: string;
  };
  readonly skills: readonly GeneratedCvSkillGroup[];
  readonly experience: readonly GeneratedCvExperience[];
  readonly additionalExperience: readonly GeneratedCvAdditionalExperience[];
  readonly projects: readonly GeneratedCvProject[];
  readonly education: readonly GeneratedCvEducation[];
  readonly awards: readonly GeneratedCvAward[];
  readonly languages: readonly GeneratedCvLanguage[];
};

export type CvRoleConfig = {
  readonly id: CvRoleId;
  readonly label: string;
  readonly targetTitle: string;
  readonly summaryIntent: string;
  readonly requiredTags: readonly string[];
  readonly preferredTags: readonly string[];
  readonly excludedTags?: readonly string[];
  readonly atsKeywords: readonly string[];
  readonly prioritySkillGroups: readonly SkillGroupId[];
  readonly priorityProjectCategories: readonly Project["category"][];
  readonly priorityExperienceTypes: readonly Experience["type"][];
  readonly sectionOrder: readonly CvSectionId[];
  readonly limits: {
    readonly maxPages: number;
    readonly maxProjects: number;
    readonly maxExperienceItems: number;
    readonly maxBulletsPerExperience: number;
    readonly maxSkillsPerGroup: number;
    readonly maxEducationItems: number;
  };
};

export class CvEngineInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CvEngineInputError";
  }
}

export const roleConfigs = {
  fullstack_engineer: {
    id: "fullstack_engineer",
    label: "Full-Stack Engineer",
    targetTitle: "Full-Stack Developer",
    summaryIntent:
      "Show end-to-end product development ability across frontend, backend, cloud, data, and secure systems.",
    requiredTags: ["frontend", "backend", "web", "software engineering"],
    preferredTags: [
      "vue",
      "nuxt",
      "react",
      "next.js",
      "node.js",
      "api",
      "cloud",
      "database",
      "security",
      "ai",
    ],
    excludedTags: ["private-only", "tutorial-learning"],
    atsKeywords: [
      "JavaScript",
      "TypeScript",
      "Vue.js",
      "Nuxt.js",
      "React",
      "Next.js",
      "Node.js",
      "Express.js",
      "FastAPI",
      "SQL",
      "PostgreSQL",
      "MongoDB",
      "AWS",
      "Docker",
      "Git",
      "Agile",
    ],
    prioritySkillGroups: [
      "programming-fundamentals",
      "frontend",
      "backend-tools",
      "databases",
      "cloud-infrastructure",
      "security-blockchain",
    ],
    priorityProjectCategories: ["web", "ai-ml", "blockchain-fintech", "iot"],
    priorityExperienceTypes: ["work", "internship"],
    sectionOrder: [
      "header",
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "awards",
      "languages",
    ],
    limits: {
      maxPages: 1,
      // Two projects, not three. With three this CV lands 6px over one A4 page, which
      // prints a second sheet holding one line of Languages. CHI is the oldest and
      // least full-stack of the three, so it is the one that goes.
      // 1, not 2. The wider print leading costs ~55px here and this CV had 4px of
      // slack. Rug Pull Detection is the more full-stack of the two (React, FastAPI,
      // Redis, Docker) so Smart Shoe is the one that goes.
      maxProjects: 1,
      maxExperienceItems: 4,
      maxBulletsPerExperience: 3,
      maxSkillsPerGroup: 7,
      maxEducationItems: 2,
    },
  },
  ai_ml_engineer: {
    id: "ai_ml_engineer",
    label: "AI / ML Engineer",
    targetTitle: "AI / Machine Learning Engineer",
    summaryIntent:
      "Emphasize machine learning, applied AI systems, data pipelines, model evaluation, and software engineering ability.",
    requiredTags: ["ai", "machine learning", "python", "data"],
    preferredTags: [
      "deep learning",
      "computer vision",
      "tensorflow",
      "scikit-learn",
      "pandas",
      "research",
      "backend",
    ],
    excludedTags: ["private-only", "tutorial-learning"],
    atsKeywords: [
      "Python",
      "Machine Learning",
      "Deep Learning",
      "TensorFlow",
      "scikit-learn",
      "Pandas",
      "NumPy",
      "Computer Vision",
      "Model Evaluation",
      "FastAPI",
      "Data Processing",
    ],
    prioritySkillGroups: [
      "machine-learning-ai",
      "programming-fundamentals",
      "backend-tools",
      "databases",
      "cloud-infrastructure",
    ],
    priorityProjectCategories: ["ai-ml", "iot", "academic", "blockchain-fintech"],
    priorityExperienceTypes: ["education", "work", "internship"],
    sectionOrder: [
      "header",
      "summary",
      "skills",
      "projects",
      "experience",
      "education",
      "awards",
      "languages",
    ],
    limits: {
      maxPages: 1,
      // 2, not 4. Three fit, but only with 26px of slack. CHI is a cultural-heritage
      // PWA with no ML in it and was the third of the three, so dropping it buys the
      // headroom back without costing this CV anything on-topic.
      maxProjects: 2,
      maxExperienceItems: 3,
      maxBulletsPerExperience: 3,
      maxSkillsPerGroup: 7,
      // 2, not 3. The LL.B. as a third entry puts this CV at 99% of a page - full, but
      // 11px from spilling a second sheet, which one font fallback would do. It is
      // also the least relevant of the three degrees here; Security and Apple keep it.
      maxEducationItems: 2,
    },
  },
  security_engineer: {
    id: "security_engineer",
    label: "Security Engineer",
    targetTitle: "Security-Focused Software Engineer",
    summaryIntent:
      "Show secure software development, cybersecurity learning, CTF activity, cryptography, and blockchain-related security exposure.",
    requiredTags: ["security", "software engineering"],
    // "privacy-tech" earns its place: the PDPA/GDPR consent work is the most
    // security-adjacent employment on the record, and without this tag it scored level
    // with generic freelance frontend and was demoted to a bare Additional Experience
    // line - while the summary above it leaned on that very work. "ctf" is gone
    // because no content entry carries it, so it only diluted the match ratio.
    preferredTags: [
      "cryptography",
      "privacy-tech",
      "blockchain",
      "linux",
      "backend",
      "cloud",
      "python",
    ],
    excludedTags: ["private-only", "tutorial-learning"],
    // GDPR and PDPA are real terms on this CV and real terms in security/privacy job
    // descriptions. "CTF", "RSA" and "Secure Backend" appear nowhere in the content, so
    // they only produced "Missing ATS keyword" warnings and diluted the match ratio -
    // which is what kept the PDPA/GDPR consent work scoring below generic frontend.
    atsKeywords: [
      "Cybersecurity",
      "GDPR",
      "PDPA",
      "Linux",
      "Python",
      "Cryptography",
      "Blockchain",
      "Node.js",
      "Go",
      "Hyperledger Fabric",
    ],
    prioritySkillGroups: [
      "security-blockchain",
      "programming-fundamentals",
      "backend-tools",
      "cloud-infrastructure",
      "databases",
    ],
    priorityProjectCategories: ["security-ctf", "blockchain-fintech", "ai-ml", "iot"],
    priorityExperienceTypes: ["work", "internship", "education", "activity", "award"],
    sectionOrder: [
      "header",
      "summary",
      "skills",
      "experience",
      "awards",
      "projects",
      "education",
      "languages",
    ],
    limits: {
      maxPages: 1,
      // One strong, on-topic project beats three mixed ones here: Smart Shoe and CHI
      // are IoT and cultural-heritage work with no security story, and dropping them is
      // what brings this CV onto a single full page.
      maxProjects: 1,
      maxExperienceItems: 4,
      // 2, not 3. This is how the wider print leading is paid for here, and it is the
      // cheapest way: dropping maxExperienceItems instead would remove the KBTG
      // internship outright - bridging will not bring it back, because it sits
      // against Bank of Thailand with no gap to fill - and dropping an education
      // entry would lose the LL.B. Two bullets a role also scans better than three.
      maxBulletsPerExperience: 2,
      maxSkillsPerGroup: 7,
      // The law degree (LL.B.) is relevant to this role's IP/compliance
      // angle, so security gets one more education slot than the other
      // roles instead of always losing it to the ATS priority ranking.
      maxEducationItems: 3,
    },
  },
  apple_specialist: {
    id: "apple_specialist",
    label: "Apple Specialist",
    targetTitle: "Apple Specialist (Retail, Part-Time)",
    summaryIntent:
      "Show customer-facing communication, fast learning across many tools and platforms, and reliable teamwork - not backend depth.",
    // No experience entry is tagged for retail/customer service - it doesn't
    // exist in the data. These stay broad (the same tags fullstack_engineer
    // uses) so every real work entry stays eligible; ranking below is what
    // actually favors the client-facing ones.
    requiredTags: ["frontend", "web", "software-engineering"],
    preferredTags: ["react", "nextjs", "vue", "nuxt", "dashboard", "cloud", "privacy-tech"],
    excludedTags: ["private-only", "tutorial-learning"],
    atsKeywords: ["Customers", "Clients", "Team", "Requirements", "Support", "Training", "Agile"],
    prioritySkillGroups: ["frontend", "programming-fundamentals"],
    priorityProjectCategories: ["web"],
    priorityExperienceTypes: ["work"],
    // Deliberately omits "skills" and "projects". The reader here is a retail hiring
    // manager, not an engineer: a wall of frameworks and an ESP32 prototype answer a
    // question nobody asked and reinforce "overqualified, will leave in six months".
    // "languages" leads instead - four languages is a direct commercial signal for a
    // Bangkok store, and it was previously the last line on the page.
    sectionOrder: ["header", "summary", "languages", "experience", "education", "awards"],
    limits: {
      maxPages: 1,
      maxProjects: 0,
      // Stays at 3 so Bank of Thailand drops to the compact "Additional Experience"
      // line: the timeline stays continuous without a central-bank System Analyst role
      // headlining a retail application.
      maxExperienceItems: 3,
      maxBulletsPerExperience: 3,
      maxSkillsPerGroup: 5,
      // 3, not 2: the LL.B. is the third entry and this is the CV with room for it.
      // A law degree taken part-time alongside full-time work is an unusual thing
      // to show a retail manager, and it reads as persistence rather than depth.
      maxEducationItems: 3,
    },
  },
} as const satisfies Record<CvRoleId, CvRoleConfig>;

export function getRoleConfig(role: CvRoleId): CvRoleConfig {
  const roleConfig = roleConfigs[role];

  if (!roleConfig) {
    throw new CvEngineInputError(
      `Unsupported role "${role}". Supported CV roles: ${Object.keys(roleConfigs).join(", ")}.`,
    );
  }

  return roleConfig;
}

export function isCvRoleId(value: string): value is CvRoleId {
  return value in roleConfigs;
}

export function isCvLanguage(value: string): value is CvLanguage {
  return value === "en" || value === "th";
}
