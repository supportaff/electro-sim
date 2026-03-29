import type { ComponentType, Terminal, ComponentProps } from './types';

export interface ComponentDef {
  type: ComponentType;
  label: string;
  category: string;
  symbol: string;          // SVG path data or emoji placeholder
  defaultProps: ComponentProps;
  terminalDefs: Omit<Terminal, 'id'>[];  // relative positions at rotation=0
  width: number;
  height: number;
  description: string;
}

// Grid unit = 20px
const G = 20;

export const COMPONENT_LIBRARY: ComponentDef[] = [
  // ── PASSIVE ────────────────────────────────────────────────────────────────
  {
    type: 'resistor', label: 'Resistor', category: 'Passive',
    symbol: 'R',
    defaultProps: { resistance: 1000, label: 'R', tolerance: 5 },
    terminalDefs: [{ x: 0, y: G*2, label: 'p' }, { x: G*4, y: G*2, label: 'n' }],
    width: G*4, height: G*4,
    description: 'Resistor. V = IR. Default 1kΩ.',
  },
  {
    type: 'capacitor', label: 'Capacitor', category: 'Passive',
    symbol: 'C',
    defaultProps: { capacitance: 1e-6, label: 'C' },
    terminalDefs: [{ x: 0, y: G*2, label: 'p' }, { x: G*4, y: G*2, label: 'n' }],
    width: G*4, height: G*4,
    description: 'Capacitor. I = C·dV/dt. Default 1μF.',
  },
  {
    type: 'inductor', label: 'Inductor', category: 'Passive',
    symbol: 'L',
    defaultProps: { inductance: 1e-3, label: 'L' },
    terminalDefs: [{ x: 0, y: G*2, label: 'p' }, { x: G*4, y: G*2, label: 'n' }],
    width: G*4, height: G*4,
    description: 'Inductor. V = L·dI/dt. Default 1mH.',
  },
  {
    type: 'transformer', label: 'Transformer', category: 'Passive',
    symbol: 'TR',
    defaultProps: { ratio: 1, label: 'T', inductance: 1 },
    terminalDefs: [
      { x: 0, y: G, label: 'p1' }, { x: 0, y: G*3, label: 'p2' },
      { x: G*5, y: G, label: 's1' }, { x: G*5, y: G*3, label: 's2' },
    ],
    width: G*5, height: G*4,
    description: 'Ideal transformer. Turns ratio Np:Ns.',
  },
  {
    type: 'potentiometer', label: 'Potentiometer', category: 'Passive',
    symbol: 'POT',
    defaultProps: { resistance: 10000, label: 'POT', value: '50%' },
    terminalDefs: [
      { x: 0, y: G*2, label: 'p' }, { x: G*4, y: G*2, label: 'n' }, { x: G*2, y: 0, label: 'w' },
    ],
    width: G*4, height: G*4,
    description: 'Variable resistor with wiper. 10kΩ default.',
  },

  // ── SOURCES ────────────────────────────────────────────────────────────────
  {
    type: 'vdc', label: 'DC Voltage', category: 'Sources',
    symbol: 'VDC',
    defaultProps: { voltage: 5, label: 'V1' },
    terminalDefs: [{ x: G*2, y: 0, label: 'p' }, { x: G*2, y: G*4, label: 'n' }],
    width: G*4, height: G*4,
    description: 'Ideal DC voltage source. Default 5V.',
  },
  {
    type: 'idc', label: 'DC Current', category: 'Sources',
    symbol: 'IDC',
    defaultProps: { current: 0.001, label: 'I1' },
    terminalDefs: [{ x: G*2, y: 0, label: 'p' }, { x: G*2, y: G*4, label: 'n' }],
    width: G*4, height: G*4,
    description: 'Ideal DC current source. Default 1mA.',
  },
  {
    type: 'vac', label: 'AC Voltage', category: 'Sources',
    symbol: 'VAC',
    defaultProps: { voltage: 120, frequency: 50, phase: 0, waveform: 'sine', label: 'VAC1' },
    terminalDefs: [{ x: G*2, y: 0, label: 'p' }, { x: G*2, y: G*4, label: 'n' }],
    width: G*4, height: G*4,
    description: 'AC voltage source. Sine/Square/Triangle. Default 120V 50Hz.',
  },
  {
    type: 'pulse', label: 'Pulse Source', category: 'Sources',
    symbol: 'PLS',
    defaultProps: { voltage: 5, frequency: 1000, label: 'PLS1' },
    terminalDefs: [{ x: G*2, y: 0, label: 'p' }, { x: G*2, y: G*4, label: 'n' }],
    width: G*4, height: G*4,
    description: 'Configurable pulse voltage source.',
  },
  {
    type: 'battery', label: 'Battery', category: 'Sources',
    symbol: 'BAT',
    defaultProps: { voltage: 9, resistance: 0.5, label: 'BAT1' },
    terminalDefs: [{ x: G*2, y: 0, label: 'p' }, { x: G*2, y: G*4, label: 'n' }],
    width: G*4, height: G*4,
    description: 'Battery with internal resistance. Default 9V 0.5Ω.',
  },
  {
    type: 'ground', label: 'Ground', category: 'Sources',
    symbol: 'GND',
    defaultProps: { voltage: 0, label: 'GND' },
    terminalDefs: [{ x: G, y: 0, label: 'g' }],
    width: G*2, height: G*2,
    description: 'Ground reference (0V node).',
  },
  {
    type: 'power_rail', label: 'Power Rail', category: 'Sources',
    symbol: 'PWR',
    defaultProps: { railVoltage: 5, label: 'VCC' },
    terminalDefs: [{ x: G, y: G*2, label: 'v' }],
    width: G*2, height: G*2,
    description: 'Named power rail. Connects same-name rails globally.',
  },
  {
    type: 'vcvs', label: 'VCVS', category: 'Sources',
    symbol: 'VCVS',
    defaultProps: { gain: 1, label: 'E1' },
    terminalDefs: [
      { x: 0, y: G, label: 'vp' }, { x: 0, y: G*3, label: 'vn' },
      { x: G*5, y: G, label: 'op' }, { x: G*5, y: G*3, label: 'on' },
    ],
    width: G*5, height: G*4,
    description: 'Voltage-Controlled Voltage Source. Vout = A·Vctrl.',
  },

  // ── SEMICONDUCTOR ─────────────────────────────────────────────────────────
  {
    type: 'diode', label: 'Diode', category: 'Semiconductor',
    symbol: 'D',
    defaultProps: { vt: 0.7, is: 1e-12, label: 'D1' },
    terminalDefs: [{ x: 0, y: G*2, label: 'a' }, { x: G*4, y: G*2, label: 'k' }],
    width: G*4, height: G*4,
    description: 'PN Junction diode. Vf=0.7V default.',
  },
  {
    type: 'zener', label: 'Zener Diode', category: 'Semiconductor',
    symbol: 'ZD',
    defaultProps: { vt: 0.7, voltage: 5.1, label: 'Z1' },
    terminalDefs: [{ x: 0, y: G*2, label: 'a' }, { x: G*4, y: G*2, label: 'k' }],
    width: G*4, height: G*4,
    description: 'Zener diode. Vz=5.1V default.',
  },
  {
    type: 'led', label: 'LED', category: 'Semiconductor',
    symbol: 'LED',
    defaultProps: { vt: 2.0, label: 'LED1', value: 'red' },
    terminalDefs: [{ x: 0, y: G*2, label: 'a' }, { x: G*4, y: G*2, label: 'k' }],
    width: G*4, height: G*4,
    description: 'Light Emitting Diode. Vf~2V. Colors: red/green/blue/white.',
  },
  {
    type: 'bjt_npn', label: 'NPN BJT', category: 'Semiconductor',
    symbol: 'NPN',
    defaultProps: { gain: 100, label: 'Q1', model: 'NPN' },
    terminalDefs: [
      { x: 0, y: G*2, label: 'b' },
      { x: G*3, y: 0, label: 'c' },
      { x: G*3, y: G*4, label: 'e' },
    ],
    width: G*4, height: G*4,
    description: 'NPN BJT. Ic = β·Ib. Default β=100.',
  },
  {
    type: 'bjt_pnp', label: 'PNP BJT', category: 'Semiconductor',
    symbol: 'PNP',
    defaultProps: { gain: 100, label: 'Q2', model: 'PNP' },
    terminalDefs: [
      { x: 0, y: G*2, label: 'b' },
      { x: G*3, y: 0, label: 'e' },
      { x: G*3, y: G*4, label: 'c' },
    ],
    width: G*4, height: G*4,
    description: 'PNP BJT. Current flows emitter→collector.',
  },
  {
    type: 'nmos', label: 'N-MOSFET', category: 'Semiconductor',
    symbol: 'NMOS',
    defaultProps: { vt: 2, gain: 10, label: 'M1', model: 'NMOS' },
    terminalDefs: [
      { x: 0, y: G*2, label: 'g' },
      { x: G*3, y: 0, label: 'd' },
      { x: G*3, y: G*4, label: 's' },
    ],
    width: G*4, height: G*4,
    description: 'N-channel MOSFET. Enhancement mode. Vth=2V.',
  },
  {
    type: 'pmos', label: 'P-MOSFET', category: 'Semiconductor',
    symbol: 'PMOS',
    defaultProps: { vt: -2, gain: 10, label: 'M2', model: 'PMOS' },
    terminalDefs: [
      { x: 0, y: G*2, label: 'g' },
      { x: G*3, y: 0, label: 's' },
      { x: G*3, y: G*4, label: 'd' },
    ],
    width: G*4, height: G*4,
    description: 'P-channel MOSFET. Enhancement mode.',
  },
  {
    type: 'opamp', label: 'Op-Amp', category: 'Semiconductor',
    symbol: 'OA',
    defaultProps: { gain: 1e6, label: 'U1', model: 'ideal' },
    terminalDefs: [
      { x: 0, y: G, label: 'inp' },
      { x: 0, y: G*3, label: 'inn' },
      { x: G*5, y: G*2, label: 'out' },
      { x: G*2, y: 0, label: 'vp' },
      { x: G*2, y: G*4, label: 'vn' },
    ],
    width: G*5, height: G*4,
    description: 'Ideal Op-Amp. Gain=1MV/V. Rail-limited.',
  },
  {
    type: 'scr', label: 'SCR/Thyristor', category: 'Semiconductor',
    symbol: 'SCR',
    defaultProps: { vt: 1.0, label: 'SCR1' },
    terminalDefs: [
      { x: 0, y: G*2, label: 'a' },
      { x: G*4, y: G*2, label: 'k' },
      { x: G*2, y: G*4, label: 'g' },
    ],
    width: G*4, height: G*4,
    description: 'Silicon Controlled Rectifier. Triggered by gate pulse.',
  },

  // ── DIGITAL LOGIC ─────────────────────────────────────────────────────────
  {
    type: 'gate_and', label: 'AND Gate', category: 'Digital',
    symbol: 'AND',
    defaultProps: { label: 'AND' },
    terminalDefs: [
      { x: 0, y: G, label: 'a' }, { x: 0, y: G*3, label: 'b' }, { x: G*4, y: G*2, label: 'y' },
    ],
    width: G*4, height: G*4,
    description: 'AND logic gate. Y = A·B.',
  },
  {
    type: 'gate_or', label: 'OR Gate', category: 'Digital',
    symbol: 'OR',
    defaultProps: { label: 'OR' },
    terminalDefs: [
      { x: 0, y: G, label: 'a' }, { x: 0, y: G*3, label: 'b' }, { x: G*4, y: G*2, label: 'y' },
    ],
    width: G*4, height: G*4,
    description: 'OR logic gate. Y = A+B.',
  },
  {
    type: 'gate_not', label: 'NOT Gate', category: 'Digital',
    symbol: 'NOT',
    defaultProps: { label: 'NOT' },
    terminalDefs: [{ x: 0, y: G*2, label: 'a' }, { x: G*4, y: G*2, label: 'y' }],
    width: G*4, height: G*4,
    description: 'NOT inverter. Y = Ā.',
  },
  {
    type: 'gate_nand', label: 'NAND Gate', category: 'Digital',
    symbol: 'NAND',
    defaultProps: { label: 'NAND' },
    terminalDefs: [
      { x: 0, y: G, label: 'a' }, { x: 0, y: G*3, label: 'b' }, { x: G*4, y: G*2, label: 'y' },
    ],
    width: G*4, height: G*4,
    description: 'NAND gate. Y = ¬(A·B).',
  },
  {
    type: 'gate_nor', label: 'NOR Gate', category: 'Digital',
    symbol: 'NOR',
    defaultProps: { label: 'NOR' },
    terminalDefs: [
      { x: 0, y: G, label: 'a' }, { x: 0, y: G*3, label: 'b' }, { x: G*4, y: G*2, label: 'y' },
    ],
    width: G*4, height: G*4,
    description: 'NOR gate. Y = ¬(A+B).',
  },
  {
    type: 'gate_xor', label: 'XOR Gate', category: 'Digital',
    symbol: 'XOR',
    defaultProps: { label: 'XOR' },
    terminalDefs: [
      { x: 0, y: G, label: 'a' }, { x: 0, y: G*3, label: 'b' }, { x: G*4, y: G*2, label: 'y' },
    ],
    width: G*4, height: G*4,
    description: 'XOR gate. Y = A⊕B.',
  },
  {
    type: 'ff_d', label: 'D Flip-Flop', category: 'Digital',
    symbol: 'DFF',
    defaultProps: { label: 'FF1' },
    terminalDefs: [
      { x: 0, y: G, label: 'd' }, { x: 0, y: G*3, label: 'clk' },
      { x: G*5, y: G, label: 'q' }, { x: G*5, y: G*3, label: 'qn' },
    ],
    width: G*5, height: G*4,
    description: 'D Flip-Flop. Clocked storage element.',
  },
  {
    type: 'clock', label: 'Clock', category: 'Digital',
    symbol: 'CLK',
    defaultProps: { frequency: 1000, voltage: 5, label: 'CLK1' },
    terminalDefs: [{ x: G*2, y: G*4, label: 'out' }],
    width: G*4, height: G*4,
    description: 'Digital clock source. Configurable frequency.',
  },
  {
    type: 'logic_probe', label: 'Logic Probe', category: 'Digital',
    symbol: 'LP',
    defaultProps: { label: 'LP1' },
    terminalDefs: [{ x: 0, y: G, label: 'in' }],
    width: G*3, height: G*2,
    description: 'Shows HIGH/LOW state. Lights up based on voltage threshold.',
  },

  // ── POWER ELECTRONICS ─────────────────────────────────────────────────────
  {
    type: 'rectifier_1ph', label: '1-Ph Rectifier', category: 'Power',
    symbol: 'RECT',
    defaultProps: { label: 'REC1' },
    terminalDefs: [
      { x: 0, y: G*2, label: 'ac1' }, { x: G*6, y: G*2, label: 'ac2' },
      { x: G*3, y: 0, label: 'dc+' }, { x: G*3, y: G*4, label: 'dc-' },
    ],
    width: G*6, height: G*4,
    description: 'Full-wave bridge rectifier. 4 diodes inside.',
  },
  {
    type: 'buck', label: 'Buck Converter', category: 'Power',
    symbol: 'BUCK',
    defaultProps: { voltage: 5, frequency: 100000, label: 'BUCK1' },
    terminalDefs: [
      { x: 0, y: G*2, label: 'vin' }, { x: G*6, y: G*2, label: 'vout' },
      { x: G*3, y: G*4, label: 'gnd' },
    ],
    width: G*6, height: G*4,
    description: 'Step-down DC-DC converter template. Set Vout < Vin.',
  },
  {
    type: 'boost', label: 'Boost Converter', category: 'Power',
    symbol: 'BST',
    defaultProps: { voltage: 12, frequency: 100000, label: 'BST1' },
    terminalDefs: [
      { x: 0, y: G*2, label: 'vin' }, { x: G*6, y: G*2, label: 'vout' },
      { x: G*3, y: G*4, label: 'gnd' },
    ],
    width: G*6, height: G*4,
    description: 'Step-up DC-DC converter template.',
  },
  {
    type: 'igbt', label: 'IGBT', category: 'Power',
    symbol: 'IGBT',
    defaultProps: { vt: 3, label: 'G1', model: 'IGBT' },
    terminalDefs: [
      { x: 0, y: G*2, label: 'g' },
      { x: G*3, y: 0, label: 'c' },
      { x: G*3, y: G*4, label: 'e' },
    ],
    width: G*4, height: G*4,
    description: 'Insulated Gate Bipolar Transistor. High power switching.',
  },

  // ── MEASUREMENT ───────────────────────────────────────────────────────────
  {
    type: 'voltmeter', label: 'Voltmeter', category: 'Instruments',
    symbol: 'V',
    defaultProps: { label: 'VM1' },
    terminalDefs: [{ x: 0, y: G*2, label: 'p' }, { x: G*4, y: G*2, label: 'n' }],
    width: G*4, height: G*4,
    description: 'High-impedance voltmeter. Measures node-to-node voltage.',
  },
  {
    type: 'ammeter', label: 'Ammeter', category: 'Instruments',
    symbol: 'A',
    defaultProps: { label: 'AM1' },
    terminalDefs: [{ x: 0, y: G*2, label: 'p' }, { x: G*4, y: G*2, label: 'n' }],
    width: G*4, height: G*4,
    description: 'Low-impedance ammeter. Place in series.',
  },

  // ── WIRING & ELECTRICAL ──────────────────────────────────────────────────
  {
    type: 'switch_spst', label: 'SPST Switch', category: 'Wiring',
    symbol: 'SW',
    defaultProps: { closed: false, label: 'SW1' },
    terminalDefs: [{ x: 0, y: G*2, label: 'p' }, { x: G*4, y: G*2, label: 'n' }],
    width: G*4, height: G*4,
    description: 'Single Pole Single Throw switch. Click to toggle.',
  },
  {
    type: 'switch_spdt', label: 'SPDT Switch', category: 'Wiring',
    symbol: 'SPDT',
    defaultProps: { closed: false, label: 'SW2' },
    terminalDefs: [
      { x: 0, y: G*2, label: 'com' },
      { x: G*4, y: G, label: 'nc' },
      { x: G*4, y: G*3, label: 'no' },
    ],
    width: G*4, height: G*4,
    description: 'Single Pole Double Throw switch.',
  },
  {
    type: 'mcb', label: 'MCB', category: 'Wiring',
    symbol: 'MCB',
    defaultProps: { closed: true, label: 'MCB1' },
    terminalDefs: [{ x: 0, y: G*2, label: 'p' }, { x: G*4, y: G*2, label: 'n' }],
    width: G*4, height: G*4,
    description: 'Miniature Circuit Breaker. Trips on overload.',
  },
  {
    type: 'fuse', label: 'Fuse', category: 'Wiring',
    symbol: 'F',
    defaultProps: { current: 10, closed: true, label: 'F1' },
    terminalDefs: [{ x: 0, y: G*2, label: 'p' }, { x: G*4, y: G*2, label: 'n' }],
    width: G*4, height: G*4,
    description: 'Fuse. Opens when current exceeds rating.',
  },
  {
    type: 'relay', label: 'Relay', category: 'Wiring',
    symbol: 'RLY',
    defaultProps: { closed: false, voltage: 12, label: 'RLY1' },
    terminalDefs: [
      { x: 0, y: G, label: 'coil+' }, { x: 0, y: G*3, label: 'coil-' },
      { x: G*5, y: G, label: 'com' }, { x: G*5, y: G*3, label: 'no' },
    ],
    width: G*5, height: G*4,
    description: 'Electromechanical relay. Coil voltage toggles contacts.',
  },
  {
    type: 'motor_3ph', label: '3-Ph Motor', category: 'Wiring',
    symbol: 'M3',
    defaultProps: { voltage: 415, frequency: 50, label: 'M1' },
    terminalDefs: [
      { x: 0, y: G, label: 'u' }, { x: 0, y: G*2, label: 'v' }, { x: 0, y: G*3, label: 'w' },
    ],
    width: G*5, height: G*4,
    description: '3-phase induction motor. 415V 50Hz.',
  },
  {
    type: 'lamp', label: 'Lamp', category: 'Wiring',
    symbol: 'LP',
    defaultProps: { resistance: 100, voltage: 230, label: 'LA1' },
    terminalDefs: [{ x: 0, y: G*2, label: 'p' }, { x: G*4, y: G*2, label: 'n' }],
    width: G*4, height: G*4,
    description: 'Incandescent lamp model. R=100Ω at rated voltage.',
  },
  {
    type: 'ground', label: 'Ground (Earth)', category: 'Wiring',
    symbol: 'GND',
    defaultProps: { voltage: 0, label: 'PE' },
    terminalDefs: [{ x: G, y: 0, label: 'g' }],
    width: G*2, height: G*2,
    description: 'Protective earth / chassis ground.',
  },
  {
    type: 'contactor', label: 'Contactor', category: 'Wiring',
    symbol: 'KM',
    defaultProps: { closed: false, voltage: 230, label: 'KM1' },
    terminalDefs: [
      { x: 0, y: G, label: 'a1' }, { x: 0, y: G*3, label: 'a2' },
      { x: G*5, y: G, label: 't1' }, { x: G*5, y: G*3, label: 't2' },
    ],
    width: G*5, height: G*4,
    description: 'Heavy-duty contactor. Coil energizes main contacts.',
  },
];

export const CATEGORIES = [
  'Passive', 'Sources', 'Semiconductor', 'Digital', 'Power', 'Instruments', 'Wiring',
] as const;

export const getComponentDef = (type: ComponentType): ComponentDef | undefined =>
  COMPONENT_LIBRARY.find(d => d.type === type);

export const getByCategory = (cat: string) =>
  COMPONENT_LIBRARY.filter(d => d.category === cat);
