import type { ContentMeta, Link } from "./common";
import type { TranslatableText } from "./translation";

export type Profile = ContentMeta & {
  readonly name: TranslatableText;
  readonly handle: string;
  readonly nickname: TranslatableText;
  readonly nickname2: TranslatableText;
  readonly role: TranslatableText;
  readonly location: TranslatableText;
  readonly headline: TranslatableText;
  readonly summary: readonly TranslatableText[];
  readonly contact: {
    readonly email: Link;
    readonly github: Link;
    readonly linkedin: Link;
    readonly phone?: Link;
    readonly line?: Link;
    readonly whatsapp?: Link;
  };
  readonly links: readonly Link[];
};
