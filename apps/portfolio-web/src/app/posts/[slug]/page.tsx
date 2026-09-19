import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/molecules/Breadcrumbs";
import { PostElsewhere } from "@/components/molecules/PostElsewhere";
import { PageShell } from "@/components/templates/PageShell";
import { postDateFormat } from "@/lib/dates";
import { buildBlogPostingJsonLd, buildBreadcrumbJsonLd, toJsonLdScript } from "@/lib/json-ld";
import { getPost, getPosts } from "@/lib/posts";
import { buildPageMetadata } from "@/lib/seo";

export const revalidate = 3600;

/** Prerendered at build; a post added later is served by ISR on first request. */
export async function generateStaticParams() {
  const posts = await getPosts();

  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) return {};

  return buildPageMetadata({
    title: post.title,
    description: post.summary,
    path: `/posts/${slug}`,
    // A backfilled archive post is a copy; the Medium original keeps the
    // search result rather than competing with a page that has no history.
    canonical: post.canonical,
  });
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const trail = [
    { href: "/posts", label: "Posts" },
    { href: `/posts/${slug}`, label: post.title },
  ];

  return (
    <PageShell>
      <article className="mx-auto w-full max-w-2xl">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLdScript(buildBreadcrumbJsonLd(trail)) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLdScript(buildBlogPostingJsonLd(post)) }}
        />

        <Breadcrumbs trail={trail} />

        <p className="mt-4 text-sm font-medium uppercase tracking-[0.16em] text-(--color-accent)">
          <time dateTime={post.date}>{postDateFormat.format(new Date(post.date))}</time>
        </p>
        <h1 className="mt-4 text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
          {post.title}
        </h1>
        <p className="mt-4 text-lg leading-8 text-(--color-text-muted)">{post.summary}</p>

        {/* Above the body, not below it: for an archive post the reader
            should learn the original lives elsewhere before reading a
            summary of it, not after. */}
        <PostElsewhere post={post} className="mt-6" />

        {/* Sanitised in packages/content/src/posts/render.ts. */}
        <div className="post-body mt-10" dangerouslySetInnerHTML={{ __html: post.body }} />
      </article>
    </PageShell>
  );
}
