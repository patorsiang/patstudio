import { describe, expect, test } from "bun:test";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Storybook is the design system's source: `/design-sync` reads it, so a
 * component with no story never reaches Claude Design, however visual it is.
 * Before this test, 11 of 27 components were missing, including the nav and
 * the namecard where the WCAG audit found incidents, and nothing noticed.
 *
 * The rule: every component file in atoms, molecules, organisms and templates
 * has `stories/<Name>.stories.tsx`, unless it paints nothing. A new component
 * without a story fails here, so the choice to leave one out is written down
 * below with a reason.
 */

const root = import.meta.dir;
const groups = ["atoms", "molecules", "organisms", "templates"];

/** Components that render no markup, so a story would show an empty canvas. */
const paintsNothing: Record<string, string> = {
  DocumentLangSync: "sets document.documentElement.lang in an effect and returns null",
  ServiceWorkerRegistration: "registers the service worker in an effect and returns null",
};

/** Non-component modules that live beside the components. */
const notComponents = new Set(["button-styles"]);

function componentNames() {
  return groups.flatMap((group) =>
    readdirSync(join(root, group))
      .filter((file) => file.endsWith(".tsx"))
      .map((file) => file.replace(/\.tsx$/, ""))
      .filter((name) => !notComponents.has(name)),
  );
}

describe("component stories", () => {
  test("every visual component has a story", () => {
    const missing = componentNames()
      .filter((name) => !(name in paintsNothing))
      .filter((name) => !existsSync(join(root, "stories", `${name}.stories.tsx`)));

    expect(missing).toEqual([]);
  });

  test("an excluded component really has no story, so the list stays honest", () => {
    const stale = Object.keys(paintsNothing).filter((name) =>
      existsSync(join(root, "stories", `${name}.stories.tsx`)),
    );

    expect(stale).toEqual([]);
  });

  test("every excluded name is still a component", () => {
    const names = componentNames();
    const gone = Object.keys(paintsNothing).filter((name) => !names.includes(name));

    expect(gone).toEqual([]);
  });
});
