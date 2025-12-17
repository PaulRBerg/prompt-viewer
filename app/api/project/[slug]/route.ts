import { NextResponse } from "next/server";
import { PROJECTS } from "@/lib/prompts/config";
import { loadProject, toClientPayload } from "@/lib/prompts/loader";
import type { ProjectSlug, PromptFileClient } from "@/lib/prompts/types";

type RouteParams = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
  const { slug } = await params;

  // Validate slug
  if (!(slug in PROJECTS)) {
    return NextResponse.json({ error: "Invalid project slug" }, { status: 400 });
  }

  try {
    const projectData = await loadProject(slug as ProjectSlug);
    const files: PromptFileClient[] = projectData.files.map(toClientPayload);

    return NextResponse.json(
      { files },
      {
        headers: {
          "Cache-Control": "private, max-age=60",
        },
      },
    );
  } catch (error) {
    console.error(`Failed to load project ${slug}:`, error);
    return NextResponse.json({ error: "Failed to load project" }, { status: 500 });
  }
}
