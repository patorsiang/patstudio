import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SkillGroup } from "@/components/molecules/SkillGroup";

const meta = {
  title: "Molecules/SkillGroup",
  component: SkillGroup,
  args: {
    title: "Frontend",
    items: ["React", "Next.js", "Tailwind CSS", "Accessibility"],
  },
} satisfies Meta<typeof SkillGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Card: Story = {};

export const Inline: Story = {
  args: {
    variant: "inline",
  },
};
