import type { ContentMeta, Link } from "./common";
import type { TranslatableText } from "./translation";

export type ProjectCategory =
  | "web"
  | "ai-ml"
  | "security-ctf"
  | "blockchain-fintech"
  | "game-interactive"
  | "open-source"
  | "product-experiment"
  | "academic"
  | "tutorial-learning"
  | "iot";

export type ProjectStatus =
  "idea" | "prototype" | "in-progress" | "launched" | "paused" | "archived";

export type ProjectPlacement = "featured-project" | "project" | "playground" | "hidden";

export type ContributionType = "solo" | "team" | "open-source" | "academic" | "tutorial";

export type Project = ContentMeta & {
  readonly title: TranslatableText;
  readonly slug: string;
  readonly category: ProjectCategory;
  readonly status: ProjectStatus;
  readonly summary: TranslatableText;
  readonly role: TranslatableText;
  readonly techStack: readonly string[];
  readonly tags: readonly string[];
  readonly highlights: readonly TranslatableText[];
  readonly links: readonly Link[];
  readonly placement: ProjectPlacement;
  readonly contributionType: ContributionType;
  readonly timeframe?: TranslatableText;
  readonly problem?: TranslatableText;
  readonly audience?: TranslatableText;
  readonly keyLearning?: readonly TranslatableText[];
  readonly testingNotes?: TranslatableText;
};
