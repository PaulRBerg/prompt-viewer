export type ProjectSlug = "new-ui" | "old-ui";

export type ProjectConfig = {
	name: string;
	slug: ProjectSlug;
	directory: string;
};

export type PromptFrontmatter = {
	title: string;
	date: string;
	project: string;
	tags: string[];
};

export type PromptEntry = {
	time: string;
	sessionId: string;
	content: string;
};

export type PromptFile = {
	date: string;
	frontmatter: PromptFrontmatter;
	entries: PromptEntry[];
	rawContent: string;
};

export type ProjectData = {
	project: ProjectConfig;
	files: PromptFile[];
};
