import { experiences, type Experience } from "@patorsiang/content";
import type { Metadata } from "next";

import { RevealOnView } from "@/components/atoms/RevealOnView";
import { ExperienceCard } from "@/components/molecules/ExperienceCard";
import { PageShell } from "@/components/templates/PageShell";
import { Section } from "@/components/organisms/Section";
import { buildPageMetadata } from "@/lib/seo";

const title = "Experience";
const description =
  "Work history, internships, and education for Napatchol Thaipanich, with dates, organizations, and what each role delivered.";

export const metadata: Metadata = buildPageMetadata({
  title,
  description,
  path: "/experience",
  type: "profile",
});

/**
 * Ordered so the page reads newest-first within the sections a recruiter scans
 * first. A type with no entries renders nothing rather than an empty heading.
 */
const groups = [
  { type: "work", eyebrow: "Work", heading: "Roles and what they delivered." },
  { type: "internship", eyebrow: "Internships", heading: "Early industry experience." },
  { type: "education", eyebrow: "Education", heading: "Degrees and study focus." },
] as const satisfies readonly { type: Experience["type"]; eyebrow: string; heading: string }[];

function byNewest(a: Experience, b: Experience) {
  return b.startDate.localeCompare(a.startDate);
}

function formatDateRange(experience: Experience) {
  if (experience.current) {
    return `${experience.startDate}–present`;
  }

  return experience.endDate
    ? `${experience.startDate}–${experience.endDate}`
    : experience.startDate;
}

export default function ExperiencePage() {
  return (
    <PageShell>
      <RevealOnView>
        <Section eyebrow="Experience" title="Work, internships, and education.">
          <p className="mt-6 max-w-2xl text-base leading-8 text-(--color-text-muted)">
            Newest first within each group. Every entry lists the organization, location, dates, and
            the specific work behind it.
          </p>
        </Section>
      </RevealOnView>

      {groups.map((group) => {
        const items = experiences.filter((item) => item.type === group.type).toSorted(byNewest);

        if (items.length === 0) {
          return null;
        }

        return (
          <RevealOnView key={group.type}>
            <Section eyebrow={group.eyebrow} title={group.heading}>
              <div className="mt-8 space-y-5">
                {items.map((item) => (
                  <ExperienceCard
                    key={item.id}
                    title={item.title.en}
                    organization={item.organization.en}
                    location={item.location.en}
                    dateRange={formatDateRange(item)}
                    summary={item.summary.en}
                    bullets={item.highlights.map((highlight) => highlight.en)}
                    skills={item.skills}
                  />
                ))}
              </div>
            </Section>
          </RevealOnView>
        );
      })}
    </PageShell>
  );
}
