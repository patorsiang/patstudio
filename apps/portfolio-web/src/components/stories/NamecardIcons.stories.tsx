import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  ChevronRightIcon,
  EmailIcon,
  FlipIcon,
  GitHubIcon,
  LineIcon,
  LinkedInIcon,
  PlusIcon,
  WhatsAppIcon,
} from "@/components/atoms/NamecardIcons";

const icons = [
  { name: "LineIcon", Icon: LineIcon },
  { name: "WhatsAppIcon", Icon: WhatsAppIcon },
  { name: "GitHubIcon", Icon: GitHubIcon },
  { name: "LinkedInIcon", Icon: LinkedInIcon },
  { name: "EmailIcon", Icon: EmailIcon },
  { name: "PlusIcon", Icon: PlusIcon },
  { name: "ChevronRightIcon", Icon: ChevronRightIcon },
  { name: "FlipIcon", Icon: FlipIcon },
];

const meta = {
  title: "Atoms/NamecardIcons",
  component: LineIcon,
} satisfies Meta<typeof LineIcon>;

export default meta;

type Story = StoryObj<typeof meta>;

/** All eight glyphs at their default sizes. They inherit `currentColor`, so they follow the theme. */
export const AllIcons: Story = {
  render: () => (
    <ul className="flex flex-wrap gap-6 text-(--color-text)">
      {icons.map(({ name, Icon }) => (
        <li key={name} className="flex flex-col items-center gap-2 text-xs">
          <Icon size={32} />
          <span className="font-mono text-(--color-text-muted)">{name}</span>
        </li>
      ))}
    </ul>
  ),
};

/** The size that decides whether the row reads: the default 18 px next to a label. */
export const WithLabel: Story = {
  render: () => (
    <p className="inline-flex items-center gap-2 text-sm font-medium text-(--color-text)">
      <GitHubIcon />
      GitHub
    </p>
  ),
};
