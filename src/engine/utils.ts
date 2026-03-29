import type { CircuitComponent, Wire, Terminal } from './types';

export const GRID = 20;

export const snapToGrid = (v: number) => Math.round(v / GRID) * GRID;

export const uuid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

// Rotate a point (x,y) around origin by `deg`
export function rotatePoint(x: number, y: number, cx: number, cy: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return {
    x: cos * (x - cx) - sin * (y - cy) + cx,
    y: sin * (x - cx) + cos * (y - cy) + cy,
  };
}

// Return absolute terminal positions for a placed component
export function getAbsoluteTerminals(
  comp: Pick<CircuitComponent, 'x' | 'y' | 'rotation'>,
  terminalDefs: Omit<Terminal, 'id'>[],
  w: number,
  h: number
): { x: number; y: number; label: string }[] {
  const cx = w / 2;
  const cy = h / 2;
  return terminalDefs.map(t => {
    const r = rotatePoint(t.x, t.y, cx, cy, comp.rotation);
    return {
      label: t.label,
      x: comp.x + r.x,
      y: comp.y + r.y,
    };
  });
}

// Distance between two points
export const dist = (x1: number, y1: number, x2: number, y2: number) =>
  Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

// Find closest terminal on canvas within threshold
export function findNearestTerminal(
  px: number,
  py: number,
  components: CircuitComponent[],
  threshold = GRID
) {
  let best: { comp: CircuitComponent; terminal: Terminal; d: number } | null = null;
  for (const comp of components) {
    for (const t of comp.terminals) {
      const d = dist(px, py, t.x, t.y);
      if (d < threshold && (!best || d < best.d)) {
        best = { comp, terminal: t, d };
      }
    }
  }
  return best;
}

// Format engineering notation
export function formatValue(v: number, unit: string): string {
  const abs = Math.abs(v);
  if (abs >= 1e9) return `${(v / 1e9).toFixed(2)}G${unit}`;
  if (abs >= 1e6) return `${(v / 1e6).toFixed(2)}M${unit}`;
  if (abs >= 1e3) return `${(v / 1e3).toFixed(2)}k${unit}`;
  if (abs >= 1)   return `${v.toFixed(3)}${unit}`;
  if (abs >= 1e-3) return `${(v * 1e3).toFixed(2)}m${unit}`;
  if (abs >= 1e-6) return `${(v * 1e6).toFixed(2)}μ${unit}`;
  if (abs >= 1e-9) return `${(v * 1e9).toFixed(2)}n${unit}`;
  return `${v.toFixed(2)}${unit}`;
}

// Voltage → heat-map color
export function voltageToColor(v: number, vmax = 50): string {
  const t = Math.max(0, Math.min(1, (v + vmax) / (2 * vmax)));
  // blue (low) → cyan → green → yellow → red (high)
  const r = Math.round(255 * Math.max(0, Math.min(1, 2 * t - 0.5)));
  const g = Math.round(255 * Math.max(0, Math.min(1, 2 * t < 1 ? 2 * t : 2 - 2 * t)));
  const b = Math.round(255 * Math.max(0, Math.min(1, 1 - 2 * t)));
  return `rgb(${r},${g},${b})`;
}
