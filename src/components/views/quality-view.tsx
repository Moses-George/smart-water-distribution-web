// import { HOURLY, QUALITY } from "@/lib/network-data";
// import { cn } from "@/lib/utils";
// import { Droplets } from "lucide-react";
// import { Panel } from "../dashboard/panel";
// import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// const chartAxis = { stroke: "oklch(0.72 0.03 225)", fontSize: 11 } as const;
// const gridStroke = "oklch(0.35 0.03 230 / 40%)";
// const tipStyle = {
//   contentStyle: { background: "oklch(0.23 0.035 232)", border: "1px solid oklch(0.34 0.03 232)", borderRadius: 8, fontSize: 12 },
//   labelStyle: { color: "oklch(0.72 0.03 225)" },
// } as const;

// export default function QualityView() {
//   const trend = HOURLY.map((h, i) => ({
//     hour: h.hour,
//     cl: +(0.7 + Math.sin(i / 3) * 0.15 - (i > 18 ? 0.35 : 0)).toFixed(2),
//     turb: +(0.3 + Math.abs(Math.sin(i / 4)) * 0.2).toFixed(2),
//     ph: +(7.3 + Math.sin(i / 5) * 0.15).toFixed(2),
//   }));
//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//       {QUALITY.map((q) => (
//         <div key={q.name} className="panel-surface p-4">
//           <div className="flex items-center justify-between mb-2">
//             <span className="text-xs text-muted-foreground uppercase tracking-wider">{q.name}</span>
//             <Droplets className={cn("h-4 w-4",
//               q.status === "alert" ? "text-[oklch(0.68_0.22_25)]" : "text-primary",
//             )} />
//           </div>
//           <div className={cn("text-3xl font-mono", q.status === "alert" && "text-[oklch(0.68_0.22_25)]")}>
//             {q.value} <span className="text-sm text-muted-foreground">{q.unit}</span>
//           </div>
//           <div className="text-[10px] text-muted-foreground mt-1">Range {q.min}–{q.max} {q.unit}</div>
//         </div>
//       ))}
//       <Panel title="Quality trend — last 24h" className="lg:col-span-3">
//         <ResponsiveContainer width="100%" height={260}>
//           <LineChart data={trend}>
//             <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" vertical={false} />
//             <XAxis dataKey="hour" {...chartAxis} />
//             <YAxis {...chartAxis} />
//             <Tooltip {...tipStyle} />
//             <Legend wrapperStyle={{ fontSize: 12 }} />
//             <ReferenceLine y={0.2} stroke="oklch(0.68 0.22 25)" strokeDasharray="4 4" />
//             <Line dataKey="cl" name="Chlorine (mg/L)" stroke="oklch(0.78 0.16 200)" strokeWidth={2} dot={false} />
//             <Line dataKey="turb" name="Turbidity (NTU)" stroke="oklch(0.82 0.18 90)" strokeWidth={2} dot={false} />
//             <Line dataKey="ph" name="pH" stroke="oklch(0.85 0.14 165)" strokeWidth={2} dot={false} />
//           </LineChart>
//         </ResponsiveContainer>
//       </Panel>
//     </div>
//   );
// }


import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { cn } from "@/lib/utils";
import { Droplets, Plus } from "lucide-react";
import { Panel } from "../dashboard/panel";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
// import type { RootState } from "@/store/store";
import { useListQualityQuery, useAddQualityMutation } from "@/store/api/qualityApi";
import { toast } from "react-toastify";
import { normalizeError } from "@/utils/helpers";
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

export default function QualityView() {
  const nid = useSelector((s: RootState) => s.networkUi.activeNetworkId);
  const { data: readings = [], isLoading, refetch } = useListQualityQuery(
    { nid: nid!, limit: 100 },
    { skip: !nid }
  );
  const [addQuality, { isLoading: adding }] = useAddQualityMutation();
  const [form, setForm] = useState({ node_ext: "", chlorine: "", turbidity: "", ph: "", temperature: "" });

  const summary = useMemo(() => {
    const latest = readings[0];
    return [
      { name: "Chlorine", value: latest?.chlorine ?? 0, unit: "mg/L", min: 0.2, max: 4, status: (latest?.chlorine ?? 0) < 0.2 ? "alert" : "ok" },
      { name: "Turbidity", value: latest?.turbidity ?? 0, unit: "NTU", min: 0, max: 1, status: (latest?.turbidity ?? 0) > 1 ? "alert" : "ok" },
      { name: "pH", value: latest?.ph ?? 0, unit: "", min: 6.5, max: 8.5, status: "ok" },
      { name: "Temperature", value: latest?.temperature ?? 0, unit: "°C", min: 5, max: 30, status: "ok" },
    ];
  }, [readings]);

  const trend = useMemo(
    () =>
      [...readings]
        .reverse()
        .slice(-24)
        .map((r) => ({
          hour: new Date(r.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          cl: r.chlorine ?? 0,
          turb: r.turbidity ?? 0,
          ph: r.ph ?? 0,
        })),
    [readings]
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nid || !form.node_ext.trim()) return;
    try {
      await addQuality({
        nid,
        body: {
          node_ext: form.node_ext,
          chlorine: form.chlorine ? +form.chlorine : null,
          turbidity: form.turbidity ? +form.turbidity : null,
          ph: form.ph ? +form.ph : null,
          temperature: form.temperature ? +form.temperature : null,
        },
      }).unwrap();
      setForm({ node_ext: "", chlorine: "", turbidity: "", ph: "", temperature: "" });
      refetch();
      toast.success("Reading logged");
    } catch (e) {
      toast.error(normalizeError(e).message);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {summary.map((q) => (
        <div key={q.name} className="panel-surface p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">{q.name}</span>
            <Droplets
              className={cn(
                "h-4 w-4",
                q.status === "alert" ? "text-[oklch(0.68_0.22_25)]" : "text-primary"
              )}
            />
          </div>
          <div
            className={cn(
              "text-3xl font-mono",
              q.status === "alert" && "text-[oklch(0.68_0.22_25)]"
            )}
          >
            {typeof q.value === "number" ? q.value.toFixed(2) : q.value}{" "}
            <span className="text-sm text-muted-foreground">{q.unit}</span>
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">
            Range {q.min}–{q.max} {q.unit}
          </div>
        </div>
      ))}
      <Panel title="Quality trend" className="lg:col-span-4">
        {isLoading ? (
          <div className="py-8 grid place-items-center"><ClipLoader size={20} /></div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trend}>
              <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="hour" {...chartAxis} />
              <YAxis {...chartAxis} />
              <Tooltip {...tipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <ReferenceLine y={0.2} stroke="oklch(0.68 0.22 25)" strokeDasharray="4 4" />
              <Line dataKey="cl" name="Chlorine (mg/L)" stroke="oklch(0.78 0.16 200)" strokeWidth={2} dot={false} />
              <Line dataKey="turb" name="Turbidity (NTU)" stroke="oklch(0.82 0.18 90)" strokeWidth={2} dot={false} />
              <Line dataKey="ph" name="pH" stroke="oklch(0.85 0.14 165)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Panel>

      <Panel title="Log a reading" className="lg:col-span-4">
        <form
          onSubmit={submit}
          className="grid grid-cols-2 md:grid-cols-6 gap-2 text-xs items-end"
        >
          <label className="flex flex-col gap-1">
            <span className="text-muted-foreground">Node</span>
            <input
              value={form.node_ext}
              onChange={(e) => setForm({ ...form, node_ext: e.target.value })}
              className="rounded border border-border bg-panel px-2 py-1.5"
              placeholder="C1"
            />
          </label>
          {(["chlorine", "turbidity", "ph", "temperature"] as const).map((k) => (
            <label key={k} className="flex flex-col gap-1">
              <span className="text-muted-foreground capitalize">{k}</span>
              <input
                type="number"
                step="0.01"
                value={form[k]}
                onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                className="rounded border border-border bg-panel px-2 py-1.5 font-mono"
              />
            </label>
          ))}
          <button
            type="submit"
            disabled={adding}
            className="flex items-center justify-center gap-1 px-3 py-2 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 disabled:opacity-40"
          >
            {adding ? <ClipLoader size={10} color="#fff" /> : <Plus className="h-3 w-3" />} Log
          </button>
        </form>
      </Panel>
    </div>
  );
}