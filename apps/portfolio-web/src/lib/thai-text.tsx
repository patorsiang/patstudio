import { splitThai } from "@patorsiang/utils";
import type { ReactNode } from "react";

/**
 * Wraps each run of Thai script in `<span lang="th">`, so a screen reader
 * switches to a Thai voice for it (WCAG 3.1.2 Language of Parts). For text
 * that arrives as a plain string, like a post's title and summary, where the
 * author cannot mark the language. The post body does the same on its HTML in
 * packages/content/src/posts/render.ts, from the same `splitThai`.
 *
 * A function, not a component: it paints nothing of its own, so it needs no
 * story (src/components/stories.test.ts) and does not add to the design system.
 */
export function markThaiText(text: string): ReactNode {
  return splitThai(text).map((part, index) =>
    part.thai ? (
      <span key={index} lang="th">
        {part.text}
      </span>
    ) : (
      part.text
    ),
  );
}
