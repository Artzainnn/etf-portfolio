/**
 * Signal-bar style risk indicator. Five vertical bars of increasing height,
 * filled up to `score` (1-5). Colour reflects the risk bucket:
 *   - 1-2: emerald (low)
 *   - 3:   amber   (medium)
 *   - 4-5: rose    (higher)
 *
 * Empty bars use the same color at low opacity so the shape remains visible
 * in both light and dark mode without an extra CSS theming hop.
 */
export function RiskBars({
  score,
  size = "sm",
  className = "",
}: {
  score: number | null;
  size?: "sm" | "md";
  className?: string;
}) {
  if (score == null) return null;
  const clamped = Math.max(0, Math.min(5, Math.round(score)));

  const color =
    clamped <= 2 ? "#10b981" : clamped === 3 ? "#f59e0b" : "#f43f5e"; // emerald-500 / amber-500 / rose-500

  const dims =
    size === "md"
      ? { width: 28, height: 18, barWidth: 3.5, gap: 2 }
      : { width: 22, height: 14, barWidth: 2.5, gap: 1.5 };
  const { width, height, barWidth, gap } = dims;
  const step = barWidth + gap;
  const heights = [
    height * 0.25,
    height * 0.4,
    height * 0.55,
    height * 0.75,
    height * 0.95,
  ];

  const label =
    clamped <= 2 ? "Low risk" : clamped === 3 ? "Medium risk" : "Higher risk";

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      role="img"
      aria-label={`${label} (${clamped}/5)`}
    >
      <title>{`${label} (${clamped}/5)`}</title>
      {[1, 2, 3, 4, 5].map((i) => {
        const h = heights[i - 1];
        const x = (i - 1) * step;
        const y = height - h;
        const filled = i <= clamped;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barWidth}
            height={h}
            rx={0.7}
            fill={color}
            fillOpacity={filled ? 1 : 0.18}
          />
        );
      })}
    </svg>
  );
}
