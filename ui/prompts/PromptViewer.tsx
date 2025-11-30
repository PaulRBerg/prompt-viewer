"use client";

import { useState } from "react";
import { DateTime } from "effect";
import type { ProjectConfig, ProjectSlug, PromptFile } from "@/lib/prompts/types";
import { ProjectSwitcher } from "./ProjectSwitcher";
import { SearchBar } from "./SearchBar";
import { DateList } from "./DateList";

type ProjectDataMap = Record<ProjectSlug, PromptFile[]>;

type PromptViewerProps = {
	projects: ProjectConfig[];
	initialProject: ProjectSlug;
	projectData: ProjectDataMap;
};

function getTodayDate(): string {
	return DateTime.formatIsoDateUtc(DateTime.unsafeMake(new Date()));
}

export function PromptViewer({
	projects,
	initialProject,
	projectData,
}: PromptViewerProps) {
	const [activeProject, setActiveProject] = useState<ProjectSlug>(initialProject);
	const [searchQuery, setSearchQuery] = useState("");
	const [expandedDate, setExpandedDate] = useState<string | null>(() => {
		// Auto-expand today's date if it exists
		const today = getTodayDate();
		const files = projectData[initialProject];
		return files.some((f) => f.date === today) ? today : files[0]?.date ?? null;
	});

	const currentFiles = projectData[activeProject] ?? [];

	function handleProjectChange(slug: ProjectSlug) {
		setActiveProject(slug);
		// Reset expanded date to most recent in new project
		const files = projectData[slug] ?? [];
		const today = getTodayDate();
		setExpandedDate(files.some((f) => f.date === today) ? today : files[0]?.date ?? null);
	}

	function handleDateClick(date: string) {
		setExpandedDate((current) => (current === date ? null : date));
	}

	return (
		<div className="mx-auto max-w-4xl px-4 py-8">
			<header className="mb-8">
				<h1 className="mb-2 font-serif text-4xl tracking-tight">Prompt Archive</h1>
				<p className="text-muted">Browse your Claude conversation history</p>
			</header>

			<div className="mb-6">
				<SearchBar
					value={searchQuery}
					onChange={setSearchQuery}
					placeholder="Search prompts..."
				/>
			</div>

			<div className="mb-6">
				<ProjectSwitcher
					projects={projects}
					activeProject={activeProject}
					onSelect={handleProjectChange}
				/>
			</div>

			<main className="rounded-lg border border-border bg-card">
				{currentFiles.length === 0 ? (
					<div className="p-8 text-center text-muted">
						No prompts found for this project.
					</div>
				) : (
					<DateList
						files={currentFiles}
						expandedDate={expandedDate}
						onDateClick={handleDateClick}
						searchQuery={searchQuery}
					/>
				)}
			</main>

			<footer className="mt-8 text-center text-muted text-sm">
				{currentFiles.length} {currentFiles.length === 1 ? "day" : "days"} of prompts
			</footer>
		</div>
	);
}
