import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SegmentedLinks } from "@/components/molecules/SegmentedLinks";

const meta = {
  title: "Molecules/SegmentedLinks",
  component: SegmentedLinks,
  args: {
    label: "CV variant",
    items: [
      {
        id: "fullstack",
        href: "/en/cv/fullstack-engineer",
        label: "Full-Stack",
        fullLabel: "Full-Stack Engineer",
        active: true,
      },
      {
        id: "ai-ml",
        href: "/en/cv/ai-ml-engineer",
        label: "AI / ML",
        fullLabel: "AI / ML Engineer",
        active: false,
      },
      {
        id: "security",
        href: "/en/cv/security-engineer",
        label: "Security",
        fullLabel: "Security Engineer",
        active: false,
      },
    ],
  },
} satisfies Meta<typeof SegmentedLinks>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/**
 * Three segments, full width. Kept for the row's own sake, but note this is
 * *not* how many roles the real CV toolbar renders - see CvVariants below,
 * which is the production shape (four roles) and is why this story alone
 * let the mobile overflow bug ship unnoticed.
 */
export const FullWidth: Story = {
  args: {
    className: "w-full",
  },
};

/**
 * The real CV toolbar shape: four roles, full width, `collapsible` so it
 * renders as a dropdown below `sm` and a wrap-safe row from `sm` up. Resize
 * the preview below 640px to see the dropdown.
 */
export const CvVariants: Story = {
  args: {
    className: "w-full",
    collapsible: { summary: "Apple Specialist" },
    items: [
      {
        id: "fullstack",
        href: "/en/cv/fullstack-engineer",
        label: "Full-Stack",
        fullLabel: "Full-Stack Engineer",
        active: false,
      },
      {
        id: "ai-ml",
        href: "/en/cv/ai-ml-engineer",
        label: "AI / ML",
        fullLabel: "AI / ML Engineer",
        active: false,
      },
      {
        id: "security",
        href: "/en/cv/security-engineer",
        label: "Security",
        fullLabel: "Security Engineer",
        active: false,
      },
      {
        id: "apple",
        href: "/en/cv/apple-specialist",
        label: "Apple Specialist",
        fullLabel: "Apple Specialist",
        active: true,
      },
    ],
  },
};

export const TwoSegments: Story = {
  args: {
    label: "Language",
    items: [
      {
        id: "en",
        href: "/en/cv/fullstack-engineer",
        label: "EN",
        fullLabel: "English",
        active: true,
      },
      {
        id: "th",
        href: "/th/cv/fullstack-engineer",
        label: "TH",
        fullLabel: "Thai",
        active: false,
      },
    ],
  },
};
