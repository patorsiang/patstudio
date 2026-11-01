import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { NamecardFlip } from "@/components/organisms/NamecardFlip";

const meta = {
  title: "Organisms/NamecardFlip",
  component: NamecardFlip,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof NamecardFlip>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The front: name, role, handle and the QR code. */
export const Front: Story = {};

/** The back: the contact channels and Save Contact. Turned over by the play step, as a visitor would. */
export const Back: Story = {
  play: async ({ canvasElement }) => {
    canvasElement.querySelector<HTMLButtonElement>('button[aria-label^="Turn card over"]')?.click();
  },
};
