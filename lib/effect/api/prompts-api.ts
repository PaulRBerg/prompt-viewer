import "server-only";

import { HttpApi, HttpApiEndpoint, HttpApiGroup } from "@effect/platform";
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

export class Api extends HttpApi.make("api").add(PromptsApi) {}
