export type ProjectSlug = "new-ui" | "old-ui" | "effect-web3" | "effect-next";

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

// Client-side payload should NOT include rawContent
export type PromptFileClient = Omit<PromptFile, "rawContent">;

export type SearchResult = {
  date: string;
  time: string;
  sessionId: string;
  excerpt: string;
  matchStart: number;
  matchEnd: number;
};

export type SearchRequest = {
  project: ProjectSlug;
  query: string;
};

export type SearchResponse = {
  results: SearchResult[];
};
