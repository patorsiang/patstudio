import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Breadcrumbs } from "@/components/molecules/Breadcrumbs";

const meta = {
  title: "Molecules/Breadcrumbs",
  component: Breadcrumbs,
  args: {
    trail: [
      { href: "/", label: "Home" },
      { href: "/posts", label: "Posts" },
      { href: "/posts/picking-one-thing", label: "Picking one thing to build" },
    ],
  },
} satisfies Meta<typeof Breadcrumbs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const PostPage: Story = {};

export const OneLevel: Story = {
  args: {
    trail: [
      { href: "/", label: "Home" },
      { href: "/projects", label: "Projects" },
    ],
  },
};
