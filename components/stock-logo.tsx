"use client";

import { useMemo, useState } from "react";
import {
  fallbackLogoUrl,
  primaryLogoUrl,
} from "@/lib/data/stock-logos";
import { LOGO_FILES } from "@/lib/data/logo-manifest";

/**
 * Renders a company / fund logo with a graceful fallback chain:
 *   1. Local cached file under /public/logos (downloaded ahead of time)
 *   2. icon.horse (live, good quality)
 *   3. Google favicon (live, universal)
 *   4. Emoji fallback
 *
 * Most logos resolve at step 1 with zero external requests.
 */
export function StockLogo({
  ticker,
  fallbackEmoji,
  size = 28,
}: {
  ticker: string;
  fallbackEmoji: string;
  size?: number;
}) {
  // Ordered list of image URLs to try before falling back to the emoji.
  const sources = useMemo(() => {
    const list: string[] = [];
    const localFile = LOGO_FILES[ticker];
    if (localFile) list.push(`/logos/${localFile}`);
    const primary = primaryLogoUrl(ticker);
    if (primary) list.push(primary);
    const fallback = fallbackLogoUrl(ticker);
    if (fallback) list.push(fallback);
    return list;
  }, [ticker]);

  const [idx, setIdx] = useState(0);

  if (sources.length === 0 || idx >= sources.length) {
    return (
      <span
        className="inline-flex shrink-0 items-center justify-center leading-none"
        style={{ fontSize: size * 0.78 }}
        aria-hidden
      >
        {fallbackEmoji}
      </span>
    );
  }

  return (
    <span
      className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-white ring-1 ring-zinc-200 dark:bg-zinc-100 dark:ring-zinc-700"
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={sources[idx]}
        alt={`${ticker} logo`}
        width={size}
        height={size}
        loading="lazy"
        className="h-full w-full object-contain"
        onError={() => setIdx((i) => i + 1)}
      />
    </span>
  );
}
