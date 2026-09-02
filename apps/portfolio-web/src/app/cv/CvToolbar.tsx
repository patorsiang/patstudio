import type { CvLanguage, CvRoleId } from "@patorsiang/cv-engine";
import Link from "next/link";

import { ButtonLink } from "@/components/atoms/ButtonLink";
import { SegmentedLinks } from "@/components/molecules/SegmentedLinks";
import { buildCanonicalCvHref, buildCvExportFilename } from "@/lib/cv-routes";

import { PrintButton } from "./PrintButton";

const roleLabels = {
  en: {
    fullstack_engineer: "Full-Stack Engineer",
    ai_ml_engineer: "AI / ML Engineer",
    security_engineer: "Security Engineer",
    apple_specialist: "Apple Specialist",
  },
  th: {
    fullstack_engineer: "Full-Stack Developer",
    ai_ml_engineer: "วิศวกร AI / ML",
    security_engineer: "วิศวกร Security",
    apple_specialist: "Apple Specialist",
  },
} as const satisfies Record<CvLanguage, Record<CvRoleId, string>>;

/** Abbreviations shown inside the segmented control; full names stay in roleLabels. */
const shortRoleLabels = {
  fullstack_engineer: "Full-Stack",
  ai_ml_engineer: "AI / ML",
  security_engineer: "Security",
  apple_specialist: "Apple Specialist",
} as const satisfies Record<CvRoleId, string>;

const roleIds = Object.keys(shortRoleLabels) as readonly CvRoleId[];

const uiLabels = {
  en: {
    back: "Back to portfolio",
    json: "Download JSON",
    markdown: "Download Markdown",
    roleSelector: "CV variant",
  },
  th: {
    back: "กลับไปหน้า portfolio",
    json: "ดาวน์โหลด JSON",
    markdown: "ดาวน์โหลด Markdown",
    roleSelector: "รูปแบบ CV",
  },
} as const satisfies Record<CvLanguage, Record<string, string>>;

type CvToolbarProps = {
  readonly role: CvRoleId;
  readonly lang: CvLanguage;
};

export function CvToolbar({ role, lang }: CvToolbarProps) {
  const jsonHref = `/cv/export/json?role=${role}&lang=${lang}`;
  const markdownHref = `/cv/export/markdown?role=${role}&lang=${lang}`;

  return (
    <div className="mb-8 flex flex-col gap-4 border-b border-(--color-border) pb-6 print:hidden">
      {/* Language switching lives in GlobalNav, which already preserves the current role. */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/"
          className="inline-flex h-10 items-center self-start text-sm font-semibold text-(--color-accent) underline-offset-4 transition hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {uiLabels[lang].back}
        </Link>

        <SegmentedLinks
          label={uiLabels[lang].roleSelector}
          className="w-full sm:w-auto"
          collapsible={{ summary: roleLabels[lang][role] }}
          items={roleIds.map((roleId) => ({
            id: roleId,
            href: buildCanonicalCvHref(roleId, lang),
            label: shortRoleLabels[roleId],
            fullLabel: roleLabels[lang][roleId],
            active: roleId === role,
          }))}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <ButtonLink href={jsonHref} download={buildCvExportFilename(role, lang, "json")}>
          {uiLabels[lang].json}
        </ButtonLink>
        <ButtonLink href={markdownHref} download={buildCvExportFilename(role, lang, "md")}>
          {uiLabels[lang].markdown}
        </ButtonLink>
        <PrintButton />
      </div>
    </div>
  );
}
