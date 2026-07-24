// import { useNetworkStore } from "@/hooks/useNetwork";
// import type { ScenarioId, ScenarioMetrics } from "@/types/network";
// import { useState } from "react";
// import { Panel } from "../dashboard/panel";
// import { cn } from "@/lib/utils";
// import { Gauge, Sparkles } from "lucide-react";
// import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// const chartAxis = { stroke: "oklch(0.72 0.03 225)", fontSize: 11 } as const;
// const gridStroke = "oklch(0.35 0.03 230 / 40%)";
// const tipStyle = {
//   contentStyle: { background: "oklch(0.23 0.035 232)", border: "1px solid oklch(0.34 0.03 232)", borderRadius: 8, fontSize: 12 },
//   labelStyle: { color: "oklch(0.72 0.03 225)" },
// } as const;

// export default function ScenarioView() {
//   const scenarios: { id: ScenarioId; label: string; desc: string }[] = [
//     {
//       id: "pop",
//       label: "Population +30%",
//       desc: "Uniform demand growth across all consumers",
//     },
//     {
//       id: "pump",
//       label: "Pump failure",
//       desc: "Take the first pump offline (0 kW)",
//     },
//     {
//       id: "burst",
//       label: "Pipe burst",
//       desc: "First pipe bursts: +300 L/s loss, downstream pressure drop",
//     },
//     {
//       id: "res",
//       label: "New reservoir",
//       desc: "Adds R-next in the NE, +4 m pressure downstream",
//     },
//     {
//       id: "solar",
//       label: "Solar pumping 60%",
//       desc: "60% of pump energy from PV (offset grid)",
//     },
//   ];
//   const [pick, setPick] = useState<ScenarioId>("pop");
//   const { scenarioResult: result, runScenario: run } = useNetworkStore();

//   const rows = result
//     ? [
//         {
//           l: "Peak demand",
//           u: "L/s",
//           b: result.baseline.peakDemand,
//           a: result.scenario.peakDemand,
//           badWhenUp: true,
//         },
//         {
//           l: "Min pressure",
//           u: "m",
//           b: result.baseline.minPressure,
//           a: result.scenario.minPressure,
//           badWhenUp: false,
//         },
//         {
//           l: "Avg pressure",
//           u: "m",
//           b: result.baseline.avgPressure,
//           a: result.scenario.avgPressure,
//           badWhenUp: false,
//         },
//         {
//           l: "Daily energy",
//           u: "kWh",
//           b: result.baseline.energyKWh,
//           a: result.scenario.energyKWh,
//           badWhenUp: true,
//         },
//         {
//           l: "CO₂",
//           u: "t",
//           b: result.baseline.co2t,
//           a: result.scenario.co2t,
//           badWhenUp: true,
//         },
//         {
//           l: "Active leaks",
//           u: "",
//           b: result.baseline.activeLeaks,
//           a: result.scenario.activeLeaks,
//           badWhenUp: true,
//         },
//         {
//           l: "Nodes",
//           u: "",
//           b: result.baseline.nodes,
//           a: result.scenario.nodes,
//           badWhenUp: false,
//         },
//         {
//           l: "Pipes",
//           u: "",
//           b: result.baseline.pipes,
//           a: result.scenario.pipes,
//           badWhenUp: false,
//         },
//       ]
//     : [];

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
//       <Panel
//         title="What-if scenarios"
//         subtitle="Clones your current network, applies the change, then compares"
//       >
//         <ul className="space-y-1.5">
//           {scenarios.map((s) => (
//             <li key={s.id}>
//               <button
//                 onClick={() => setPick(s.id)}
//                 className={cn(
//                   "w-full text-left p-2.5 rounded-md border transition",
//                   pick === s.id
//                     ? "border-primary/40 bg-primary/10"
//                     : "border-border bg-panel-2 hover:bg-panel",
//                 )}
//               >
//                 <div className="text-sm font-medium flex items-center gap-1.5">
//                   <Sparkles
//                     className={cn(
//                       "h-3.5 w-3.5",
//                       pick === s.id && "text-primary",
//                     )}
//                   />
//                   {s.label}
//                 </div>
//                 <div className="text-[11px] text-muted-foreground mt-0.5">
//                   {s.desc}
//                 </div>
//               </button>
//             </li>
//           ))}
//         </ul>
//         <button
//           onClick={() => run(pick)}
//           className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition"
//         >
//           <Gauge className="h-4 w-4" /> Run scenario
//         </button>
//         {result && (
//           <p className="mt-2 text-[10px] text-muted-foreground">
//             Last run: {new Date(result.ranAt).toLocaleTimeString()} ·{" "}
//             {result.label}
//           </p>
//         )}
//       </Panel>

//       <div className="flex flex-col gap-6">
//         {!result ? (
//           <Panel title="Compare">
//             <p className="text-sm text-muted-foreground">
//               Pick a scenario and click{" "}
//               <span className="text-foreground">Run scenario</span> to snapshot
//               your current network, apply the change, and see the before/after
//               side-by-side.
//             </p>
//           </Panel>
//         ) : (
//           <>
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               <Panel
//                 title="Baseline (your network)"
//                 subtitle={`${result.baseline.nodes} nodes · ${result.baseline.pipes} pipes`}
//               >
//                 <ScenarioMetricList metrics={result.baseline} />
//               </Panel>
//               <Panel
//                 title={`Scenario · ${result.label}`}
//                 subtitle={`${result.scenario.nodes} nodes · ${result.scenario.pipes} pipes`}
//               >
//                 <ScenarioMetricList metrics={result.scenario} />
//               </Panel>
//             </div>

//             <Panel title="Side-by-side deltas">
//               <div className="overflow-x-auto">
//                 <table className="w-full text-xs">
//                   <thead className="text-muted-foreground text-[10px] uppercase tracking-wider">
//                     <tr className="border-b border-border">
//                       <th className="text-left py-2 font-medium">Metric</th>
//                       <th className="text-right font-medium">Baseline</th>
//                       <th className="text-right font-medium">Scenario</th>
//                       <th className="text-right font-medium">Δ</th>
//                       <th className="text-right font-medium">Δ %</th>
//                     </tr>
//                   </thead>
//                   <tbody className="font-mono">
//                     {rows.map((r) => {
//                       const delta = r.a - r.b;
//                       const pct = r.b === 0 ? 0 : (delta / r.b) * 100;
//                       const worse = r.badWhenUp ? delta > 0 : delta < 0;
//                       const better = r.badWhenUp ? delta < 0 : delta > 0;
//                       return (
//                         <tr key={r.l} className="border-b border-border/50">
//                           <td className="py-1.5 font-sans">{r.l}</td>
//                           <td className="text-right">
//                             {r.b}
//                             {r.u && ` ${r.u}`}
//                           </td>
//                           <td className="text-right">
//                             {r.a}
//                             {r.u && ` ${r.u}`}
//                           </td>
//                           <td
//                             className={cn(
//                               "text-right",
//                               worse && "text-[oklch(0.68_0.22_25)]",
//                               better && "text-[oklch(0.78_0.18_155)]",
//                             )}
//                           >
//                             {delta >= 0 ? "+" : ""}
//                             {delta.toFixed(1)}
//                           </td>
//                           <td
//                             className={cn(
//                               "text-right",
//                               worse && "text-[oklch(0.68_0.22_25)]",
//                               better && "text-[oklch(0.78_0.18_155)]",
//                             )}
//                           >
//                             {pct >= 0 ? "+" : ""}
//                             {pct.toFixed(1)}%
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>
//             </Panel>

//             <Panel title="24h demand — baseline vs scenario">
//               <ResponsiveContainer width="100%" height={260}>
//                 <LineChart data={result.compare}>
//                   <CartesianGrid
//                     stroke={gridStroke}
//                     strokeDasharray="3 3"
//                     vertical={false}
//                   />
//                   <XAxis dataKey="hour" {...chartAxis} />
//                   <YAxis {...chartAxis} unit=" ML/h" />
//                   <Tooltip {...tipStyle} />
//                   <Legend wrapperStyle={{ fontSize: 12 }} />
//                   <Line
//                     dataKey="baseline"
//                     name="Baseline"
//                     stroke="oklch(0.72 0.03 225)"
//                     strokeWidth={2}
//                     dot={false}
//                   />
//                   <Line
//                     dataKey="scenario"
//                     name="Scenario"
//                     stroke="oklch(0.78 0.16 200)"
//                     strokeWidth={2.5}
//                     dot={false}
//                   />
//                 </LineChart>
//               </ResponsiveContainer>
//             </Panel>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }


import { useState } from "react";
import { useSelector } from "react-redux";
import { Panel } from "../dashboard/panel";
import { cn } from "@/lib/utils";
import { Gauge, Sparkles, Trash2 } from "lucide-react";
// import type { RootState } from "@/store/store";
import {
  useListScenariosQuery,
  useRunScenarioMutation,
  useDeleteScenarioMutation,
} from "@/store/api/scenariosApi";
import { toast } from "react-toastify";
import { normalizeError } from "@/utils/helpers";
import { ClipLoader } from "react-spinners";
import type { ScenarioMetrics } from "@/types/network";
import type { RootState } from "@/store/rootReducer";

type Kind = "pop" | "pump" | "burst" | "res" | "solar";

const SCENARIOS: { id: Kind; label: string; desc: string }[] = [
  { id: "pop", label: "Population +30%", desc: "Uniform demand growth across all consumers" },
  { id: "pump", label: "Pump failure", desc: "Take the first pump offline (0 kW)" },
  { id: "burst", label: "Pipe burst", desc: "First pipe bursts: +300 L/s loss" },
  { id: "res", label: "New reservoir", desc: "Adds a reservoir, +4 m downstream" },
  { id: "solar", label: "Solar pumping 60%", desc: "60% of pump energy from PV" },
];

export default function ScenarioView() {
  const nid = useSelector((s: RootState) => s.networkUi.activeNetworkId);
  const [pick, setPick] = useState<Kind>("pop");
  const { data: scenarios = [], refetch } = useListScenariosQuery(nid!, { skip: !nid });
  const [runMut, { isLoading }] = useRunScenarioMutation();
  const [delMut] = useDeleteScenarioMutation();
  const latest = scenarios[0];

  const run = async () => {
    if (!nid) return;
    const label = SCENARIOS.find((s) => s.id === pick)?.label ?? pick;
    try {
      await runMut({ nid, body: { name: label, kind: pick } }).unwrap();
      toast.success("Scenario complete");
      refetch();
    } catch (e) {
      toast.error(normalizeError(e).message);
    }
  };

  const onDel = async (id: number) => {
    if (!nid) return;
    await delMut({ nid, id }).unwrap().catch(() => {});
    refetch();
  };

  const rows = latest?.baseline_metrics && latest?.scenario_metrics
    ? Object.keys(latest.baseline_metrics).map((k) => ({
        l: k,
        b: Number(latest.baseline_metrics![k] ?? 0),
        a: Number(latest.scenario_metrics![k] ?? 0),
      }))
    : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
      <Panel
        title="What-if scenarios"
        subtitle="Backend clones your current network, applies change, then compares"
      >
        <ul className="space-y-1.5">
          {SCENARIOS.map((s) => (
            <li key={s.id}>
              <button
                onClick={() => setPick(s.id)}
                className={cn(
                  "w-full text-left p-2.5 rounded-md border transition",
                  pick === s.id
                    ? "border-primary/40 bg-primary/10"
                    : "border-border bg-panel-2 hover:bg-panel"
                )}
              >
                <div className="text-sm font-medium flex items-center gap-1.5">
                  <Sparkles className={cn("h-3.5 w-3.5", pick === s.id && "text-primary")} />
                  {s.label}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{s.desc}</div>
              </button>
            </li>
          ))}
        </ul>
        <button
          onClick={run}
          disabled={!nid || isLoading}
          className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition disabled:opacity-40"
        >
          {isLoading ? <ClipLoader size={14} color="#fff" /> : <Gauge className="h-4 w-4" />}
          Run scenario
        </button>
      </Panel>

      <div className="flex flex-col gap-6">
        {!latest ? (
          <Panel title="Compare">
            <p className="text-sm text-muted-foreground">
              Pick a scenario and click Run to snapshot your current network and compare metrics.
            </p>
          </Panel>
        ) : (
          <>
            <Panel
              title={`Latest: ${latest.name}`}
              subtitle={`Ran ${new Date(latest.created_at).toLocaleString()} · kind=${latest.kind}`}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="text-muted-foreground text-[10px] uppercase tracking-wider">
                    <tr className="border-b border-border">
                      <th className="text-left py-2 font-medium">Metric</th>
                      <th className="text-right font-medium">Baseline</th>
                      <th className="text-right font-medium">Scenario</th>
                      <th className="text-right font-medium">Δ</th>
                      <th className="text-right font-medium">Δ %</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    {rows.map((r) => {
                      const delta = r.a - r.b;
                      const pct = r.b === 0 ? 0 : (delta / r.b) * 100;
                      return (
                        <tr key={r.l} className="border-b border-border/50">
                          <td className="py-1.5 font-sans">{r.l}</td>
                          <td className="text-right">{r.b.toFixed(2)}</td>
                          <td className="text-right">{r.a.toFixed(2)}</td>
                          <td className="text-right">{delta >= 0 ? "+" : ""}{delta.toFixed(2)}</td>
                          <td className="text-right">{pct >= 0 ? "+" : ""}{pct.toFixed(1)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Panel>

            <Panel title="Scenario history">
              <ul className="divide-y divide-border">
                {scenarios.map((s) => (
                  <li key={s.id} className="py-2 flex items-center justify-between">
                    <div>
                      <div className="text-sm">{s.name}</div>
                      <div className="text-[10px] text-muted-foreground">
                        #{s.id} · {new Date(s.created_at).toLocaleString()}
                      </div>
                    </div>
                    <button
                      onClick={() => onDel(s.id)}
                      className="p-1.5 rounded text-muted-foreground hover:text-[oklch(0.68_0.22_25)] hover:bg-panel-2 transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </Panel>
          </>
        )}
      </div>
    </div>
  );
}


function ScenarioMetricList({ metrics }: { metrics: ScenarioMetrics }) {
  const rows = [
    { l: "Peak demand", v: `${metrics.peakDemand} L/s` },
    { l: "Min pressure", v: `${metrics.minPressure} m` },
    { l: "Avg pressure", v: `${metrics.avgPressure} m` },
    { l: "Daily energy", v: `${metrics.energyKWh.toLocaleString()} kWh` },
    { l: "CO₂", v: `${metrics.co2t} t` },
    { l: "Active leaks", v: `${metrics.activeLeaks}` },
  ];
  return (
    <ul className="space-y-2 text-sm">
      {rows.map((r) => (
        <li key={r.l} className="flex items-center justify-between border-b border-border/50 pb-1.5">
          <span className="text-muted-foreground text-xs">{r.l}</span>
          <span className="font-mono">{r.v}</span>
        </li>
      ))}
    </ul>
  );
}