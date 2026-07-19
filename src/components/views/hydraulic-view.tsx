import { useNetworkStore } from "@/hooks/useNetwork";
import  { HOURLY } from "@/lib/network-data";
import { cn } from "@/lib/utils";
import  { Panel } from "../dashboard/panel";
import {
  Area, AreaChart, Bar as RBar, BarChart, CartesianGrid, ComposedChart, Legend,
  Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine,
} from "recharts";

const chartAxis = { stroke: "oklch(0.72 0.03 225)", fontSize: 11 } as const;
const gridStroke = "oklch(0.35 0.03 230 / 40%)";
const tipStyle = {
  contentStyle: { background: "oklch(0.23 0.035 232)", border: "1px solid oklch(0.34 0.03 232)", borderRadius: 8, fontSize: 12 },
  labelStyle: { color: "oklch(0.72 0.03 225)" },
} as const;

export default function HydraulicView() {
  const {pipes} = useNetworkStore();
  const pressureSeries = HOURLY.map((h) => ({
    hour: h.hour, p1: 58 + Math.sin(h.demand) * 3, p2: 46 + Math.cos(h.demand) * 4, p3: 34 + Math.sin(h.demand * 0.7) * 5,
  }));
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Panel title="Pressure — 24h simulation" subtitle="EPANET solver · steady-state per hour" className="lg:col-span-2">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={pressureSeries}>
            <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="hour" {...chartAxis} />
            <YAxis {...chartAxis} unit=" m" />
            <Tooltip {...tipStyle} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <ReferenceLine y={20} stroke="oklch(0.68 0.22 25)" strokeDasharray="4 4" label={{ value: "Min", fill: "oklch(0.68 0.22 25)", fontSize: 10 }} />
            <Line dataKey="p1" name="P-1 outlet" stroke="oklch(0.78 0.16 200)" strokeWidth={2} dot={false} />
            <Line dataKey="p2" name="P-2 outlet" stroke="oklch(0.85 0.14 165)" strokeWidth={2} dot={false} />
            <Line dataKey="p3" name="P-3 outlet" stroke="oklch(0.82 0.18 90)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Panel>

      <Panel title="Pipe flow & velocity" subtitle="Snapshot at 14:00">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-muted-foreground text-[10px] uppercase tracking-wider">
              <tr className="border-b border-border">
                <th className="text-left py-2 font-medium">Pipe</th>
                <th className="text-right font-medium">Dia</th>
                <th className="text-right font-medium">Flow</th>
                <th className="text-right font-medium">Vel</th>
                <th className="text-right font-medium">Head loss</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {pipes.slice(0, 10).map((p) => (
                <tr key={p.id} className="border-b border-border/50">
                  <td className="py-1.5">{p.id} <span className="text-muted-foreground">{p.from}→{p.to}</span></td>
                  <td className="text-right">{p.diameter}</td>
                  <td className="text-right">{p.flow}</td>
                  <td className={cn("text-right", p.velocity > 1.3 && "text-[oklch(0.82_0.17_65)]")}>{p.velocity.toFixed(1)}</td>
                  <td className="text-right text-muted-foreground">{p.headloss.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Tank levels" subtitle="Hourly balance · reservoir + 2 tanks">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={HOURLY}>
            <defs>
              <linearGradient id="tankg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.78 0.16 200)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="oklch(0.78 0.16 200)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="hour" {...chartAxis} />
            <YAxis {...chartAxis} unit="%" domain={[0, 100]} />
            <Tooltip {...tipStyle} />
            <Area dataKey="tank" name="Tank A" stroke="oklch(0.78 0.16 200)" fill="url(#tankg)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </Panel>
    </div>
  );
}