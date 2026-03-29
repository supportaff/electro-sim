// ─── Core circuit data types ───────────────────────────────────────────────

export type ComponentType =
  // Passive
  | 'resistor' | 'capacitor' | 'inductor' | 'transformer' | 'potentiometer'
  // Sources
  | 'vdc' | 'idc' | 'vac' | 'pulse' | 'pwm' | 'vcvs' | 'ccvs' | 'vccs' | 'cccs' | 'battery' | 'ground' | 'power_rail'
  // Semiconductor
  | 'diode' | 'zener' | 'led' | 'bjt_npn' | 'bjt_pnp' | 'nmos' | 'pmos' | 'jfet' | 'opamp' | 'scr' | 'triac' | 'diac'
  // Digital
  | 'gate_and' | 'gate_or' | 'gate_not' | 'gate_nand' | 'gate_nor' | 'gate_xor' | 'gate_xnor'
  | 'ff_sr' | 'ff_jk' | 'ff_d' | 'ff_t' | 'mux' | 'demux' | 'encoder' | 'decoder'
  | 'seg7' | 'clock' | 'logic_probe'
  // Power Electronics
  | 'rectifier_1ph' | 'rectifier_3ph' | 'inverter' | 'buck' | 'boost' | 'buckboost' | 'igbt' | 'snubber'
  // Measurement
  | 'voltmeter' | 'ammeter' | 'oscilloscope' | 'multimeter' | 'bode' | 'power_analyzer' | 'spectrum'
  // Wiring/Electrical
  | 'breaker' | 'mcb' | 'mccb' | 'rccb' | 'fuse' | 'isolator'
  | 'switch_spst' | 'switch_spdt' | 'switch_dpst' | 'switch_dpdt'
  | 'contactor' | 'relay' | 'dol_starter' | 'star_delta'
  | 'motor_3ph' | 'motor_1ph' | 'lamp' | 'socket' | 'earthing';

export interface Terminal {
  id: string;      // e.g. 'p' | 'n' | 'gate' | 'drain' | 'source'
  x: number;       // relative to component origin
  y: number;
  label: string;
}

export interface ComponentProps {
  // Common
  resistance?: number;    // Ω
  capacitance?: number;   // F
  inductance?: number;    // H
  voltage?: number;       // V
  current?: number;       // A
  frequency?: number;     // Hz
  phase?: number;         // degrees
  waveform?: 'sine' | 'square' | 'triangle';
  gain?: number;
  ratio?: number;         // transformer turns ratio
  // Semiconductor
  vt?: number;            // threshold voltage
  is?: number;            // saturation current
  // General
  label?: string;
  value?: string;         // display value string
  model?: string;
  tolerance?: number;     // %
  // Switch state
  closed?: boolean;
  // Rail
  railVoltage?: number;
}

export interface CircuitComponent {
  id: string;
  type: ComponentType;
  x: number;
  y: number;
  rotation: number;       // 0 | 90 | 180 | 270
  props: ComponentProps;
  terminals: Terminal[];  // absolute positions after transform
  selected?: boolean;
}

export interface Wire {
  id: string;
  points: number[];       // flat [x0,y0,x1,y1,...]
  fromComponentId?: string;
  fromTerminalId?: string;
  toComponentId?: string;
  toTerminalId?: string;
  nodeId?: string;        // MNA node assignment
  selected?: boolean;
  current?: number;       // computed A
  voltage?: number;       // computed V (average of endpoints)
}

export interface CircuitNode {
  id: string;             // 'n0', 'n1', ...
  voltage: number;
  connectedWireIds: string[];
  connectedTerminals: { componentId: string; terminalId: string }[];
}

export interface SimulationResult {
  nodeVoltages: Record<string, number>;
  branchCurrents: Record<string, number>;
  time?: number[];
  waveforms?: Record<string, number[]>;   // nodeId → voltage trace
  powerPerComponent?: Record<string, number>;
  errors?: string[];
}

export interface CircuitState {
  components: CircuitComponent[];
  wires: Wire[];
  nodes: CircuitNode[];
  simResult?: SimulationResult;
  simRunning: boolean;
  simTime: number;
  simSpeed: number;
  mode: 'select' | 'wire' | 'place';
  placingType?: ComponentType;
}
