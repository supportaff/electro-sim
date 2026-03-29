/**
 * AC Frequency Sweep (Bode Plot data)
 * Sweeps frequency from fStart to fStop (log scale)
 * Returns magnitude (dB) and phase (deg) at output node
 */
import { create, all, complex } from 'mathjs';
const math = create(all);

export interface ACResult {
  frequencies: number[];
  magnitude: number[]; // dB
  phase: number[];     // degrees
}

export function runACSweep(
  r: number, l: number, c: number,
  fStart = 1, fStop = 1e6, points = 100
): ACResult {
  const frequencies: number[] = [];
  const magnitude: number[] = [];
  const phase: number[] = [];

  for (let i = 0; i <= points; i++) {
    const f = fStart * Math.pow(fStop / fStart, i / points);
    const w = 2 * Math.PI * f;
    const jw = math.complex(0, w);

    // Transfer function H(jw) for RLC low-pass: H = (1/jwC) / (R + jwL + 1/jwC)
    const ZC = math.divide(1, math.multiply(jw, c)) as math.Complex;
    const ZL = math.multiply(jw, l) as math.Complex;
    const Ztotal = math.add(math.add(r, ZL), ZC) as math.Complex;
    const H = math.divide(ZC, Ztotal) as math.Complex;

    const mag = math.abs(H) as number;
    const ang = Math.atan2((H as any).im ?? 0, (H as any).re ?? mag) * 180 / Math.PI;

    frequencies.push(f);
    magnitude.push(20 * Math.log10(mag + 1e-12));
    phase.push(ang);
  }

  return { frequencies, magnitude, phase };
}
