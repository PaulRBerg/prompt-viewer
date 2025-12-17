import "server-only";

import { NextResponse } from "next/server";
import { PROJECTS } from "@/lib/prompts/config";
import { loadProject } from "@/lib/prompts/loader";
import type { PromptFile, SearchRequest, SearchResponse, SearchResult } from "@/lib/prompts/types";

type SearchAPIResponse = SearchResponse | { error: string };

function searchEntries(files: PromptFile[], query: string): SearchResult[] {
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

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SearchRequest;
    const { project, query } = body;

    // Validate project
    if (!project || !(project in PROJECTS)) {
      return NextResponse.json<SearchAPIResponse>({ error: "Invalid project" }, { status: 400 });
    }

    // Handle empty or too short query
    if (!query || query.trim().length < 2) {
      return NextResponse.json<SearchAPIResponse>({ results: [] });
    }

    // Validate query length
    if (query.length > 500) {
      return NextResponse.json<SearchAPIResponse>({ error: "Query too long" }, { status: 400 });
    }

    // Load project data
    const projectData = await loadProject(project);

    // Search entries
    const results = searchEntries(projectData.files, query.trim());

    return NextResponse.json<SearchAPIResponse>({ results });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json<SearchAPIResponse>({ error: "Search failed" }, { status: 500 });
  }
}
