import { legacyProfileSource } from "./shared";
import type { Experience } from "../types";

export const experiences = [
  {
    id: "experience.sec-playground-fullstack-developer",
    locale: "en",
    source: legacyProfileSource,
    visibility: "public",
    type: "work",
    title: {
      en: "Full-Stack Developer",
      translated: { th: { value: "Full-Stack Developer", status: "approved" } },
    },
    organization: {
      en: "SEC Playground Co., Ltd.",
      translated: { th: { value: "SEC Playground Co., Ltd.", status: "approved" } },
    },
    location: {
      en: "Bangkok, Thailand",
      translated: { th: { value: "กรุงเทพฯ ประเทศไทย", status: "approved" } },
    },
    startDate: "2026-02",
    current: true,
    summary: {
      en: "Building product features for cybersecurity, gamified learning, and AI-related platform work.",
      translated: {
        th: {
          value:
            "พัฒนาฟีเจอร์ผลิตภัณฑ์ด้าน cybersecurity, gamified learning และแพลตฟอร์มที่เกี่ยวข้องกับ AI",
          status: "reviewed",
        },
      },
    },
    highlights: [
      {
        en: "Developed full-stack features for SECPlayground, a hands-on cybersecurity training platform, across Vue.js, Nuxt.js, Node.js, APIs, and SQL-backed application flows.",
        translated: {
          th: {
            value:
              "พัฒนา full-stack features สำหรับ SECPlayground แพลตฟอร์มฝึกอบรมด้าน cybersecurity แบบลงมือทำจริง ด้วย Vue.js, Nuxt.js, Node.js, APIs และ application flows ที่ใช้ SQL",
            status: "ai_draft",
          },
        },
      },
      {
        en: "Built and maintained user-facing interfaces, backend services, and integration points powering gamified training content and challenges.",
        translated: {
          th: {
            value:
              "สร้างและดูแล user-facing interfaces, backend services และ integration points ที่รองรับเนื้อหาการฝึกอบรมและ challenges แบบ gamification",
            status: "ai_draft",
          },
        },
      },
      {
        en: "Shipped features through the team's Git and CI/CD workflow, covering testing and Linux deployment alongside implementation.",
        translated: {
          th: {
            value:
              "ทำงานร่วมกับทีมตลอดขั้นตอน implementation, testing และ deployment เพื่อนำฟีเจอร์ขึ้นใช้งานจริง",
            status: "ai_draft",
          },
        },
      },
    ],
    skills: [
      "Vue.js",
      "Nuxt.js",
      "Node.js",
      "JavaScript/TypeScript",
      "SQL",
      "Git",
      "Linux",
      "CI/CD",
    ],
    tags: [
      "frontend",
      "backend",
      "web",
      "software-engineering",
      "fullstack",
      "vue",
      "nuxt",
      "nodejs",
      "api",
      "database",
      "security",
      "cybersecurity",
      "ai",
      "gamification",
      "ctf",
    ],
  },
  {
    id: "experience.freelance-frontend-developer",
    locale: "en",
    source: legacyProfileSource,
    visibility: "public",
    type: "work",
    title: {
      en: "Frontend Developer",
      translated: { th: { value: "Frontend Developer", status: "approved" } },
    },
    organization: {
      en: "Freelance",
      translated: { th: { value: "Freelance", status: "approved" } },
    },
    location: {
      en: "Bangkok, Thailand",
      translated: { th: { value: "กรุงเทพฯ ประเทศไทย", status: "approved" } },
    },
    startDate: "2023-06",
    endDate: "2024-05",
    summary: {
      en: "Independent client work for small businesses, run solo from first conversation to launch.",
      translated: {
        th: {
          value: "งานอิสระให้ลูกค้าธุรกิจขนาดเล็ก ดูแลเองตั้งแต่พูดคุยครั้งแรกจนถึงเปิดใช้งานจริง",
          status: "ai_draft",
        },
      },
    },
    highlights: [
      {
        en: "Delivered 2 client web projects end-to-end - from requirements gathering to production deployment - using React, Next.js, and WordPress.",
        translated: {
          th: {
            value:
              "ส่งมอบโปรเจกต์เว็บให้ลูกค้า 2 โปรเจกต์แบบครบวงจร ตั้งแต่เก็บความต้องการจนถึงนำขึ้นใช้งานจริง ด้วย React, Next.js และ WordPress",
            status: "ai_draft",
          },
        },
      },
      {
        en: "Built responsive web and dashboard interfaces matched to each client's design specifications and hosting requirements.",
        translated: {
          th: {
            value:
              "สร้างเว็บและ dashboard แบบ responsive ให้ตรงกับ design specifications และความต้องการด้าน hosting ของลูกค้าแต่ละราย",
            status: "ai_draft",
          },
        },
      },
      {
        en: "Managed client communication directly, translating feedback into scoped, production-ready changes.",
        translated: {
          th: {
            value:
              "สื่อสารกับลูกค้าโดยตรง และแปลง feedback ให้เป็นการเปลี่ยนแปลงที่กำหนดขอบเขตชัดเจนและพร้อมใช้งานจริง",
            status: "ai_draft",
          },
        },
      },
    ],
    skills: ["React", "Next.js", "WordPress", "Cloud Hosting"],
    tags: ["frontend", "web", "react", "nextjs", "dashboard", "cloud", "software-engineering"],
  },
  {
    id: "experience.datawow-frontend-developer",
    locale: "en",
    source: legacyProfileSource,
    visibility: "public",
    type: "work",
    title: {
      en: "Frontend Developer",
      translated: { th: { value: "Frontend Developer", status: "approved" } },
    },
    organization: {
      en: "Data Wow Co., Ltd.",
      translated: { th: { value: "Data Wow Co., Ltd.", status: "approved" } },
    },
    location: {
      en: "Bangkok, Thailand",
      translated: { th: { value: "กรุงเทพฯ ประเทศไทย", status: "approved" } },
    },
    startDate: "2021-12",
    endDate: "2023-04",
    summary: {
      en: "Developed frontend features for privacy-tech, dashboard, and internal-platform products in a fast-moving product team.",
      translated: {
        th: {
          value:
            "พัฒนา frontend features สำหรับผลิตภัณฑ์ด้าน privacy-tech, dashboard และ internal platform ในทีมผลิตภัณฑ์ที่ทำงานรวดเร็ว",
          status: "reviewed",
        },
      },
    },
    highlights: [
      {
        en: "Built interfaces for Cookie Wow and PDPA Pro, PDPA/GDPR consent-management platforms that have since grown to 9,000+ websites and 600M+ consent records.",
        translated: {
          th: {
            value:
              "พัฒนา interfaces สำหรับ Cookie Wow และ PDPA Pro แพลตฟอร์มจัดการ consent ด้าน PDPA/GDPR ที่ปัจจุบันเติบโตถึงกว่า 9,000 เว็บไซต์ และ consent record กว่า 600 ล้านรายการ",
            status: "ai_draft",
          },
        },
      },
      {
        en: "Implemented dashboards, a LINE bot chat storage system, and a mock exam platform, each with real-time data handling needs.",
        translated: {
          th: {
            value:
              "พัฒนา dashboard ระบบจัดเก็บแชต LINE bot และแพลตฟอร์ม mock exam ซึ่งแต่ละระบบต้องจัดการข้อมูลแบบ real-time",
            status: "ai_draft",
          },
        },
      },
      {
        en: "Worked with agile product teams to deliver frontend changes within planned release timelines.",
        translated: {
          th: {
            value: "ทำงานร่วมกับทีม agile เพื่อส่งมอบงาน frontend ตามรอบ release ที่วางไว้",
            status: "reviewed",
          },
        },
      },
    ],
    skills: ["Next.js", "React", "Ruby", "AWS", "Agile"],
    tags: [
      "frontend",
      "web",
      "react",
      "nextjs",
      "dashboard",
      "cloud",
      "privacy-tech",
      "real-time",
      "software-engineering",
    ],
  },
  {
    id: "experience.bank-of-thailand-system-analyst",
    locale: "en",
    source: legacyProfileSource,
    visibility: "public",
    type: "work",
    title: {
      en: "System Analyst",
      translated: { th: { value: "System Analyst", status: "approved" } },
    },
    organization: {
      en: "Bank of Thailand",
      translated: { th: { value: "Bank of Thailand", status: "approved" } },
    },
    location: {
      en: "Bangkok, Thailand",
      translated: { th: { value: "กรุงเทพฯ ประเทศไทย", status: "approved" } },
    },
    startDate: "2019-11",
    endDate: "2021-11",
    summary: {
      en: "Contributed to financial-system projects in a central bank environment, spanning blockchain infrastructure, ISO 20022 migration, testing, and workflow automation.",
      translated: {
        th: {
          value:
            "มีส่วนร่วมในโปรเจกต์ระบบการเงินภายในสภาพแวดล้อมของธนาคารกลาง ครอบคลุม blockchain infrastructure, ISO 20022 migration, testing และ workflow automation",
          status: "reviewed",
        },
      },
    },
    highlights: [
      {
        en: "Worked on DLTBond, a blockchain-based government bond platform (Angular, Node.js, Go, Hyperledger Fabric) that cut bond delivery time from 15 days to 2 and has issued over 160 billion baht across 10 bond series since 2020; developed internal dashboards and maintained the system.",
        translated: {
          th: {
            value:
              "ทำงานในโปรเจกต์ DLTBond แพลตฟอร์มพันธบัตรรัฐบาลที่ใช้ blockchain (Angular, Node.js, Go, Hyperledger Fabric) ซึ่งช่วยลดระยะเวลาส่งมอบพันธบัตรจาก 15 วันเหลือ 2 วัน และออกพันธบัตรไปแล้วกว่า 160,000 ล้านบาทใน 10 รุ่น นับตั้งแต่ปี 2020 พัฒนา dashboard ภายในและดูแลระบบ",
            status: "ai_draft",
          },
        },
      },
      {
        en: "Supported ISO 20022 migration work through Java updates, requirements analysis, SWIFT-standard alignment, and system testing.",
        translated: {
          th: {
            value:
              "สนับสนุนงาน ISO 20022 migration ผ่านการปรับปรุง Java วิเคราะห์ requirements และทดสอบระบบ",
            status: "reviewed",
          },
        },
      },
      {
        en: "Automated 2-3 procurement and contracting review workflows using UiPath RPA, cutting manual checking time.",
        translated: {
          th: {
            value:
              "ทำ automation ให้กับ workflow การตรวจสอบด้าน procurement และ contracting จำนวน 2-3 workflow ด้วย UiPath RPA เพื่อลดเวลาตรวจสอบแบบ manual",
            status: "ai_draft",
          },
        },
      },
    ],
    skills: ["Angular", "Node.js", "Go", "Hyperledger Fabric", "Java", "UiPath"],
    tags: [
      "backend",
      "blockchain",
      "fintech",
      "nodejs",
      "go",
      "java",
      "automation",
      "software-engineering",
    ],
  },
  {
    id: "experience.kbtg-blockchain-developer-internship",
    locale: "en",
    source: legacyProfileSource,
    visibility: "public",
    type: "internship",
    title: {
      en: "Blockchain Developer",
      translated: { th: { value: "Blockchain Developer", status: "approved" } },
    },
    organization: {
      en: "KBTG Develop Bootcamp 2019",
      translated: { th: { value: "KBTG Develop Bootcamp 2019", status: "approved" } },
    },
    location: {
      en: "Bangkok, Thailand",
      translated: { th: { value: "กรุงเทพฯ ประเทศไทย", status: "approved" } },
    },
    startDate: "2019-06",
    endDate: "2019-08",
    summary: {
      en: "Built a blockchain proof of concept in an Agile bootcamp environment, combining React frontend work with Go backend development.",
      translated: {
        th: {
          value:
            "พัฒนา blockchain proof of concept ใน bootcamp แบบ Agile โดยทำทั้ง React frontend และ Go backend",
          status: "reviewed",
        },
      },
    },
    highlights: [
      {
        en: "Built Time Donation using React and a Go backend integrated with the Stellar SDK.",
        translated: {
          th: {
            value: "พัฒนา Time Donation ด้วย React และ Go backend ที่เชื่อมกับ Stellar SDK",
            status: "reviewed",
          },
        },
      },
      {
        en: "Developed the proof of concept through a 1-2 month team sprint focused on social-impact use cases.",
        translated: {
          th: {
            value:
              "พัฒนา proof of concept ด้าน social impact ร่วมกับทีมใน bootcamp ระยะเวลา 1-2 เดือน",
            status: "reviewed",
          },
        },
      },
    ],
    skills: ["React", "Go", "Stellar", "Blockchain", "Agile"],
    tags: ["frontend", "backend", "blockchain", "react", "go", "software-engineering"],
  },
  {
    id: "experience.beid-frontend-developer-internship",
    locale: "en",
    source: legacyProfileSource,
    visibility: "public",
    type: "internship",
    title: {
      en: "Frontend Developer",
      translated: { th: { value: "Frontend Developer", status: "approved" } },
    },
    organization: {
      en: "BeID Corporation Co., Ltd.",
      translated: { th: { value: "BeID Corporation Co., Ltd.", status: "approved" } },
    },
    location: {
      en: "Bangkok, Thailand",
      translated: { th: { value: "กรุงเทพฯ ประเทศไทย", status: "approved" } },
    },
    startDate: "2018-06",
    endDate: "2018-07",
    summary: {
      en: "Developed dashboard and landing-page interfaces.",
      translated: {
        th: { value: "พัฒนา interfaces สำหรับ dashboard และ landing page", status: "reviewed" },
      },
    },
    highlights: [
      {
        en: "Developed a dashboard and landing page using React.",
        translated: {
          th: { value: "พัฒนา dashboard และ landing page ด้วย React", status: "reviewed" },
        },
      },
    ],
    skills: ["React"],
    tags: ["frontend", "web", "react", "dashboard", "software-engineering"],
  },
  {
    id: "education.university-of-kent-msc-advanced-computer-science",
    locale: "en",
    source: legacyProfileSource,
    visibility: "public",
    type: "education",
    title: {
      en: "MSc Advanced Computer Science",
      translated: { th: { value: "MSc Advanced Computer Science", status: "approved" } },
    },
    organization: {
      en: "University of Kent",
      translated: { th: { value: "University of Kent", status: "approved" } },
    },
    location: {
      en: "Canterbury, UK",
      translated: { th: { value: "Canterbury, UK", status: "approved" } },
    },
    startDate: "2024-09",
    endDate: "2025-09",
    summary: {
      en: "Completed an MSc in Advanced Computer Science with distinction.",
      translated: {
        th: {
          value: "สำเร็จการศึกษา MSc Advanced Computer Science ด้วยผลการเรียนระดับ distinction",
          status: "reviewed",
        },
      },
    },
    highlights: [
      {
        en: "Studied artificial intelligence, deep learning, computer security, IoT, and quantum computing.",
        translated: {
          th: {
            value:
              "ศึกษา artificial intelligence, deep learning, computer security, IoT และ quantum computing",
            status: "reviewed",
          },
        },
      },
      {
        en: "Built a cryptocurrency rug pull detection dissertation project.",
        translated: {
          th: {
            value: "พัฒนา dissertation project เกี่ยวกับการตรวจจับ cryptocurrency rug pull",
            status: "reviewed",
          },
        },
      },
    ],
    skills: ["AI", "Deep Learning", "Computer Security", "IoT", "Python"],
    tags: [
      "ai",
      "deep-learning",
      "computer-security",
      "iot",
      "python",
      "quantum-computing",
      "academic",
    ],
  },
  {
    id: "education.mahidol-ict-bsc",
    locale: "en",
    source: legacyProfileSource,
    visibility: "public",
    type: "education",
    title: {
      en: "B.Sc. Information and Communication Technology",
      translated: {
        th: { value: "B.Sc. Information and Communication Technology", status: "approved" },
      },
    },
    organization: {
      en: "Mahidol University",
      translated: { th: { value: "Mahidol University", status: "approved" } },
    },
    location: {
      en: "Nakhon Pathom, Thailand",
      translated: { th: { value: "นครปฐม ประเทศไทย", status: "approved" } },
    },
    startDate: "2015-07",
    endDate: "2019-06",
    summary: {
      en: "Studied Information and Communication Technology with a Database and Intelligent Systems focus.",
      translated: {
        th: {
          value:
            "ศึกษา Information and Communication Technology โดยเน้น Database และ Intelligent Systems",
          status: "reviewed",
        },
      },
    },
    highlights: [
      {
        en: "Studied web programming, human-computer interaction, databases, algorithms, and digital image processing.",
        translated: {
          th: {
            value:
              "ศึกษา web programming, human-computer interaction, databases, algorithms และ digital image processing",
            status: "reviewed",
          },
        },
      },
      {
        en: "Built a cultural heritage progressive web app as the senior project.",
        translated: {
          th: {
            value: "พัฒนา progressive web app ด้าน cultural heritage เป็น senior project",
            status: "reviewed",
          },
        },
      },
    ],
    skills: ["Web Programming", "Databases", "Algorithms", "HCI", "PWA"],
    tags: ["web", "databases", "algorithms", "pwa", "academic"],
  },
  {
    id: "education.ramkhamhaeng-laws",
    locale: "en",
    source: legacyProfileSource,
    visibility: "public",
    type: "education",
    title: {
      en: "LL.B. Bachelor of Laws",
      translated: { th: { value: "LL.B. Bachelor of Laws", status: "approved" } },
    },
    organization: {
      en: "Ramkhamhaeng University",
      translated: { th: { value: "Ramkhamhaeng University", status: "approved" } },
    },
    location: {
      en: "Bangkok, Thailand",
      translated: { th: { value: "กรุงเทพฯ ประเทศไทย", status: "approved" } },
    },
    startDate: "2015",
    endDate: "2023",
    summary: {
      en: "Studied law with coursework related to intellectual property, international trade, and computer-related law.",
      translated: {
        th: {
          value:
            "ศึกษากฎหมาย โดยมี coursework ที่เกี่ยวข้องกับทรัพย์สินทางปัญญา การค้าระหว่างประเทศ และกฎหมายเกี่ยวกับคอมพิวเตอร์",
          status: "reviewed",
        },
      },
    },
    highlights: [
      {
        en: "Built a cross-domain foundation connecting software, product risk, legal context, and people.",
        translated: {
          th: {
            value:
              "สร้างพื้นฐานข้ามสายงานที่ช่วยเชื่อมโยงซอฟต์แวร์ ความเสี่ยงของผลิตภัณฑ์ บริบททางกฎหมาย และผู้ใช้งาน",
            status: "reviewed",
          },
        },
      },
    ],
    skills: ["Law", "Intellectual Property", "Computer-Related Law"],
    tags: ["law", "intellectual-property", "computer-related-law", "academic"],
  },
] as const satisfies readonly Experience[];
