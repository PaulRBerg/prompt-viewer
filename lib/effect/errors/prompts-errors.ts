import "server-only";

import { Schema } from "effect";

export class ProjectNotFoundError extends Schema.TaggedError<ProjectNotFoundError>()(
  "ProjectNotFoundError",
  { slug: Schema.String },
) {}

export class FileParseError extends Schema.TaggedError<FileParseError>()("FileParseError", {
  path: Schema.String,
  reason: Schema.String,
}) {}

export class InvalidQueryError extends Schema.TaggedError<InvalidQueryError>()(
  "InvalidQueryError",
  { reason: Schema.String },
) {}

export type PromptsError = ProjectNotFoundError | FileParseError | InvalidQueryError;
