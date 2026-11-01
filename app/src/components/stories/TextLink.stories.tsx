import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { TextLink } from "@/components/atoms/TextLink";

const meta = {
  title: "Atoms/TextLink",
  component: TextLink,
  args: {
    children: "See all projects",
    href: "/projects",
  },
} satisfies Meta<typeof TextLink>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Internal: Story = {};

export const External: Story = {
  args: {
    href: "https://github.com/patorsiang",
    target: "_blank",
    rel: "noreferrer",
    children: "GitHub",
  },
};

export const InProse: Story = {
  render: (args) => (
    <p className="max-w-md text-base leading-8 text-(--color-text-muted)">
      Every entry states what was built and where the code can be reviewed. <TextLink {...args} />.
    </p>
  ),
};
