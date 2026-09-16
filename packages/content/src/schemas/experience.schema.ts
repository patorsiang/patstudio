import { z } from "zod";
import { contentMetaSchema } from "./common.schema";
import { translatableTextSchema } from "./translation.schema";

export const experienceTypeSchema = z.enum([
  "work",
  "education",
  "award",
  "activity",
  "internship",
]);

/**
 * `YYYY-MM`, or `YYYY` where only the year is known. Anything looser reaches
 * `cv-engine`'s timeline maths as an unparseable date, which silently falls back to
 * today rather than failing — see `docs/decisions/0002-cv-timeline-gap-bridging.md`.
 */
const contentDateSchema = z
  .string()
  .regex(/^\d{4}(-(0[1-9]|1[0-2]))?$/, "Date must be YYYY-MM, or YYYY when only the year is known");

export const experienceSchema = contentMetaSchema.extend({
  type: experienceTypeSchema,
  title: translatableTextSchema,
  organization: translatableTextSchema,
  location: translatableTextSchema,
  startDate: contentDateSchema,
  endDate: contentDateSchema.optional(),
  current: z.boolean().optional(),
  summary: translatableTextSchema,
  highlights: z.array(translatableTextSchema),
  skills: z.array(z.string()),
  tags: z.array(z.string()),
});
