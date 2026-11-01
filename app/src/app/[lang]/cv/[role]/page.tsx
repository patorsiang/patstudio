import { buildCVOutput, isCvLanguage, type CvLanguage } from "@patorsiang/cv-engine";
import { logger } from "@patorsiang/utils";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ownerName, siteName } from "@/lib/seo";
import { CvPageContent } from "../../../cv/CvPageContent";
import { DocumentLangSync } from "@/components/molecules/DocumentLangSync";
import {
  buildCanonicalCvHref,
  cvLanguages,
  cvRoleSlugToId,
  cvRoleSlugs,
  isCvRoleListed,
} from "@/lib/cv-routes";

type Params = { lang: string; role: string } | Promise<{ lang: string; role: string }>;

const seoRoleLabels = {
  fullstack_engineer: "Full-Stack Engineer",
  ai_ml_engineer: "AI / ML Engineer",
  security_engineer: "Security Engineer",
  apple_specialist: "Apple Specialist",
} as const;

const roleDescriptions = {
  en: {
    fullstack_engineer:
      "Full-stack engineering CV for Napatchol Thaipanich, focused on practical web systems, product delivery, and security-aware foundations.",
    ai_ml_engineer:
      "AI and ML engineering CV for Napatchol Thaipanich, focused on applied AI projects, automation, and practical web systems.",
    security_engineer:
      "Security-focused CV for Napatchol Thaipanich, focused on security-aware software work, risk context, and practical web system foundations.",
    apple_specialist:
      "Apple Specialist CV for Napatchol Thaipanich, focused on customer-facing communication, fast learning across tools and platforms, and reliable teamwork.",
  },
  th: {
    fullstack_engineer:
      "CV สาย Full-Stack Engineer ของ Napatchol Thaipanich เน้นระบบเว็บเชิงปฏิบัติ การส่งมอบผลิตภัณฑ์ และพื้นฐานระบบที่คำนึงถึงความปลอดภัย",
    ai_ml_engineer:
      "CV สาย AI / ML Engineer ของ Napatchol Thaipanich เน้นโปรเจกต์ AI เชิงประยุกต์ automation และระบบเว็บที่นำไปใช้งานได้จริง",
    security_engineer:
      "CV สาย Security Engineer ของ Napatchol Thaipanich เน้นงานซอฟต์แวร์ที่คำนึงถึงความปลอดภัย บริบทความเสี่ยง และพื้นฐานระบบเว็บเชิงปฏิบัติ",
    apple_specialist:
      "CV สำหรับตำแหน่ง Apple Specialist ของ Napatchol Thaipanich เน้นการสื่อสารกับลูกค้า การเรียนรู้เครื่องมือใหม่ได้เร็ว และการทำงานเป็นทีมที่เชื่อถือได้",
  },
} as const;

export const dynamicParams = false;

export function generateStaticParams() {
  return cvLanguages.flatMap((lang) => cvRoleSlugs.map((role) => ({ lang, role })));
}

export async function generateMetadata({
  params,
}: Readonly<{
  params: Params;
}>): Promise<Metadata> {
  const selection = await resolveParams(params);
  const title = `CV - ${seoRoleLabels[selection.role]} | ${ownerName}`;
  const description = roleDescriptions[selection.lang][selection.role];
  const canonical = buildCanonicalCvHref(selection.role, selection.lang);

  return {
    title: {
      absolute: title,
    },
    description,
    // Unlisted roles stay reachable by direct link but out of search results.
    ...(isCvRoleListed(selection.role) ? {} : { robots: { index: false, follow: true } }),
    alternates: {
      canonical,
      languages: {
        en: buildCanonicalCvHref(selection.role, "en"),
        th: buildCanonicalCvHref(selection.role, "th"),
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName,
      locale: selection.lang === "en" ? "en_US" : "th_TH",
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function CvRoleLanguagePage({
  params,
}: Readonly<{
  params: Params;
}>) {
  const selection = await resolveParams(params);
  const cv = buildCVOutput(selection.role, selection.lang);

  if (process.env.NODE_ENV === "development" && cv.meta.warnings.length > 0) {
    logger.warn(`CV Engine Warnings for ${selection.role} (${selection.lang}):`);
    cv.meta.warnings.forEach((warning) => logger.warn(`- ${warning}`));
  }

  return (
    <>
      <DocumentLangSync lang={selection.lang} />
      <CvPageContent
        cv={cv}
        selection={{
          role: selection.role,
          lang: selection.lang,
        }}
      />
    </>
  );
}

async function resolveParams(params: Params) {
  const { lang, role: roleSlug } = await Promise.resolve(params);

  if (!isCvLanguage(lang)) {
    notFound();
  }

  const role = cvRoleSlugToId(roleSlug);

  if (!role) {
    notFound();
  }

  return { lang: lang as CvLanguage, role };
}
