"use client";

import { Button } from "@/components/atoms/Button";

/**
 * Uses the browser's print. A future automated PDF export should set
 * displayHeaderFooter: false.
 *
 * This note used to be the button's aria-label, which replaced the visible
 * text "Print CV" as its accessible name (WCAG 2.5.3 Label in Name). A note for
 * developers belongs in a comment, not in what a screen reader announces.
 */
export function PrintButton() {
  return (
    <Button variant="primary" onClick={() => window.print()}>
      Print CV
    </Button>
  );
}
