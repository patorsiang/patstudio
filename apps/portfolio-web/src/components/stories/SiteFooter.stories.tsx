import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SiteFooter } from "@/components/organisms/SiteFooter";

const meta = {
  title: "Organisms/SiteFooter",
  component: SiteFooter,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof SiteFooter>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Utility links, then the privacy line in English and Thai. */
export const Default: Story = {};
