import { z } from "../zod";
import { contentMetaSchema, linkSchema } from "./common.schema";
import { translatableTextSchema } from "./translation.schema";

export const projectCategorySchema = z.enum([
  "web",
  "ai-ml",
  "security-ctf",
  "blockchain-fintech",
  "game-interactive",
  "open-source",
  "product-experiment",
  "academic",
  "tutorial-learning",
  "iot",
]);

export const projectStatusSchema = z.enum([
  "idea",
  "prototype",
  "in-progress",
  "launched",
  "paused",
  "archived",
]);

export const projectPlacementSchema = z.enum([
  "featured-project",
  "project",
  "playground",
  "hidden",
]);

export const contributionTypeSchema = z.enum([
  "solo",
  "team",
  "open-source",
  "academic",
  "tutorial",
]);

export const projectSchema = contentMetaSchema.extend({
  title: translatableTextSchema,
  slug: z.string(),
  category: projectCategorySchema,
  status: projectStatusSchema,
  summary: translatableTextSchema,
  role: translatableTextSchema,
  techStack: z.array(z.string()),
  tags: z.array(z.string()),
  highlights: z.array(translatableTextSchema),
  links: z.array(linkSchema),
  placement: projectPlacementSchema,
  contributionType: contributionTypeSchema,
  timeframe: translatableTextSchema.optional(),
  problem: translatableTextSchema.optional(),
  audience: translatableTextSchema.optional(),
  keyLearning: z.array(translatableTextSchema).optional(),
  testingNotes: translatableTextSchema.optional(),
});
