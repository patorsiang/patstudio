import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { HeroMark } from "@/components/atoms/HeroMark";

const meta = {
  title: "Atoms/HeroMark",
  component: HeroMark,
  decorators: [
    // The mark draws itself once with @starting-style, so a capture taken as the
    // story loads can show it empty or half-drawn, and the design system's
    // preview did. Turning the transition off makes it paint at its end state.
    (Story) => (
      <>
        <style>{".hero-mark-draw { transition: none; }"}</style>
        <Story />
      </>
    ),
  ],
} satisfies Meta<typeof HeroMark>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
