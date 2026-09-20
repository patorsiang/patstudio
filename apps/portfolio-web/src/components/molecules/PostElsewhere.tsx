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
          {/* tap-reach, not a real h-10 box: this row sits under a card's
              tags, and 40px of real height would open a gap there for one
              line of metadata. `inline-block` because ::after anchors to the
              link's own box, and an inline box that wrapped would give it
              only one line fragment to sit over - see PostCard's title. */}
          <TextLink
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className="tap-reach inline-block"
          >
            {link.label}
          </TextLink>
        </span>
      ))}
    </p>
  );
}
