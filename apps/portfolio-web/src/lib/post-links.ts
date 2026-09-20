import { postLinkLabel, type PostSummary } from "@patorsiang/content";

export type PostExternalLink = {
  /** "original" when this site holds the copy; "also" when it holds the original. */
  readonly kind: "original" | "also";
  readonly label: string;
  readonly href: string;
};

/**
 * The out-of-site links a post should show, in the order they are read.
 *
 * `lib/posts.ts` explains why post *cards* never link out — every card goes to
 * `/posts/<slug>`. These links are different: they are not navigation to the
 * same content on another host, they state where else this piece exists, which
 * is the one thing an on-site archive cannot say for itself. A recruiter
 * checking output, and a reader who wants to comment, both need it.
 */
export function postExternalLinks(
  post: Pick<PostSummary, "canonical" | "elsewhere">,
): PostExternalLink[] {
  const links: PostExternalLink[] = [];
  const seen = new Set<string>();

  const push = (kind: PostExternalLink["kind"], href: string) => {
    const label = postLinkLabel(href);

    if (!label || seen.has(href)) return;

    seen.add(href);
    links.push({ kind, label, href });
  };

  if (post.canonical) push("original", post.canonical);
  for (const href of post.elsewhere) push("also", href);

  return links;
}
