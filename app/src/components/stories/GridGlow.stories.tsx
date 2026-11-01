import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { GridGlow } from "@/components/atoms/GridGlow";

const meta = {
  title: "Atoms/GridGlow",
  component: GridGlow,
  decorators: [
    (Story) => (
      <div className="relative h-64 overflow-hidden bg-background">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GridGlow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
