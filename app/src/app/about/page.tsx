import { profile, projects, skills } from "@patorsiang/content";
import { sanitizeUrl } from "@patorsiang/utils";
import type { Metadata } from "next";

import { RevealOnView } from "@/components/atoms/RevealOnView";
import { ContactLinks } from "@/components/molecules/ContactLinks";
import { SkillGroup } from "@/components/molecules/SkillGroup";
import { PageShell } from "@/components/templates/PageShell";
import { Section } from "@/components/organisms/Section";
import { buildPageMetadata } from "@/lib/seo";

const title = "About";
const description = `${profile.headline.en} Based in ${profile.location.en}.`;

export const metadata: Metadata = buildPageMetadata({
  title,
  description,
  path: "/about",
  type: "profile",
});

/** Display labels for the project category enum; the set shown is whatever the projects use. */
const categoryLabels: Record<string, string> = {
  "ai-ml": "AI and machine learning",
  "security-ctf": "Security and CTF",
  "blockchain-fintech": "Blockchain and fintech",
  "game-interactive": "Games and interactive",
  "open-source": "Open source",
  "product-experiment": "Product experiments",
  academic: "Academic research",
  "tutorial-learning": "Teaching and learning",
  web: "Web systems",
  iot: "IoT and hardware",
};

const interests = [...new Set(projects.map((project) => project.category))].map(
  (category) => categoryLabels[category] ?? category,
);

export default function AboutPage() {
  return (
    <PageShell>
      <RevealOnView>
        <Section eyebrow="About" title={profile.role.en} headingLevel={1}>
          <p className="mt-6 max-w-2xl text-base leading-8 text-(--color-text-muted)">
            {profile.headline.en}
          </p>

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="space-y-5 text-base leading-8 text-(--color-text-muted)">
              {profile.summary.map((paragraph) => (
                <p key={paragraph.en}>{paragraph.en}</p>
              ))}
            </div>

            <aside className="border-l-0 border-(--color-border) lg:border-l lg:pl-8">
              <dl className="space-y-8">
                <div>
                  <dt className="text-sm font-medium uppercase tracking-[0.16em] text-(--color-text-subtle)">
                    Location
                  </dt>
                  <dd className="mt-3 text-lg font-semibold text-foreground">
                    {profile.location.en}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium uppercase tracking-[0.16em] text-(--color-text-subtle)">
                    Public identity
                  </dt>
                  <dd className="mt-3 text-lg font-semibold text-foreground">
                    {profile.nickname.en} / {profile.nickname2.en}
                  </dd>
                  <dd className="mt-1 text-sm text-(--color-text-muted)">@{profile.handle}</dd>
                </div>
              </dl>
            </aside>
          </div>
        </Section>
      </RevealOnView>

      <RevealOnView>
        <Section eyebrow="Engineering focus" title="Where the work concentrates.">
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {skills.map((group) => (
              <SkillGroup key={group.id} title={group.label.en} items={group.items} />
            ))}
          </div>
        </Section>
      </RevealOnView>

      <RevealOnView>
        <Section eyebrow="Interests" title="Problem areas the projects cover.">
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-base leading-8 text-(--color-text-muted)">
            {interests.map((interest) => (
              <li key={interest}>{interest}</li>
            ))}
          </ul>
        </Section>
      </RevealOnView>

      <RevealOnView>
        <Section eyebrow="Links" title="Professional links.">
          <div className="mt-8">
            <ContactLinks
              aria-label="Professional links"
              links={[
                {
                  label: "Email",
                  href: sanitizeUrl(profile.contact.email.url),
                  variant: "primary" as const,
                },
                ...profile.links
                  .filter((link) => link.label.en !== "Portfolio")
                  .map((link) => ({
                    label: link.label.en,
                    href: sanitizeUrl(link.url),
                    external: true,
                  })),
                { label: "View CV", href: "/cv" },
              ]}
            />
          </div>
        </Section>
      </RevealOnView>
    </PageShell>
  );
}
