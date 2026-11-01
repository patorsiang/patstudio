import type { Preview } from "@storybook/nextjs-vite";

import "../src/app/globals.css";
import { geistMono, geistSans } from "../src/app/fonts";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },

  // Every component styles itself from the theme tokens, so a story rendered in
  // one theme only shows half of what it does. This drives the same data-theme
  // attribute GlobalNav sets at runtime, so the toolbar and the real app
  // exercise the identical code path.
  globalTypes: {
    theme: {
      description: "Theme tokens applied to the story",
      toolbar: {
        title: "Theme",
        icon: "contrast",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },

  initialGlobals: {
    theme: "light",
  },

  decorators: [
    (Story, context) => {
      document.documentElement.dataset.theme = context.globals.theme as string;
      // Stories never render layout.tsx, which is where <html> gets these. Without
      // them --font-geist-sans is empty and every story falls back to system-ui.
      document.documentElement.classList.add(geistSans.variable, geistMono.variable, "antialiased");

      return Story();
    },
  ],
};

export default preview;
