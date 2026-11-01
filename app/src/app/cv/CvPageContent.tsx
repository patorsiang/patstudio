import type { CvLanguage, CvRoleId, GeneratedCV } from "@patorsiang/cv-engine";
import { sanitizeUrl } from "@patorsiang/utils";
import Image from "next/image";
import { Fragment, type ReactNode } from "react";

import { TextLink } from "@/components/atoms/TextLink";
import { ExperienceCard } from "@/components/molecules/ExperienceCard";
import { ProjectCard } from "@/components/molecules/ProjectCard";
import { SkillGroup } from "@/components/molecules/SkillGroup";
import { CVSection } from "@/components/organisms/CVSection";
import { PageShell } from "@/components/templates/PageShell";
import { siteUrl } from "@/lib/seo";

import { CvToolbar } from "./CvToolbar";
import { orderedBodySections, type CvBodySection } from "./cv-sections";

const sectionLabels = {
  en: {
    summary: "Professional Summary",
    skills: "Technical Skills",
    experience: "Work Experience",
    additionalExperience: "Additional Experience",
    projects: "Selected Projects",
    education: "Education",
    awards: "Awards & Activities",
    languages: "Languages",
  },
  th: {
    summary: "สรุปประสบการณ์",
    skills: "ทักษะด้านเทคนิค",
    experience: "ประสบการณ์ทำงาน",
    additionalExperience: "ประสบการณ์เพิ่มเติม",
    projects: "โปรเจกต์ที่คัดเลือก",
    education: "การศึกษา",
    awards: "รางวัลและกิจกรรม",
    languages: "ภาษา",
  },
} as const satisfies Record<CvLanguage, Record<string, string>>;

type CvLabels = (typeof sectionLabels)[CvLanguage];

const portfolioQrCodeSrc = "/portfolio-qr.svg";
const fallbackPortfolioUrl = `${siteUrl}/`;

type CvPageContentProps = {
  readonly cv: GeneratedCV;
  readonly selection: {
    readonly role: CvRoleId;
    readonly lang: CvLanguage;
  };
};
export function CvPageContent({ cv, selection }: CvPageContentProps) {
  const labels = sectionLabels[selection.lang];
  const portfolioLink =
    cv.header.links.find((link) => link.label.toLowerCase() === "portfolio") ??
    ({ label: "Portfolio", url: fallbackPortfolioUrl } as const);
  const sections = renderSections(cv, labels);

  return (
    <PageShell
      lang={selection.lang}
      contentClassName="max-w-5xl gap-8 py-8 print:max-w-none print:gap-0 print:px-0 print:py-0"
    >
      <CvToolbar role={selection.role} lang={selection.lang} />

      <article className="cv-print-article bg-(--color-surface) p-6 shadow-sm ring-1 ring-(--color-border) sm:p-10 print:p-0 print:shadow-none print:ring-0">
        <header className="border-b border-(--color-border) pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-(--color-accent)">
                {cv.header.targetTitle}
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-foreground sm:text-5xl print:text-3xl">
                {cv.header.name}
              </h1>
              <p className="mt-3 text-base font-medium text-(--color-text-muted)">
                {cv.header.location}
              </p>
            </div>

            <address className="not-italic text-sm leading-7 text-(--color-text-muted) sm:text-right">
              {/*
                These stack, so each needs its own 40px row rather than an
                overlay - 28px line boxes would leave the bands overlapping and
                the wrong link taking the tap. print:* restores the tight
                inline flow the CV sheet is laid out for.
              */}
              <a
                className="flex h-10 items-center font-medium text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:justify-end print:inline print:h-auto"
                href={sanitizeUrl(`mailto:${cv.header.email}`)}
              >
                {cv.header.email}
              </a>
              {cv.header.links.map((link) => (
                <TextLink
                  key={link.url}
                  href={sanitizeUrl(link.url)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 items-center sm:justify-end print:hidden"
                >
                  {link.label}
                </TextLink>
              ))}
              {/*
                On screen these are labelled links; on paper an ATS parser only sees the
                text, so print renders the bare URL. Without this the PDF carried no
                GitHub or LinkedIn address at all - the QR code is not machine-readable
                text, and only the portfolio URL survived, in the QR caption.
              */}
              <span className="hidden print:block">
                {cv.header.links.map((link) => stripUrlProtocol(link.url)).join("  ·  ")}
              </span>
              <div className="mt-3 hidden flex-col items-end gap-1 print:flex">
                <Image
                  src={portfolioQrCodeSrc}
                  alt={`QR code for ${portfolioLink.label}`}
                  width={80}
                  height={80}
                  unoptimized
                  // This block is `hidden` until `print:flex` (see className
                  // below), so Next's default loading="lazy" never fires -
                  // the browser only requests the image once it gets a
                  // layout box, i.e. exactly when window.print() is called.
                  // That races the print snapshot against the fetch and can
                  // print a blank QR. `priority` forces eager loading on
                  // mount, well before Print CV is ever clicked.
                  priority
                  className="h-20 w-20"
                />
              </div>
            </address>
          </div>
        </header>

        <div className="cv-print-stack mt-8 space-y-8 print:space-y-0">
          {orderedBodySections(cv.meta.sectionOrder, {
            summary: Boolean(cv.summary.text),
            skills: cv.skills.length > 0,
            experience: cv.experience.length > 0,
            projects: cv.projects.length > 0,
            education: cv.education.length > 0,
            awards: cv.awards.length > 0,
            languages: cv.languages.length > 0,
          }).map((section) => (
            <Fragment key={section}>{sections[section]}</Fragment>
          ))}
        </div>
      </article>
    </PageShell>
  );
}

function renderSections(cv: GeneratedCV, labels: CvLabels): Record<CvBodySection, ReactNode> {
  return {
    summary: (
      <CVSection title={labels.summary}>
        <p className="text-sm leading-7 text-(--color-text-muted) print:leading-6">
          {cv.summary.text}
        </p>
      </CVSection>
    ),

    skills: (
      <CVSection title={labels.skills} className="cv-print-skills">
        <div className="cv-print-compact-list grid gap-4 sm:grid-cols-2 print:grid-cols-2">
          {cv.skills.map((group) => (
            <SkillGroup key={group.id} title={group.group} items={group.items} variant="inline" />
          ))}
        </div>
      </CVSection>
    ),

    experience: (
      <>
        <CVSection title={labels.experience}>
          <div className="cv-print-compact-list space-y-6 print:space-y-0">
            {cv.experience.map((experience) => (
              <div key={experience.id} className="cv-print-experience">
                <ExperienceCard
                  title={experience.title}
                  organization={experience.organization}
                  location={experience.location}
                  dateRange={formatDateRange(experience.startDate, experience.endDate)}
                  summary={experience.summary}
                  bullets={experience.bullets}
                  skills={experience.skills}
                  variant="plain"
                />
              </div>
            ))}
          </div>
        </CVSection>

        {cv.additionalExperience.length > 0 ? (
          <CVSection title={labels.additionalExperience}>
            <ul className="space-y-2 text-sm leading-6 text-(--color-text-muted)">
              {cv.additionalExperience.map((item) => (
                <li key={item.id}>
                  <span className="font-semibold text-foreground">{item.title}</span>
                  {" · "}
                  {item.organization}
                  {" · "}
                  {item.dateRange}
                </li>
              ))}
            </ul>
          </CVSection>
        ) : null}
      </>
    ),

    projects: (
      <CVSection title={labels.projects}>
        <div className="cv-print-compact-list space-y-5 print:space-y-0">
          {cv.projects.map((project) => (
            <div key={project.id} className="cv-print-project">
              <ProjectCard
                title={project.title}
                subtitle={project.subtitle}
                summary={project.summary}
                technologies={project.technologies}
                links={project.links.map((link) => ({
                  label: link.label,
                  href: sanitizeUrl(link.url),
                }))}
                variant="plain"
              />
            </div>
          ))}
        </div>
      </CVSection>
    ),

    education: (
      <CVSection title={labels.education}>
        <div className="cv-print-compact-list space-y-4 print:space-y-0">
          {cv.education.map((education) => (
            <div key={education.id} className="cv-print-education">
              <ExperienceCard
                title={education.degree}
                organization={education.organization}
                location={education.location}
                dateRange={formatDateRange(education.startDate, education.endDate)}
                summary={education.summary}
                bullets={education.bullets}
                variant="plain"
              />
            </div>
          ))}
        </div>
      </CVSection>
    ),

    awards: (
      <CVSection title={labels.awards}>
        <ul className="space-y-2 text-sm leading-6 text-(--color-text-muted)">
          {cv.awards.map((award) => (
            <li key={award.id}>
              <span className="font-semibold text-foreground">{award.title}</span>
              {" · "}
              {award.organization}
            </li>
          ))}
        </ul>
      </CVSection>
    ),

    languages: (
      <CVSection title={labels.languages}>
        <p className="cv-print-languages text-sm leading-6 text-(--color-text-muted)">
          {cv.languages.map((language) => `${language.name}: ${language.level}`).join(" · ")}
        </p>
      </CVSection>
    ),
  };
}

function formatDateRange(startDate: string, endDate?: string) {
  return endDate ? `${startDate} - ${endDate}` : startDate;
}

function stripUrlProtocol(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}
