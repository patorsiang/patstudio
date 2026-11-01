import { profile } from "@patorsiang/content";

import { cvRoleSlugs, listedCvRoleSlugs } from "@/lib/cv-routes";
import { defaultDescription, ownerName, siteUrl } from "@/lib/seo";

export const dynamic = "force-static";

const cvRoleLabels: Readonly<Record<(typeof cvRoleSlugs)[number], string>> = {
  "fullstack-engineer": "Full-Stack Engineer",
  "ai-ml-engineer": "AI / ML Engineer",
  "security-engineer": "Security Engineer",
  "apple-specialist": "Apple Specialist",
};

/**
 * llmstxt.org convention: a plain-text map of the site for LLM-based
 * crawlers/agents, which don't render JS or follow a nav bar the way a
 * browser does. Built from the same siteUrl/listedCvRoleSlugs the sitemap uses, so
 * it can't drift out of sync with the routes that actually exist.
 */
export function GET() {
  const url = (path: string) => new URL(path, siteUrl).href;

  const lines = [
    `# ${ownerName}`,
    "",
    `> ${defaultDescription}`,
    "",
    "## Portfolio",
    "",
    `- [Home](${url("/")}): Overview, experience, and featured projects.`,
    `- [About](${url("/about")}): Background, skills, and professional links.`,
    `- [Experience](${url("/experience")}): Work history, internships, and education.`,
    `- [Projects](${url("/projects")}): Selected and playground projects with source links.`,
    `- [Posts](${url("/posts")}): Writing on software engineering, AI-assisted development, and learning in public.`,
    `- [Contact](${url("/contact")}): Direct contact channels.`,
    "",
    "## CV",
    "",
    ...listedCvRoleSlugs.map((role) => {
      const cvPath = `/en/cv/${role}`;

      return `- [${cvRoleLabels[role]} CV](${url(cvPath)}): ATS-oriented, role-tailored resume.`;
    }),
    "",
    "## Contact",
    "",
    `- Email: ${profile.contact.email.label.en}`,
    `- GitHub: ${profile.contact.github.label.en}`,
    `- LinkedIn: ${profile.contact.linkedin.label.en}`,
  ];

  return new Response(lines.join("\n") + "\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
