import { z } from "zod";

export const supportedLocaleSchema = z.enum(["th", "ko", "zh-CN"]);

export const translationStatusSchema = z.enum(["missing", "ai_draft", "reviewed", "approved"]);

export const translationEntrySchema = z.object({
  value: z.string(),
  status: translationStatusSchema,
});

export const translatableTextSchema = z.object({
  en: z.string(),
  translated: z.partialRecord(supportedLocaleSchema, translationEntrySchema).optional(),
});
