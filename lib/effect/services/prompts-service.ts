import "server-only";

import { FileSystem } from "@effect/platform";
import { NodeFileSystem } from "@effect/platform-node";
import { Context, Effect, Layer } from "effect";
import matter from "gray-matter";
import { PROJECTS, PROMPTS_ROOT } from "@/lib/prompts/config";
import type {
  ProjectConfig,
  ProjectData,
  ProjectSlug,
  PromptEntry,
  PromptFile,
  PromptFileClient,
  PromptFrontmatter,
  SearchResult,
} from "@/lib/prompts/types";
import { FileParseError, InvalidQueryError, ProjectNotFoundError } from "../errors/prompts-errors";

const TIME_PATTERN = /^## (\d{2}:\d{2}:\d{2})/;
const SESSION_ID_PATTERN = /_Session ID: ([^\n]+)_/;

/**
 * Parse markdown content into structured entries
 */
function cleanContent(lines: string[]): string {
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
        content: "",
        sessionId: "",
        time: timeMatch[1],
      };
      currentContent = [];
    } else if (currentEntry) {
      // Check for session ID - skip this line from content
      const sessionMatch = line.match(SESSION_ID_PATTERN);
      if (sessionMatch) {
        currentEntry.sessionId = sessionMatch[1];
        continue;
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
    entries: parseEntries(content),
    frontmatter,
    rawContent: fileContent,
  };
}

/**
 * Convert PromptFile to client-safe payload (remove rawContent)
 */
export function toClientPayload(file: PromptFile): PromptFileClient {
  return {
    date: file.date,
    entries: file.entries,
    frontmatter: file.frontmatter,
  };
}

/**
 * Search entries for a query with context extraction
 */
function searchEntriesImpl(files: PromptFile[], query: string): SearchResult[] {
  const lowerQuery = query.toLowerCase();
  const results: SearchResult[] = [];

  for (const file of files) {
    for (const entry of file.entries) {
      const lowerContent = entry.content.toLowerCase();
      const matchIndex = lowerContent.indexOf(lowerQuery);

      if (matchIndex !== -1) {
        // Extract excerpt with ~100 chars context on each side
        const excerptStart = Math.max(0, matchIndex - 100);
        const excerptEnd = Math.min(entry.content.length, matchIndex + query.length + 100);
        const excerpt = entry.content.slice(excerptStart, excerptEnd);

        // Compute match position within excerpt
        const matchStart = matchIndex - excerptStart;
        const matchEnd = matchStart + query.length;

        results.push({
          date: file.date,
          excerpt,
          matchEnd,
          matchStart,
          sessionId: entry.sessionId,
          time: entry.time,
        });

        if (results.length >= 100) break;
      }
    }
    if (results.length >= 100) break;
  }

  return results;
}

/**
 * PromptsService interface
 */
export interface PromptsService {
  readonly loadProject: (
    slug: ProjectSlug,
  ) => Effect.Effect<ProjectData, FileParseError | ProjectNotFoundError>;
  readonly loadAllProjects: () => Effect.Effect<ProjectData[], FileParseError>;
  readonly searchEntries: (
    slug: ProjectSlug,
    query: string,
  ) => Effect.Effect<SearchResult[], FileParseError | ProjectNotFoundError | InvalidQueryError>;
}

export const PromptsService = Context.GenericTag<PromptsService>("PromptsService");

/**
 * Implementation
 */
function make(fs: FileSystem.FileSystem): PromptsService {
  /**
   * Get all markdown files for a project
   */
  const getProjectFiles = (slug: ProjectSlug): Effect.Effect<string[], never> =>
    Effect.gen(function* () {
      const project = PROJECTS[slug];
      const projectPath = `${PROMPTS_ROOT}/${project.directory}`;

      // Try to read directory, return empty array if it doesn't exist
      const files = yield* fs
        .readDirectory(projectPath)
        .pipe(Effect.catchAll(() => Effect.succeed([])));

      return files
        .filter((file) => file.endsWith(".md"))
        .sort()
        .reverse(); // Newest first
    });

  /**
   * Load a single prompt file with error handling
   */
  const loadPromptFile = (
    projectPath: string,
    filename: string,
  ): Effect.Effect<PromptFile | null, FileParseError> =>
    Effect.gen(function* () {
      const filePath = `${projectPath}/${filename}`;

      // Try to read file, skip on error with logging
      const fileContent = yield* fs.readFileString(filePath).pipe(
        Effect.catchAll((error) =>
          Effect.gen(function* () {
            yield* Effect.logWarning(`Failed to read ${filename}: ${String(error)}`);
            return yield* Effect.fail(
              new FileParseError({ path: filePath, reason: String(error) }),
            );
          }),
        ),
        Effect.catchAll(() => Effect.succeed(null)),
      );

      if (fileContent === null) {
        return null;
      }

      try {
        return parsePromptFile(filename, fileContent);
      } catch (error) {
        yield* Effect.logWarning(`Failed to parse ${filename}: ${String(error)}`);
        return null;
      }
    });

  /**
   * Load all prompt files for a project
   */
  const loadProject = (
    slug: ProjectSlug,
  ): Effect.Effect<ProjectData, FileParseError | ProjectNotFoundError> =>
    Effect.gen(function* () {
      const project: ProjectConfig | undefined = PROJECTS[slug];

      if (!project) {
        return yield* Effect.fail(new ProjectNotFoundError({ slug }));
      }

      const projectPath = `${PROMPTS_ROOT}/${project.directory}`;
      const filenames = yield* getProjectFiles(slug);

      // Load all files in parallel
      const fileResults = yield* Effect.forEach(
        filenames,
        (filename) => loadPromptFile(projectPath, filename),
        { concurrency: "unbounded" },
      );

      // Filter out null results (failed files)
      const files = fileResults.filter((file): file is PromptFile => file !== null);

      return {
        files,
        project,
      };
    });

  /**
   * Load all projects in parallel
   */
  const loadAllProjects = (): Effect.Effect<ProjectData[], FileParseError> =>
    Effect.gen(function* () {
      const slugs = Object.keys(PROJECTS) as ProjectSlug[];

      const projects = yield* Effect.forEach(
        slugs,
        (slug) =>
          loadProject(slug).pipe(
            // Catch ProjectNotFoundError and return empty project
            Effect.catchTag("ProjectNotFoundError", (error) => {
              const project = PROJECTS[error.slug as ProjectSlug];
              return Effect.succeed({
                files: [],
                project,
              } as ProjectData);
            }),
          ),
        { concurrency: "unbounded" },
      );

      return projects;
    });

  /**
   * Search entries across a project
   */
  const searchEntries = (
    slug: ProjectSlug,
    query: string,
  ): Effect.Effect<SearchResult[], FileParseError | ProjectNotFoundError | InvalidQueryError> =>
    Effect.gen(function* () {
      // Validate query
      const trimmedQuery = query.trim();

      if (trimmedQuery.length < 2) {
        return [];
      }

      if (query.length > 500) {
        return yield* Effect.fail(
          new InvalidQueryError({ reason: "Query too long (max 500 characters)" }),
        );
      }

      // Load project data
      const projectData = yield* loadProject(slug);

      // Search entries
      return searchEntriesImpl(projectData.files, trimmedQuery);
    });

  return {
    loadAllProjects,
    loadProject,
    searchEntries,
  };
}

/**
 * Layer implementation
 */
export const PromptsServiceLive = Layer.effect(
  PromptsService,
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    return make(fs);
  }),
).pipe(Layer.provide(NodeFileSystem.layer));
