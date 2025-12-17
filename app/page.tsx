import { DEFAULT_PROJECT, PROJECTS } from "@/lib/prompts/config";
import { loadProject, toClientPayload } from "@/lib/prompts/loader";
import type { ProjectSlug } from "@/lib/prompts/types";
import { PromptViewer } from "@/ui/prompts/PromptViewer";

export default async function HomePage() {
  const projectSlugs = Object.keys(PROJECTS) as ProjectSlug[];

  // Load only default project initially
  const defaultProjectData = await loadProject(DEFAULT_PROJECT);
  const defaultFiles = defaultProjectData.files.map(toClientPayload);

  const projects = projectSlugs.map((slug) => PROJECTS[slug]);

  return (
    <PromptViewer
      initialFiles={defaultFiles}
      initialProject={DEFAULT_PROJECT}
      projects={projects}
    />
  );
}
