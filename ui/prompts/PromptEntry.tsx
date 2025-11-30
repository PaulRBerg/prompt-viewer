import type { PromptEntry as PromptEntryType } from "@/lib/prompts/types";

type PromptEntryProps = {
  entry: PromptEntryType;
  searchQuery?: string;
};

export function PromptEntry({ entry, searchQuery }: PromptEntryProps) {
  return (
    <article className="border-border border-l-2 py-3 pl-4">
      <header className="mb-2 flex items-baseline gap-3">
        <time className="font-mono text-muted text-xs">{entry.time}</time>
        <span className="font-mono text-muted/70 text-xs">
          {entry.sessionId.slice(0, 8)}
        </span>
      </header>

      <div className="prose prose-sm max-w-none">
        {searchQuery ? (
          <HighlightedContent content={entry.content} query={searchQuery} />
        ) : (
          <FormattedContent content={entry.content} />
        )}
      </div>
    </article>
  );
}

function FormattedContent({ content }: { content: string }) {
  // Simple display without markdown parsing to avoid security issues
  // In production, consider using a markdown library like react-markdown
  return <p className="whitespace-pre-wrap text-foreground">{content}</p>;
}

function HighlightedContent({
  content,
  query,
}: { content: string; query: string }) {
  const parts = content.split(new RegExp(`(${query})`, "gi"));

  return (
    <p className="whitespace-pre-wrap text-foreground">
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-accent/20 text-foreground">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </p>
  );
}
