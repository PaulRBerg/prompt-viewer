"use client";

import { ChevronRight } from "lucide-react";
import { tv } from "tailwind-variants";
import dayjs from "dayjs";
import type { PromptFile } from "@/lib/prompts/types";
import { cn } from "@/lib/cn";

const dateButtonStyles = tv({
  base: "flex w-full items-center justify-between border-border border-b px-4 py-3 text-left font-serif text-lg transition-colors hover:bg-muted/50",
  variants: {
    expanded: {
      true: "bg-muted/30",
      false: "",
    },
  },
});

const chevronStyles = tv({
  base: "h-5 w-5 transition-transform duration-200",
  variants: {
    expanded: {
      true: "rotate-90",
      false: "",
    },
  },
});

const entriesContainerStyles = tv({
  base: "grid transition-all duration-300 ease-in-out",
  variants: {
    expanded: {
      true: "grid-rows-[1fr]",
      false: "grid-rows-[0fr]",
    },
  },
});

type DateListProps = {
  files: PromptFile[];
  expandedDate: string | null;
  onDateClick: (date: string) => void;
  searchQuery?: string;
};

export function DateList({
  files,
  expandedDate,
  onDateClick,
  searchQuery,
}: DateListProps) {
  // Filter files if search query exists
  const filteredFiles = searchQuery
    ? files.filter((file) =>
        file.entries.some((entry) =>
          entry.content.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      )
    : files;

  // Sort by date, newest first
  const sortedFiles = [...filteredFiles].sort((a, b) =>
    dayjs(b.date).diff(dayjs(a.date)),
  );

  return (
    <div className="space-y-0">
      {sortedFiles.map((file) => {
        const isExpanded = expandedDate === file.date;
        const formattedDate = dayjs(file.date).format("MMMM D, YYYY");

        // Filter entries if search query exists
        const displayEntries = searchQuery
          ? file.entries.filter((entry) =>
              entry.content.toLowerCase().includes(searchQuery.toLowerCase()),
            )
          : file.entries;

        return (
          <div key={file.date}>
            <button
              type="button"
              onClick={() => onDateClick(file.date)}
              className={dateButtonStyles({ expanded: isExpanded })}
            >
              <span>{formattedDate}</span>
              <ChevronRight className={chevronStyles({ expanded: isExpanded })} />
            </button>

            <div className={entriesContainerStyles({ expanded: isExpanded })}>
              <div className="overflow-hidden">
                <div className="space-y-4 bg-background px-4 py-4">
                  {displayEntries.map((entry, index) => (
                    <div
                      key={`${entry.sessionId}-${index}`}
                      className="border-border border-l-2 pl-4"
                    >
                      <div className="mb-2 flex items-baseline gap-3">
                        <time className="font-mono text-muted text-xs">
                          {entry.time}
                        </time>
                        <span className="font-mono text-muted/70 text-xs">
                          {entry.sessionId.slice(0, 8)}
                        </span>
                      </div>
                      <div className="prose prose-sm max-w-none">
                        {searchQuery ? (
                          <HighlightedContent
                            content={entry.content}
                            query={searchQuery}
                          />
                        ) : (
                          <p className="whitespace-pre-wrap text-foreground">
                            {entry.content}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
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
