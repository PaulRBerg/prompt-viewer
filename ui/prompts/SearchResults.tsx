"use client";

import { formatDate } from "@/lib/prompts/format-date";
import type { SearchResult } from "@/lib/prompts/types";

type SearchResultsProps = {
  results: SearchResult[];
  isSearching: boolean;
};

export function SearchResults({ results, isSearching }: SearchResultsProps) {
  if (isSearching) {
    return (
      <div className="p-8 text-center text-muted">
        <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        <p className="mt-2">Searching...</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="p-8 text-center text-muted">
        No results found. Try a different search term.
      </div>
    );
  }

  // Group results by date
  const groupedResults = results.reduce(
    (acc, result) => {
      if (!acc[result.date]) {
        acc[result.date] = [];
      }
      acc[result.date].push(result);
      return acc;
    },
    {} as Record<string, SearchResult[]>,
  );

  // Sort dates descending
  const sortedDates = Object.keys(groupedResults).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-0">
      {sortedDates.map((date) => {
        const formattedDate = formatDate(date);
        const dateResults = groupedResults[date];

        return (
          <div key={date}>
            <div className="border-border border-b bg-muted/30 px-4 py-3 font-serif text-lg">
              {formattedDate}
            </div>
            <div className="space-y-4 bg-background px-4 py-4">
              {dateResults.map((result, index) => (
                <div
                  className="border-border border-l-2 pl-4"
                  key={`${result.date}-${result.time}-${index}`}
                >
                  <div className="mb-2 flex items-baseline gap-3">
                    <time className="font-mono text-muted text-xs">{result.time}</time>
                    {result.sessionId && (
                      <span className="font-mono text-muted/70 text-xs">
                        {result.sessionId.slice(0, 8)}
                      </span>
                    )}
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <HighlightedExcerpt
                      excerpt={result.excerpt}
                      matchEnd={result.matchEnd}
                      matchStart={result.matchStart}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function HighlightedExcerpt({
  excerpt,
  matchStart,
  matchEnd,
}: {
  excerpt: string;
  matchStart: number;
  matchEnd: number;
}) {
  return (
    <p className="whitespace-pre-wrap text-foreground">
      {excerpt.slice(0, matchStart)}
      <mark className="bg-accent/20 text-foreground">{excerpt.slice(matchStart, matchEnd)}</mark>
      {excerpt.slice(matchEnd)}
    </p>
  );
}
