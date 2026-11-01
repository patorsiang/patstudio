import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ExperienceCard } from "@/components/molecules/ExperienceCard";

const meta = {
  title: "Molecules/ExperienceCard",
  component: ExperienceCard,
  args: {
    title: "Software Engineer",
    organization: "Example Studio",
    location: "Bangkok, Thailand",
    dateRange: "2024 - Present",
    summary:
      "Built production web applications, data dashboards, and API integrations for customer-facing workflows.",
    bullets: [
      "Delivered reusable React components for repeated dashboard patterns.",
      "Improved deployment reliability through clearer environment configuration.",
    ],
    skills: ["TypeScript", "Next.js", "PostgreSQL"],
  },
} satisfies Meta<typeof ExperienceCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Card: Story = {};

export const Plain: Story = {
  args: {
    variant: "plain",
  },
};
