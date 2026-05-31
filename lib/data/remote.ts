/**
 * Fetch helpers that point at the always-fresh copy of the data files on
 * the project's GitHub `main` branch. This means daily data refreshes
 * (committed by the GitHub Action) appear on the live site without
 * needing a Vercel redeploy.
 *
 * Next.js caches each response server-side for `revalidate` seconds, so
 * we don't hammer GitHub on every request. Each bundled JSON is also
 * imported statically as a fallback when the remote fetch fails.
 */

const REPO = "Artzainnn/etf-portfolio";
const BRANCH = "main";
const REVALIDATE_SECONDS = 30 * 60; // 30 min

/**
 * Per-deployment data version. jsDelivr caches `@main` for ~12h and
 * Next.js caches each fetch for `revalidate` seconds, so right after a
 * deploy that ships new data the live site could keep serving the old
 * CDN copy. Appending the commit SHA as a cache-busting query gives
 * every deployment a unique fetch URL — so a fresh deploy always pulls
 * the current data — while staying constant *within* a deployment so
 * the 30-min revalidate still prevents hammering. (jsDelivr serves the
 * file regardless of the query string.)
 */
const DATA_VERSION = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "dev";

/**
 * jsDelivr CDN URL for a path inside the repo's `main` branch.
 * jsDelivr proxies GitHub content with global CDN caching and works for
 * public repos without auth. We picked jsDelivr over
 * raw.githubusercontent.com because the latter occasionally 404s for a
 * few minutes after a visibility change and has worse caching.
 */
export function remoteUrl(pathInRepo: string): string {
  return `https://cdn.jsdelivr.net/gh/${REPO}@${BRANCH}/${pathInRepo}?v=${DATA_VERSION}`;
}

/**
 * Fetch JSON from the remote repo with Next.js cache + a local fallback.
 * Always returns the fallback if the remote fetch fails for any reason.
 */
export async function fetchRemoteJsonOrFallback<T>(
  pathInRepo: string,
  fallback: T,
): Promise<T> {
  try {
    const res = await fetch(remoteUrl(pathInRepo), {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return fallback;
    const json = (await res.json()) as T;
    return json;
  } catch {
    return fallback;
  }
}
