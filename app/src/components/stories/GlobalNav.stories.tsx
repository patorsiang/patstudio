import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { GlobalNav } from "@/components/organisms/GlobalNav";

const meta = {
  title: "Organisms/GlobalNav",
  component: GlobalNav,
  parameters: {
    layout: "fullscreen",
    // The nav reads the current path to mark the active link, so each story sets one.
    nextjs: { appDirectory: true, navigation: { pathname: "/about" } },
  },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-6xl px-6 py-6 sm:px-8 lg:px-10">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GlobalNav>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OnAbout: Story = {};

/** On a CV page the nav also shows the EN / TH language switch. */
export const OnCvPage: Story = {
  parameters: {
    nextjs: { appDirectory: true, navigation: { pathname: "/en/cv/fullstack-engineer" } },
  },
};

export const OnThaiCvPage: Story = {
  parameters: {
    nextjs: { appDirectory: true, navigation: { pathname: "/th/cv/fullstack-engineer" } },
  },
};
