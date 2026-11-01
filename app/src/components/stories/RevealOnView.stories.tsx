import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { RevealOnView } from "@/components/atoms/RevealOnView";

/**
 * Storybook's canvas is far shorter than a real page, so RevealOnView's
 * children are already in view the moment this story mounts - this story
 * exercises the "already visible, never hidden" path, not the scroll-in
 * reveal itself. The scroll-in path is covered by
 * e2e/section-reveal.e2e.ts against the real homepage instead.
 */
const meta = {
  title: "Atoms/RevealOnView",
  component: RevealOnView,
} satisfies Meta<typeof RevealOnView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <p className="text-foreground">Content that reveals when scrolled into view.</p>,
  },
};
