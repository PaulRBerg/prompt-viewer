import "server-only";

import { HttpApiEndpoint, HttpApiGroup } from "@effect/platform";
import { Schema } from "effect";
import {
  BadRequestErrorSchema,
  NotFoundErrorSchema,
  ProjectResponseSchema,
  ProjectSlugSchema,
  SearchRequestSchema,
  SearchResponseSchema,
} from "../schemas/prompts-schemas";

export class PromptsApi extends HttpApiGroup.make("prompts")
  .add(
    HttpApiEndpoint.get("getProject", "/:slug")
      .addSuccess(ProjectResponseSchema)
      .addError(NotFoundErrorSchema)
      .addError(BadRequestErrorSchema)
      .setPath(Schema.Struct({ slug: ProjectSlugSchema })),
  )
  .add(
    HttpApiEndpoint.post("search", "/search")
      .addSuccess(SearchResponseSchema)
      .addError(BadRequestErrorSchema)
      .setPayload(SearchRequestSchema),
  )
  .prefix("/api/project") {}
