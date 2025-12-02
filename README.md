# Prompt Viewer

A web application for browsing archived Claude conversation prompts, organized by project and date.

## Features

- **Multi-Project Support** — Switch between different prompt archives via tabs
- **Date-Based Organization** — Prompts grouped by date with expandable/collapsible sections
- **Structured Display** — Each entry shows timestamp, session ID, and full prompt content

## Tech Stack

- [Next.js v16](https://nextjs.org) with App Router and React v19
- [Effect-TS](https://effect.website) for functional async patterns
- [Tailwind CSS v4](https://tailwindcss.com) for styling
- [Bun](https://bun.sh) as package manager

## Usage

```bash
bun install
just dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

Prompts are read from `~/.claude-prompts/` directories configured in the project settings.

## License

MIT
