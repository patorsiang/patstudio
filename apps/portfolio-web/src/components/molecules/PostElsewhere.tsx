import type { PostSummary } from "@patorsiang/content";

import { TextLink } from "@/components/atoms/TextLink";
import { classNames } from "@/lib/classnames";
import { postExternalLinks } from "@/lib/post-links";

const PREFIX = {
  original: "Originally on",
  also: "Also on",
} as const;

/**
 * Where else this post exists. Renders nothing when the answer is nowhere,
 * which is the common case - see `lib/post-links.ts` for why these links are
 * an exception to the rule that post UI never leaves the site.
 */
export function PostElsewhere({
  post,
  className,
}: {
  readonly post: Pick<PostSummary, "canonical" | "elsewhere">;
  readonly className?: string;
}) {
  const links = postExternalLinks(post);

  if (links.length === 0) return null;

  return (
    <p
      className={classNames(
        "flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-(--color-text-muted)",
        className,
      )}
    >
      {links.map((link) => (
        <span key={link.href}>
          {`${PREFIX[link.kind]} `}
          <TextLink href={link.href} target="_blank" rel="noreferrer">
            {link.label}
          </TextLink>
        </span>
      ))}
    </p>
  );
}
