/**
 * Converts canvas CircuitComponent[] + Wire[] into MNA nodes/elements.
 * Handles netlist extraction via node assignment.
 */
import type { CircuitComponent, Wire } from './types';
import type { MNANode, MNAElement } from './mna';

interface MNABuildResult {
  nodes: MNANode[];
  elements: MNAElement[];
  nodeIdMap: Record<string, number>; // nodeStringId -> MNA index (0=GND)
}

export function buildMNAFromCircuit(
  components: CircuitComponent[],
  wires: Wire[],
  t: number = 0,
  capState: Record<string, number> = {},
  indState: Record<string, number> = {},
  dt: number = 1e-4
): MNABuildResult {
  // Union-Find to merge nodes connected by wires
  const parent: Record<string, string> = {};

  const find = (x: string): string => {
    if (!parent[x]) parent[x] = x;
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  };
  const union = (a: string, b: string) => { parent[find(a)] = find(b); };

  // Each terminal is initially its own node
  for (const comp of components) {
    for (const t of comp.terminals) {
      const tid = `${comp.id}.${t.id}`;
      parent[tid] = tid;
    }
  }

  // Wires merge terminals
  for (const wire of wires) {
    if (wire.fromComponentId && wire.fromTerminalId && wire.toComponentId && wire.toTerminalId) {
      const a = `${wire.fromComponentId}.${wire.fromTerminalId}`;
      const b = `${wire.toComponentId}.${wire.toTerminalId}`;
      union(a, b);
    }
  }

  // Identify GND node
  let gndRoot = '';
  for (const comp of components) {
    if (comp.type === 'ground') {
      const tid = `${comp.id}.g`;
      gndRoot = find(tid);
      break;
    }
  }

  // Assign MNA node indices (GND = 0)
  const rootToIdx: Record<string, number> = {};
  let nextIdx = 1;
  const allRoots = new Set<string>();

  for (const comp of components) {
    for (const term of comp.terminals) {
      const tid = `${comp.id}.${term.id}`;
      allRoots.add(find(tid));
    }
  }

  for (const root of allRoots) {
    if (root === gndRoot) {
      rootToIdx[root] = 0;
    } else {
      rootToIdx[root] = nextIdx++;
    }
  }

  const getNode = (compId: string, termId: string): number => {
    const tid = `${compId}.${termId}`;
    const root = find(tid);
    return rootToIdx[root] ?? 0;
  };

  // Build MNA node list
  const mnaNodes: MNANode[] = Array.from(allRoots).map(root => ({
    id: root,
    index: rootToIdx[root],
  }));

  const elements: MNAElement[] = [];

  for (const comp of components) {
    const { type, id, props } = comp;

    switch (type) {
      case 'resistor':
      case 'potentiometer': {
        const p = getNode(id, 'p');
        const n = getNode(id, 'n');
        elements.push({ type: 'R', nodeP: p, nodeN: n, value: props.resistance ?? 1000, id });
        break;
      }
      case 'capacitor': {
        const p = getNode(id, 'p');
        const n = getNode(id, 'n');
        const C = props.capacitance ?? 1e-6;
        const vc = capState[id] ?? 0;
        // Companion model: G = C/dt, Ieq = C/dt * Vc(t-1)
        const g = C / dt;
        const ieq = g * vc;
        elements.push({ type: 'R', nodeP: p, nodeN: n, value: 1 / g, id: `${id}_cap_r` });
        elements.push({ type: 'I', nodeP: p, nodeN: n, value: ieq, id: `${id}_cap_i` });
        break;
      }
      case 'inductor': {
        const p = getNode(id, 'p');
        const n = getNode(id, 'n');
        const L = props.inductance ?? 1e-3;
        const il = indState[id] ?? 0;
        // Companion model: R = L/dt, Veq = L/dt * Il(t-1)
        const r = L / dt;
        elements.push({ type: 'R', nodeP: p, nodeN: n, value: r, id: `${id}_ind_r` });
        elements.push({ type: 'V', nodeP: p, nodeN: n, value: il * r, id: `${id}_ind_v` });
        break;
      }
      case 'vdc':
      case 'battery': {
        const p = getNode(id, 'p');
        const n = getNode(id, 'n');
        const v = props.voltage ?? 5;
        elements.push({ type: 'V', nodeP: p, nodeN: n, value: v, id });
        if (type === 'battery' && props.resistance) {
          elements.push({ type: 'R', nodeP: p, nodeN: n, value: props.resistance, id: `${id}_rint` });
        }
        break;
      }
      case 'vac': {
        const p = getNode(id, 'p');
        const n = getNode(id, 'n');
        const amp = (props.voltage ?? 120) * Math.SQRT2;
        const freq = props.frequency ?? 50;
        const phase = ((props.phase ?? 0) * Math.PI) / 180;
        let v = amp * Math.sin(2 * Math.PI * freq * t + phase);
        if (props.waveform === 'square') v = v >= 0 ? amp : -amp;
        if (props.waveform === 'triangle') {
          const period = 1 / freq;
          const tp = ((t % period) + period) % period;
          v = tp < period / 2 ? (4 * amp / period) * tp - amp : amp - (4 * amp / period) * (tp - period / 2);
        }
        elements.push({ type: 'V', nodeP: p, nodeN: n, value: v, id });
        break;
      }
      case 'idc': {
        const p = getNode(id, 'p');
        const n = getNode(id, 'n');
        elements.push({ type: 'I', nodeP: p, nodeN: n, value: props.current ?? 0.001, id });
        break;
      }
      case 'diode':
      case 'led': {
        const a = getNode(id, 'a');
        const k = getNode(id, 'k');
        elements.push({ type: 'D', nodeP: a, nodeN: k, value: props.vt ?? 0.7, id });
        break;
      }
      case 'zener': {
        const a = getNode(id, 'a');
        const k = getNode(id, 'k');
        elements.push({ type: 'Z', nodeP: a, nodeN: k, value: props.voltage ?? 5.1, id });
        break;
      }
      case 'switch_spst':
      case 'mcb':
      case 'fuse':
      case 'contactor': {
        const p = getNode(id, 'p');
        const n = getNode(id, 'n');
        const closed = props.closed ?? true;
        if (closed) {
          elements.push({ type: 'SHORT', nodeP: p, nodeN: n, value: 0, id });
        } else {
          elements.push({ type: 'R', nodeP: p, nodeN: n, value: 1e12, id }); // open = huge R
        }
        break;
      }
      case 'voltmeter': {
        const p = getNode(id, 'p');
        const n = getNode(id, 'n');
        elements.push({ type: 'R', nodeP: p, nodeN: n, value: 1e9, id }); // high-Z
        break;
      }
      case 'ammeter': {
        const p = getNode(id, 'p');
        const n = getNode(id, 'n');
        elements.push({ type: 'SHORT', nodeP: p, nodeN: n, value: 0, id });
        break;
      }
      case 'ground':
      case 'lamp': {
        if (type === 'lamp') {
          const p = getNode(id, 'p');
          const n = getNode(id, 'n');
          elements.push({ type: 'R', nodeP: p, nodeN: n, value: props.resistance ?? 100, id });
        }
        break;
      }
      default:
        break;
    }
  }

  // Build nodeIdMap for probe lookups
  const nodeIdMap: Record<string, number> = {};
  for (const [root, idx] of Object.entries(rootToIdx)) {
    nodeIdMap[root] = idx;
  }

  return { nodes: mnaNodes, elements, nodeIdMap };
}
