import "server-only";

import { Schema } from "effect";

// ============================================================================
// Core Domain Schemas
// ============================================================================

export const ProjectSlugSchema = Schema.Literal("new-ui", "old-ui", "effect-web3", "effect-next");

export const PromptFrontmatterSchema = Schema.Struct({
  date: Schema.String,
  project: Schema.String,
  tags: Schema.Array(Schema.String),
  title: Schema.String,
});

export const PromptEntrySchema = Schema.Struct({
  content: Schema.String,
  sessionId: Schema.String,
  time: Schema.String,
});

export const PromptFileClientSchema = Schema.Struct({
  date: Schema.String,
  entries: Schema.Array(PromptEntrySchema),
  frontmatter: PromptFrontmatterSchema,
});

// ============================================================================
// Search Schemas
// ============================================================================

export const SearchResultSchema = Schema.Struct({
  date: Schema.String,
  excerpt: Schema.String,
  matchEnd: Schema.Number,
  matchStart: Schema.Number,
  sessionId: Schema.String,
  time: Schema.String,
});

export const SearchRequestSchema = Schema.Struct({
  project: ProjectSlugSchema,
  query: Schema.String.pipe(Schema.minLength(2), Schema.maxLength(500)),
});

export const SearchResponseSchema = Schema.Struct({
  results: Schema.Array(SearchResultSchema),
});

// ============================================================================
// Project Response Schema
// ============================================================================

export const ProjectResponseSchema = Schema.Struct({
  files: Schema.Array(PromptFileClientSchema),
});

// ============================================================================
// Error Schemas
// ============================================================================

export const NotFoundErrorSchema = Schema.Struct({
  _tag: Schema.Literal("NotFound"),
  message: Schema.String,
}).annotations({ status: 404 });

export const BadRequestErrorSchema = Schema.Struct({
  _tag: Schema.Literal("BadRequest"),
  message: Schema.String,
}).annotations({ status: 400 });

// ============================================================================
// Derived Types
// ============================================================================

export type ProjectSlug = typeof ProjectSlugSchema.Type;
export type PromptFrontmatter = typeof PromptFrontmatterSchema.Type;
export type PromptEntry = typeof PromptEntrySchema.Type;
export type PromptFileClient = typeof PromptFileClientSchema.Type;
export type SearchResult = typeof SearchResultSchema.Type;
export type SearchRequest = typeof SearchRequestSchema.Type;
export type SearchResponse = typeof SearchResponseSchema.Type;
export type ProjectResponse = typeof ProjectResponseSchema.Type;
export type NotFoundError = typeof NotFoundErrorSchema.Type;
export type BadRequestError = typeof BadRequestErrorSchema.Type;
