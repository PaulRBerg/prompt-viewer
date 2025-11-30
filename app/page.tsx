import { PROJECTS, DEFAULT_PROJECT } from "@/lib/prompts/config";
import { loadProject } from "@/lib/prompts/loader";
import type { ProjectSlug, PromptFile } from "@/lib/prompts/types";
import { PromptViewer } from "@/ui/prompts/PromptViewer";

export default async function HomePage() {
	const projectSlugs = Object.keys(PROJECTS) as ProjectSlug[];

	// Load all project data in parallel
	const projectDataEntries = await Promise.all(
		projectSlugs.map(async (slug) => {
			const data = await loadProject(slug);
			return [slug, data.files] as [ProjectSlug, PromptFile[]];
		}),
	);

	const projectData = Object.fromEntries(projectDataEntries) as Record<ProjectSlug, PromptFile[]>;
	const projects = projectSlugs.map((slug) => PROJECTS[slug]);

	return (
		<PromptViewer
			projects={projects}
			initialProject={DEFAULT_PROJECT}
			projectData={projectData}
		/>
	);
}
