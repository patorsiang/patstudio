/**
 * The hosts `/_next/image` is allowed to fetch a post image from.
 *
 * One list, two readers, and they must agree:
 *
 * - `next.config.ts` spreads it into `images.remotePatterns`, which is what the
 *   optimizer actually enforces. A URL it doesn't cover is a 400, not a
 *   fallback.
 * - `render.ts` calls `isOptimizableImageUrl` to decide whether to emit an
 *   `/_next/image` URL at all, or degrade the image to a link.
 *
 * If the two disagree the failure is silent in one direction (an image that
 * could have been optimized renders as a link) and loud in the other (a
 * `<img>` pointing at a 400). Hence one file, no imports, so `next.config.ts`
 * can read it without pulling in `marked`/`jsdom` through the posts barrel.
 *
 * This is also the file to edit when a post needs an image that does not live
 * in `thinking-in-public`. Add the host here and both sides follow.
 */

export type PostImageSource = {
  readonly protocol: "https";
  readonly hostname: string;
  /**
   * A `remotePatterns` pathname glob. Only a trailing `/**` is used here - it
   * is the one wildcard form `matchesPathname` below implements.
   */
  readonly pathname: string;
};

/**
 * Scoped to the one repo posts are authored in rather than all of
 * `raw.githubusercontent.com`, or even all of `/patorsiang/`. `remotePatterns`
 * is a standing invitation for anyone to make this site's optimizer fetch and
 * cache whatever the pattern covers; there is no reason for that to be wider
 * than the content source actually is.
 */
export const POST_IMAGE_SOURCES: readonly PostImageSource[] = [
  {
    protocol: "https",
    hostname: "raw.githubusercontent.com",
    pathname: "/patorsiang/thinking-in-public/**",
  },
  /*
   * Event posters for the meetup write-ups, on the organisers' own CDNs.
   * These are the only images not in `thinking-in-public`, and they are here
   * under protest: the URLs belong to somebody else and can be revoked or
   * re-transformed without notice, at which point the image breaks once the
   * optimizer's 30-day cache lapses.
   *
   * The durable fix is to commit both posters into `thinking-in-public/assets`
   * and reference them relatively, the way every other post image works, so
   * the site depends on one origin the author controls. Until then, note that
   * the optimizer fetches each source roughly once a month and serves every
   * reader from Vercel's cache - this is a caching proxy, not hotlinking.
   */
  { protocol: "https", hostname: "p-u.popcdn.net", pathname: "/event_details/posters/**" },
  { protocol: "https", hostname: "res.cloudinary.com", pathname: "/startup-grind/**" },
];

/**
 * Exported for testing, and deliberately narrower than Next's own glob
 * handling: `/**` matches any number of trailing segments, and nothing else is
 * supported. A pattern this doesn't understand matches nothing rather than
 * matching too much.
 */
export function matchesPathname(pattern: string, pathname: string): boolean {
  if (pattern.endsWith("/**")) {
    return pathname.startsWith(`${pattern.slice(0, -2)}`);
  }

  return pattern === pathname;
}

/** True when `/_next/image` is allowed to fetch this URL. */
export function isOptimizableImageUrl(url: string): boolean {
  let parsed: URL;

  try {
    parsed = new URL(url);
  } catch {
    return false;
  }

  return POST_IMAGE_SOURCES.some(
    (source) =>
      // `protocol` on a parsed URL carries the colon; the pattern doesn't.
      parsed.protocol === `${source.protocol}:` &&
      parsed.hostname === source.hostname &&
      matchesPathname(source.pathname, parsed.pathname),
  );
}
