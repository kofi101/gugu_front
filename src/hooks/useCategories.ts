import { getCategories } from "../data/catalog";
import type { Category } from "../lib/types";
import { useAsync } from "./useAsync";

let cache: Promise<Category[]> | null = null;

function load() {
  if (!cache) {
    cache = getCategories().catch((err) => {
      cache = null;
      throw err;
    });
  }
  return cache;
}

/** Categories are shared by the header, menu, home and footer; fetched once per session. */
export function useCategories() {
  return useAsync(load, []);
}
