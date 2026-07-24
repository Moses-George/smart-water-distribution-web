// import { useNetworkStore } from "@/hooks/useNetwork";
// import { LEAKS } from "@/lib/network-data";
// import { Bar, Panel } from "../dashboard/panel";
// import { AlertTriangle, Play } from "lucide-react";
// import { NetworkMap } from "../dashboard/network-map";
// import { cn } from "@/lib/utils";

// export default function LeaksView() {
//   const { leakResult: result, runLeakDetection: run, nodes } = useNetworkStore();

//   const ranked =
//     result?.perNode.filter((r) => r.prob > 0.01).slice(0, 12) ?? [];
//   const stale = LEAKS;

//   return (
//     <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6">
//       <Panel
//         title="Live leak likelihood map"
//         subtitle={
//           result
//             ? `Ran ${new Date(result.ranAt).toLocaleTimeString()} · ${result.updatedNodes} nodes updated · ${result.criticals} critical`
//             : "Click Run to score every node from current topology + simulated sensor residuals"
//         }
//         right={
//           <button
//             onClick={run}
//             className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition"
//           >
//             <Play className="h-3.5 w-3.5" /> Run Leak Detection
//           </button>
//         }
//       >
//         <NetworkMap highlightLeaks />
//       </Panel>

//       <div className="flex flex-col gap-6">
//         <Panel
//           title={
//             result ? "Ranked anomalies (live)" : "Ranked anomalies (last scan)"
//           }
//         >
//           <ul className="divide-y divide-border">
//             {(result
//               ? ranked
//               : stale.map((l) => ({
//                   id: l.node,
//                   label: l.node,
//                   prob: l.prob,
//                   zScore: 0,
//                   reason: `${l.zone} · ${l.detected}`,
//                 }))
//             ).map((l) => {
//               const pct = Math.round(l.prob * 100);
//               const tone =
//                 l.prob > 0.7 ? "danger" : l.prob > 0.4 ? "warning" : "default";
//               return (
//                 <li key={l.id} className="py-2.5">
//                   <div className="flex items-center justify-between text-sm mb-1.5">
//                     <div className="flex items-center gap-2">
//                       <AlertTriangle
//                         className={cn(
//                           "h-3.5 w-3.5",
//                           tone === "danger" && "text-[oklch(0.68_0.22_25)]",
//                           tone === "warning" && "text-[oklch(0.82_0.17_65)]",
//                           tone === "default" && "text-muted-foreground",
//                         )}
//                       />
//                       <span className="font-medium">{l.label}</span>
//                     </div>
//                     <span className="font-mono text-sm">{pct}%</span>
//                   </div>
//                   <Bar
//                     value={pct}
//                     tone={
//                       tone === "danger"
//                         ? "danger"
//                         : tone === "warning"
//                           ? "energy"
//                           : "aqua"
//                     }
//                   />
//                   <div className="text-[10px] text-muted-foreground mt-1">
//                     {l.reason}
//                   </div>
//                 </li>
//               );
//             })}
//             {result && ranked.length === 0 && (
//               <li className="py-4 text-xs text-muted-foreground">
//                 No nodes above 1% likelihood. Network looks healthy.
//               </li>
//             )}
//           </ul>
//         </Panel>
//         <Panel title="Detector ensemble & assumptions">
//           <div className="space-y-2 text-xs">
//             <div className="p-2 rounded bg-panel-2 border border-border">
//               <div className="font-medium">Pressure-residual z-score</div>
//               <div className="text-muted-foreground">
//                 Simulated sensor reading − hydraulic model prediction, per node.
//               </div>
//             </div>
//             <div className="p-2 rounded bg-panel-2 border border-border">
//               <div className="font-medium">Pipe-age & material risk</div>
//               <div className="text-muted-foreground">
//                 Steel/PVC over 20y weighted higher. Averages connected pipes per
//                 node.
//               </div>
//             </div>
//             <div className="p-2 rounded bg-panel-2 border border-border">
//               <div className="font-medium">Sigmoid fusion</div>
//               <div className="text-muted-foreground">
//                 P(leak) = σ(z − 2.2). Threshold 0.7 = critical, 0.4 = warning.
//               </div>
//             </div>
//             <div className="text-[10px] text-muted-foreground pt-2">
//               Scans {nodes.length} nodes. Reservoirs and tanks are excluded
//               (source nodes).
//             </div>
//           </div>
//         </Panel>
//       </div>
//     </div>
//   );
// }


import { useSelector } from "react-redux";
import { Bar, Panel } from "../dashboard/panel";
import { AlertTriangle, Play } from "lucide-react";
import { NetworkMap } from "../dashboard/network-map";
import { cn } from "@/lib/utils";
// import type { RootState } from "@/store/store";
import { useDetectLeaksMutation } from "@/store/api/leaksApi";
import { toast } from "react-toastify";
import { normalizeError } from "@/utils/helpers";
import { ClipLoader } from "react-spinners";
import type { RootState } from "@/store/rootReducer";

export default function LeaksView() {
  const nid = useSelector((s: RootState) => s.networkUi.activeNetworkId);
  const nodes = useSelector((s: RootState) => s.network.nodes);
  const [detect, { data: result, isLoading }] = useDetectLeaksMutation({
    fixedCacheKey: "leaks-detect",
  });

  const ranked = result?.leaks.slice(0, 12) ?? [];

  const run = async () => {
    if (!nid) return;
    try {
      await detect(nid).unwrap();
      toast.success("Leak detection complete");
    } catch (e) {
      toast.error(normalizeError(e).message);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6">
      <Panel
        title="Live leak likelihood map"
        subtitle={
          result
            ? `${result.updated_nodes} nodes updated · ${result.leaks.filter((l) => l.prob > 0.7).length} critical`
            : "Click Run to score every node from current topology + simulated sensor residuals"
        }
        right={
          <button
            onClick={run}
            disabled={!nid || isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition disabled:opacity-40"
          >
            {isLoading ? <ClipLoader size={12} color="#fff" /> : <Play className="h-3.5 w-3.5" />}
            Run Leak Detection
          </button>
        }
      >
        <NetworkMap highlightLeaks />
      </Panel>

      <div className="flex flex-col gap-6">
        <Panel title={result ? "Ranked anomalies (live)" : "Ranked anomalies"}>
          <ul className="divide-y divide-border">
            {ranked.map((l) => {
              const pct = Math.round(l.prob * 100);
              const tone = l.prob > 0.7 ? "danger" : l.prob > 0.4 ? "warning" : "default";
              return (
                <li key={l.node_ext} className="py-2.5">
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <div className="flex items-center gap-2">
                      <AlertTriangle
                        className={cn(
                          "h-3.5 w-3.5",
                          tone === "danger" && "text-[oklch(0.68_0.22_25)]",
                          tone === "warning" && "text-[oklch(0.82_0.17_65)]",
                          tone === "default" && "text-muted-foreground"
                        )}
                      />
                      <span className="font-medium">{l.node_ext}</span>
                    </div>
                    <span className="font-mono text-sm">{pct}%</span>
                  </div>
                  <Bar
                    value={pct}
                    tone={tone === "danger" ? "danger" : tone === "warning" ? "energy" : "aqua"}
                  />
                  <div className="text-[10px] text-muted-foreground mt-1">
                    {l.zone} · {l.severity}
                  </div>
                </li>
              );
            })}
            {!result && (
              <li className="py-4 text-xs text-muted-foreground">
                No scan yet — click Run Leak Detection.
              </li>
            )}
            {result && ranked.length === 0 && (
              <li className="py-4 text-xs text-muted-foreground">
                No nodes above 1% likelihood. Network looks healthy.
              </li>
            )}
          </ul>
        </Panel>
        <Panel title="Detector ensemble & assumptions">
          <div className="space-y-2 text-xs">
            <div className="p-2 rounded bg-panel-2 border border-border">
              <div className="font-medium">IsolationForest on pressure residuals</div>
              <div className="text-muted-foreground">
                Backend model trained on hydraulic simulation vs sensor telemetry.
              </div>
            </div>
            <div className="p-2 rounded bg-panel-2 border border-border">
              <div className="font-medium">Pipe-age & material risk</div>
              <div className="text-muted-foreground">
                Steel/PVC over 20y weighted higher.
              </div>
            </div>
            <div className="text-[10px] text-muted-foreground pt-2">
              Scans {nodes.length} nodes. Reservoirs and tanks are excluded (source nodes).
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}