import type { PostSummary } from "@patorsiang/content";
import Link from "next/link";

import { Card } from "@/components/atoms/Card";
import { Tag } from "@/components/atoms/Tag";
import { PostElsewhere } from "@/components/molecules/PostElsewhere";

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function PostCard({ post }: { readonly post: PostSummary }) {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-baseline gap-x-3 text-xs font-medium uppercase tracking-[0.12em] text-(--color-accent)">
        <time dateTime={post.date}>{dateFormat.format(new Date(post.date))}</time>
        {/* Only surfaced when it is not a finished post - the reader should
            know they are reading a draft, and "published" is the default. */}
        {post.maturity === "published" ? null : <span>{post.maturity.replace("-", " ")}</span>}
      </div>

      <h2 className="mt-3 text-xl font-semibold text-foreground">
        {/* tap-reach rather than a real 40px box: the title carries the
            card's line rhythm, and a block-level hit box would open a gap
            above the date row and below the summary.
            `block` (not the default inline): tap-reach's ::after positions
            itself relative to the link's own box, and an inline element
            whose text wraps to a second line only gives that positioning a
            single line-box fragment to anchor to (typically the first),
            not the full wrapped extent - which can put the 40px tap band
            somewhere that isn't over the rendered text at all. A block
            box is never fragmented like that, and renders identically here
            since this link is the heading's only child. */}
        <Link
          href={`/posts/${post.slug}`}
          className="tap-reach block underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus)"
        >
          {post.title}
        </Link>
      </h2>

      <p className="mt-3 text-sm leading-7 text-(--color-text-muted)">{post.summary}</p>

      {post.tags.length > 0 ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
      ) : null}

      <PostElsewhere post={post} className="mt-5" />
    </Card>
  );
}
