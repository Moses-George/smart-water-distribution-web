export type NodeType = "reservoir" | "tank" | "pump" | "valve" | "junction" | "consumer";

export interface NetworkNode {
  id: string;
  type: NodeType;
  label: string;
  x: number; // 0-100
  y: number; // 0-100
  pressure: number; // m
  demand?: number; // L/s
  level?: number; // % for tanks
  status: "ok" | "warn" | "alert";
  leakProb?: number; // 0-1
  ratedKw?: number; // for pumps
  elevation?: number; // m
}

export interface NetworkPipe {
  id: string;
  from: string;
  to: string;
  diameter: number; // mm
  flow: number; // L/s
  velocity: number; // m/s
  headloss: number;
  material: "PVC" | "DI" | "Steel" | "HDPE";
  age: number; // years
}

export type Tool =
  | "select"
  | "connect"
  | "delete"
  | "add-reservoir"
  | "add-tank"
  | "add-pump"
  | "add-valve"
  | "add-junction"
  | "add-consumer";

export type ScenarioId = "pop" | "pump" | "burst" | "res" | "solar";

export interface ScheduleRow {
  hour: string;
  tariff: number;
  demandLps: number;
  pumps: Record<string, number>; // pumpId → kW at that hour
  kw: number;
  cost: number; // $
  baselineKw: number;
  baselineCost: number;
}

export interface ScheduleResult {
  rows: ScheduleRow[];
  totalKWh: number;
  totalCost: number;
  baselineKWh: number;
  baselineCost: number;
  savings: number;
  savingsPct: number;
  pumpIds: string[];
  ranAt: number;
}

export interface LeakResult {
  perNode: { id: string; label: string; prob: number; zScore: number; reason: string }[];
  updatedNodes: number;
  criticals: number;
  ranAt: number;
}

export interface ScenarioMetrics {
  peakDemand: number; // L/s
  minPressure: number; // m
  avgPressure: number;
  energyKWh: number;
  co2t: number;
  activeLeaks: number;
  nodes: number;
  pipes: number;
}

export interface ScenarioResult {
  id: ScenarioId;
  label: string;
  baseline: ScenarioMetrics;
  scenario: ScenarioMetrics;
  compare: { hour: string; baseline: number; scenario: number }[];
  scenarioNodes: NetworkNode[];
  scenarioPipes: NetworkPipe[];
  ranAt: number;
}

// interface State {
//   nodes: NetworkNode[];
//   pipes: NetworkPipe[];
//   tool: Tool;
//   selectedId: string | null;
//   selectedPipeId: string | null;
//   connectFrom: string | null;

//   scheduleResult: ScheduleResult | null;
//   leakResult: LeakResult | null;
//   scenarioResult: ScenarioResult | null;

//   setTool: (t: Tool) => void;
//   select: (id: string | null) => void;
//   selectPipe: (id: string | null) => void;
//   addNodeAt: (type: NodeType, x: number, y: number) => void;
//   moveNode: (id: string, x: number, y: number) => void;
//   updateNode: (id: string, patch: Partial<NetworkNode>) => void;
//   updatePipe: (id: string, patch: Partial<NetworkPipe>) => void;
//   deleteNode: (id: string) => void;
//   deletePipe: (id: string) => void;
//   connectNodes: (from: string, to: string) => void;
//   setConnectFrom: (id: string | null) => void;
//   reset: () => void;
//   clear: () => void;

//   optimizeSchedule: () => void;
//   runLeakDetection: () => void;
//   runScenario: (id: ScenarioId) => void;
// }