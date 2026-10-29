import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PageShell } from "@/components/templates/PageShell";

const meta = {
  title: "Templates/PageShell",
  component: PageShell,
  parameters: {
    layout: "fullscreen",
    nextjs: { appDirectory: true, navigation: { pathname: "/about" } },
  },
  args: {
    children: (
      <section>
        <h1 className="text-4xl font-semibold text-foreground">About</h1>
        <p className="mt-4 max-w-prose text-base leading-8 text-(--color-text-muted)">
          The page frame: the grid glow behind the content, the global nav on top, and the site
          footer below the main landmark.
        </p>
      </section>
    ),
  },
} satisfies Meta<typeof PageShell>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
