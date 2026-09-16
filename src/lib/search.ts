// Mirrors gugu_2.0/lib/app/util/search/advance_searchable_values.dart:
// `advanceSearchableValues` holds lowercased full phrases plus every 1..32 char prefix of each word.

export const MAX_PREFIX_LEN = 32;

export function queryWords(query: string): string[] {
  return (query.toLowerCase().match(/[a-z0-9]+/g) ?? []).map((w) => w.slice(0, MAX_PREFIX_LEN));
}

/** Longest word gives the most selective array-contains token. */
export function firestoreToken(query: string): string | null {
  const words = queryWords(query);
  if (words.length === 0) return null;
  return words.reduce((a, b) => (b.length > a.length ? b : a));
}

/** Every query word must be present as a token (tokens include all prefixes). */
export function matchesAllWords(values: readonly string[] | undefined, fallbackText: string, words: string[]) {
  const set = new Set(values ?? []);
  const blob = fallbackText.toLowerCase();
  return words.every((w) => set.has(w) || blob.includes(w));
}
