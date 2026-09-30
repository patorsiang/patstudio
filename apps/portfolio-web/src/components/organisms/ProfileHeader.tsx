import Image from "next/image";

import { HeroMark } from "@/components/atoms/HeroMark";
import { ContactLinks, type ContactLink } from "@/components/molecules/ContactLinks";

type ProfileHeaderProps = {
  readonly handle: string;
  readonly name: string;
  readonly role: string;
  readonly headline: string;
  readonly links: readonly ContactLink[];
  /**
   * Optional; omitting it renders pixel-identical. The flex wrapper below
   * applies either way, so the text block sits one level deeper in the DOM
   * than before this prop existed.
   * The alt text describes the person, not the file.
   */
  readonly portrait?: {
    readonly src: string;
    readonly alt: string;
  };
};

export function ProfileHeader({
  handle,
  name,
  role,
  headline,
  links,
  portrait,
}: ProfileHeaderProps) {
  return (
    <header className="flex flex-col gap-8 border-b border-(--color-border) pb-10 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex max-w-3xl flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
        {portrait ? (
          <Image
            src={portrait.src}
            alt={portrait.alt}
            width={112}
            height={112}
            // The source is an SVG illustration, so Next's optimiser is both
            // unnecessary and disabled for SVG by default. Matches how the CV
            // QR code is rendered.
            unoptimized
            // The header opens every page it's used on, so the portrait is the
            // LCP element there - lazy loading (Next's default) delays it.
            loading="eager"
            fetchPriority="high"
            className="h-24 w-24 shrink-0 sm:h-28 sm:w-28"
          />
        ) : null}
        <div>
          <div className="flex items-center gap-2">
            <HeroMark />
            <p className="font-mono text-sm font-medium tracking-[0.08em] text-(--color-accent)">
              ~/{handle}
            </p>
          </div>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-foreground sm:text-6xl">
            {name}
          </h1>
          <p className="mt-4 text-xl font-medium text-(--color-text-muted)">{role}</p>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-(--color-text-muted)">{headline}</p>
        </div>
      </div>
      <ContactLinks links={links} />
    </header>
  );
}
