import MiniSearch from "minisearch";
import type { PromptEntry, PromptFile } from "./types";

type SearchDocument = {
	id: string;
	date: string;
	time: string;
	content: string;
	sessionId: string;
	fileIndex: number;
	entryIndex: number;
};

type SearchResult = {
	file: PromptFile;
	matchingEntries: Array<{
		entry: PromptEntry;
		score: number;
	}>;
};

/**
 * Create a search index from prompt files
 */
export function createSearchIndex(files: PromptFile[]): MiniSearch<SearchDocument> {
	const documents: SearchDocument[] = [];

	files.forEach((file, fileIndex) => {
		file.entries.forEach((entry, entryIndex) => {
			documents.push({
				id: `${file.date}-${entry.time}-${entryIndex}`,
				date: file.date,
				time: entry.time,
				content: entry.content,
				sessionId: entry.sessionId,
				fileIndex,
				entryIndex,
			});
		});
	});

	const miniSearch = new MiniSearch<SearchDocument>({
		fields: ["content", "date", "sessionId"],
		storeFields: ["date", "time", "content", "sessionId", "fileIndex", "entryIndex"],
		searchOptions: {
			boost: { date: 2 },
			fuzzy: 0.2,
			prefix: true,
		},
	});

	miniSearch.addAll(documents);

	return miniSearch;
}

/**
 * Search prompts and return matching files with highlighted entries
 */
export function searchPrompts(
	index: MiniSearch<SearchDocument>,
	files: PromptFile[],
	query: string,
): SearchResult[] {
	if (!query.trim()) {
		return [];
	}

	const searchResults = index.search(query);
	const resultMap = new Map<string, SearchResult>();

	for (const result of searchResults) {
		const { fileIndex, entryIndex } = result as unknown as SearchDocument;
		const file = files[fileIndex];
		const entry = file.entries[entryIndex];

		if (!resultMap.has(file.date)) {
			resultMap.set(file.date, {
				file,
				matchingEntries: [],
			});
		}

		const searchResult = resultMap.get(file.date);
		if (searchResult) {
			searchResult.matchingEntries.push({
				entry,
				score: result.score,
			});
		}
	}

	// Sort by score (highest first)
	return Array.from(resultMap.values()).map((result) => ({
		...result,
		matchingEntries: result.matchingEntries.sort((a, b) => b.score - a.score),
	}));
}
