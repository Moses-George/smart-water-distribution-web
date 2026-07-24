// import { KPIS } from "@/lib/network-data";
// import { Bar, Panel, Stat } from "../dashboard/panel";
// import {Bar as RBar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
// import { Battery, Droplets, Factory, Zap } from "lucide-react";

// const chartAxis = { stroke: "oklch(0.72 0.03 225)", fontSize: 11 } as const;
// const gridStroke = "oklch(0.35 0.03 230 / 40%)";
// const tipStyle = {
//   contentStyle: { background: "oklch(0.23 0.035 232)", border: "1px solid oklch(0.34 0.03 232)", borderRadius: 8, fontSize: 12 },
//   labelStyle: { color: "oklch(0.72 0.03 225)" },
// } as const;

// export default function CarbonView() {
//   const data = Array.from({ length: 12 }, (_, i) => ({
//     m: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
//     grid: 90 - i * 2, solar: i * 3 + 4,
//   }));
//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//       <Stat label="CO₂ today" value={KPIS.co2Today} unit="tCO₂e" trend="↓ 24% YoY" tone="success" />
//       <Stat label="Pump energy" value={KPIS.energyToday.toLocaleString()} unit="kWh" trend="61% grid · 39% solar" tone="energy" />
//       <Stat label="Water losses" value={KPIS.nrw} unit="% NRW" trend="Target: 15%" tone="aqua" />

//       <Panel title="Energy mix — 12 months" className="lg:col-span-2">
//         <ResponsiveContainer width="100%" height={280}>
//           <BarChart data={data} stackOffset="expand">
//             <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" vertical={false} />
//             <XAxis dataKey="m" {...chartAxis} />
//             <YAxis {...chartAxis} tickFormatter={(v) => `${Math.round(v * 100)}%`} />
//             <Tooltip {...tipStyle} />
//             <Legend wrapperStyle={{ fontSize: 12 }} />
//             <RBar dataKey="grid" name="Grid" stackId="e" fill="oklch(0.6 0.05 260)" />
//             <RBar dataKey="solar" name="Solar" stackId="e" fill="oklch(0.82 0.18 90)" />
//           </BarChart>
//         </ResponsiveContainer>
//       </Panel>

//       <Panel title="Carbon breakdown">
//         <ul className="space-y-3 text-sm">
//           {[
//             { l: "Pump energy (grid)", v: "2.1 tCO₂e", pct: 66, tone: "energy" as const, i: Zap },
//             { l: "Chemical dosing", v: "0.6 tCO₂e", pct: 19, tone: "aqua" as const, i: Droplets },
//             { l: "Facilities", v: "0.4 tCO₂e", pct: 12, tone: "aqua" as const, i: Factory },
//             { l: "Losses (embedded)", v: "0.1 tCO₂e", pct: 3, tone: "aqua" as const, i: Battery },
//           ].map((r) => {
//             const Icon = r.i;
//             return (
//               <li key={r.l}>
//                 <div className="flex justify-between items-center mb-1">
//                   <span className="flex items-center gap-2 text-xs text-muted-foreground"><Icon className="h-3.5 w-3.5" />{r.l}</span>
//                   <span className="font-mono text-xs">{r.v}</span>
//                 </div>
//                 <Bar value={r.pct} tone={r.tone} />
//               </li>
//             );
//           })}
//         </ul>
//       </Panel>
//     </div>
//   );
// }


import { useSelector } from "react-redux";
import { Bar, Panel, Stat } from "../dashboard/panel";
import {
  Bar as RBar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Battery, Droplets, Factory, Zap } from "lucide-react";
// import type { RootState } from "@/store/store";
import { useCarbonQuery } from "@/store/api/carbonApi";
import { ClipLoader } from "react-spinners";
import type { RootState } from "@/store/rootReducer";

const chartAxis = { stroke: "oklch(0.72 0.03 225)", fontSize: 11 } as const;
const gridStroke = "oklch(0.35 0.03 230 / 40%)";
const tipStyle = {
  contentStyle: {
    background: "oklch(0.23 0.035 232)",
    border: "1px solid oklch(0.34 0.03 232)",
    borderRadius: 8,
    fontSize: 12,
  },
  labelStyle: { color: "oklch(0.72 0.03 225)" },
} as const;

export default function CarbonView() {
  const nid = useSelector((s: RootState) => s.networkUi.activeNetworkId);
  const { data, isLoading } = useCarbonQuery(nid!, { skip: !nid });

  if (isLoading || !data) {
    return (
      <div className="grid place-items-center py-16">
        <ClipLoader size={20} />
      </div>
    );
  }

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const trend = data.trend_7d.map((v, i) => ({ d: days[i % 7], co2: v }));
  const mix = Array.from({ length: 12 }, (_, i) => ({
    m: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
    grid: 90 - i * 2,
    solar: i * 3 + 4,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Stat label="CO₂ today" value={(data.kg_co2_today / 1000).toFixed(2)} unit="tCO₂e" trend={`Grid: ${data.grid_factor} kg/kWh`} tone="success" />
      <Stat label="Pump energy today" value={data.kwh_today.toLocaleString()} unit="kWh" tone="energy" />
      <Stat label="7-day CO₂ trend" value={(data.trend_7d.reduce((a, b) => a + b, 0) / 1000).toFixed(2)} unit="tCO₂e" tone="aqua" />

      <Panel title="7-day CO₂ trend" className="lg:col-span-2">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={trend}>
            <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="d" {...chartAxis} />
            <YAxis {...chartAxis} unit=" kg" />
            <Tooltip {...tipStyle} />
            <Line dataKey="co2" name="kg CO₂" stroke="oklch(0.78 0.16 200)" strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </Panel>

      <Panel title="Carbon breakdown">
        <ul className="space-y-3 text-sm">
          {[
            { l: "Pump energy (grid)", v: `${(data.kg_co2_today * 0.66 / 1000).toFixed(2)} tCO₂e`, pct: 66, tone: "energy" as const, i: Zap },
            { l: "Chemical dosing", v: `${(data.kg_co2_today * 0.19 / 1000).toFixed(2)} tCO₂e`, pct: 19, tone: "aqua" as const, i: Droplets },
            { l: "Facilities", v: `${(data.kg_co2_today * 0.12 / 1000).toFixed(2)} tCO₂e`, pct: 12, tone: "aqua" as const, i: Factory },
            { l: "Losses (embedded)", v: `${(data.kg_co2_today * 0.03 / 1000).toFixed(2)} tCO₂e`, pct: 3, tone: "aqua" as const, i: Battery },
          ].map((r) => {
            const Icon = r.i;
            return (
              <li key={r.l}>
                <div className="flex justify-between items-center mb-1">
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Icon className="h-3.5 w-3.5" />
                    {r.l}
                  </span>
                  <span className="font-mono text-xs">{r.v}</span>
                </div>
                <Bar value={r.pct} tone={r.tone} />
              </li>
            );
          })}
        </ul>
      </Panel>

      <Panel title="Energy mix — 12 months" className="lg:col-span-3">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={mix} stackOffset="expand">
            <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="m" {...chartAxis} />
            <YAxis {...chartAxis} tickFormatter={(v) => `${Math.round(v * 100)}%`} />
            <Tooltip {...tipStyle} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <RBar dataKey="grid" name="Grid" stackId="e" fill="oklch(0.6 0.05 260)" />
            <RBar dataKey="solar" name="Solar" stackId="e" fill="oklch(0.82 0.18 90)" />
          </BarChart>
        </ResponsiveContainer>
      </Panel>
    </div>
  );
}
