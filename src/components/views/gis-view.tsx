// import { useState } from "react";
// import { Panel } from "../dashboard/panel";
// import { NetworkMap } from "../dashboard/network-map";
// import {
//   Bar as RBar,
//   BarChart,
//   CartesianGrid,
//   ResponsiveContainer,
//   Tooltip,
//   XAxis,
//   YAxis,
// } from "recharts";
// import { cn } from "@/lib/utils";

// const chartAxis = { stroke: "oklch(0.72 0.03 225)", fontSize: 11 } as const;
// const gridStroke = "oklch(0.35 0.03 230 / 40%)";
// const tipStyle = {
//   contentStyle: {
//     background: "oklch(0.23 0.035 232)",
//     border: "1px solid oklch(0.34 0.03 232)",
//     borderRadius: 8,
//     fontSize: 12,
//   },
//   labelStyle: { color: "oklch(0.72 0.03 225)" },
// } as const;

// export default function GisView() {
//   const layers = [
//     "Pipe age",
//     "Pipe material",
//     "Failure history",
//     "Demand zones",
//     "Pressure zones",
//     "Elevation",
//   ];
//   const [layer, setLayer] = useState(layers[0]);
//   return (
//     <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
//       <Panel title="GIS layers" subtitle={`Active: ${layer}`}>
//         <NetworkMap />
//       </Panel>
//       <div className="flex flex-col gap-6">
//         <Panel title="Layer selector">
//           <div className="grid grid-cols-1 gap-1.5">
//             {layers.map((l) => (
//               <button
//                 key={l}
//                 onClick={() => setLayer(l)}
//                 className={cn(
//                   "text-left px-3 py-2 rounded-md text-sm border transition",
//                   layer === l
//                     ? "border-primary/40 bg-primary/10 text-foreground"
//                     : "border-border bg-panel-2 text-muted-foreground hover:text-foreground",
//                 )}
//               >
//                 {l}
//               </button>
//             ))}
//           </div>
//         </Panel>
//         <Panel title="Distribution — pipe material">
//           <ResponsiveContainer width="100%" height={200}>
//             <BarChart
//               data={[
//                 { m: "PVC", km: 84 },
//                 { m: "DI", km: 62 },
//                 { m: "HDPE", km: 41 },
//                 { m: "Steel", km: 23 },
//               ]}
//             >
//               <CartesianGrid
//                 stroke={gridStroke}
//                 strokeDasharray="3 3"
//                 vertical={false}
//               />
//               <XAxis dataKey="m" {...chartAxis} />
//               <YAxis {...chartAxis} unit="km" />
//               <Tooltip {...tipStyle} />
//               <RBar
//                 dataKey="km"
//                 fill="oklch(0.78 0.16 200)"
//                 radius={[4, 4, 0, 0]}
//               />
//             </BarChart>
//           </ResponsiveContainer>
//         </Panel>
//       </div>
//     </div>
//   );
// }


import { useState } from "react";
import { Panel } from "../dashboard/panel";
import { NetworkMap } from "../dashboard/network-map";
import {
  Bar as RBar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";

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

export default function GisView() {
  const layers = [
    "Pipe age",
    "Pipe material",
    "Failure history",
    "Demand zones",
    "Pressure zones",
    "Elevation",
  ];
  const [layer, setLayer] = useState(layers[0]);
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
      <Panel title="GIS layers" subtitle={`Active: ${layer}`}>
        <NetworkMap />
      </Panel>
      <div className="flex flex-col gap-6">
        <Panel title="Layer selector">
          <div className="grid grid-cols-1 gap-1.5">
            {layers.map((l) => (
              <button
                key={l}
                onClick={() => setLayer(l)}
                className={cn(
                  "text-left px-3 py-2 rounded-md text-sm border transition",
                  layer === l
                    ? "border-primary/40 bg-primary/10 text-foreground"
                    : "border-border bg-panel-2 text-muted-foreground hover:text-foreground",
                )}
              >
                {l}
              </button>
            ))}
          </div>
        </Panel>
        <Panel title="Distribution — pipe material">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={[
                { m: "PVC", km: 84 },
                { m: "DI", km: 62 },
                { m: "HDPE", km: 41 },
                { m: "Steel", km: 23 },
              ]}
            >
              <CartesianGrid
                stroke={gridStroke}
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis dataKey="m" {...chartAxis} />
              <YAxis {...chartAxis} unit="km" />
              <Tooltip {...tipStyle} />
              <RBar
                dataKey="km"
                fill="oklch(0.78 0.16 200)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>
    </div>
  );
}