import { legacyProfileSource } from "./shared";
import type { Profile } from "../types";

export const profile = {
  id: "profile.napatchol-thaipanich",
  locale: "en",
  source: legacyProfileSource,
  visibility: "public",
  name: {
    en: "Napatchol Thaipanich",
    translated: { th: { value: "ณภัทรชล ไทพาณิชย์", status: "reviewed" } },
  },
  handle: "patorsiang",
  nickname: { en: "Pat", translated: { th: { value: "ภัทร", status: "reviewed" } } },
  nickname2: { en: "Siang", translated: { th: { value: "เซียง", status: "reviewed" } } },
  role: {
    en: "Full-stack developer",
    translated: { th: { value: "Full-stack developer", status: "reviewed" } },
  },
  location: {
    en: "Bangkok, Thailand",
    translated: { th: { value: "กรุงเทพฯ ประเทศไทย", status: "reviewed" } },
  },
  // Doubles as the /about meta description, so it has to read as a complete
  // sentence on its own in a search result - which is why it repeats the role
  // that sits directly above it on the page.
  headline: {
    en: "Full-stack developer at SEC Playground, building security-aware products across web platforms, gamified training, and applied AI.",
    translated: {
      th: {
        value:
          "Full-stack developer ที่ SEC Playground พัฒนาผลิตภัณฑ์ที่คำนึงถึงความปลอดภัย ครอบคลุมเว็บแพลตฟอร์ม gamified training และ AI เชิงประยุกต์",
        status: "ai_draft",
      },
    },
  },
  summary: [
    {
      en: "MSc Advanced Computer Science with distinction from the University of Kent, completed 2025, after building web and financial-systems products in Bangkok since 2019.",
      translated: {
        th: {
          value:
            "จบปริญญาโท MSc Advanced Computer Science ระดับ distinction จาก University of Kent ในปี 2025 หลังจากพัฒนาผลิตภัณฑ์ด้านเว็บและระบบการเงินในกรุงเทพฯ ตั้งแต่ปี 2019",
          status: "ai_draft",
        },
      },
    },
    {
      en: "Day to day that is Vue, Nuxt, Node, and SQL-backed services. Earlier work covered React, Next.js, and a blockchain bond platform on Hyperledger Fabric in a central-bank environment.",
      translated: {
        th: {
          value:
            "ปัจจุบันทำงานกับ Vue, Nuxt, Node และบริการที่ใช้ SQL ส่วนงานก่อนหน้าครอบคลุม React, Next.js และแพลตฟอร์มพันธบัตรบน blockchain ด้วย Hyperledger Fabric ในสภาพแวดล้อมธนาคารกลาง",
          status: "ai_draft",
        },
      },
    },
    {
      en: "I care about software that is reliable, understandable, and trusted by the people who depend on it, especially in security-aware and learning-focused products.",
      translated: {
        th: {
          value:
            "ให้ความสำคัญกับซอฟต์แวร์ที่น่าเชื่อถือ เข้าใจง่าย และได้รับความไว้วางใจจากผู้ใช้ โดยเฉพาะผลิตภัณฑ์ที่คำนึงถึงความปลอดภัยและการเรียนรู้",
          status: "reviewed",
        },
      },
    },
  ],
  contact: {
    email: {
      label: {
        en: "napatchol.tha@gmail.com",
        translated: { th: { value: "napatchol.tha@gmail.com", status: "approved" } },
      },
      url: "mailto:napatchol.tha@gmail.com",
    },
    github: {
      label: {
        en: "github.com/patorsiang",
        translated: { th: { value: "github.com/patorsiang", status: "approved" } },
      },
      url: "https://github.com/patorsiang",
    },
    linkedin: {
      label: {
        en: "linkedin.com/in/napatchol-thaipanich",
        translated: { th: { value: "linkedin.com/in/napatchol-thaipanich", status: "approved" } },
      },
      url: "https://www.linkedin.com/in/napatchol-thaipanich",
    },
    // Not rendered on any existing page (contact/page.tsx, SiteFooter, etc.
    // all read named fields and ignore these) - added for the /card namecard
    // feature. Phone is deliberately not shown in HTML anywhere; it appears
    // only inside the /card/vcard download, per
    // docs/requirements/namecard.md#5.
    phone: {
      label: {
        en: "+66 95 939 0164",
        translated: { th: { value: "+66 95 939 0164", status: "approved" } },
      },
      url: "tel:+66959390164",
    },
    line: {
      label: {
        en: "LINE",
        translated: { th: { value: "LINE", status: "approved" } },
      },
      url: "https://line.me/R/ti/p/@766wwbir",
    },
    whatsapp: {
      label: {
        en: "WhatsApp",
        translated: { th: { value: "WhatsApp", status: "approved" } },
      },
      url: "https://wa.me/66959390164",
    },
  },
  links: [
    {
      label: { en: "Portfolio", translated: { th: { value: "Portfolio", status: "approved" } } },
      url: "https://patstudio.vercel.app/",
    },
    {
      label: { en: "GitHub", translated: { th: { value: "GitHub", status: "approved" } } },
      url: "https://github.com/patorsiang",
    },
    {
      label: { en: "LinkedIn", translated: { th: { value: "LinkedIn", status: "approved" } } },
      url: "https://www.linkedin.com/in/napatchol-thaipanich",
    },
  ],
} as const satisfies Profile;
