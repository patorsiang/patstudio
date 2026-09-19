import { z } from "zod";

/**
 * Mirrors the maturity levels the source repo's README already defines, so the
 * archive and the site cannot disagree about what a post's status means.
 */
export const postMaturitySchema = z.enum(["raw-note", "draft", "published", "evergreen"]);

export const postSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  // ISO date, not just a year: three posts sorted by year alone have no order.
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
  summary: z.string().min(1),
  tags: z.array(z.string()).default([]),
  maturity: postMaturitySchema,
  lang: z.array(z.enum(["en", "th"])).min(1),
  /**
   * Set only when the post was first published somewhere else (the Medium
   * archive). It overrides this site's self-canonical so the original keeps
   * the search result instead of competing with a copy that has no history.
   */
  canonical: z.string().url().optional(),
  /**
   * Other places this same post is readable. The label is derived from the
   * host (see `posts/elsewhere.ts`), so front matter stays one flat line and
   * the parser needs no YAML dependency.
   */
  elsewhere: z.array(z.string().url()).default([]),
  body: z.string(),
});
