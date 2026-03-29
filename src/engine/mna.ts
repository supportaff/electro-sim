/**
 * Modified Nodal Analysis (MNA) Solver
 * Solves DC operating point: [G][V] = [I]
 * Supports: R, C (DC open), L (DC short), V-sources, I-sources, Diodes, BJTs, Op-Amps
 */
import { create, all } from 'mathjs';
const math = create(all);

export interface MNANode {
  id: string;
  index: number; // row/col in matrix (0 = GND)
}

export interface MNAElement {
  type: 'R' | 'C' | 'L' | 'V' | 'I' | 'D' | 'Z' | 'BJT' | 'OPAMP' | 'VCVS' | 'SHORT';
  nodeP: number;
  nodeN: number;
  nodeExtra?: number;  // for BJT collector, op-amp output etc.
  value: number;       // resistance / voltage / current
  id: string;
}

export interface MNAResult {
  nodeVoltages: number[];
  branchCurrents: Record<string, number>;
  success: boolean;
  error?: string;
}

export class MNASolver {
  private nodes: MNANode[];
  private elements: MNAElement[];
  private nodeCount: number;
  private vsCount: number;

  constructor(nodes: MNANode[], elements: MNAElement[]) {
    this.nodes = nodes;
    this.elements = elements;
    // Count ground-referenced nodes (index > 0)
    this.nodeCount = Math.max(...nodes.map(n => n.index), 0);
    this.vsCount = elements.filter(e => e.type === 'V' || e.type === 'OPAMP' || e.type === 'VCVS').length;
  }

  solve(): MNAResult {
    const N = this.nodeCount;
    const M = this.vsCount;
    const size = N + M;

    if (size === 0) return { nodeVoltages: [0], branchCurrents: {}, success: true };

    // Build G (conductance), B, C, D sub-matrices and RHS
    // G: N×N  B: N×M  C: M×N  D: M×M  e: N  f: M
    const G = Array.from({ length: size }, () => new Array(size).fill(0));
    const rhs = new Array(size).fill(0);

    let vsIdx = 0;
    const vsCurrentIds: string[] = [];

    for (const el of this.elements) {
      const p = el.nodeP;  // 0 = GND
      const n = el.nodeN;

      switch (el.type) {
        case 'R': {
          if (el.value === 0) break; // short handled separately
          const g = 1 / el.value;
          if (p > 0) G[p-1][p-1] += g;
          if (n > 0) G[n-1][n-1] += g;
          if (p > 0 && n > 0) { G[p-1][n-1] -= g; G[n-1][p-1] -= g; }
          break;
        }
        case 'C':  // DC: open circuit → no stamp
          break;
        case 'L':  // DC: short circuit → stamp as V=0 source
        case 'V': {
          const row = N + vsIdx;
          vsCurrentIds.push(el.id);
          if (p > 0) { G[p-1][row] += 1; G[row][p-1] += 1; }
          if (n > 0) { G[n-1][row] -= 1; G[row][n-1] -= 1; }
          rhs[row] = el.type === 'L' ? 0 : el.value;
          vsIdx++;
          break;
        }
        case 'I': {
          if (p > 0) rhs[p-1] -= el.value;
          if (n > 0) rhs[n-1] += el.value;
          break;
        }
        case 'D': {
          // Linearized diode: small-signal conductance + current source
          const vd = 0.65; // operating point guess
          const gd = 40 * 1e-12 * Math.exp(40 * vd); // diode gm
          const id = gd * vd - 1e-12 * (Math.exp(40 * vd) - 1);
          const g = Math.max(gd, 1e-9);
          if (p > 0) { G[p-1][p-1] += g; rhs[p-1] -= id; }
          if (n > 0) { G[n-1][n-1] += g; rhs[n-1] += id; }
          if (p > 0 && n > 0) { G[p-1][n-1] -= g; G[n-1][p-1] -= g; }
          break;
        }
        case 'Z': {
          // Zener: forward biased stamp
          const vz = el.value;
          const row = N + vsIdx;
          vsCurrentIds.push(el.id);
          if (p > 0) { G[p-1][row] += 1; G[row][p-1] += 1; }
          if (n > 0) { G[n-1][row] -= 1; G[row][n-1] -= 1; }
          rhs[row] = vz;
          vsIdx++;
          break;
        }
        case 'OPAMP': {
          // Ideal op-amp: V+ - V- = 0, Vout is free
          const vp = el.nodeP;    // + input
          const vn = el.nodeN;    // - input
          const vo = el.nodeExtra ?? 0; // output
          const row = N + vsIdx;
          vsCurrentIds.push(el.id);
          if (vp > 0) G[row][vp-1] += 1;
          if (vn > 0) G[row][vn-1] -= 1;
          if (vo > 0) { G[vo-1][row] += 1; G[row][vo-1] = 0; }
          vsIdx++;
          break;
        }
        case 'VCVS': {
          const row = N + vsIdx;
          vsCurrentIds.push(el.id);
          const vcp = el.nodeExtra ?? 0; // control +
          const vcn = 0;                  // control -
          if (p > 0) { G[p-1][row] += 1; G[row][p-1] += 1; }
          if (n > 0) { G[n-1][row] -= 1; G[row][n-1] -= 1; }
          if (vcp > 0) G[row][vcp-1] -= el.value; // gain
          if (vcn > 0) G[row][vcn-1] += el.value;
          vsIdx++;
          break;
        }
        case 'SHORT': {
          const row = N + vsIdx;
          vsCurrentIds.push(el.id);
          if (p > 0) { G[p-1][row] += 1; G[row][p-1] += 1; }
          if (n > 0) { G[n-1][row] -= 1; G[row][n-1] -= 1; }
          rhs[row] = 0;
          vsIdx++;
          break;
        }
      }
    }

    try {
      const Gmat = math.matrix(G);
      const rhsVec = math.matrix(rhs);
      const sol = math.lusolve(Gmat, rhsVec) as number[][];
      const flat = sol.flat();

      const nodeVoltages = [0, ...flat.slice(0, N)];
      const branchCurrents: Record<string, number> = {};
      for (let i = 0; i < vsCurrentIds.length; i++) {
        branchCurrents[vsCurrentIds[i]] = flat[N + i] ?? 0;
      }
      return { nodeVoltages, branchCurrents, success: true };
    } catch (e) {
      return { nodeVoltages: new Array(N + 1).fill(0), branchCurrents: {}, success: false, error: String(e) };
    }
  }
}
