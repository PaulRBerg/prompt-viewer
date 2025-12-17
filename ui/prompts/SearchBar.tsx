"use client";

import { Loader2, Search, X } from "lucide-react";
import { tv } from "tailwind-variants";

const inputStyles = tv({
  base: "w-full rounded-lg border border-border bg-background px-4 py-2.5 pr-10 pl-10 text-sm transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent",
});

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isSearching?: boolean;
};

export function SearchBar({
  value,
  onChange,
  placeholder = "Search prompts...",
  isSearching = false,
}: SearchBarProps) {
  return (
    <div className="relative">
      {isSearching ? (
        <Loader2 className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 animate-spin text-muted" />
      ) : (
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
      )}
      <input
        className={inputStyles()}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type="text"
        value={value}
      />
      {value && (
        <button
          aria-label="Clear search"
          className="absolute top-1/2 right-3 -translate-y-1/2 text-muted transition-colors hover:text-foreground"
          onClick={() => onChange("")}
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
