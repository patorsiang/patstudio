// The design system's public surface for Claude Design: exactly the components
// that have a Storybook story. Re-exports the app's real source - nothing here is
// reimplemented. Add a line here (and a story) to add a component to the sync.
import "./font-vars";

// Not a component: lets a prototype pick the route GlobalNav and OfflineBanner react to.
export { PathnameProvider } from "../shims/next-navigation";

export { Button } from "@/components/atoms/Button";
export { ButtonLink } from "@/components/atoms/ButtonLink";
export { Card } from "@/components/atoms/Card";
export { GridGlow } from "@/components/atoms/GridGlow";
export { HeroMark } from "@/components/atoms/HeroMark";
export { RevealOnView } from "@/components/atoms/RevealOnView";
export { SiteMark } from "@/components/atoms/SiteMark";
export { Tag } from "@/components/atoms/Tag";
export { TextLink } from "@/components/atoms/TextLink";
export { Breadcrumbs } from "@/components/molecules/Breadcrumbs";
export { ContactLinks } from "@/components/molecules/ContactLinks";
export { ExperienceCard } from "@/components/molecules/ExperienceCard";
export { ProjectCard } from "@/components/molecules/ProjectCard";
export { SegmentedLinks } from "@/components/molecules/SegmentedLinks";
export { SkillGroup } from "@/components/molecules/SkillGroup";
export { ProfileHeader } from "@/components/organisms/ProfileHeader";
export { NamecardStrap } from "@/components/atoms/NamecardStrap";
export {
  ChevronRightIcon,
  EmailIcon,
  FlipIcon,
  GitHubIcon,
  LineIcon,
  LinkedInIcon,
  PlusIcon,
  WhatsAppIcon,
} from "@/components/atoms/NamecardIcons";
export { OfflineBanner } from "@/components/molecules/OfflineBanner";
export { PostCard } from "@/components/molecules/PostCard";
export { PostElsewhere } from "@/components/molecules/PostElsewhere";
export { CVSection } from "@/components/organisms/CVSection";
export { GlobalNav } from "@/components/organisms/GlobalNav";
export { NamecardFlip } from "@/components/organisms/NamecardFlip";
export { Section } from "@/components/organisms/Section";
export { SiteFooter } from "@/components/organisms/SiteFooter";
export { PageShell } from "@/components/templates/PageShell";
