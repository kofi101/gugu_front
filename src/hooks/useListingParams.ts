import { useSearchParams } from "react-router";
import { SORT_LABELS, type ProductSort } from "../data/catalog";

export const SORTS = Object.keys(SORT_LABELS) as ProductSort[];

function parseMoney(v: string | null) {
  if (v == null || v.trim() === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

/** Filters, sort and cursor all live in the URL so listings are shareable and back-button friendly. */
export function useListingParams() {
  const [params] = useSearchParams();
  const sortParam = params.get("sort") as ProductSort | null;
  return {
    params,
    sub: params.get("sub") ?? undefined,
    sort: sortParam && SORTS.includes(sortParam) ? sortParam : ("recommended" as ProductSort),
    min: parseMoney(params.get("min")),
    max: parseMoney(params.get("max")),
    after: params.get("after") ?? undefined,
  };
}

export function withParams(params: URLSearchParams, changes: Record<string, string | undefined>) {
  const next = new URLSearchParams(params);
  for (const [k, v] of Object.entries(changes)) {
    if (v == null || v === "") next.delete(k);
    else next.set(k, v);
  }
  next.delete("after"); // any filter change restarts pagination
  if (changes.after) next.set("after", changes.after);
  const s = next.toString();
  return s ? `?${s}` : "";
}

