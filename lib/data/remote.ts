/**
 * Fetch helpers that point at the always-fresh copy of the data files on
 * the project's GitHub `main` branch (via the jsDelivr CDN). This means
 * daily data refreshes (committed by the GitHub Action) and newly-added
 * funds/stocks appear on the live site without needing a redeploy.
 *
 * We deliberately do NOT use Next.js's server-side Data Cache here: it
 * persists across deployments on Vercel and was holding a stale copy of
 * the data for up to 30 min after each change (newly-added stocks didn't
 * show up). The data files are small and this is a single-user app, so a
 * direct `no-store` fetch per render is the simpler, always-correct
 * choice. Each bundled JSON is still imported statically as a fallback
 * when the remote fetch fails.
 */

const REPO = "Artzainnn/etf-portfolio";
const BRANCH = "main";

/**
 * jsDelivr CDN URL for a path inside the repo's `main` branch.
 * jsDelivr proxies GitHub content with global CDN caching and works for
 * public repos without auth. We picked jsDelivr over
 * raw.githubusercontent.com because the latter occasionally 404s for a
 * few minutes after a visibility change and has worse caching.
 */
export function remoteUrl(pathInRepo: string): string {
  return `https://cdn.jsdelivr.net/gh/${REPO}@${BRANCH}/${pathInRepo}`;
}

/**
 * Fetch JSON from the remote repo with a local fallback. Bypasses the
 * Next.js Data Cache (`no-store`) so the live site always reflects the
 * current data; returns the bundled fallback if the fetch fails.
 */
export async function fetchRemoteJsonOrFallback<T>(
  pathInRepo: string,
  fallback: T,
): Promise<T> {
  try {
    const res = await fetch(remoteUrl(pathInRepo), { cache: "no-store" });
    if (!res.ok) return fallback;
    const json = (await res.json()) as T;
    return json;
  } catch {
    return fallback;
  }
}
