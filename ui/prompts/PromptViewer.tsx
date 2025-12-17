"use client";

import { DateTime } from "effect";
import { useState } from "react";
import type { ProjectConfig, ProjectSlug, PromptFileClient } from "@/lib/prompts/types";
import { DateList } from "./DateList";
import { useSearch } from "./hooks/useSearch";
import { ProjectSwitcher } from "./ProjectSwitcher";
import { SearchBar } from "./SearchBar";
import { SearchResults } from "./SearchResults";

type ProjectDataMap = Partial<Record<ProjectSlug, PromptFileClient[]>>;

type PromptViewerProps = {
  projects: ProjectConfig[];
  initialProject: ProjectSlug;
  initialFiles: PromptFileClient[];
};

function getTodayDate(): string {
  return DateTime.formatIsoDateUtc(DateTime.unsafeMake(new Date()));
}

export function PromptViewer({ projects, initialProject, initialFiles }: PromptViewerProps) {
  const [activeProject, setActiveProject] = useState<ProjectSlug>(initialProject);
  const [projectData, setProjectData] = useState<ProjectDataMap>(() => ({
    [initialProject]: initialFiles,
  }));
  const [loadingProject, setLoadingProject] = useState<ProjectSlug | null>(null);
  const [expandedDate, setExpandedDate] = useState<string | null>(() => {
    // Auto-expand today's date if it exists
    const today = getTodayDate();
    return initialFiles.some((f) => f.date === today) ? today : (initialFiles[0]?.date ?? null);
  });

  const { inputValue, setInputValue, results, isSearching, hasActiveSearch } =
    useSearch(activeProject);

  const currentFiles = projectData[activeProject] ?? [];

  async function handleProjectChange(slug: ProjectSlug) {
    setActiveProject(slug);

    // Load project data if not already cached
    if (!projectData[slug]) {
      setLoadingProject(slug);
      try {
        const response = await fetch(`/api/project/${slug}`);
        if (!response.ok) {
          throw new Error("Failed to load project");
        }
        const data = (await response.json()) as { files: PromptFileClient[] };
        setProjectData((prev) => ({ ...prev, [slug]: data.files }));

        // Reset expanded date to most recent in new project
        const today = getTodayDate();
        setExpandedDate(
          data.files.some((f: PromptFileClient) => f.date === today)
            ? today
            : (data.files[0]?.date ?? null),
        );
      } catch (error) {
        console.error("Failed to load project:", error);
      } finally {
        setLoadingProject(null);
      }
    } else {
      // Reset expanded date to most recent in cached project
      const files = projectData[slug];
      const today = getTodayDate();
      setExpandedDate(files.some((f) => f.date === today) ? today : (files[0]?.date ?? null));
    }
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
          isSearching={isSearching}
          onChange={setInputValue}
          placeholder="Search prompts..."
          value={inputValue}
        />
      </div>

      <div className="mb-6">
        <ProjectSwitcher
          activeProject={activeProject}
          onSelect={handleProjectChange}
          projects={projects}
        />
      </div>

      <main className="rounded-lg border border-border bg-card">
        {loadingProject ? (
          <div className="p-8 text-center text-muted">Loading project data...</div>
        ) : hasActiveSearch ? (
          <SearchResults isSearching={isSearching} results={results} />
        ) : currentFiles.length === 0 ? (
          <div className="p-8 text-center text-muted">No prompts found for this project.</div>
        ) : (
          <DateList
            expandedDate={expandedDate}
            files={currentFiles}
            onDateClick={handleDateClick}
          />
        )}
      </main>

      <footer className="mt-8 text-center text-muted text-sm">
        {currentFiles.length} {currentFiles.length === 1 ? "day" : "days"} of prompts
      </footer>
    </div>
  );
}
