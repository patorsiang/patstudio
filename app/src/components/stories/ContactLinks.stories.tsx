import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ContactLinks } from "@/components/molecules/ContactLinks";

const meta = {
  title: "Molecules/ContactLinks",
  component: ContactLinks,
  args: {
    links: [
      { label: "GitHub", href: "https://github.com/patorsiang", external: true },
      { label: "View CV", href: "/en/cv/fullstack-engineer" },
      { label: "Email", href: "mailto:napatchol.tha@gmail.com", variant: "primary" },
    ],
  },
} satisfies Meta<typeof ContactLinks>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
