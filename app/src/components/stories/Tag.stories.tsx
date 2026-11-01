import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Tag } from "@/components/atoms/Tag";

const meta = {
  title: "Atoms/Tag",
  component: Tag,
  args: {
    children: "TypeScript",
  },
} satisfies Meta<typeof Tag>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Group: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {["FastAPI", "Python", "React", "Redis", "TensorFlow", "Docker"].map((item) => (
        <Tag key={item}>{item}</Tag>
      ))}
    </div>
  ),
};
