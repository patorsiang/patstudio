import { profile } from "@patorsiang/content";
import { sanitizeUrl } from "@patorsiang/utils";
import type { Metadata } from "next";

import { RevealOnView } from "@/components/atoms/RevealOnView";
import { TextLink } from "@/components/atoms/TextLink";
import { PageShell } from "@/components/templates/PageShell";
import { Section } from "@/components/organisms/Section";
import { buildPageMetadata } from "@/lib/seo";

const title = "Contact";
const description = `Ways to reach Napatchol Thaipanich: email, GitHub, and LinkedIn. Based in ${profile.location.en}.`;

export const metadata: Metadata = buildPageMetadata({
  title,
  description,
  path: "/contact",
  type: "profile",
});

const channels = [
  { label: "Email", entry: profile.contact.email },
  { label: "GitHub", entry: profile.contact.github },
  { label: "LinkedIn", entry: profile.contact.linkedin },
] as const;

export default function ContactPage() {
  return (
    <PageShell>
      <RevealOnView>
        <Section eyebrow="Contact" title="Direct channels." headingLevel={1}>
          <p className="mt-6 max-w-2xl text-base leading-8 text-(--color-text-muted)">
            Email is the most direct route. There is no contact form here on purpose — these go
            straight to accounts that are actually monitored.
          </p>

          <dl className="mt-8 max-w-2xl divide-y divide-(--color-border) border-y border-(--color-border)">
            {channels.map((channel) => (
              <div
                key={channel.label}
                className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between"
              >
                <dt className="text-sm font-medium uppercase tracking-[0.14em] text-(--color-text-subtle)">
                  {channel.label}
                </dt>
                <dd className="text-base">
                  {/*
                  Overlay rather than a real 40px box: the row is
                  sm:items-baseline, and giving the link a height would drop it
                  off the baseline it shares with its <dt>. The py-4 rows sit
                  far enough apart that the bands do not meet.
                */}
                  <TextLink
                    href={sanitizeUrl(channel.entry.url)}
                    target={channel.label === "Email" ? undefined : "_blank"}
                    rel={channel.label === "Email" ? undefined : "noreferrer"}
                    className="tap-reach"
                  >
                    {channel.entry.label.en}
                  </TextLink>
                </dd>
              </div>
            ))}

            <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between">
              <dt className="text-sm font-medium uppercase tracking-[0.14em] text-(--color-text-subtle)">
                Location
              </dt>
              <dd className="text-base text-(--color-text-muted)">{profile.location.en}</dd>
            </div>
          </dl>
        </Section>
      </RevealOnView>
    </PageShell>
  );
}
