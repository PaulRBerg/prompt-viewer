"use client";

import { ChevronRight } from "lucide-react";
import { tv } from "tailwind-variants";
import { formatDate } from "@/lib/prompts/format-date";
import type { PromptFileClient } from "@/lib/prompts/types";

const dateButtonStyles = tv({
  base: "flex w-full cursor-pointer items-center justify-between border-border border-b px-4 py-3 text-left font-serif text-lg transition-colors hover:bg-muted/50",
  variants: {
    expanded: {
      false: "",
      true: "bg-muted/30",
    },
  },
});

const chevronStyles = tv({
  base: "h-5 w-5 transition-transform duration-200",
  variants: {
    expanded: {
      false: "",
      true: "rotate-90",
    },
  },
});

type DateListProps = {
  files: PromptFileClient[];
  expandedDate: string | null;
  onDateClick: (date: string) => void;
};

export function DateList({ files, expandedDate, onDateClick }: DateListProps) {
  return (
    <div className="space-y-0">
      {files.map((file) => {
        const isExpanded = expandedDate === file.date;
        const formattedDate = formatDate(file.date);
        const entriesId = `entries-${file.date}`;

        return (
          <div key={file.date}>
            <button
              aria-controls={entriesId}
              aria-expanded={isExpanded}
              className={dateButtonStyles({ expanded: isExpanded })}
              onClick={() => onDateClick(file.date)}
              type="button"
            >
              <span>{formattedDate}</span>
              <ChevronRight className={chevronStyles({ expanded: isExpanded })} />
            </button>

            {isExpanded && (
              <div className="space-y-4 bg-background px-4 py-4" id={entriesId}>
                {file.entries.map((entry, index) => (
                  <div
                    className="border-border border-l-2 pl-4"
                    key={`${file.date}-${entry.time}-${index}`}
                  >
                    <div className="mb-2 flex items-baseline gap-3">
                      <time className="font-mono text-muted text-xs">{entry.time}</time>
                      {entry.sessionId && (
                        <span className="font-mono text-muted/70 text-xs">
                          {entry.sessionId.slice(0, 8)}
                        </span>
                      )}
                    </div>
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap text-foreground">{entry.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
