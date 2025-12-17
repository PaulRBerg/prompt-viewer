import "server-only";

import { homedir } from "node:os";
import type { ProjectConfig, ProjectSlug } from "./types";

export const PROMPTS_ROOT = `${homedir()}/.claude-prompts`;

export const PROJECTS: Record<ProjectSlug, ProjectConfig> = {
  "effect-next": {
    directory: "projects-effect-next",
    name: "Effect Next",
    slug: "effect-next",
  },
  "effect-web3": {
    directory: "projects-effect-web3",
    name: "Effect Web3",
    slug: "effect-web3",
  },
  "new-ui": {
    directory: "sablier-new-ui",
    name: "New UI",
    slug: "new-ui",
  },
  "old-ui": {
    directory: "sablier-old-ui",
    name: "Old UI",
    slug: "old-ui",
  },
};

export const DEFAULT_PROJECT: ProjectSlug = "new-ui";
