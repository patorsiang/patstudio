import { z } from "zod";
import {
  experiences as rawExperiences,
  profile as rawProfile,
  projects as rawProjects,
  skills as rawSkills,
} from "./data";
import { experienceSchema, profileSchema, projectSchema, skillGroupSchema } from "./schemas";

export const experiences = z.array(experienceSchema).parse(rawExperiences);
export const profile = profileSchema.parse(rawProfile);
export const projects = z.array(projectSchema).parse(rawProjects);
export const skills = z.array(skillGroupSchema).parse(rawSkills);

export type {
  ContentMeta,
  ContentSource,
  ContentSourceType,
  ContentVisibility,
  ContributionType,
  Experience,
  ExperienceType,
  Link,
  Locale,
  Post,
  PostMaturity,
  Profile,
  Project,
  ProjectCategory,
  ProjectPlacement,
  ProjectStatus,
  RawPost,
  SkillGroup,
  SkillGroupId,
  SupportedLocale,
  TranslatableText,
  TranslationEntry,
  TranslationStatus,
} from "./types";

export * from "./schemas";

// NOT "export * from './posts'": posts/fetch.ts genuinely needs
// renderPostBody (packages/content/src/posts/render.ts), which needs
// isomorphic-dompurify/jsdom - a real, direct dependency, unlike the
// accidental barrel pull-through fixed in @patorsiang/utils. But cv-engine
// (and everything built on cv-engine, including the /cv legacy-redirect
// routes) only needs profile/experiences/projects/skills from this
// package's main barrel, never posts - so eagerly re-exporting posts here
// pulled jsdom into those routes' bundles too. Only PostSummary is
// re-exported directly: it's a type-only export, erased at compile time,
// so it carries none of the runtime weight. Consumers that need the actual
// posts runtime (fetchPosts, POST_FALLBACK, renderPostBody) import from the
// "@patorsiang/content/posts" subpath instead.
export type { PostSummary } from "./posts/fallback";
// Safe in the main barrel despite the note above: posts/elsewhere.ts is a
// pure string helper with no imports at all, so it carries no jsdom.
export { postLinkLabel } from "./posts/elsewhere";
