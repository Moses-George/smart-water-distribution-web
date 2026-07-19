import { Map, Waves, Zap, TrendingUp, Radio, Wrench, Droplets, GitBranch, Leaf, Sparkles } from "lucide-react";

export type ModuleId =
  | "twin" 
  | "hydraulic" 
  | "energy" 
  | "forecast" 
  | "leaks"
  | "maintenance" 
  | "quality" 
  | "gis" 
  | "carbon" 
  | "scenario";

export const MODULES: { id: ModuleId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "twin", label: "Digital Twin", icon: Map },
  { id: "hydraulic", label: "Hydraulic Sim", icon: Waves },
  { id: "energy", label: "Energy Optimization", icon: Zap },
  { id: "forecast", label: "Demand Forecast", icon: TrendingUp },
  { id: "leaks", label: "Leak Detection", icon: Radio },
  { id: "maintenance", label: "Predictive Maintenance", icon: Wrench },
  { id: "quality", label: "Water Quality", icon: Droplets },
  { id: "gis", label: "GIS Analytics", icon: GitBranch },
  { id: "carbon", label: "Carbon Footprint", icon: Leaf },
  { id: "scenario", label: "Scenario Simulation", icon: Sparkles },
];

// Move KPIS, HOURLY, WEEK_FORECAST, LEAKS, ASSETS, QUALITY here
export const KPIS = {
  nrw: 22.4,
  energyToday: 38420,
  costToday: 4920,
  activeLeaks: 3,
  savingsMonth: 187000,
  co2Today: 14.6,
};

// ... export other constants