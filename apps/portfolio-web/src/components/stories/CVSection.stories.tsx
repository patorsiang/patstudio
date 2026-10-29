import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { CVSection } from "@/components/organisms/CVSection";

const meta = {
  title: "Organisms/CVSection",
  component: CVSection,
  args: {
    title: "Experience",
    children: (
      <p className="text-sm leading-7 text-(--color-text-muted)">
        Built production web applications, data dashboards, and API integrations for customer-facing
        workflows.
      </p>
    ),
  },
  decorators: [
    (Story) => (
      <div className="max-w-2xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CVSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithList: Story = {
  args: {
    title: "Skills",
    children: (
      <ul className="flex flex-wrap gap-2 text-sm text-(--color-text-muted)">
        {["TypeScript", "Next.js", "PostgreSQL", "Docker"].map((skill) => (
          <li key={skill}>{skill}</li>
        ))}
      </ul>
    ),
  },
};
