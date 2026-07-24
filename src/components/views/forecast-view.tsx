// import { WEEK_FORECAST } from "@/lib/network-data";
// import { cn } from "@/lib/utils";
// import {Bar as RBar, ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Area, Line, BarChart } from "recharts";
// import  { Panel } from "../dashboard/panel";

// const chartAxis = { stroke: "oklch(0.72 0.03 225)", fontSize: 11 } as const;
// const gridStroke = "oklch(0.35 0.03 230 / 40%)";
// const tipStyle = {
//   contentStyle: { background: "oklch(0.23 0.035 232)", border: "1px solid oklch(0.34 0.03 232)", borderRadius: 8, fontSize: 12 },
//   labelStyle: { color: "oklch(0.72 0.03 225)" },
// } as const;

// export default function ForecastView() {
//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//       <Panel title="7-day demand forecast" subtitle="Temporal Fusion Transformer · 90% prediction band" className="lg:col-span-2">
//         <ResponsiveContainer width="100%" height={320}>
//           <ComposedChart data={WEEK_FORECAST}>
//             <defs>
//               <linearGradient id="band" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="0%" stopColor="oklch(0.78 0.16 200)" stopOpacity={0.3} />
//                 <stop offset="100%" stopColor="oklch(0.78 0.16 200)" stopOpacity={0.02} />
//               </linearGradient>
//             </defs>
//             <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" vertical={false} />
//             <XAxis dataKey="day" {...chartAxis} />
//             <YAxis {...chartAxis} unit=" ML" />
//             <Tooltip {...tipStyle} />
//             <Legend wrapperStyle={{ fontSize: 12 }} />
//             <Area dataKey="upper" stroke="none" fill="url(#band)" name="90% band" />
//             <Area dataKey="lower" stroke="none" fill="oklch(0.19 0.03 230)" />
//             <Line dataKey="actual" name="Actual" stroke="oklch(0.85 0.14 165)" strokeWidth={2.5} dot={{ r: 3 }} />
//             <Line dataKey="forecast" name="Forecast" stroke="oklch(0.78 0.16 200)" strokeWidth={2.5} strokeDasharray="5 4" dot={false} />
//           </ComposedChart>
//         </ResponsiveContainer>
//       </Panel>

//       <Panel title="Model performance">
//         <div className="space-y-4 text-sm">
//           {[
//             { m: "MAPE", v: "3.2%", tone: "success" as const },
//             { m: "RMSE", v: "4.8 ML", tone: "default" as const },
//             { m: "R²", v: "0.94", tone: "success" as const },
//           ].map((r) => (
//             <div key={r.m} className="flex justify-between items-baseline border-b border-border/50 pb-2">
//               <span className="text-muted-foreground text-xs">{r.m}</span>
//               <span className={cn("font-mono text-xl", r.tone === "success" && "text-[oklch(0.78_0.18_155)]")}>{r.v}</span>
//             </div>
//           ))}
//         </div>
//         <div className="mt-4 text-[11px] text-muted-foreground">
//           Models: <span className="text-foreground">XGBoost</span> ensembled with <span className="text-foreground">LSTM</span>; TFT in staging.
//         </div>
//       </Panel>

//       <Panel title="Feature importance" className="lg:col-span-3">
//         <ResponsiveContainer width="100%" height={200}>
//           <BarChart data={[
//             { f: "Hour of day", v: 0.28 }, { f: "Day of week", v: 0.19 }, { f: "Temperature", v: 0.16 },
//             { f: "Prev-hour demand", v: 0.14 }, { f: "Holiday flag", v: 0.10 }, { f: "Rainfall (24h)", v: 0.07 }, { f: "Humidity", v: 0.06 },
//           ]} layout="vertical" margin={{ left: 80 }}>
//             <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" horizontal={false} />
//             <XAxis type="number" {...chartAxis} />
//             <YAxis type="category" dataKey="f" {...chartAxis} width={100} />
//             <Tooltip {...tipStyle} />
//             <RBar dataKey="v" fill="oklch(0.78 0.16 200)" radius={[0, 4, 4, 0]} />
//           </BarChart>
//         </ResponsiveContainer>
//       </Panel>
//     </div>
//   );
// }


import { useSelector } from "react-redux";
import {
  Bar as RBar,
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Area,
  Line,
  BarChart,
} from "recharts";
import { Panel } from "../dashboard/panel";
import { cn } from "@/lib/utils";
// import type { RootState } from "@/store/store";
import { useHourlyForecastQuery, useWeeklyForecastQuery } from "@/store/api/forecastApi";
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

export default function ForecastView() {
  const nid = useSelector((s: RootState) => s.networkUi.activeNetworkId);
  const { data: weekly, isLoading: wLoad } = useWeeklyForecastQuery(nid!, { skip: !nid });
  const { data: hourly, isLoading: hLoad } = useHourlyForecastQuery(nid!, { skip: !nid });

  const weekData =
    weekly?.points.map((p) => ({
      day: p.t,
      actual: p.actual,
      forecast: p.forecast,
      lower: p.lower,
      upper: p.upper,
    })) ?? [];

  const hourData =
    hourly?.points.map((p) => ({
      t: p.t,
      forecast: p.forecast,
      lower: p.lower,
      upper: p.upper,
    })) ?? [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Panel
        title="7-day demand forecast"
        subtitle="TFT · 90% prediction band (backend inference)"
        className="lg:col-span-2"
      >
        {wLoad ? (
          <div className="h-[320px] grid place-items-center"><ClipLoader size={20} /></div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={weekData}>
              <defs>
                <linearGradient id="band" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.78 0.16 200)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="oklch(0.78 0.16 200)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" {...chartAxis} />
              <YAxis {...chartAxis} unit=" ML" />
              <Tooltip {...tipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area dataKey="upper" stroke="none" fill="url(#band)" name="90% band" />
              <Area dataKey="lower" stroke="none" fill="oklch(0.19 0.03 230)" />
              <Line dataKey="actual" name="Actual" stroke="oklch(0.85 0.14 165)" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line dataKey="forecast" name="Forecast" stroke="oklch(0.78 0.16 200)" strokeWidth={2.5} strokeDasharray="5 4" dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </Panel>

      <Panel title="Model performance">
        <div className="space-y-4 text-sm">
          {[
            { m: "MAPE", v: "3.2%", tone: "success" as const },
            { m: "RMSE", v: "4.8 ML", tone: "default" as const },
            { m: "R²", v: "0.94", tone: "success" as const },
          ].map((r) => (
            <div key={r.m} className="flex justify-between items-baseline border-b border-border/50 pb-2">
              <span className="text-muted-foreground text-xs">{r.m}</span>
              <span className={cn("font-mono text-xl", r.tone === "success" && "text-[oklch(0.78_0.18_155)]")}>
                {r.v}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 text-[11px] text-muted-foreground">
          Models: <span className="text-foreground">XGBoost</span> ensembled with{" "}
          <span className="text-foreground">LSTM</span>; TFT in staging.
        </div>
      </Panel>

      <Panel title="Next 24h — hourly forecast" className="lg:col-span-3">
        {hLoad ? (
          <div className="h-[220px] grid place-items-center"><ClipLoader size={20} /></div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={hourData}>
              <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="t" {...chartAxis} />
              <YAxis {...chartAxis} unit=" ML/h" />
              <Tooltip {...tipStyle} />
              <Area dataKey="upper" stroke="none" fill="oklch(0.78 0.16 200 / 20%)" name="90% band" />
              <Area dataKey="lower" stroke="none" fill="oklch(0.19 0.03 230)" />
              <Line dataKey="forecast" name="Forecast" stroke="oklch(0.78 0.16 200)" strokeWidth={2.5} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </Panel>

      <Panel title="Feature importance" className="lg:col-span-3">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={[
              { f: "Hour of day", v: 0.28 },
              { f: "Day of week", v: 0.19 },
              { f: "Temperature", v: 0.16 },
              { f: "Prev-hour demand", v: 0.14 },
              { f: "Holiday flag", v: 0.1 },
              { f: "Rainfall (24h)", v: 0.07 },
              { f: "Humidity", v: 0.06 },
            ]}
            layout="vertical"
            margin={{ left: 80 }}
          >
            <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" {...chartAxis} />
            <YAxis type="category" dataKey="f" {...chartAxis} width={100} />
            <Tooltip {...tipStyle} />
            <RBar dataKey="v" fill="oklch(0.78 0.16 200)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Panel>
    </div>
  );
}
