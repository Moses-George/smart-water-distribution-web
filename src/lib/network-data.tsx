import type { NetworkNode, NetworkPipe } from "@/types/network";

export const NODES: NetworkNode[] = [
  { id: "R1", type: "reservoir", label: "Northfield Reservoir", x: 8, y: 18, pressure: 62, status: "ok" },
  { id: "T1", type: "tank", label: "Elevated Tank A", x: 32, y: 12, pressure: 55, level: 78, status: "ok" },
  { id: "T2", type: "tank", label: "Ground Tank B", x: 72, y: 22, pressure: 42, level: 41, status: "warn" },
  { id: "P1", type: "pump", label: "Pump Station 1", x: 20, y: 30, pressure: 58, status: "ok", ratedKw: 420 },
  { id: "P2", type: "pump", label: "Pump Station 2", x: 55, y: 45, pressure: 51, status: "ok", ratedKw: 280 },
  { id: "P3", type: "pump", label: "Pump Station 3", x: 82, y: 55, pressure: 34, status: "alert", ratedKw: 180 },
  { id: "V1", type: "valve", label: "PRV-1", x: 40, y: 55, pressure: 46, status: "ok" },
  { id: "V2", type: "valve", label: "PRV-2", x: 65, y: 70, pressure: 38, status: "ok" },
  { id: "J1", type: "junction", label: "J-12", x: 30, y: 55, pressure: 44, status: "ok", leakProb: 0.97 },
  { id: "J2", type: "junction", label: "J-5", x: 48, y: 30, pressure: 50, status: "ok", leakProb: 0.04 },
  { id: "J3", type: "junction", label: "J-30", x: 75, y: 40, pressure: 39, status: "ok", leakProb: 0.01 },
  { id: "J4", type: "junction", label: "J-18", x: 22, y: 72, pressure: 41, status: "warn", leakProb: 0.62 },
  { id: "C1", type: "consumer", label: "District 1", x: 15, y: 85, pressure: 33, demand: 24, status: "ok" },
  { id: "C2", type: "consumer", label: "District 2", x: 42, y: 82, pressure: 30, demand: 31, status: "ok" },
  { id: "C3", type: "consumer", label: "District 3", x: 68, y: 88, pressure: 26, demand: 19, status: "warn" },
  { id: "C4", type: "consumer", label: "District 4", x: 88, y: 80, pressure: 22, demand: 15, status: "alert" },
];

export const PIPES: NetworkPipe[] = [
  { id: "PP1", from: "R1", to: "P1", diameter: 400, flow: 92, velocity: 1.1, headloss: 2.1, material: "DI", age: 12 },
  { id: "PP2", from: "P1", to: "T1", diameter: 350, flow: 78, velocity: 1.3, headloss: 3.4, material: "DI", age: 12 },
  { id: "PP3", from: "P1", to: "J1", diameter: 300, flow: 44, velocity: 1.0, headloss: 2.8, material: "PVC", age: 18 },
  { id: "PP4", from: "T1", to: "J2", diameter: 300, flow: 55, velocity: 1.2, headloss: 2.5, material: "PVC", age: 8 },
  { id: "PP5", from: "J2", to: "P2", diameter: 300, flow: 48, velocity: 1.1, headloss: 3.0, material: "HDPE", age: 5 },
  { id: "PP6", from: "P2", to: "T2", diameter: 350, flow: 62, velocity: 1.4, headloss: 3.2, material: "DI", age: 15 },
  { id: "PP7", from: "P2", to: "V1", diameter: 250, flow: 28, velocity: 0.9, headloss: 2.1, material: "PVC", age: 22 },
  { id: "PP8", from: "V1", to: "J1", diameter: 250, flow: 25, velocity: 0.8, headloss: 1.8, material: "PVC", age: 22 },
  { id: "PP9", from: "V1", to: "C2", diameter: 200, flow: 31, velocity: 1.0, headloss: 4.1, material: "HDPE", age: 6 },
  { id: "PP10", from: "T2", to: "J3", diameter: 300, flow: 40, velocity: 1.1, headloss: 2.4, material: "DI", age: 15 },
  { id: "PP11", from: "J3", to: "P3", diameter: 250, flow: 22, velocity: 0.7, headloss: 2.9, material: "Steel", age: 32 },
  { id: "PP12", from: "P3", to: "V2", diameter: 250, flow: 20, velocity: 0.6, headloss: 2.2, material: "Steel", age: 32 },
  { id: "PP13", from: "V2", to: "C3", diameter: 200, flow: 19, velocity: 0.8, headloss: 3.4, material: "PVC", age: 14 },
  { id: "PP14", from: "P3", to: "C4", diameter: 200, flow: 15, velocity: 0.7, headloss: 4.6, material: "Steel", age: 32 },
  { id: "PP15", from: "J1", to: "J4", diameter: 250, flow: 26, velocity: 0.9, headloss: 2.6, material: "PVC", age: 18 },
  { id: "PP16", from: "J4", to: "C1", diameter: 200, flow: 24, velocity: 0.9, headloss: 3.8, material: "PVC", age: 20 },
];

// Hourly (24h) — demand (ML/h), tariff (¢/kWh), pump kW, tank level %
export const HOURLY = Array.from({ length: 24 }).map((_, h) => {
  const demandBase = 6 + 4 * Math.sin(((h - 7) / 24) * Math.PI * 2) + (h >= 7 && h <= 9 ? 3 : 0) + (h >= 18 && h <= 21 ? 3.5 : 0);
  const tariff = h >= 22 || h < 6 ? 6 : h >= 17 && h <= 21 ? 24 : 14;
  const forecast = demandBase * (1 + (Math.sin(h) * 0.04));
  return {
    hour: `${String(h).padStart(2, "0")}:00`,
    demand: +demandBase.toFixed(2),
    forecast: +forecast.toFixed(2),
    tariff,
    pumpKw: +(tariff < 10 ? 480 : tariff > 20 ? 140 : 300).toFixed(0),
    tank: +(60 + 20 * Math.sin(((h - 3) / 24) * Math.PI * 2)).toFixed(1),
  };
});

export const WEEK_FORECAST = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => ({
  day: d,
  actual: 145 + i * 3 + (i % 2 ? 8 : -4),
  forecast: 148 + i * 3 + (i % 2 ? 6 : -2),
  lower: 138 + i * 3,
  upper: 158 + i * 3,
}));

export const LEAKS = [
  { node: "J-12", prob: 0.97, zone: "District 2 feeder", detected: "2h ago", severity: "critical" },
  { node: "J-18", prob: 0.62, zone: "District 1 loop", detected: "9h ago", severity: "high" },
  { node: "PP14", prob: 0.28, zone: "District 4 spur", detected: "1d ago", severity: "medium" },
  { node: "J-5", prob: 0.04, zone: "Central", detected: "—", severity: "low" },
  { node: "J-30", prob: 0.01, zone: "Eastern", detected: "—", severity: "low" },
];

export const ASSETS = [
  { id: "Pump 2", type: "Pump", rul: 42, health: 58, cycles: 128_400, note: "Vibration trending up" },
  { id: "Pump 1", type: "Pump", rul: 210, health: 84, cycles: 89_100, note: "Nominal" },
  { id: "Pump 3", type: "Pump", rul: 12, health: 31, cycles: 214_800, note: "Bearing wear detected" },
  { id: "PRV-1", type: "Valve", rul: 320, health: 91, cycles: 12_400, note: "Nominal" },
  { id: "PP11", type: "Pipe (Steel, 32y)", rul: 95, health: 44, cycles: 0, note: "Corrosion risk high" },
  { id: "PP16", type: "Pipe (PVC, 20y)", rul: 260, health: 72, cycles: 0, note: "Joint stress moderate" },
];

export const QUALITY = [
  { name: "Chlorine", value: 0.72, unit: "mg/L", min: 0.2, max: 1.0, status: "ok" as const },
  { name: "Turbidity", value: 0.34, unit: "NTU", min: 0, max: 1.0, status: "ok" as const },
  { name: "pH", value: 7.4, unit: "", min: 6.5, max: 8.5, status: "ok" as const },
  { name: "Temperature", value: 18.2, unit: "°C", min: 5, max: 25, status: "ok" as const },
  { name: "Chlorine (Z-4)", value: 0.15, unit: "mg/L", min: 0.2, max: 1.0, status: "alert" as const },
];

export const KPIS = {
  nrw: 18.4, // %
  energyToday: 8_420, // kWh
  costToday: 1_284, // $
  avgPressure: 44.6, // m
  co2Today: 3.2, // tCO2e
  activeLeaks: 2,
  demandNow: 138, // ML/d
  savingsMonth: 24_600, // $
};
