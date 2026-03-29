/**
 * Transient Simulation Engine
 * Backward Euler integration for C and L elements
 * Time steps: fixed dt
 */
import { MNASolver } from './mna';
import type { MNAElement, MNANode } from './mna';
import type { CircuitComponent, Wire } from './types';
import { buildMNAFromCircuit } from './circuitToMNA';

export interface TransientOptions {
  tStart: number;
  tStop: number;
  dt: number;
  probeNodes: string[]; // node IDs to record
}

export interface TransientResult {
  time: number[];
  waveforms: Record<string, number[]>; // nodeId -> voltage trace
  branchWaveforms: Record<string, number[]>; // elementId -> current trace
}

export function runTransient(
  components: CircuitComponent[],
  wires: Wire[],
  opts: TransientOptions
): TransientResult {
  const { tStart, tStop, dt, probeNodes } = opts;
  const timeArr: number[] = [];
  const waveforms: Record<string, number[]> = {};
  const branchWaveforms: Record<string, number[]> = {};

  for (const n of probeNodes) {
    waveforms[n] = [];
    branchWaveforms[n] = [];
  }

  // State: capacitor voltages, inductor currents
  const capState: Record<string, number> = {}; // elementId -> voltage
  const indState: Record<string, number> = {}; // elementId -> current

  for (let t = tStart; t <= tStop; t += dt) {
    const { nodes, elements, nodeIdMap } = buildMNAFromCircuit(
      components, wires, t, capState, indState, dt
    );

    const solver = new MNASolver(nodes, elements);
    const result = solver.solve();

    timeArr.push(t);
    for (const nid of probeNodes) {
      const idx = nodeIdMap[nid] ?? 0;
      const v = result.nodeVoltages[idx] ?? 0;
      waveforms[nid].push(v);
    }

    // Update capacitor and inductor states for next step
    for (const el of elements) {
      if (el.type === 'C') {
        const vp = result.nodeVoltages[el.nodeP] ?? 0;
        const vn = result.nodeVoltages[el.nodeN] ?? 0;
        capState[el.id] = vp - vn;
      }
    }
  }

  return { time: timeArr, waveforms, branchWaveforms };
}
