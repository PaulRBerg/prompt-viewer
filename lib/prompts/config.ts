import { homedir } from "node:os";
import type { ProjectConfig, ProjectSlug } from "./types";

export const PROMPTS_ROOT = `${homedir()}/.claude-prompts`;

export const PROJECTS: Record<ProjectSlug, ProjectConfig> = {
	"new-ui": {
		name: "New UI",
		slug: "new-ui",
		directory: "sablier-new-ui",
	},
	"old-ui": {
		name: "Old UI",
		slug: "old-ui",
		directory: "sablier-old-ui",
	},
};

export const DEFAULT_PROJECT: ProjectSlug = "new-ui";
