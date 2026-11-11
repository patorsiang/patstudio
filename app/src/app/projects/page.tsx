import { projects, type Project } from "@patorsiang/content";
import { sanitizeUrl } from "@patorsiang/utils";
import type { Metadata } from "next";

import { RevealOnView } from "@/components/atoms/RevealOnView";
import { ProjectCard } from "@/components/molecules/ProjectCard";
import { PageShell } from "@/components/templates/PageShell";
import { Section } from "@/components/organisms/Section";
import { buildPageMetadata } from "@/lib/seo";

const title = "Projects";
const description =
  "Public projects by Napatchol Thaipanich, with the stack, what was built, and links to the source for each one.";

export const metadata: Metadata = buildPageMetadata({
  title,
  description,
  path: "/projects",
});

/** Featured work leads the index; `hidden` never surfaces. */
const placementRank: Record<Project["placement"], number> = {
  "featured-project": 0,
  project: 1,
  playground: 2,
  hidden: 3,
};

const selectedProjects = projects
  .filter((project) => project.placement === "featured-project" || project.placement === "project")
  .toSorted((a, b) => placementRank[a.placement] - placementRank[b.placement]);

const playgroundProjects = projects.filter((project) => project.placement === "playground");

export default function ProjectsPage() {
  return (
    <PageShell>
      <RevealOnView>
        <Section eyebrow="Projects" title="Selected project work." headingLevel={1}>
          <p className="mt-6 max-w-2xl text-base leading-8 text-(--color-text-muted)">
            Each entry states what the project does, what was built, the stack behind it, and where
            the code can be reviewed. Research prototypes are labelled as such, with their
            limitations stated rather than omitted.
          </p>

          {/* The h1 above names the page; without this h2 the card titles (h3) would skip a level. */}
          <h2 className="sr-only">Selected projects</h2>
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {selectedProjects.map((project) => (
              <ProjectCard key={project.id} {...toCardProps(project)} />
            ))}
          </div>
        </Section>
      </RevealOnView>

      {playgroundProjects.length > 0 ? (
        <RevealOnView>
          <Section eyebrow="Playground" title="Smaller experiments.">
            <p className="mt-6 max-w-2xl text-base leading-8 text-(--color-text-muted)">
              Learning exercises and prototypes kept public for reference. Smaller in scope than the
              work above.
            </p>

            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              {playgroundProjects.map((project) => (
                <ProjectCard key={project.id} {...toCardProps(project)} />
              ))}
            </div>
          </Section>
        </RevealOnView>
      ) : null}
    </PageShell>
  );
}

function toCardProps(project: Project) {
  return {
    title: project.title.en,
    subtitle: project.role.en,
    summary: project.summary.en,
    technologies: project.techStack,
    meta: [project.category, project.status, project.timeframe?.en].filter(
      (value): value is string => Boolean(value),
    ),
    // The spec caps cards at 2-3 outcomes; more than that belongs on a detail page.
    highlights: project.highlights.slice(0, 3).map((highlight) => highlight.en),
    note: project.testingNotes?.en,
    links: project.links.map((link) => ({
      label: link.label.en,
      href: sanitizeUrl(link.url),
    })),
  };
}
