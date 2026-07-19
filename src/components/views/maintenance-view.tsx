import { ASSETS } from "@/lib/network-data";
import { Bar, Panel } from "../dashboard/panel";
import { cn } from "@/lib/utils";
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Wrench } from "lucide-react";

const chartAxis = { stroke: "oklch(0.72 0.03 225)", fontSize: 11 } as const;
const gridStroke = "oklch(0.35 0.03 230 / 40%)";
const tipStyle = {
  contentStyle: { background: "oklch(0.23 0.035 232)", border: "1px solid oklch(0.34 0.03 232)", borderRadius: 8, fontSize: 12 },
  labelStyle: { color: "oklch(0.72 0.03 225)" },
} as const;

export default function MaintenanceView() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Panel
        title="Asset remaining useful life"
        subtitle="Survival model · calibrated on fleet history"
        className="lg:col-span-2"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-border">
                <th className="text-left py-2 font-medium">Asset</th>
                <th className="text-left font-medium">Type</th>
                <th className="text-right font-medium">Health</th>
                <th className="text-right font-medium">Cycles</th>
                <th className="text-right font-medium">Est. failure</th>
                <th className="text-left font-medium pl-6">Note</th>
              </tr>
            </thead>
            <tbody>
              {ASSETS.map((a) => {
                const tone =
                  a.rul < 30 ? "danger" : a.rul < 100 ? "warning" : "success";
                return (
                  <tr key={a.id} className="border-b border-border/50">
                    <td className="py-3 font-medium">{a.id}</td>
                    <td className="text-muted-foreground">{a.type}</td>
                    <td className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <span className="font-mono w-8">{a.health}</span>
                        <div className="w-24">
                          <Bar
                            value={a.health}
                            tone={
                              tone === "danger"
                                ? "danger"
                                : tone === "warning"
                                  ? "energy"
                                  : "success"
                            }
                          />
                        </div>
                      </div>
                    </td>
                    <td className="text-right font-mono text-muted-foreground">
                      {a.cycles.toLocaleString()}
                    </td>
                    <td
                      className={cn(
                        "text-right font-mono",
                        tone === "danger" && "text-[oklch(0.68_0.22_25)]",
                        tone === "warning" && "text-[oklch(0.82_0.17_65)]",
                        tone === "success" && "text-[oklch(0.78_0.18_155)]",
                      )}
                    >
                      {a.rul} d
                    </td>
                    <td className="pl-6 text-xs text-muted-foreground">
                      {a.note}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Pump 2 vibration trend">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart
            data={Array.from({ length: 30 }, (_, i) => ({
              d: i + 1,
              v: 2.2 + i * 0.06 + Math.sin(i) * 0.2,
            }))}
          >
            <defs>
              <linearGradient id="vib" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="oklch(0.82 0.17 65)"
                  stopOpacity={0.5}
                />
                <stop
                  offset="100%"
                  stopColor="oklch(0.82 0.17 65)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke={gridStroke}
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis dataKey="d" {...chartAxis} unit="d" />
            <YAxis {...chartAxis} unit=" mm/s" />
            <Tooltip {...tipStyle} />
            <ReferenceLine
              y={4.5}
              stroke="oklch(0.68 0.22 25)"
              strokeDasharray="4 4"
              label={{
                value: "Alarm",
                fill: "oklch(0.68 0.22 25)",
                fontSize: 10,
              }}
            />
            <Area
              dataKey="v"
              stroke="oklch(0.82 0.17 65)"
              fill="url(#vib)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Panel>
      <Panel title="Recommended work orders">
        <ul className="space-y-2 text-xs">
          {[
            {
              p: "Pump 3",
              a: "Replace lower bearing · in ≤ 12 days",
              tone: "danger",
            },
            {
              p: "Pump 2",
              a: "Alignment check · in ≤ 42 days",
              tone: "warning",
            },
            {
              p: "PP11 (Steel)",
              a: "Wall-thickness inspection",
              tone: "warning",
            },
            { p: "PRV-1", a: "Annual calibration", tone: "default" },
          ].map((w, i) => (
            <li
              key={i}
              className="p-3 rounded bg-panel-2 border border-border flex items-start gap-3"
            >
              <Wrench
                className={cn(
                  "h-4 w-4 mt-0.5 shrink-0",
                  w.tone === "danger" && "text-[oklch(0.68_0.22_25)]",
                  w.tone === "warning" && "text-[oklch(0.82_0.17_65)]",
                  w.tone === "default" && "text-muted-foreground",
                )}
              />
              <div>
                <div className="font-medium">{w.p}</div>
                <div className="text-muted-foreground">{w.a}</div>
              </div>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
