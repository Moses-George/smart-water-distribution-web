import { KPIS } from "@/lib/constants";
import { Stat } from "./panel";

export function KPIStrip() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <Stat 
        label="Non-Revenue Water" 
        value={KPIS.nrw} 
        unit="%" 
        trend="↓ 2.3 vs last month" 
        tone="aqua" 
      />
      <Stat 
        label="Energy Today" 
        value={KPIS.energyToday.toLocaleString()} 
        unit="kWh" 
        trend={`$${KPIS.costToday.toLocaleString()} cost`} 
        tone="energy" 
      />
      <Stat 
        label="Active Leaks" 
        value={KPIS.activeLeaks} 
        trend="1 critical · 1 high" 
        tone="danger" 
      />
      <Stat 
        label="Monthly Savings" 
        value={`$${(KPIS.savingsMonth / 1000).toFixed(1)}k`} 
        trend="AI-optimized schedule" 
        tone="success" 
      />
    </div>
  );
}