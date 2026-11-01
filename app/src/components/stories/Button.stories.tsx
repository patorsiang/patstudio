import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "@/components/atoms/Button";

const meta = {
  title: "Atoms/Button",
  component: Button,
  args: {
    children: "Print CV",
    onClick: () => {},
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Secondary: Story = {};

export const Primary: Story = {
  args: {
    variant: "primary",
  },
};

/**
 * Both variants together: the secondary boundary uses --color-border-strong,
 * which is the token that has to clear 3:1 in each theme. Switch the toolbar
 * theme on this story to check it.
 */
export const BothVariants: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-3">
      <Button {...args} variant="secondary">
        Secondary
      </Button>
      <Button {...args} variant="primary">
        Primary
      </Button>
    </div>
  ),
};
