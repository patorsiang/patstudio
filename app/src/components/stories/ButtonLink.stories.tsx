import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ButtonLink } from "@/components/atoms/ButtonLink";

const meta = {
  title: "Atoms/ButtonLink",
  component: ButtonLink,
  args: {
    children: "View CV",
    href: "/en/cv/fullstack-engineer",
  },
} satisfies Meta<typeof ButtonLink>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Secondary: Story = {};

export const Primary: Story = {
  args: {
    variant: "primary",
  },
};

export const External: Story = {
  args: {
    href: "https://github.com/patorsiang",
    target: "_blank",
    rel: "noreferrer",
    children: "GitHub",
  },
};

/** With `download` this renders a plain anchor, so the client router cannot intercept it. */
export const Download: Story = {
  args: {
    href: "/cv/export/markdown?role=fullstack_engineer&lang=en",
    download: "napatchol-thaipanich-fullstack_engineer-en.cv.md",
    children: "Download Markdown",
  },
};
