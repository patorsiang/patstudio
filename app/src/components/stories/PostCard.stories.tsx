import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PostCard } from "@/components/molecules/PostCard";

const meta = {
  title: "Molecules/PostCard",
  component: PostCard,
  args: {
    post: {
      slug: "example-talk-notes-2026",
      title: "What I learned from a 20-minute talk about delegating to AI",
      date: "2026-09-06",
      summary:
        "Notes from a community talk: prompt frameworks against delegation, and a first-hand test of Thai text rendering.",
      tags: ["ai", "events", "thai"],
      maturity: "published",
      lang: ["en", "th"],
      elsewhere: [],
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-2xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PostCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Published: Story = {};

/** An unfinished post names its state next to the date. */
export const Draft: Story = {
  args: {
    post: { ...meta.args.post, maturity: "draft" },
  },
};

/** The post also lives off-site, so the card says where. */
export const WithElsewhere: Story = {
  args: {
    post: {
      ...meta.args.post,
      canonical: "https://medium.com/@napatcholthaipanich_6231/example-post",
      elsewhere: ["https://dev.to/patorsiang/example-post"],
    },
  },
};

export const NoTags: Story = {
  args: {
    post: { ...meta.args.post, tags: [] },
  },
};
