"use client";

import { Search, X } from "lucide-react";
import { tv } from "tailwind-variants";

const inputStyles = tv({
  base: "w-full rounded-lg border border-border bg-background px-4 py-2.5 pr-10 pl-10 text-sm transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent",
});

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function SearchBar({
  value,
  onChange,
  placeholder = "Search prompts...",
}: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputStyles()}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="-translate-y-1/2 absolute top-1/2 right-3 text-muted transition-colors hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
