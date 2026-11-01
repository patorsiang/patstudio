import type { Post, PostSummary } from "@patorsiang/content";
// Subpath, not the main barrel: fetchPosts/POST_FALLBACK need
// renderPostBody's jsdom dependency, which most other consumers of
// @patorsiang/content (including cv-engine) must not carry - see
// packages/content/src/index.ts.
import { fetchPosts, POST_FALLBACK } from "@patorsiang/content/posts";

import { POST_IMAGE_SIZES } from "@/lib/post-image-sizes";

/**
 * Every route reads posts through here.
 *
 * The fallback exists so a GitHub outage degrades the index to titles and
 * links rather than an empty page. Every card links to `/posts/<slug>`
 * regardless of whether the data came from a live fetch or the fallback -
 * an out-of-site link would either 404 just the same (nowhere else on this
 * site has the body) or point a reader at raw, unedited notes in the source
 * repo, which is worse. In practice this only matters for a slug that has
 * never been successfully rendered before a live outage starts; anything
 * already built keeps serving its last-good page until the outage clears
 * and the next revalidation succeeds.
 */
export async function getPosts(): Promise<PostSummary[]> {
  try {
    return await fetchPosts(POST_IMAGE_SIZES);
  } catch (error) {
    console.error("Falling back to committed post summaries", error);
    return [...POST_FALLBACK];
  }
}

export async function getPost(slug: string): Promise<Post | null> {
  try {
    const posts = await fetchPosts(POST_IMAGE_SIZES);
    return posts.find((post) => post.slug === slug) ?? null;
  } catch (error) {
    console.error(`Could not load post ${slug}`, error);
    return null;
  }
}
