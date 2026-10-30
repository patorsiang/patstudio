// Browser stand-in for next/image: a plain <img>. The optimiser, placeholders and
// loaders are server concerns; the one in-scope caller passes `unoptimized`.
import type { ImgHTMLAttributes } from "react";

// Set by build-dist.mjs: app/public files the components use, as data URIs keyed
// by their URL path ("/card-qr.svg"). A bundle has no server to answer those.
declare const __DS_PUBLIC_FILES__: Record<string, string>;

type ImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src: string | { src: string };
  fill?: boolean;
  priority?: boolean;
  unoptimized?: boolean;
  quality?: number | string;
  placeholder?: string;
  blurDataURL?: string;
};

export default function Image({
  src,
  fill,
  priority: _p,
  unoptimized: _u,
  quality: _q,
  placeholder: _ph,
  blurDataURL: _b,
  style,
  ...rest
}: ImageProps) {
  const url = typeof src === "string" ? src : src.src;
  const fillStyle = fill ? { position: "absolute" as const, inset: 0, width: "100%", height: "100%" } : undefined;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={__DS_PUBLIC_FILES__[url] ?? url} style={{ ...fillStyle, ...style }} {...rest} />;
}
