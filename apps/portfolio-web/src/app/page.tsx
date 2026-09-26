import { experiences, profile, projects } from "@patorsiang/content";
import { generateCV } from "@patorsiang/cv-engine";
import { sanitizeUrl } from "@patorsiang/utils";

import { TextLink } from "@/components/atoms/TextLink";
import { ExperienceCard } from "@/components/molecules/ExperienceCard";
import { ProjectCard } from "@/components/molecules/ProjectCard";
import { SkillGroup } from "@/components/molecules/SkillGroup";
import { ProfileHeader } from "@/components/organisms/ProfileHeader";
import { PageShell } from "@/components/templates/PageShell";
import { Section } from "@/components/organisms/Section";
import { RevealOnView } from "@/components/atoms/RevealOnView";

type ExperienceItem = (typeof experiences)[number];

const cv = generateCV("fullstack_engineer", "en");

const projectOrder = new Map(cv.projects.map((project, index) => [project.id, index]));

const experienceOrder = new Map(cv.experience.map((experience, index) => [experience.id, index]));

const featuredProjects = projects
  .filter((project) => project.placement === "featured-project" && projectOrder.has(project.id))
  .sort((a, b) => (projectOrder.get(a.id) ?? 0) - (projectOrder.get(b.id) ?? 0));

const workExperiences = experiences
  .filter(
    (experience) =>
      (experience.type === "work" || experience.type === "internship") &&
      experienceOrder.has(experience.id),
  )
  .sort((a, b) => (experienceOrder.get(a.id) ?? 0) - (experienceOrder.get(b.id) ?? 0));

const educationExperiences = experiences.filter((experience) => experience.type === "education");

function formatDateRange(startDate: string, endDate?: string) {
  return endDate ? `${startDate} - ${endDate}` : startDate;
}

export default function Home() {
  return (
    <PageShell>
      <ProfileHeader
        handle={profile.handle}
        name={profile.name.en}
        role={profile.role.en}
        headline={profile.headline.en}
        // Generator options that produced /avataaars.svg (getavataaars.com),
        // kept so the avatar can be regenerated now that legacy-v1 is gone:
        // https://avataaars.io/?avatarStyle=Circle&topType=LongHairBob&accessoriesType=Prescription02&hairColor=Black&facialHairType=Blank&clotheType=Hoodie&clotheColor=Heather&eyeType=Default&eyebrowType=Default&mouthType=Eating&skinColor=Light
        portrait={{
          src: "/avataaars.svg",
          alt: `Illustrated portrait of ${profile.name.en}`,
        }}
        links={[
          ...profile.links
            .filter((link) => link.label.en !== "Portfolio")
            .map((link) => ({
              label: link.label.en,
              href: sanitizeUrl(link.url),
              external: true,
            })),
          { label: "View CV", href: "/en/cv/fullstack-engineer" },
          {
            label: "Email",
            href: sanitizeUrl(profile.contact.email.url),
            variant: "primary" as const,
          },
        ]}
      />

      <RevealOnView>
        <Section eyebrow="About" title="Practical software for real product problems.">
          <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="space-y-5 text-base leading-8 text-(--color-text-muted)">
              {profile.summary.map((paragraph) => (
                <p key={paragraph.en}>{paragraph.en}</p>
              ))}
            </div>

            <aside className="border-l-0 border-(--color-border) lg:border-l lg:pl-8">
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-(--color-text-subtle)">
                Location
              </p>
              <p className="mt-3 text-lg font-semibold text-foreground">{profile.location.en}</p>
              <p className="mt-8 text-sm font-medium uppercase tracking-[0.16em] text-(--color-text-subtle)">
                Public identity
              </p>
              <p className="mt-3 text-lg font-semibold text-foreground">
                {profile.nickname.en} / {profile.nickname2.en}
              </p>
            </aside>
          </div>
        </Section>
      </RevealOnView>

      <RevealOnView>
        <Section eyebrow="Experience" title="Work and education.">
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <ExperienceColumn title="Work" items={workExperiences} />
            <ExperienceColumn title="Education" items={educationExperiences} />
          </div>
        </Section>
      </RevealOnView>

      <RevealOnView>
        <Section eyebrow="Projects" title="Selected project samples.">
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {featuredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                title={project.title.en}
                summary={project.summary.en}
                technologies={project.techStack}
                meta={[project.category, project.status]}
                links={project.links.map((link) => ({
                  label: link.label.en,
                  href: sanitizeUrl(link.url),
                }))}
              />
            ))}
          </div>

          <p className="mt-6">
            <TextLink href="/projects" className="tap-reach">
              See all projects
            </TextLink>
          </p>
        </Section>
      </RevealOnView>

      <RevealOnView>
        <Section eyebrow="Skills" title="Core skill groups.">
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cv.skills.map((group) => (
              <SkillGroup key={group.id} title={group.group} items={group.items} />
            ))}
          </div>
        </Section>
      </RevealOnView>
    </PageShell>
  );
}

function ExperienceColumn({
  title,
  items,
}: Readonly<{
  title: string;
  items: readonly ExperienceItem[];
}>) {
  return (
    <div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <div className="mt-4 space-y-4">
        {items.map((item) => (
          <ExperienceCard
            key={item.id}
            title={item.title.en}
            organization={item.organization.en}
            location={item.location.en}
            dateRange={formatDateRange(item.startDate, item.endDate)}
            summary={item.summary.en}
            bullets={item.highlights.slice(0, 2).map((highlight) => highlight.en)}
          />
        ))}
      </div>
    </div>
  );
}
