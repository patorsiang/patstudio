import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Card } from "@/components/atoms/Card";

const meta = {
  title: "Atoms/Card",
  component: Card,
  args: {
    className: "p-6 max-w-md",
    children:
      "Cards carry repeated items: projects, experience entries, skill groups. Never nest one inside another.",
  },
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
