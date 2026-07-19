import { useNetworkStore } from "@/hooks/useNetwork";
import { HOURLY } from "@/lib/network-data";
import { useMemo } from "react";
import { Panel, Stat } from "../dashboard/panel";
import { Lightbulb, Play } from "lucide-react";
import { Bar as RBar, CartesianGrid, ComposedChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis, Line } from "recharts";
import { cn } from "@/lib/utils";

const chartAxis = { stroke: "oklch(0.72 0.03 225)", fontSize: 11 } as const;
const gridStroke = "oklch(0.35 0.03 230 / 40%)";
const tipStyle = {
  contentStyle: { background: "oklch(0.23 0.035 232)", border: "1px solid oklch(0.34 0.03 232)", borderRadius: 8, fontSize: 12 },
  labelStyle: { color: "oklch(0.72 0.03 225)" },
} as const;

export default function EnergyView() {
  const { nodes, scheduleResult: result, optimizeSchedule } = useNetworkStore();
  const pumps = nodes.filter((n) => n.type === "pump");
  //   const result = useNetwork((s) => s.scheduleResult);
  //   const optimize = useNetwork((s) => s.optimizeSchedule);

  const chartData = useMemo(() => {
    if (!result)
      return HOURLY.map((h) => ({
        hour: h.hour,
        kw: 0,
        baselineKw: 0,
        tariff: h.tariff,
      }));
    return result.rows.map((r) => ({
      hour: r.hour,
      kw: r.kw,
      baselineKw: r.baselineKw,
      tariff: r.tariff,
    }));
  }, [result]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Panel
        title="Optimize Pump Schedule"
        subtitle="Runs against the pumps currently in your digital twin"
        className="lg:col-span-3"
        right={
          <button
            onClick={optimizeSchedule}
            disabled={pumps.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition disabled:opacity-40"
          >
            <Play className="h-3.5 w-3.5" />{" "}
            {result ? "Re-run optimization" : "Run optimization"}
          </button>
        }
      >
        {!result ? (
          <p className="text-sm text-muted-foreground">
            {pumps.length === 0
              ? "Add at least one pump in the Digital Twin, then run optimization."
              : `Ready to optimize ${pumps.length} pump${pumps.length === 1 ? "" : "s"} (${pumps.reduce((s, p) => s + (p.ratedKw ?? 0), 0)} kW rated). Click Run to compute a tariff-aware daily schedule.`}
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <Stat
                label="Optimized daily cost"
                value={`$${result.totalCost.toLocaleString()}`}
                tone="aqua"
              />
              <Stat
                label="Baseline daily cost"
                value={`$${result.baselineCost.toLocaleString()}`}
              />
              <Stat
                label="Daily savings"
                value={`$${result.savings.toLocaleString()}`}
                trend={`${result.savingsPct}% vs baseline`}
                tone="success"
              />
              <Stat
                label="Daily energy"
                value={`${result.totalKWh.toLocaleString()}`}
                unit="kWh"
                tone="energy"
              />
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={chartData}>
                <CartesianGrid
                  stroke={gridStroke}
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis dataKey="hour" {...chartAxis} />
                <YAxis yAxisId="l" {...chartAxis} unit=" kW" />
                <YAxis
                  yAxisId="r"
                  orientation="right"
                  {...chartAxis}
                  unit="¢"
                />
                <Tooltip {...tipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <RBar
                  yAxisId="l"
                  dataKey="baselineKw"
                  name="Baseline"
                  fill="oklch(0.72 0.03 225 / 60%)"
                  radius={[3, 3, 0, 0]}
                />
                <RBar
                  yAxisId="l"
                  dataKey="kw"
                  name="Optimized"
                  fill="oklch(0.78 0.16 200)"
                  radius={[3, 3, 0, 0]}
                />
                <Line
                  yAxisId="r"
                  type="monotone"
                  dataKey="tariff"
                  name="Tariff ¢/kWh"
                  stroke="oklch(0.82 0.18 90)"
                  strokeWidth={2.5}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </>
        )}
      </Panel>

      {result && (
        <Panel
          title="Recommended hourly schedule (kW per pump)"
          className="lg:col-span-2"
        >
          <div className="overflow-x-auto max-h-[360px]">
            <table className="w-full text-[11px]">
              <thead className="text-muted-foreground text-[10px] uppercase tracking-wider sticky top-0 bg-panel">
                <tr className="border-b border-border">
                  <th className="text-left py-1.5 font-medium">Hour</th>
                  <th className="text-right font-medium">Tariff</th>
                  {result.pumpIds.map((id) => (
                    <th key={id} className="text-right font-medium">
                      {id}
                    </th>
                  ))}
                  <th className="text-right font-medium">Total kW</th>
                  <th className="text-right font-medium">$ / h</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {result.rows.map((r) => (
                  <tr
                    key={r.hour}
                    className={cn(
                      "border-b border-border/50",
                      r.tariff < 10 && "bg-[color:var(--success)]/5",
                      r.tariff > 20 && "bg-[color:var(--danger)]/5",
                    )}
                  >
                    <td className="py-1">{r.hour}</td>
                    <td className="text-right">{r.tariff}¢</td>
                    {result.pumpIds.map((id) => (
                      <td key={id} className="text-right">
                        {r.pumps[id]?.toFixed(0) ?? 0}
                      </td>
                    ))}
                    <td className="text-right font-semibold">
                      {r.kw.toFixed(0)}
                    </td>
                    <td className="text-right">${r.cost.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      <Panel title="Method & assumptions">
        <ul className="text-xs text-muted-foreground space-y-2">
          <li className="flex gap-1.5">
            <Lightbulb className="h-3 w-3 mt-0.5 shrink-0 text-primary" />{" "}
            Tariff-weighted continuous LP: duty for hour <em>h</em> ∝ 1 /
            tariff(h)<sup>1.4</sup>, normalised to hit the daily kWh target.
          </li>
          <li className="flex gap-1.5">
            <Lightbulb className="h-3 w-3 mt-0.5 shrink-0 text-primary" />{" "}
            Baseline assumes pumps run at 65% duty flat all day.
          </li>
          <li className="flex gap-1.5">
            <Lightbulb className="h-3 w-3 mt-0.5 shrink-0 text-primary" />{" "}
            Per-pump load is split proportionally to its rated kW (editable in
            the properties panel).
          </li>
          <li className="flex gap-1.5">
            <Lightbulb className="h-3 w-3 mt-0.5 shrink-0 text-primary" /> Grid
            CO₂ factor: 0.38 kg/kWh. Storage headroom is assumed sufficient to
            shift load into off-peak.
          </li>
        </ul>
      </Panel>
    </div>
  );
}
