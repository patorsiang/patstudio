import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Section } from "@/components/organisms/Section";

const meta = {
  title: "Organisms/Section",
  component: Section,
  args: {
    eyebrow: "Projects",
    title: "Things I have built",
    children: (
      <p className="mt-6 max-w-prose text-base leading-8 text-(--color-text-muted)">
        Each entry states what was built and where the code can be reviewed.
      </p>
    ),
  },
} satisfies Meta<typeof Section>;

export default meta;

type Story = StoryObj<typeof meta>;

export const EyebrowAndTitle: Story = {};

export const TitleOnly: Story = {
  args: { eyebrow: undefined },
};

export const NoHeading: Story = {
  args: { eyebrow: undefined, title: undefined },
};
