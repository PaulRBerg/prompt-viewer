import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import matter from "gray-matter";
import { PROJECTS, PROMPTS_ROOT } from "./config";
import type {
	ProjectData,
	ProjectSlug,
	PromptEntry,
	PromptFile,
	PromptFrontmatter,
} from "./types";

const TIME_PATTERN = /^## (\d{2}:\d{2}:\d{2})/;
const SESSION_ID_PATTERN = /_Session ID: ([^\n]+)_/;

/**
 * Parse markdown content into structured entries
 */
function cleanContent(lines: string[]): string {
	// Join, trim, then remove trailing --- separator
	return lines
		.join("\n")
		.trim()
		.replace(/\n---\s*$/, "")
		.trim();
}

function parseEntries(content: string): PromptEntry[] {
	const lines = content.split("\n");
	const entries: PromptEntry[] = [];
	let currentEntry: PromptEntry | null = null;
	let currentContent: string[] = [];

	for (const line of lines) {
		const timeMatch = line.match(TIME_PATTERN);

		if (timeMatch) {
			// Save previous entry if exists
			if (currentEntry) {
				currentEntry.content = cleanContent(currentContent);
				entries.push(currentEntry);
			}

			// Start new entry
			currentEntry = {
				time: timeMatch[1],
				sessionId: "",
				content: "",
			};
			currentContent = [];
		} else if (currentEntry) {
			// Check for session ID - skip this line from content
			const sessionMatch = line.match(SESSION_ID_PATTERN);
			if (sessionMatch) {
				currentEntry.sessionId = sessionMatch[1];
				continue; // Don't add session ID line to content
			}

			currentContent.push(line);
		}
	}

	// Save last entry
	if (currentEntry) {
		currentEntry.content = cleanContent(currentContent);
		entries.push(currentEntry);
	}

	return entries;
}

/**
 * Parse a single markdown file
 */
function parsePromptFile(filename: string, fileContent: string): PromptFile {
	const { data, content } = matter(fileContent);
	const frontmatter = data as PromptFrontmatter;

	// Extract date from filename (YYYY-MM-DD.md)
	const date = filename.replace(".md", "");

	return {
		date,
		frontmatter,
		entries: parseEntries(content),
		rawContent: fileContent,
	};
}

/**
 * Get all markdown files for a project
 */
export async function getProjectFiles(slug: ProjectSlug): Promise<string[]> {
	const project = PROJECTS[slug];
	const projectPath = join(PROMPTS_ROOT, project.directory);

	try {
		const files = await readdir(projectPath);
		return files
			.filter((file) => file.endsWith(".md"))
			.sort()
			.reverse(); // Newest first
	} catch {
		// Directory doesn't exist or can't be read
		return [];
	}
}

/**
 * Load all prompt files for a project
 */
export async function loadProject(slug: ProjectSlug): Promise<ProjectData> {
	const project = PROJECTS[slug];
	const projectPath = join(PROMPTS_ROOT, project.directory);
	const filenames = await getProjectFiles(slug);

	const files: PromptFile[] = [];

	for (const filename of filenames) {
		try {
			const filePath = join(projectPath, filename);
			const fileContent = await readFile(filePath, "utf-8");
			const promptFile = parsePromptFile(filename, fileContent);
			files.push(promptFile);
		} catch (error) {
			// Skip files that can't be read
			console.error(`Failed to read ${filename}:`, error);
		}
	}

	return {
		project,
		files,
	};
}

/**
 * Load all projects
 */
export async function loadAllProjects(): Promise<ProjectData[]> {
	const slugs = Object.keys(PROJECTS) as ProjectSlug[];
	const projects = await Promise.all(slugs.map((slug) => loadProject(slug)));
	return projects;
}
