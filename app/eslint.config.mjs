import { defineConfig } from "eslint/config";
import { nextBaseConfig } from "@patorsiang/configs/eslint-next";

// Atomic design layers, lowest first. A layer may use the layers below it and
// nothing above: an atom knows nothing of molecules, a molecule nothing of
// organisms. Enforced here because the boundary is invisible at review time -
// an upward import looks like any other import until the component graph is
// tangled enough that nothing can be reused or tested in isolation.
const layers = [
  { dir: "atoms", singular: "An atom" },
  { dir: "molecules", singular: "A molecule" },
  { dir: "organisms", singular: "An organism" },
  { dir: "templates", singular: "A template" },
];

// Components must not reach into route code: it inverts the dependency and
// makes the component unusable outside this app's routing.
const noAppImports = {
  group: ["@/app/*", "**/app/*", "../../app/*"],
  message:
    "Components cannot import from app/. Move the shared helper into src/lib and import it from there.",
};

function formatList(items) {
  if (items.length <= 2) {
    return items.join(" or ");
  }

  return `${items.slice(0, -1).join(", ")}, or ${items.at(-1)}`;
}

// Every config below repeats noAppImports on purpose: flat config replaces a
// rule's options rather than merging them, so a later per-layer block would
// silently drop the app/ restriction if it listed only its own patterns.
const componentBoundaryRules = [
  {
    files: ["src/components/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [noAppImports] }],
    },
  },
  ...layers.flatMap((layer, index) => {
    const higherLayers = layers.slice(index + 1);

    if (higherLayers.length === 0) {
      return [];
    }

    return [
      {
        files: [`src/components/${layer.dir}/**/*.{ts,tsx}`],
        rules: {
          "no-restricted-imports": [
            "error",
            {
              patterns: [
                noAppImports,
                {
                  group: higherLayers.flatMap((higher) => [
                    `@/components/${higher.dir}/*`,
                    `**/components/${higher.dir}/*`,
                    `../${higher.dir}/*`,
                  ]),
                  message: `${layer.singular} cannot import from ${formatList(higherLayers.map((higher) => higher.dir))}. Move the shared piece down a layer, or lift the composition up into the layer that needs it.`,
                },
              ],
            },
          ],
        },
      },
    ];
  }),
];

const eslintConfig = defineConfig([...nextBaseConfig, ...componentBoundaryRules]);

export default eslintConfig;
