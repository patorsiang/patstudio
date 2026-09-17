import {
  experiences,
  profile,
  projects,
  skills,
  type Experience,
  type Link,
  type Project,
  type TranslatableText,
} from "@patorsiang/content";
import {
  type CvLanguage,
  type CvRoleId,
  type GeneratedCV,
  type GeneratedCvAward,
  type GeneratedCvEducation,
  type GeneratedCvExperience,
  type GeneratedCvLanguage,
  type GeneratedCvProject,
  type GeneratedCvSkillGroup,
  type CvRoleConfig,
  type GeneratedCvAdditionalExperience,
  CvEngineInputError,
  getRoleConfig,
  isCvLanguage,
} from "./config";
import {
  selectBridgingExperiences,
  selectExperiencesForRole,
  type RankedExperience,
} from "./experience-selection";
import { filterProjectsForRole } from "./project-filter";
import { isContentAvailableForLanguage, isMissingTranslation, text } from "./content-language";
import { normalizeTag } from "./normalize";
import { groupSkillsForRole } from "./skill-grouping";
import { rankProjectsForRole, type RankedProject } from "./project-ranking";

const atsMaxAwardItems = 3;

const atsEducationPriority = new Map<string, number>([
  ["education.university-of-kent-msc-advanced-computer-science", 0],
  ["education.mahidol-ict-bsc", 1],
  ["education.ramkhamhaeng-laws", 2],
]);

const fullstackAtsExperienceBullets: Readonly<Record<string, readonly string[]>> = {
  "experience.freelance-frontend-developer": [
    "Delivered 2 client projects end-to-end, including a corporate WordPress site and responsive React/Next.js web interfaces, from requirements gathering through deployment support.",
    "Built client-facing dashboards and web experiences using JavaScript/TypeScript, CSS, HTML, and cloud hosting practices.",
    "Coordinated with clients and collaborators to clarify scope, resolve feedback, and ship production-ready frontend changes.",
  ],
  "experience.datawow-frontend-developer": [
    "Built React and Next.js interfaces for Cookie Wow and PDPA Pro, PDPA/GDPR consent platforms that have since scaled to 9,000+ websites and 600M+ consent records.",
    "Implemented real-time dashboard and LINE bot chat storage features with frontend state, API integration, and release-ready UI behavior.",
    "Delivered frontend changes in Agile product teams across privacy-tech, mock exam, and internal-platform products.",
  ],
  "experience.bank-of-thailand-system-analyst": [
    "Developed and maintained Angular, Node.js, Go, and Hyperledger Fabric components for DLTBond, a blockchain-based government bond platform that cut bond delivery time from 15 days to 2 and has issued over 160 billion baht across 10 bond series since 2020.",
    "Supported ISO 20022 migration through Java updates, requirements analysis, SWIFT-standard alignment, and system testing.",
    "Automated 2-3 procurement and contracting review workflows with UiPath RPA, cutting manual checking time in financial-system operations.",
  ],
  "experience.kbtg-blockchain-developer-internship": [
    "Built a React frontend and Go backend proof of concept integrating the Stellar SDK for a blockchain social-impact application.",
    "Delivered the Time Donation prototype in an Agile team sprint covering frontend, backend, blockchain integration, and demo readiness.",
  ],
  "experience.beid-frontend-developer-internship": [
    "Developed React dashboard and landing-page interfaces for web product prototypes.",
  ],
};

const fullstackAtsProjectSummaries: Readonly<Record<string, string>> = {
  "project.rugpull-detection":
    "Full-stack research prototype using React, FastAPI, Python, Redis, Docker, and TensorFlow to intake contract addresses, run feature extraction, and review DeFi rug-pull risk predictions, reaching 0.94 macro F1 on an 843-contract benchmark.",
  "project.smart-shoe":
    "IoT dashboard prototype using Next.js, ESP32 firmware, BLE, MQTT, and sensor data processing to visualize live step, balance, and fall-risk signals.",
  "project.chi-cultural-heritage-pwa":
    "Progressive web app using JavaScript, Node.js, and MongoDB to deliver offline-capable cultural heritage web and mobile experiences.",
};

const aiMlProjectSummaries: Readonly<Record<string, string>> = {
  "project.rugpull-detection":
    "MSc dissertation. Designed and built a fused multi-model classifier over tabular, Solidity source, opcode, and GRU timeline features, trained on 1,550 labelled contracts and reaching 0.94 macro F1 on an 843-contract benchmark across 6 rug-pull categories. Built the React/Vite and FastAPI workflow around it for contract intake, feature extraction, and prediction review.",
  "project.food101-classification":
    "Computer-vision experiment on the 101-class Food-101 dataset using EfficientNetV2B2 transfer learning, evaluated on 25,250 samples at 0.8493 accuracy and 0.8488 macro F1. Scoped as the classification stage of a nutrition-estimation pipeline; portion-size estimation and nutrition data are not implemented.",
};

const appleExperienceBullets: Readonly<Record<string, readonly string[]>> = {
  "experience.freelance-frontend-developer": [
    "Ran two client projects alone, from the first conversation through to launch and the support that followed.",
    "Handled client communication directly, turning what people asked for into changes we had both agreed on.",
    "Built each project to the client's own requirements rather than to my own preferences.",
  ],
  "experience.datawow-frontend-developer": [
    "Built tools people use daily - consent management, dashboards, a chat-storage system and an online exam platform.",
    "Worked in a product team to agreed release timelines, alongside designers and other engineers.",
  ],
  "experience.sec-playground-fullstack-developer": [
    "Build and maintain the parts of a hands-on cybersecurity training platform that learners work through directly.",
    "Work with the team from building a feature through testing it to putting it in front of users.",
  ],
  "experience.bank-of-thailand-system-analyst": [
    "Worked in a central bank team on financial systems where mistakes are expensive and care matters more than speed.",
  ],
};

const roleExperienceBullets: Partial<
  Record<CvRoleId, Readonly<Record<string, readonly string[]>>>
> = {
  fullstack_engineer: fullstackAtsExperienceBullets,
  apple_specialist: appleExperienceBullets,
};

/**
 * A string with its machine-translated Thai counterpart.
 *
 * CLAUDE.md requires AI-authored Thai to be marked `ai_draft` rather than reviewed or
 * approved. Writing that wrapper out by hand repeated six lines per entry and made the
 * flag easy to set wrong on a copy-paste; there is one place to get it right now.
 */
/** A string whose Thai counterpart has been reviewed and approved, not machine-drafted. */
function approved(en: string, th: string): TranslatableText {
  return { en, translated: { th: { value: th, status: "approved" } } };
}

function aiDraft(en: string, th: string): TranslatableText {
  return { en, translated: { th: { value: th, status: "ai_draft" } } };
}

const roleText = {
  fullstack_engineer: {
    targetTitle: approved("Full-Stack Developer", "Full-Stack Developer"),
    summaryIntent: aiDraft(
      "Full-stack developer at SEC Playground, building cybersecurity, gamified learning, and AI features in Vue.js, Nuxt.js, Node.js, and TypeScript.",
      "นักพัฒนา Full-Stack ที่พัฒนาฟีเจอร์ด้านความปลอดภัยไซเบอร์ gamified learning และ AI ที่ SEC Playground ทำงานประจำวันด้วย Vue.js, Nuxt.js, Node.js และ TypeScript",
    ),
    summaryBody: [
      aiDraft(
        "Five years across startup, central-bank and client work: consent platforms that have since scaled to 9,000+ websites, and a blockchain government bond platform that cut bond delivery from 15 days to 2.",
        "ประสบการณ์ 5 ปีในสตาร์ทอัพ ธนาคารกลาง และงานกับลูกค้าโดยตรง ทั้งแพลตฟอร์มความยินยอมด้านความเป็นส่วนตัวที่ปัจจุบันขยายไปกว่า 9,000 เว็บไซต์ และแพลตฟอร์มพันธบัตรรัฐบาลบน blockchain ที่ลดเวลาส่งมอบพันธบัตรจาก 15 วันเหลือ 2 วัน",
      ),
      aiDraft(
        "MSc Advanced Computer Science with distinction, University of Kent, 2025.",
        "ปริญญาโท MSc Advanced Computer Science ระดับ distinction จาก University of Kent ปี 2025",
      ),
    ],
  },
  ai_ml_engineer: {
    targetTitle: approved("AI / Machine Learning Engineer", "วิศวกร AI / Machine Learning"),
    summaryIntent: aiDraft(
      "Software engineer with hands-on experience in machine learning, applied AI projects, data pipelines, and model evaluation.",
      "วิศวกรซอฟต์แวร์ที่มีประสบการณ์ตรงด้าน machine learning, โปรเจกต์ AI เชิงประยุกต์, data pipelines และการประเมินโมเดล",
    ),
    summaryBody: [
      aiDraft(
        "MSc Advanced Computer Science with distinction, University of Kent, 2025; the dissertation built a machine-learning pipeline over blockchain forensics features, reaching 0.94 macro F1 on an 843-contract benchmark.",
        "ปริญญาโท MSc Advanced Computer Science ระดับ distinction จาก University of Kent ปี 2025 วิทยานิพนธ์พัฒนา machine-learning pipeline บนคุณลักษณะจากการตรวจสอบ blockchain ได้ค่า macro F1 0.94 บนชุดทดสอบ 843 สัญญา",
      ),
      aiDraft(
        "Combines recent, project-based applied ML with five years of production software engineering: React, Vue, Node, Go and SQL-backed systems across a startup, a central bank, and direct client work.",
        "ผสมผสานงาน ML เชิงประยุกต์ระดับโปรเจกต์ในช่วงหลัง เข้ากับประสบการณ์วิศวกรรมซอฟต์แวร์ที่ใช้งานจริง 5 ปี ทั้ง React, Vue, Node, Go และระบบที่ใช้ SQL ในสตาร์ทอัพ ธนาคารกลาง และงานกับลูกค้าโดยตรง",
      ),
    ],
  },
  security_engineer: {
    targetTitle: approved(
      "Security-Focused Software Engineer",
      "Software Engineer ที่เน้นด้านความปลอดภัย",
    ),
    summaryIntent: aiDraft(
      "Software engineer working on security-focused products, with blockchain and privacy-engineering experience behind it.",
      "วิศวกรซอฟต์แวร์ที่ทำงานกับผลิตภัณฑ์ด้านความปลอดภัย โดยมีพื้นฐานจากงานบล็อกเชนและวิศวกรรมด้านความเป็นส่วนตัว",
    ),
    summaryBody: [
      aiDraft(
        "Currently building a hands-on cybersecurity training platform at SEC Playground. Earlier work included DLTBond, a Hyperledger Fabric government bond platform at the Bank of Thailand, and PDPA/GDPR consent systems that have since handled 600M+ consent records.",
        "ปัจจุบันพัฒนาแพลตฟอร์มฝึกอบรมด้านความปลอดภัยไซเบอร์แบบลงมือทำที่ SEC Playground งานก่อนหน้ารวมถึง DLTBond แพลตฟอร์มพันธบัตรรัฐบาลบน Hyperledger Fabric ที่ธนาคารแห่งประเทศไทย และระบบความยินยอมตาม PDPA/GDPR ที่ปัจจุบันรองรับบันทึกความยินยอมกว่า 600 ล้านรายการ",
      ),
      aiDraft(
        "MSc Advanced Computer Science with distinction, University of Kent, 2025, covering computer security, artificial intelligence, IoT and quantum computing.",
        "ปริญญาโท MSc Advanced Computer Science ระดับ distinction จาก University of Kent ปี 2025 ครอบคลุมความปลอดภัยคอมพิวเตอร์ ปัญญาประดิษฐ์ IoT และควอนตัมคอมพิวติง",
      ),
    ],
  },
  apple_specialist: {
    targetTitle: aiDraft(
      "Apple Specialist (Retail, Part-Time)",
      "Apple Specialist (Retail, Part-Time)",
    ),
    summaryIntent: aiDraft(
      "Software developer with five years of software and technical product experience, including direct client-facing freelance work, applying for a part-time Specialist role: understanding what people need, explaining technology clearly, and following a problem through to a solution. Uses MacBook, iPad, iPhone, Apple Watch, Apple TV and AirPods daily.",
      "นักพัฒนาซอฟต์แวร์ที่มีประสบการณ์ด้านซอฟต์แวร์และผลิตภัณฑ์เชิงเทคนิค 5 ปี รวมถึงงานฟรีแลนซ์ที่ทำงานกับลูกค้าโดยตรง สมัครตำแหน่ง Specialist แบบพาร์ทไทม์ ถนัดการทำความเข้าใจความต้องการของผู้ใช้ อธิบายเรื่องเทคนิคให้เข้าใจง่าย และติดตามปัญหาจนแก้ไขได้ ใช้งาน MacBook, iPad, iPhone, Apple Watch, Apple TV และ AirPods เป็นประจำทุกวัน",
    ),
    summaryBody: [
      aiDraft(
        "A year of that was freelance, working with clients directly: establishing what they needed, agreeing the scope, and providing support after launch.",
        "หนึ่งปีในจำนวนนั้นเป็นงานฟรีแลนซ์ที่ทำงานกับลูกค้าโดยตรง ตั้งแต่ทำความเข้าใจความต้องการ ตกลงขอบเขตงาน และดูแลหลังเปิดใช้งาน",
      ),
      aiDraft(
        "Thai and English day to day, with elementary Korean and Chinese.",
        "ใช้ภาษาไทยและอังกฤษเป็นประจำ และมีภาษาเกาหลีกับจีนในระดับเบื้องต้น",
      ),
    ],
  },
} as const satisfies Record<
  CvRoleId,
  {
    readonly targetTitle: TranslatableText;
    readonly summaryIntent: TranslatableText;
    /**
     * Replaces the shared `profile.summary` paragraphs for this role instead of
     * appending to them. Use it when the shared text argues against the application -
     * a retail reader meeting Hyperledger and central-bank work reads "overqualified,
     * will leave", which is the opposite of what the CV needs to say.
     */
    readonly summaryBody?: readonly TranslatableText[];
  }
>;

export function buildCVOutput(role: CvRoleId, lang: CvLanguage): GeneratedCV {
  const roleConfig = getRoleConfig(role);

  if (!isCvLanguage(lang)) {
    throw new CvEngineInputError(`Unsupported CV language "${lang}". Supported languages: en, th.`);
  }

  const filteredProjects = rankProjectsForRole(
    filterProjectsForRole(projects, roleConfig, lang),
    roleConfig,
  ).slice(0, roleConfig.limits.maxProjects);
  const rankedExperiences = selectExperiencesForRole(experiences, roleConfig, lang).slice(
    0,
    roleConfig.limits.maxExperienceItems,
  );
  const bridgingExperiences = selectBridgingExperiences(
    experiences,
    rankedExperiences,
    roleConfig,
    lang,
  );

  const educationSource = publicExperiencesForLanguage(lang)
    .filter((experience) => experience.type === "education")
    .sort(compareAtsEducationPriority)
    .slice(0, roleConfig.limits.maxEducationItems);

  const awardSource = publicExperiencesForLanguage(lang)
    .filter((experience) => experience.type === "award" || experience.type === "activity")
    .sort(compareExperienceDates)
    .slice(0, atsMaxAwardItems);
  const summaryText = buildSummary(roleConfig, lang);
  const skillGroups = groupSkillsForRole(skills, roleConfig, lang).map((skillGroup) => ({
    id: skillGroup.id,
    category: skillGroup.category,
    group: skillGroup.label,
    items: skillGroup.items,
  }));
  // Relevance chooses *which* roles appear; it must not choose the order they are read
  // in. Ranked order alone printed 2023 -> 2026 -> 2021 on the Apple CV, which a reader
  // takes for a mistake. Selection stays score-driven, presentation is chronological.
  const generatedExperience = [...rankedExperiences]
    .sort((a, b) => b.experience.startDate.localeCompare(a.experience.startDate))
    .map((rankedExperience) => toGeneratedExperience(rankedExperience, roleConfig, lang));
  const generatedAdditionalExperience = bridgingExperiences.map((rankedExperience) =>
    toGeneratedAdditionalExperience(rankedExperience, lang),
  );
  const generatedProjects = filteredProjects.map((project) =>
    toGeneratedProject(project.project, roleConfig, project, lang),
  );
  const education = educationSource.map((item) => toGeneratedEducation(item, lang));
  const awards = awardSource.map((item) => toGeneratedAward(item, lang));
  const languages = buildLanguages(lang);

  return {
    meta: {
      generatedAt: new Date().toISOString(),
      roleId: roleConfig.id,
      language: lang,
      maxPages: roleConfig.limits.maxPages,
      sourceVersion: "portfolio-content-v1",
      sectionOrder: roleConfig.sectionOrder,
      warnings: buildWarnings(
        roleConfig,
        filteredProjects,
        rankedExperiences,
        {
          summaryText,
          skills: skillGroups,
          experience: generatedExperience,
          projects: generatedProjects,
          education,
          awards,
          languages,
        },
        educationSource,
        awardSource,
        lang,
      ),
    },
    header: {
      name: text(profile.name, lang),
      targetTitle: text(roleText[roleConfig.id].targetTitle, lang),
      location: text(profile.location, lang),
      email: linkLabel(profile.contact.email, lang),
      links: profile.links.map((link) => toCvLink(link, lang)),
    },
    summary: {
      text: summaryText,
    },
    skills: skillGroups,
    experience: generatedExperience,
    additionalExperience: generatedAdditionalExperience,
    projects: generatedProjects,
    education,
    awards,
    languages,
  };
}

function publicExperiencesForLanguage(lang: CvLanguage) {
  return experiences.filter(
    (experience) =>
      experience.visibility === "public" && isContentAvailableForLanguage(experience.locale, lang),
  );
}

function buildSummary(roleConfig: CvRoleConfig, lang: CvLanguage): string {
  const role = roleText[roleConfig.id];
  const body: readonly TranslatableText[] =
    "summaryBody" in role && role.summaryBody ? role.summaryBody : profile.summary;

  return [text(role.summaryIntent, lang), ...body.map((paragraph) => text(paragraph, lang))].join(
    " ",
  );
}

function buildLanguages(lang: CvLanguage): readonly GeneratedCvLanguage[] {
  const languageGroup = skills
    .filter(
      (group) => group.visibility === "public" && isContentAvailableForLanguage(group.locale, lang),
    )
    .find((skillGroup) => skillGroup.groupId === "languages");

  if (!languageGroup) {
    return [];
  }

  return languageGroup.items.map((item) => {
    const [name, ...levelParts] = formatLanguageItem(item, lang).split(":");

    return {
      name: name.trim(),
      level: levelParts.join(":").trim() || text(languageGroup.label, lang),
    };
  });
}

function toGeneratedExperience(
  rankedExperience: RankedExperience,
  roleConfig: CvRoleConfig,
  lang: CvLanguage,
): GeneratedCvExperience {
  const item = rankedExperience.experience;

  return {
    id: item.id,
    title: text(item.title, lang),
    organization: text(item.organization, lang),
    location: text(item.location, lang),
    startDate: item.startDate,
    endDate: formatOpenEndedDate(item.current ? undefined : item.endDate, lang),
    summary: text(item.summary, lang),
    bullets: buildExperienceBullets(item, roleConfig, lang),
    // The chip row under each role is the loudest "this is an engineer's CV" signal on
    // the page, and a retail reader has no use for it.
    skills: roleConfig.id === "apple_specialist" ? [] : item.skills,
    rankDebug: {
      score: rankedExperience.relevanceScore,
      relevanceScore: rankedExperience.relevanceScore,
      matchedKeywords: rankedExperience.matchedKeywords,
      scoreBreakdown: rankedExperience.scoreBreakdown,
    },
  };
}

function toGeneratedProject(
  item: Project,
  roleConfig: CvRoleConfig,
  rankedProject: RankedProject,
  lang: CvLanguage,
): GeneratedCvProject {
  return {
    id: item.id,
    title: text(item.title, lang),
    subtitle: text(item.role, lang),
    summary: buildProjectSummary(item, roleConfig, lang),
    technologies: item.techStack,
    links: item.links.map((link) => toCvLink(link, lang)),
    rankDebug: {
      score: rankedProject.priorityScore,
      priorityScore: rankedProject.priorityScore,
      matchedKeywords: rankedProject.matchedKeywords,
      scoreBreakdown: rankedProject.scoreBreakdown,
    },
  };
}

function buildExperienceBullets(
  item: Experience,
  roleConfig: CvRoleConfig,
  lang: CvLanguage,
): readonly string[] {
  const roleBullets = lang === "en" ? roleExperienceBullets[roleConfig.id]?.[item.id] : undefined;

  return (roleBullets ?? item.highlights.map((highlight) => text(highlight, lang))).slice(
    0,
    roleConfig.limits.maxBulletsPerExperience,
  );
}

/**
 * A project's own summary is written for the portfolio, where one description serves
 * every reader. A CV has one reader at a time, so a role may restate the same work with
 * the evidence that reader cares about - the ML pipeline for an ML role, the full-stack
 * surface for an engineering one. Everything here still comes from the project's own
 * `highlights`; nothing is added that the source does not already state.
 */
const roleProjectSummaries: Partial<Record<CvRoleId, Readonly<Record<string, string>>>> = {
  fullstack_engineer: fullstackAtsProjectSummaries,
  ai_ml_engineer: aiMlProjectSummaries,
};

function buildProjectSummary(item: Project, roleConfig: CvRoleConfig, lang: CvLanguage): string {
  if (lang === "en") {
    return roleProjectSummaries[roleConfig.id]?.[item.id] ?? text(item.summary, lang);
  }

  return text(item.summary, lang);
}

function compareAtsEducationPriority(a: Experience, b: Experience): number {
  const priorityDifference = getAtsEducationPriority(a) - getAtsEducationPriority(b);

  return priorityDifference === 0 ? compareExperienceDates(a, b) : priorityDifference;
}

function getAtsEducationPriority(item: Experience): number {
  return atsEducationPriority.get(item.id) ?? 99;
}

function compareExperienceDates(a: Experience, b: Experience): number {
  return comparableDate(b.endDate ?? b.startDate) - comparableDate(a.endDate ?? a.startDate);
}

function toGeneratedAdditionalExperience(
  rankedExperience: RankedExperience,
  lang: CvLanguage,
): GeneratedCvAdditionalExperience {
  const item = rankedExperience.experience;

  return {
    id: item.id,
    title: text(item.title, lang),
    organization: text(item.organization, lang),
    dateRange: `${item.startDate} - ${formatOpenEndedDate(item.current ? undefined : item.endDate, lang)}`,
  };
}

function toGeneratedEducation(item: Experience, lang: CvLanguage): GeneratedCvEducation {
  return {
    id: item.id,
    degree: text(item.title, lang),
    organization: text(item.organization, lang),
    location: text(item.location, lang),
    startDate: item.startDate,
    endDate: formatOpenEndedDate(item.current ? undefined : item.endDate, lang),
    summary: text(item.summary, lang),
    bullets: item.highlights.map((highlight) => text(highlight, lang)).slice(0, 1),
  };
}

function toGeneratedAward(item: Experience, lang: CvLanguage): GeneratedCvAward {
  return {
    id: item.id,
    title: text(item.title, lang),
    organization: text(item.organization, lang),
    summary: text(item.summary, lang),
  };
}

function buildWarnings(
  roleConfig: CvRoleConfig,
  rankedProjects: readonly RankedProject[],
  rankedExperiences: readonly RankedExperience[],
  generatedContent: {
    readonly summaryText: string;
    readonly skills: readonly GeneratedCvSkillGroup[];
    readonly experience: readonly GeneratedCvExperience[];
    readonly projects: readonly GeneratedCvProject[];
    readonly education: readonly GeneratedCvEducation[];
    readonly awards: readonly GeneratedCvAward[];
    readonly languages: readonly GeneratedCvLanguage[];
  },
  education: readonly Experience[],
  awards: readonly Experience[],
  lang: CvLanguage,
): readonly string[] {
  const warnings: string[] = [];
  const generatedText = normalizeTag(buildGeneratedCvText(generatedContent));
  const missingKeywords = roleConfig.atsKeywords.filter(
    (keyword) => !generatedText.includes(normalizeTag(keyword)),
  );

  if (missingKeywords.length > 0) {
    warnings.push(`Missing ATS keyword coverage: ${missingKeywords.slice(0, 6).join(", ")}.`);
  }

  if (rankedProjects.length < roleConfig.limits.maxProjects) {
    warnings.push(`Only ${rankedProjects.length} project(s) matched the ${roleConfig.id} role.`);
  }

  const fallbackCount = countMissingTranslations({
    lang,
    roleConfig,
    rankedProjects,
    rankedExperiences,
    education,
    awards,
  });

  if (fallbackCount > 0) {
    warnings.push(
      `${fallbackCount} Thai translation field(s) fell back to English draft/source content.`,
    );
  }

  return warnings;
}

function buildGeneratedCvText({
  summaryText,
  skills: generatedSkills,
  experience,
  projects: generatedProjects,
  education,
  awards,
  languages,
}: {
  readonly summaryText: string;
  readonly skills: readonly GeneratedCvSkillGroup[];
  readonly experience: readonly GeneratedCvExperience[];
  readonly projects: readonly GeneratedCvProject[];
  readonly education: readonly GeneratedCvEducation[];
  readonly awards: readonly GeneratedCvAward[];
  readonly languages: readonly GeneratedCvLanguage[];
}): string {
  return [
    summaryText,
    ...generatedSkills.flatMap((group) => [group.group, ...group.items]),
    ...experience.flatMap((item) => [
      item.title,
      item.organization,
      item.summary,
      ...item.bullets,
      ...item.skills,
    ]),
    ...generatedProjects.flatMap((project) => [
      project.title,
      project.subtitle,
      project.summary,
      ...project.technologies,
    ]),
    ...education.flatMap((item) => [item.degree, item.organization, item.summary, ...item.bullets]),
    ...awards.flatMap((item) => [item.title, item.organization, item.summary]),
    ...languages.flatMap((language) => [language.name, language.level]),
  ].join(" ");
}

function formatLanguageItem(item: string, lang: CvLanguage): string {
  if (lang === "en") {
    return item;
  }

  const translations: Record<string, string> = {
    "Thai: Native": "ไทย: ภาษาแม่",
    "English: IELTS 6 / CEFR B2": "อังกฤษ: IELTS 6 / CEFR B2",
    "Korean: Elementary (TOPIK 1 / Sejong 2A)": "เกาหลี: ระดับต้น (TOPIK 1 / Sejong 2A)",
  };

  return translations[item] ?? item;
}

function formatOpenEndedDate(endDate: string | undefined, lang: CvLanguage): string {
  if (endDate) {
    return endDate;
  }

  return lang === "th" ? "ปัจจุบัน" : "present";
}

function countMissingTranslations({
  lang,
  roleConfig,
  rankedProjects,
  rankedExperiences,
  education,
  awards,
}: {
  readonly lang: CvLanguage;
  readonly roleConfig: CvRoleConfig;
  readonly rankedProjects: readonly RankedProject[];
  readonly rankedExperiences: readonly RankedExperience[];
  readonly education: readonly Experience[];
  readonly awards: readonly Experience[];
}): number {
  if (lang === "en") {
    return 0;
  }

  const fields: TranslatableText[] = [
    profile.name,
    profile.location,
    ...profile.links.map((link) => link.label),
    roleText[roleConfig.id].targetTitle,
    roleText[roleConfig.id].summaryIntent,
    ...profile.summary,
    ...rankedExperiences.flatMap(({ experience }) => [
      experience.title,
      experience.organization,
      experience.location,
      experience.summary,
      ...experience.highlights,
    ]),
    ...rankedProjects.flatMap(({ project }) => [
      project.title,
      project.role,
      project.summary,
      ...project.links.map((link) => link.label),
    ]),
    ...education.flatMap((experience) => [
      experience.title,
      experience.organization,
      experience.location,
      experience.summary,
      ...experience.highlights,
    ]),
    ...awards.flatMap((experience) => [
      experience.title,
      experience.organization,
      experience.summary,
    ]),
  ];

  return fields.filter((field) => isMissingTranslation(field, lang)).length;
}

function toCvLink(link: Link, lang: CvLanguage) {
  return {
    label: text(link.label, lang),
    url: link.url,
  };
}

function linkLabel(link: Link, lang: CvLanguage): string {
  return text(link.label, lang);
}

function comparableDate(value: string): number {
  const [year = "0", month = "1"] = value.split("-");

  return Number.parseInt(year, 10) * 100 + Number.parseInt(month, 10);
}
