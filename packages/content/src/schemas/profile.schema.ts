import { z } from "zod";
import { contentMetaSchema, linkSchema } from "./common.schema";
import { translatableTextSchema } from "./translation.schema";

export const profileSchema = contentMetaSchema.extend({
  name: translatableTextSchema,
  handle: z.string(),
  nickname: translatableTextSchema,
  nickname2: translatableTextSchema,
  role: translatableTextSchema,
  location: translatableTextSchema,
  headline: translatableTextSchema,
  summary: z.array(translatableTextSchema),
  contact: z.object({
    email: linkSchema,
    github: linkSchema,
    linkedin: linkSchema,
    phone: linkSchema.optional(),
    line: linkSchema.optional(),
    whatsapp: linkSchema.optional(),
  }),
  links: z.array(linkSchema),
});
