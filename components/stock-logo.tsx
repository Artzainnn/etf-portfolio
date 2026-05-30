"use client";

import { useState } from "react";
import {
  fallbackLogoUrl,
  primaryLogoUrl,
} from "@/lib/data/stock-logos";

/**
 * Renders a stock's company logo with a graceful fallback chain:
 *   1. icon.horse (good quality, no auth needed)
 *   2. Google favicon (lower quality, universally available)
 *   3. Emoji fallback (when no domain is mapped or both image loads fail)
 *
 * Loaded with native <img> (no Next.js Image domain config required).
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
  const primary = primaryLogoUrl(ticker);
  const fallback = fallbackLogoUrl(ticker);

  const [step, setStep] = useState<"primary" | "fallback" | "failed">(
    primary ? "primary" : fallback ? "fallback" : "failed",
  );

  if (step === "failed" || (!primary && !fallback)) {
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

  const src = step === "primary" ? primary! : fallback!;

  return (
    <span
      className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-white ring-1 ring-zinc-200 dark:bg-zinc-100 dark:ring-zinc-700"
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`${ticker} logo`}
        width={size}
        height={size}
        loading="lazy"
        className="h-full w-full object-contain"
        onError={() => {
          if (step === "primary" && fallback) {
            setStep("fallback");
          } else {
            setStep("failed");
          }
        }}
      />
    </span>
  );
}
