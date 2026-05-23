/**
 * Client-side portfolio storage backed by localStorage. Single-user app —
 * portfolios live entirely in the browser, no server, no auth needed.
 *
 * All functions are SSR-safe: they return defaults when window is undefined.
 */

const STORAGE_KEY = "etfp:portfolios:v1";

export interface StoredPortfolio {
  id: string;
  name: string;
  description: string | null;
  initialInvestment: number;
  monthlyContribution: number;
  durationYears: number;
  inflationRate: number;
  reinvestDividends: boolean;
  allocations: { etfId: number; percentage: number }[];
  createdAt: string;
  updatedAt: string;
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readAll(): StoredPortfolio[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as StoredPortfolio[];
  } catch {
    return [];
  }
}

function writeAll(list: StoredPortfolio[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error("Failed to write portfolios to localStorage:", e);
  }
}

export function listPortfolios(): StoredPortfolio[] {
  return readAll().sort((a, b) =>
    (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""),
  );
}

export function getPortfolio(id: string): StoredPortfolio | null {
  return readAll().find((p) => p.id === id) ?? null;
}

function newId(): string {
  if (isBrowser() && typeof window.crypto?.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return `p_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function createPortfolio(
  init: Partial<StoredPortfolio> = {},
): StoredPortfolio {
  const now = new Date().toISOString();
  const p: StoredPortfolio = {
    id: newId(),
    name: init.name ?? "Untitled portfolio",
    description: init.description ?? null,
    initialInvestment: init.initialInvestment ?? 50000,
    monthlyContribution: init.monthlyContribution ?? 5000,
    durationYears: init.durationYears ?? 10,
    inflationRate: init.inflationRate ?? 0.02,
    reinvestDividends: init.reinvestDividends ?? true,
    allocations: init.allocations ?? [],
    createdAt: now,
    updatedAt: now,
  };
  const all = readAll();
  all.push(p);
  writeAll(all);
  return p;
}

export function updatePortfolio(
  id: string,
  patch: Partial<Omit<StoredPortfolio, "id" | "createdAt">>,
): StoredPortfolio | null {
  const all = readAll();
  const idx = all.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const updated = {
    ...all[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  all[idx] = updated;
  writeAll(all);
  return updated;
}

export function deletePortfolio(id: string): boolean {
  const all = readAll();
  const next = all.filter((p) => p.id !== id);
  if (next.length === all.length) return false;
  writeAll(next);
  return true;
}

/**
 * Make a copy of an existing portfolio with a new id and a "(copy)" suffix.
 * Returns the new portfolio, or null if the source doesn't exist.
 */
export function duplicatePortfolio(id: string): StoredPortfolio | null {
  const source = getPortfolio(id);
  if (!source) return null;
  const now = new Date().toISOString();
  const copy: StoredPortfolio = {
    ...source,
    id: newId(),
    name: `${source.name} (copy)`,
    createdAt: now,
    updatedAt: now,
    // Deep-copy allocations so editing the copy doesn't mutate the original
    allocations: source.allocations.map((a) => ({ ...a })),
  };
  const all = readAll();
  all.push(copy);
  writeAll(all);
  return copy;
}

/**
 * Serialize all portfolios into a JSON string suitable for downloading as
 * a backup file. The shape includes a schema version + timestamp so future
 * versions can detect and migrate older backups.
 */
const SCHEMA = "etfp:portfolios:v1";

export function exportPortfoliosJson(): string {
  return JSON.stringify(
    {
      schema: SCHEMA,
      exportedAt: new Date().toISOString(),
      portfolios: readAll(),
    },
    null,
    2,
  );
}

export interface ImportPreview {
  fileCount: number;
  currentCount: number;
}

/** Parse + validate a backup file. Returns the portfolios + a preview. */
export function parseBackup(json: string): {
  portfolios: StoredPortfolio[];
  preview: ImportPreview;
} {
  const data = JSON.parse(json);
  if (data?.schema !== SCHEMA || !Array.isArray(data.portfolios)) {
    throw new Error("This doesn't look like a portfolio backup file.");
  }
  // Light shape check on each entry
  for (const p of data.portfolios) {
    if (
      typeof p?.id !== "string" ||
      typeof p?.name !== "string" ||
      !Array.isArray(p.allocations)
    ) {
      throw new Error("Backup file is corrupted (one or more invalid entries).");
    }
  }
  return {
    portfolios: data.portfolios as StoredPortfolio[],
    preview: {
      fileCount: data.portfolios.length,
      currentCount: readAll().length,
    },
  };
}

/**
 * Replace all existing portfolios with the ones from the backup.
 * Caller is responsible for any confirmation flow.
 */
export function restorePortfolios(portfolios: StoredPortfolio[]): void {
  writeAll(portfolios);
}
