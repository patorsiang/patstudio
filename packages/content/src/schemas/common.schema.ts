import { z } from "../zod";
import { supportedLocaleSchema, translatableTextSchema } from "./translation.schema";

export const localeSchema = z.union([z.literal("en"), supportedLocaleSchema]);

export const contentSourceTypeSchema = z.enum(["manual", "github", "linkedin", "blog", "external"]);

export const contentSourceSchema = z.object({
  type: contentSourceTypeSchema,
  label: translatableTextSchema,
  url: z.string().optional(),
  syncedAt: z.string().optional(),
});

export const contentVisibilitySchema = z.enum(["public", "private", "case-study-only", "draft"]);

export const contentMetaSchema = z.object({
  id: z.string(),
  locale: localeSchema,
  source: contentSourceSchema,
  visibility: contentVisibilitySchema,
});

export const linkSchema = z.object({
  label: translatableTextSchema,
  url: z.string().refine(
    (url) => {
      const lower = url.toLowerCase();
      return (
        lower.startsWith("http://") ||
        lower.startsWith("https://") ||
        lower.startsWith("mailto:") ||
        lower.startsWith("tel:") ||
        lower.startsWith("/") ||
        lower.startsWith("#")
      );
    },
    {
      message: "URL must use a safe protocol (http, https, mailto, tel, or relative)",
    },
  ),
});
