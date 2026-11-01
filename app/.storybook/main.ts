import type { StorybookConfig } from "@storybook/nextjs-vite";

const config: StorybookConfig = {
  stories: ["../src/components/**/*.stories.@(ts|tsx)"],
  // The namecard story loads /avataaars.svg and the QR code from public/.
  staticDirs: ["../public"],
  // Runs axe against each story as you open it. Pinned to the exact storybook
  // version rather than a caret range - mixed Storybook package versions fail
  // at runtime in ways the install only warns about.
  //
  // Scope worth remembering: axe checks contrast, accessible names, and ARIA
  // wiring on a component in isolation. It cannot see anything that only exists
  // in a real page - focus order across a route, or the 40px tap target floor
  // in docs/design/design-system.md, which is stricter than the 24px axe tests
  // and depends on layout a story does not reproduce. That rule is covered by
  // e2e/tap-targets.e2e.ts instead.
  addons: ["@storybook/addon-a11y"],
  framework: {
    name: "@storybook/nextjs-vite",
    options: {},
  },
};

export default config;
