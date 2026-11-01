import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SiteMark } from "@/components/atoms/SiteMark";

const meta = {
  title: "Atoms/SiteMark",
  component: SiteMark,
} satisfies Meta<typeof SiteMark>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { size: 96 },
};

/** The size that decides whether a mark works. */
export const Favicon: Story = {
  args: { size: 16 },
};

export const Named: Story = {
  args: { size: 96, title: "Patorsiang" },
};
