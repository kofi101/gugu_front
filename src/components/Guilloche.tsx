import { useMemo } from "react";

interface Layer {
  R: number;
  r: number;
  d: number;
  scale: number;
  opacity: number;
  width: number;
}

// Hypotrochoid rosettes, the engraved pattern printed on banknotes.
const LAYERS: Layer[] = [
  { R: 96, r: 7.2, d: 58, scale: 1.55, opacity: 0.5, width: 0.7 },
  { R: 90, r: 11.25, d: 44, scale: 1.4, opacity: 0.75, width: 0.8 },
  { R: 84, r: 6, d: 30, scale: 1.3, opacity: 0.9, width: 0.9 },
  { R: 60, r: 7.5, d: 26, scale: 1.1, opacity: 0.6, width: 0.7 },
];

function rosettePath({ R, r, d, scale }: Layer, cx: number, cy: number) {
  const k = (R - r) / r;
  // Close the curve: period is 2π · r / gcd(R, r) for rational ratios.
  const turns = Math.round(r / gcd(Math.round(R * 100), Math.round(r * 100)) * 100);
  const steps = Math.min(4000, 360 * Math.max(1, turns));
  const tMax = Math.PI * 2 * Math.max(1, turns);
  let out = "";
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * tMax;
    const x = cx + scale * ((R - r) * Math.cos(t) + d * Math.cos(k * t));
    const y = cy + scale * ((R - r) * Math.sin(t) - d * Math.sin(k * t));
    out += `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return out;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/** Decorative engraved rosette. Draws itself once; static when reduced motion is requested. */
export function Guilloche({ className = "", animate = true }: { className?: string; animate?: boolean }) {
  const paths = useMemo(() => LAYERS.map((l) => ({ l, d: rosettePath(l, 200, 200) })), []);
  return (
    <svg viewBox="0 0 400 400" className={className} aria-hidden="true" focusable="false">
      {paths.map(({ l, d }, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="currentColor"
          strokeOpacity={l.opacity}
          strokeWidth={l.width}
          pathLength={1}
          strokeDasharray={animate ? 1 : undefined}
          strokeDashoffset={animate ? 1 : undefined}
          className={animate ? "animate-draw motion-reduce:animate-none motion-reduce:[stroke-dashoffset:0]" : undefined}
          style={animate ? { animationDelay: `${i * 180}ms` } : undefined}
        />
      ))}
    </svg>
  );
}
