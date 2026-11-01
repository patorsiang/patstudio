import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ProjectCard } from "@/components/molecules/ProjectCard";

const meta = {
  title: "Molecules/ProjectCard",
  component: ProjectCard,
  args: {
    title: "Portfolio Content Engine",
    subtitle: "Personal platform",
    summary:
      "A structured content and CV generation system for maintaining role-specific portfolio material.",
    technologies: ["TypeScript", "Next.js", "Bun", "Tailwind CSS"],
    meta: ["web", "launched"],
    links: [{ label: "Repository", href: "https://github.com/patorsiang/patstudio" }],
  },
} satisfies Meta<typeof ProjectCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Card: Story = {};

/** What /projects renders: the spec's 2-3 outcomes plus a limitations note. */
export const WithHighlightsAndNote: Story = {
  args: {
    highlights: [
      "Built a React/Vite and FastAPI workflow for contract intake, feature extraction, and prediction review.",
      "Combined source, bytecode, transaction timeline, and anomaly-detection signals.",
      "Used Redis and Docker Compose to coordinate services and local experiment runs.",
    ],
    note: "Research prototype only; not production security tooling. A public release needs stronger dataset provenance and exact model metrics.",
  },
};

/** The CV variant: no card chrome, technologies inline rather than as tags. */
export const Plain: Story = {
  args: {
    variant: "plain",
  },
};
