/**
 * Client-side favorites storage. Stores a list of ticker strings in
 * localStorage. SSR-safe (returns defaults when window is undefined).
 */

const STORAGE_KEY = "etfp:favorites:v1";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readSet(): Set<string> {
  if (!isBrowser()) return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((t): t is string => typeof t === "string"));
  } catch {
    return new Set();
  }
}

function writeSet(set: Set<string>): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch (e) {
    console.error("Failed to write favorites to localStorage:", e);
  }
}

export function listFavorites(): string[] {
  return Array.from(readSet());
}

export function isFavorite(ticker: string): boolean {
  return readSet().has(ticker);
}

export function toggleFavorite(ticker: string): boolean {
  const set = readSet();
  let nowFavorite: boolean;
  if (set.has(ticker)) {
    set.delete(ticker);
    nowFavorite = false;
  } else {
    set.add(ticker);
    nowFavorite = true;
  }
  writeSet(set);
  // Notify listeners in the same tab (storage event only fires across tabs)
  if (isBrowser()) {
    window.dispatchEvent(new CustomEvent("etfp:favorites-changed"));
  }
  return nowFavorite;
}
