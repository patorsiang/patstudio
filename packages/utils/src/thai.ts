/**
 * A run of Thai script. Whitespace, digits and light punctuation stay inside
 * the run only when Thai follows them, so "ครั้งที่ 6 (ไทย" is one run but the
 * English words of "ช่วง AI Governance และ" are not swallowed by their
 * neighbours. WCAG 3.1.2 (Language of Parts) wants the voice to switch where
 * the language does.
 */
const THAI_RUN = /[฀-๿]+(?:[\s\d.,!?:;()"'\-–—]*[฀-๿]+)*/g;

export type ThaiPart = {
  readonly text: string;
  readonly thai: boolean;
};

/**
 * Splits text into alternating Thai and non-Thai parts, so a caller can wrap
 * the Thai ones in `lang="th"`. The parts always join back to the input.
 *
 * Shared by the post renderer (HTML strings) and React components, because the
 * rule for what counts as a Thai passage must be the same in both.
 */
export function splitThai(text: string): ThaiPart[] {
  const parts: ThaiPart[] = [];
  let cursor = 0;

  for (const match of text.matchAll(THAI_RUN)) {
    if (match.index > cursor) parts.push({ text: text.slice(cursor, match.index), thai: false });

    parts.push({ text: match[0], thai: true });
    cursor = match.index + match[0].length;
  }

  if (cursor < text.length) parts.push({ text: text.slice(cursor), thai: false });

  return parts;
}
