/**
 * Tiny inline SVG sparkline — no library, no client hydration cost.
 * Renders a smooth line with a gradient fill and a subtle dot at the
 * latest point so it feels current rather than static.
 */
export function Sparkline({
  data,
  width = 100,
  height = 32,
  className = "",
}: {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
}) {
  if (data.length < 2) {
    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className={className}
      />
    );
  }

  const positive = data[data.length - 1] >= data[0];
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 3;
  const w = width - pad * 2;
  const h = height - pad * 2;
  const xStep = w / (data.length - 1);

  const coords = data.map((v, i) => {
    const x = pad + i * xStep;
    const y = pad + h - ((v - min) / range) * h;
    return { x, y };
  });

  const points = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
  const lastX = coords[coords.length - 1].x;
  const lastY = coords[coords.length - 1].y;
  const fillPath = `M ${pad},${pad + h} L ${coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" L ")} L ${lastX.toFixed(1)},${pad + h} Z`;

  const stroke = positive ? "#10b981" : "#f43f5e";
  const gradientId = `spark-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.22" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill={`url(#${gradientId})`} />
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points}
      />
      <circle cx={lastX} cy={lastY} r={1.75} fill={stroke} />
    </svg>
  );
}
