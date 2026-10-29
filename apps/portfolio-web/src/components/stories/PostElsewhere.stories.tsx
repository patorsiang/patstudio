import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PostElsewhere } from "@/components/molecules/PostElsewhere";

const meta = {
  title: "Molecules/PostElsewhere",
  component: PostElsewhere,
  args: {
    post: {
      canonical: "https://medium.com/@napatcholthaipanich_6231/example-post",
      elsewhere: ["https://dev.to/patorsiang/example-post"],
    },
  },
} satisfies Meta<typeof PostElsewhere>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Written elsewhere first, then copied here. */
export const OriginalAndAlso: Story = {};

export const AlsoOnly: Story = {
  args: {
    post: { canonical: undefined, elsewhere: ["https://dev.to/patorsiang/example-post"] },
  },
};
