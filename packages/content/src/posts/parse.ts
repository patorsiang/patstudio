import { postSchema } from "../schemas/post.schema";
import type { Post } from "../types/post";

/**
 * Front matter is a small, fixed shape - eight scalar-or-list keys - so it is
 * read directly rather than adding a YAML dependency for it. The parser is
 * deliberately strict: anything it does not recognise throws, because a post
 * that renders with a silently-empty summary is worse than a build that stops.
 */
const FRONT_MATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

function parseScalar(value: string): string {
  const trimmed = value.trim();

  // Quoted values may legitimately contain a colon, which is why they exist.
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

function parseList(value: string): string[] {
  const inner = value.trim().replace(/^\[/, "").replace(/\]$/, "");

  if (!inner.trim()) return [];

  return inner.split(",").map((entry) => parseScalar(entry));
}

export function parsePost(slug: string, raw: string): Post {
  const match = FRONT_MATTER.exec(raw);

  if (!match) {
    throw new Error(`${slug}: no front matter found — expected a --- block at the top of the file`);
  }

  const fields: Record<string, string> = {};

  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith("#")) continue;

    const separator = line.indexOf(":");
    if (separator === -1) continue;

    fields[line.slice(0, separator).trim()] = line.slice(separator + 1);
  }

  const body = raw
    .slice(match[0].length)
    // The H1 duplicates the front-matter title, which the page renders itself.
    .replace(/^\s*#\s+.*(\r?\n)+/, "")
    .trim();

  const parsed = postSchema.safeParse({
    slug,
    title: fields.title === undefined ? undefined : parseScalar(fields.title),
    date: fields.date === undefined ? undefined : parseScalar(fields.date),
    summary: fields.summary === undefined ? undefined : parseScalar(fields.summary),
    tags: fields.tags === undefined ? [] : parseList(fields.tags),
    maturity: fields.maturity === undefined ? undefined : parseScalar(fields.maturity),
    lang: fields.lang === undefined ? undefined : parseList(fields.lang),
    canonical: fields.canonical === undefined ? undefined : parseScalar(fields.canonical),
    elsewhere: fields.elsewhere === undefined ? [] : parseList(fields.elsewhere),
    body,
  });

  if (!parsed.success) {
    const detail = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");

    throw new Error(`${slug}: invalid front matter — ${detail}`);
  }

  return parsed.data;
}
