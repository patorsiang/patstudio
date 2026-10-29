import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { OfflineBanner } from "@/components/molecules/OfflineBanner";

const meta = {
  title: "Molecules/OfflineBanner",
  component: OfflineBanner,
  parameters: {
    nextjs: { appDirectory: true, navigation: { pathname: "/about" } },
  },
  // The banner renders nothing while the browser is online, which is every
  // story's default. The story makes the browser report offline, and puts the
  // property back when it ends so the next story starts online.
  beforeEach: () => {
    const original = Object.getOwnPropertyDescriptor(Navigator.prototype, "onLine");

    Object.defineProperty(navigator, "onLine", { configurable: true, get: () => false });

    return () => {
      delete (navigator as unknown as { onLine?: boolean }).onLine;
      if (original) Object.defineProperty(Navigator.prototype, "onLine", original);
    };
  },
} satisfies Meta<typeof OfflineBanner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Offline: Story = {};
