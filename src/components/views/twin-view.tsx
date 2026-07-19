import { useNetworkStore } from "@/hooks/useNetwork";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import { NetworkMap } from "../dashboard/network-map";
import { Panel } from "../dashboard/panel";
import { PropertiesPanel } from "../dashboard/properties-panel";

export default function TwinView() {
  const { nodes, pipes } = useNetworkStore();
  //   const pipes = useNetwork((s) => s.pipes);
  const tanks = nodes.filter((n) => n.type === "tank");
  const pumps = nodes.filter((n) => n.type === "pump");
  const pumpsOnline = pumps.filter((n) => n.status !== "alert").length;
  const totalDemand = nodes.reduce((s, n) => s + (n.demand ?? 0), 0);
  const avgPressure = nodes.length
    ? nodes.reduce((s, n) => s + n.pressure, 0) / nodes.length
    : 0;
  const activeLeaks = nodes.filter((n) => (n.leakProb ?? 0) > 0.5).length;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
      <Panel
        title="Network Digital Twin"
        subtitle="Interactive editor · click a tool then click canvas to build"
        right={
          <div className="flex gap-2 text-[11px]">
            <span className="px-2 py-1 rounded bg-panel-2 border border-border">
              {nodes.length} nodes
            </span>
            <span className="px-2 py-1 rounded bg-panel-2 border border-border">
              {pipes.length} pipes
            </span>
            <span className="px-2 py-1 rounded bg-[color:var(--success)]/15 border border-[color:var(--success)]/40 text-[color:var(--success)]">
              Live
            </span>
          </div>
        }
      >
        <NetworkMap />
        <p className="mt-3 text-[11px] text-muted-foreground flex items-start gap-1.5">
          <Info className="h-3 w-3 mt-0.5 shrink-0" />
          Select a node/pipe with the Select tool to open the properties editor
          on the right. Add elements from the toolbar, then run Leak Detection,
          Optimize Pump Schedule, or a Scenario to see the impact.
        </p>
      </Panel>
      <div className="flex flex-col gap-6">
        <PropertiesPanel />
        <Panel title="Live telemetry">
          <div className="space-y-3">
            {[
              { l: "Total demand", v: totalDemand.toFixed(1), u: "L/s" },
              { l: "Avg pressure", v: avgPressure.toFixed(1), u: "m" },
              ...tanks.slice(0, 2).map((t) => ({
                l: `${t.label} level`,
                v: String(t.level ?? "—"),
                u: "%",
              })),
              {
                l: "Pumps online",
                v: `${pumpsOnline} / ${pumps.length}`,
                u: "",
              },
              { l: "Active leaks", v: String(activeLeaks), u: "" },
            ].map((r) => (
              <div
                key={r.l}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-muted-foreground">{r.l}</span>
                <span className="font-mono tabular-nums">
                  {r.v}{" "}
                  <span className="text-xs text-muted-foreground">{r.u}</span>
                </span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Recent events">
          <ul className="space-y-2.5 text-xs">
            {[
              {
                t: "2m",
                txt: "Pump 3 alarm: bearing vibration high",
                tone: "danger",
              },
              { t: "14m", txt: "Leak likelihood 97% at J-12", tone: "danger" },
              {
                t: "1h",
                txt: "Tariff shift → shifted pumping to off-peak",
                tone: "success",
              },
              { t: "3h", txt: "Tank B refilled to 45%", tone: "default" },
              {
                t: "6h",
                txt: "Chlorine dropped to 0.15 mg/L (Z-4)",
                tone: "warning",
              },
            ].map((e, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="text-[10px] text-muted-foreground font-mono w-8 pt-0.5">
                  {e.t}
                </span>
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full mt-1.5 shrink-0",
                    e.tone === "danger" && "bg-[color:var(--danger)]",
                    e.tone === "warning" && "bg-[color:var(--warning)]",
                    e.tone === "success" && "bg-[color:var(--success)]",
                    e.tone === "default" && "bg-muted-foreground",
                  )}
                />
                <span className="text-foreground/90">{e.txt}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
