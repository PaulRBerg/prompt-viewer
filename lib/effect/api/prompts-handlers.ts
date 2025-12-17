import "server-only";

import { HttpApiBuilder } from "@effect/platform";
import { Effect } from "effect";
import { Api } from "./api";
import { PromptsService, toClientPayload } from "../services/prompts-service";

/**
 * PromptsApi handler implementations
 */
export const PromptsApiLive = HttpApiBuilder.group(Api, "prompts", (handlers) =>
  handlers
    .handle("getProject", ({ path }) =>
      Effect.gen(function* () {
        const service = yield* PromptsService;
        const projectData = yield* service.loadProject(path.slug);

        return {
          files: projectData.files.map(toClientPayload),
        };
      }).pipe(
        Effect.mapError((e) => {
          if (e._tag === "ProjectNotFoundError") {
            return {
              _tag: "NotFound" as const,
              message: `Project ${e.slug} not found`,
            };
          }
          return {
            _tag: "BadRequest" as const,
            message: "Failed to load project",
          };
        }),
      ),
    )
    .handle("search", ({ payload }) =>
      Effect.gen(function* () {
        const service = yield* PromptsService;
        const results = yield* service.searchEntries(payload.project, payload.query);

        return { results };
      }).pipe(
        Effect.mapError((e) => {
          if (e._tag === "InvalidQueryError") {
            return {
              _tag: "BadRequest" as const,
              message: e.reason,
            };
          }
          if (e._tag === "ProjectNotFoundError") {
            return {
              _tag: "BadRequest" as const,
              message: `Project ${e.slug} not found`,
            };
          }
          return {
            _tag: "BadRequest" as const,
            message: "Search failed",
          };
        }),
      ),
    ),
);
