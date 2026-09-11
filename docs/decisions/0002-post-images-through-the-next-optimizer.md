# Post images: the Next optimizer, not a bucket

Date: 2026-09-11
Status: approved 2026-09-11
Branch: `test/functional-coverage`

Follows the house ADR shape set by `0001-namecard-in-portfolio-web.md`.

## Problem

Post images were downloaded and committed. `scripts/vendor-post-images.ts` fetched every
remote image a post referenced from `patorsiang/thinking-in-public`, wrote it into
`apps/portfolio-web/public/posts/<slug>/`, and generated a URL-to-local-path map that
`render.ts` looked each image up in before emitting a bare `<img loading="lazy">`.

Measured on `four-frameworks-one-question-2026`: **3.90 MB** across nine 430-560 KB JPEGs,
served at full size with no `srcset`, no AVIF/WebP, and no `width`/`height`. Every new
image-heavy post added another megabyte to the repo and to the deploy artifact, permanently.

The question that opened this was whether to move the bytes to S3. Two motivations were
named: page weight, and wanting a route for images that do not live in the source repo.

## Decisions

| Decision                      | Choice                                                                                     | Reasoning                                                                                                                                                                                                                                                            |
| ----------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Where the bytes live          | Stay at their origin; nothing is committed                                                 | S3, Vercel Blob and the existing `public/` copy all answer "where", and the problem was "how big". Moving 3.90 MB to a bucket still serves 3.90 MB.                                                                                                                  |
| How they reach the reader     | `/_next/image` with a responsive `srcset`                                                  | Vercel already runs an image optimizer this project pays for and already uses in `ProfileHeader`/`NamecardFlip`. It resizes, re-encodes to AVIF, and caches the result at the CDN.                                                                                   |
| Whether to add a bucket       | No                                                                                         | A bucket adds a provisioning step, a `BLOB_READ_WRITE_TOKEN`-class secret, a bill, and an upload step to the publish flow — in exchange for nothing the optimizer does not already do. Revisit only if image sources ever need to be uploaded rather than committed. |
| Host allowlist                | `packages/content/src/posts/image-hosts.ts`, read by both `next.config.ts` and `render.ts` | `remotePatterns` is what the optimizer enforces; the renderer has to make the same judgement to decide whether to emit an `<img>` at all. Two copies would drift, and the drift is silent in one direction.                                                          |
| Images not in the source repo | Allowlisted per host, scoped to a path                                                     | This is the "non-repo images" route. Adding a host is one entry; anything not listed degrades to a link rather than a broken image.                                                                                                                                  |
| Image dimensions              | A generated manifest, `src/lib/post-image-sizes.ts`                                        | `width`/`height` are what keep CLS at zero, and they cannot be known from a URL. Measured once by `scripts/post-image-manifest.ts`, the same run-by-hand shape the vendoring script had.                                                                             |

## Result

Measured against a production build, on `four-frameworks-one-question-2026`:

|                 | before  | after     |
| --------------- | ------- | --------- |
| desktop, 1280px | 3.90 MB | **68 KB** |
| mobile, 375px   | 3.90 MB | **39 KB** |

CLS 0. Every image picks a candidate matched to its slot: 256w for a ~190px table cell,
828w for the 672px column, scaling up correctly on a 2x display. 4.9 MB left the repo.

## Why this does not widen the CSP

`img-src` stays `'self' data: blob:`. `/_next/image` serves the optimized copy from this
origin no matter where the source lives, so the URL in the page is always same-origin and
`images.remotePatterns` becomes the allowlist doing the work CSP would otherwise do. The
pre-existing e2e assertion _"every image in a post body is same-origin"_ passes unchanged —
that it still passes is the evidence, which is why it was not rewritten.

## Trade-offs accepted

- **A cold-cache image now depends on its origin being up.** A vendored file was in the
  deploy artifact and could not fail. Mitigated by a 30-day `minimumCacheTTL` and by post
  _text_ already being fetched from the same host — but it is a genuine reduction in
  isolation, not a free win.
- **Two images hotlink other people's CDNs.** The meetup posters for `bkkjs-summer-2026`
  and `gdg-buildwithai-2026` live on `p-u.popcdn.net` and `res.cloudinary.com` because they
  never existed in `thinking-in-public`; the vendoring script was the only thing that had
  been hiding that. The optimizer refetches each roughly monthly and serves everyone else
  from cache, so this is a caching proxy rather than hotlinking — but the URLs belong to
  someone else and can be revoked. **Follow-up: commit both posters into
  `thinking-in-public/assets` and reference them relatively**, then drop the two hosts.
- **The manifest is still a manual step.** Forgetting it costs an image its `width`/`height`
  and nothing else. The failure mode it replaced — an unvendored image rendering as a _link_
  — was strictly worse.
- **Transformations are metered.** ~11 images × up to 4 widths × 2 formats per 30-day cache
  cycle. Not close to any tier limit.

## History left alone

The 4.9 MB of blobs remain in git history. Rewriting history to reclaim them would break
every clone and fork for a rounding error against a 32 MB repo. Stopping the growth was the
objective.
