"use client";

import { useEffect, useRef, useState } from "react";
import type { ProjectSlug, SearchResponse, SearchResult } from "@/lib/prompts/types";

const DEBOUNCE_MS = 150;
const MIN_QUERY_LENGTH = 2;

export function useSearch(project: ProjectSlug) {
  const [inputValue, setInputValue] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Clear results if query too short
    if (inputValue.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    // Cancel previous request
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    const controller = abortControllerRef.current;

    // Debounce
    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch("/api/search", {
          body: JSON.stringify({ project, query: inputValue }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
          signal: controller.signal,
        });

        if (response.ok) {
          const data: SearchResponse = await response.json();
          setResults(data.results);
        }
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Search failed:", error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [inputValue, project]);

  function clearSearch() {
    setInputValue("");
    setResults([]);
    setIsSearching(false);
  }

  return {
    clearSearch,
    hasActiveSearch: inputValue.length >= MIN_QUERY_LENGTH,
    inputValue,
    isSearching,
    results,
    setInputValue,
  };
}
