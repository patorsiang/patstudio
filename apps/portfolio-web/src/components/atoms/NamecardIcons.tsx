type IconProps = {
  readonly size?: number;
  readonly className?: string;
};

/**
 * Generic outline glyphs for the namecard's channel row - not the LINE /
 * WhatsApp / GitHub / LinkedIn brand marks. A label sits next to each one
 * everywhere it is used, so the glyph only ever needs to read as "a channel",
 * not identify which one on its own.
 *
 * Swapping in the real brand SVGs is tracked as the namecard's one open asset
 * gap - see docs/design/namecard.md section 10.
 */
function iconProps({ size = 18, className }: IconProps) {
  return {
    viewBox: "0 0 24 24",
    width: size,
    height: size,
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true as const,
  };
}

export function LineIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M4 5h16v11H8l-4 4V5z" />
    </svg>
  );
}

export function WhatsAppIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M6 4c1 0 2 .2 2.4 1.1L9.6 8c.3.7.1 1.5-.4 2l-1 1a12 12 0 0 0 5 5l1-1c.5-.5 1.3-.7 2-.4l2.9 1.2C20.8 16 21 17 21 18v1a2 2 0 0 1-2 2h-1C10.5 21 3 13.5 3 6V5a2 2 0 0 1 2-2h1z" />
    </svg>
  );
}

export function GitHubIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M8 9l-3 3 3 3" />
      <path d="M16 9l3 3-3 3" />
      <path d="M13 6l-2 12" />
    </svg>
  );
}

export function LinkedInIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M9 15l6-6" />
      <path d="M8.5 12.5l-2 2a3 3 0 0 0 4 4l2-2" />
      <path d="M15.5 11.5l2-2a3 3 0 0 0-4-4l-2 2" />
    </svg>
  );
}

export function EmailIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <svg {...iconProps({ ...props, size: props.size ?? 14 })} strokeWidth={2.2}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <svg {...iconProps({ ...props, size: props.size ?? 15 })} strokeWidth={2}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

/** The corner cue's icon on the flip card - a re-triggerable flip glyph. */
export function FlipIcon(props: IconProps) {
  return (
    <svg {...iconProps({ ...props, size: props.size ?? 13 })} strokeWidth={2.2}>
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}
