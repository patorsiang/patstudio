import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { NamecardStrap } from "@/components/atoms/NamecardStrap";

const meta = {
  title: "Atoms/NamecardStrap",
  component: NamecardStrap,
  args: { flipped: false },
  decorators: [
    // The band grows upward from its top edge and is clipped by the page, so it
    // needs a tall, clipped container with room above it to show anything.
    (Story) => (
      <div className="flex h-72 items-end justify-center overflow-hidden pb-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NamecardStrap>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Front: Story = {};

/** Twisted to match a card that shows its back. */
export const Flipped: Story = {
  args: { flipped: true },
};
