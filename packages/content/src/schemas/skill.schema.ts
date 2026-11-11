import { z } from "../zod";
import { contentMetaSchema } from "./common.schema";
import { translatableTextSchema } from "./translation.schema";

export const skillGroupIdSchema = z.enum([
  "programming-fundamentals",
  "frontend",
  "backend-tools",
  "machine-learning-ai",
  "cloud-infrastructure",
  "security-blockchain",
  "databases",
  "languages",
]);

export const skillGroupSchema = contentMetaSchema.extend({
  groupId: skillGroupIdSchema,
  label: translatableTextSchema,
  items: z.array(z.string()),
});
