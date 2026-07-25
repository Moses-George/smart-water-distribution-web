import { useMemo, useState } from "react";
import { X, ArrowRight, Plus, Minus, Pencil } from "lucide-react";
import type { Snapshot } from "@/store/slices/auditSlice";
import type { NetworkNode, NetworkPipe } from "@/types/network";

interface NodeChange {
  id: string;
  kind: "added" | "removed" | "modified";
  fields?: { key: string; before: unknown; after: unknown }[];
}
interface PipeChange {
  id: string;
  kind: "added" | "removed" | "modified";
  fields?: { key: string; before: unknown; after: unknown }[];
}

function diffNodes(a: NetworkNode[], b: NetworkNode[]): NodeChange[] {
  const ma = new Map(a.map((n) => [n.id, n]));
  const mb = new Map(b.map((n) => [n.id, n]));
  const out: NodeChange[] = [];
  for (const [id, node] of ma) {
    if (!mb.has(id)) out.push({ id, kind: "removed" });
    else {
      const other = mb.get(id)!;
      const fields: NodeChange["fields"] = [];
      (Object.keys(node) as (keyof NetworkNode)[]).forEach((k) => {
        if (JSON.stringify(node[k]) !== JSON.stringify(other[k])) {
          fields.push({ key: k as string, before: node[k], after: other[k] });
        }
      });
      if (fields.length) out.push({ id, kind: "modified", fields });
    }
  }
  for (const [id] of mb) if (!ma.has(id)) out.push({ id, kind: "added" });
  return out;
}

function diffPipes(a: NetworkPipe[], b: NetworkPipe[]): PipeChange[] {
  const ma = new Map(a.map((p) => [p.id, p]));
  const mb = new Map(b.map((p) => [p.id, p]));
  const out: PipeChange[] = [];
  for (const [id, pipe] of ma) {
    if (!mb.has(id)) out.push({ id, kind: "removed" });
    else {
      const other = mb.get(id)!;
      const fields: PipeChange["fields"] = [];
      (Object.keys(pipe) as (keyof NetworkPipe)[]).forEach((k) => {
        if (JSON.stringify(pipe[k]) !== JSON.stringify(other[k])) {
          fields.push({ key: k as string, before: pipe[k], after: other[k] });
        }
      });
      if (fields.length) out.push({ id, kind: "modified", fields });
    }
  }
  for (const [id] of mb) if (!ma.has(id)) out.push({ id, kind: "added" });
  return out;
}

function fmt(v: unknown): string {
  if (v == null) return "—";
  if (typeof v === "number")
    return Number.isInteger(v) ? String(v) : v.toFixed(2);
  return String(v);
}

function kindPill(k: NodeChange["kind"]) {
  const map = {
    added: {
      icon: Plus,
      cls: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
      label: "added",
    },
    removed: {
      icon: Minus,
      cls: "bg-red-500/10 text-red-600 border-red-500/30",
      label: "removed",
    },
    modified: {
      icon: Pencil,
      cls: "bg-amber-500/10 text-amber-600 border-amber-500/30",
      label: "modified",
    },
  } as const;
  const { icon: Icon, cls, label } = map[k];
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] ${cls}`}
    >
      <Icon className="h-3 w-3" /> {label}
    </span>
  );
}

/** Renders a mini SVG overlay marking changed / added / removed nodes and pipes. */
function DiffMap({
  before,
  after,
  nodeChanges,
  pipeChanges,
}: {
  before: Snapshot;
  after: Snapshot;
  nodeChanges: NodeChange[];
  pipeChanges: PipeChange[];
}) {
  const nodeIndex = useMemo(() => {
    const m = new Map<string, NetworkNode>();
    [...before.nodes, ...after.nodes].forEach((n) => m.set(n.id, n));
    return m;
  }, [before, after]);
  const nodeKind = new Map(nodeChanges.map((c) => [c.id, c.kind]));
  const pipeKind = new Map(pipeChanges.map((c) => [c.id, c.kind]));
  const allPipes = new Map<string, NetworkPipe>();
  [...before.pipes, ...after.pipes].forEach((p) => allPipes.set(p.id, p));

  const color = (k?: string) =>
    k === "added"
      ? "oklch(0.7 0.18 155)"
      : k === "removed"
        ? "oklch(0.65 0.22 25)"
        : k === "modified"
          ? "oklch(0.75 0.17 75)"
          : "oklch(0.75 0 0 / 0.3)";

  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-56 rounded-md border border-border bg-panel-2/40"
    >
      {[...allPipes.values()].map((p) => {
        const a = nodeIndex.get(p.from);
        const b = nodeIndex.get(p.to);
        if (!a || !b) return null;
        const k = pipeKind.get(p.id);
        return (
          <line
            key={`pipe-${p.id}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke={color(k)}
            strokeWidth={k ? 0.8 : 0.3}
            strokeDasharray={k === "removed" ? "1.5 1" : undefined}
            opacity={k ? 0.95 : 0.4}
          />
        );
      })}
      {[...nodeIndex.values()].map((n) => {
        const k = nodeKind.get(n.id);
        return (
          <g key={`node-${n.id}`}>
            <circle
              cx={n.x}
              cy={n.y}
              r={k ? 1.8 : 0.9}
              fill={color(k)}
              stroke={k ? "white" : "none"}
              strokeWidth={0.3}
              opacity={k ? 1 : 0.5}
            />
            {k && (
              <text x={n.x + 2} y={n.y - 2} fontSize={2} fill={color(k)}>
                {n.id}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export function DiffViewer({
  before,
  after,
  labelBefore,
  labelAfter,
  onClose,
}: {
  before: Snapshot;
  after: Snapshot;
  labelBefore: string;
  labelAfter: string;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"map" | "nodes" | "pipes">("map");
  const nodeChanges = useMemo(
    () => diffNodes(before.nodes, after.nodes),
    [before, after],
  );
  const pipeChanges = useMemo(
    () => diffPipes(before.pipes, after.pipes),
    [before, after],
  );
  const totalChanges = nodeChanges.length + pipeChanges.length;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="panel-surface w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-border px-4 py-2.5 bg-panel-2/60">
          <div className="text-xs">
            <span className="text-muted-foreground">{labelBefore}</span>
            <ArrowRight className="inline h-3 w-3 mx-1.5" />
            <span className="font-semibold">{labelAfter}</span>
          </div>
          <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded border border-border">
            {totalChanges} change{totalChanges === 1 ? "" : "s"}
          </span>
          <div className="ml-auto flex items-center gap-1">
            {(["map", "nodes", "pipes"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`text-[11px] px-2 py-1 rounded border ${
                  tab === t
                    ? "bg-primary/10 border-primary/40"
                    : "border-border bg-panel"
                }`}
              >
                {t === "nodes"
                  ? `Nodes (${nodeChanges.length})`
                  : t === "pipes"
                    ? `Pipes (${pipeChanges.length})`
                    : "Map"}
              </button>
            ))}
            <button
              onClick={onClose}
              className="ml-1 p-1 rounded hover:bg-panel-2"
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="p-4 overflow-auto text-xs">
          {tab === "map" && (
            <div className="space-y-3">
              <DiffMap
                before={before}
                after={after}
                nodeChanges={nodeChanges}
                pipeChanges={pipeChanges}
              />
              <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> added
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-red-500" /> removed
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />{" "}
                  modified
                </span>
              </div>
            </div>
          )}
          {tab === "nodes" && (
            <div className="space-y-2">
              {nodeChanges.length === 0 ? (
                <div className="text-muted-foreground">No node changes.</div>
              ) : (
                nodeChanges.map((c) => (
                  <div key={c.id} className="rounded border border-border p-2">
                    <div className="flex items-center gap-2">
                      {kindPill(c.kind)}
                      <span className="font-mono text-[11px]">{c.id}</span>
                    </div>
                    {c.fields?.length ? (
                      <table className="mt-2 w-full text-[11px]">
                        <tbody>
                          {c.fields.map((f) => (
                            <tr
                              key={f.key}
                              className="border-t border-border/50"
                            >
                              <td className="py-1 pr-2 text-muted-foreground w-24">
                                {f.key}
                              </td>
                              <td className="py-1 pr-2 text-red-500 line-through">
                                {fmt(f.before)}
                              </td>
                              <td className="py-1 pr-2">
                                <ArrowRight className="inline h-3 w-3" />
                              </td>
                              <td className="py-1 text-emerald-600 font-medium">
                                {fmt(f.after)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          )}
          {tab === "pipes" && (
            <div className="space-y-2">
              {pipeChanges.length === 0 ? (
                <div className="text-muted-foreground">No pipe changes.</div>
              ) : (
                pipeChanges.map((c) => (
                  <div key={c.id} className="rounded border border-border p-2">
                    <div className="flex items-center gap-2">
                      {kindPill(c.kind)}
                      <span className="font-mono text-[11px]">{c.id}</span>
                    </div>
                    {c.fields?.length ? (
                      <table className="mt-2 w-full text-[11px]">
                        <tbody>
                          {c.fields.map((f) => (
                            <tr
                              key={f.key}
                              className="border-t border-border/50"
                            >
                              <td className="py-1 pr-2 text-muted-foreground w-24">
                                {f.key}
                              </td>
                              <td className="py-1 pr-2 text-red-500 line-through">
                                {fmt(f.before)}
                              </td>
                              <td className="py-1 pr-2">
                                <ArrowRight className="inline h-3 w-3" />
                              </td>
                              <td className="py-1 text-emerald-600 font-medium">
                                {fmt(f.after)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
