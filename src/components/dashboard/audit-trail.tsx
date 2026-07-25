import { useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Undo2,
  Redo2,
  History,
  RotateCcw,
  GitCompare,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import type { AppDispatch } from "@/store/store";
import { hydrateNetwork } from "@/store/slices/networkSlice";
import { setCursor } from "@/store/slices/auditSlice";
import {
  useReplaceTopologyMutation,
  useLazyValidateTopologyQuery,
} from "@/store/api/topologyApi";
import type { Snapshot, AuditEntry } from "@/store/slices/auditSlice";
import type { NetworkNode, NetworkPipe } from "@/types/network";
import { toast } from "react-toastify";
import { normalizeError } from "@/utils/helpers";
import { DiffViewer } from "./diff-viewer";
import type { RootState } from "@/store/rootReducer";

function snapToApi(s: Snapshot) {
  return {
    nodes: s.nodes.map((n: NetworkNode) => ({
      ext_id: n.id,
      type: n.type,
      label: n.label,
      x: n.x,
      y: n.y,
      pressure: n.pressure,
      status: n.status,
      demand: n.demand ?? null,
      level: n.level ?? null,
      rated_kw: n.ratedKw ?? null,
      elevation: n.elevation ?? null,
      leak_prob: n.leakProb ?? null,
    })),
    pipes: s.pipes.map((p: NetworkPipe) => ({
      ext_id: p.id,
      from_ext: p.from,
      to_ext: p.to,
      diameter: p.diameter,
      flow: p.flow,
      velocity: p.velocity,
      headloss: p.headloss,
      material: p.material,
      age: p.age,
    })),
  };
}

export function useUndoRedo() {
  const dispatch = useDispatch<AppDispatch>();
  const nid = useSelector((s: RootState) => s.networkUi.activeNetworkId);
  const bucket = useSelector((s: RootState) =>
    nid != null ? s.audit.byNetwork[nid] : undefined,
  );
  const [replaceTopology, { isLoading }] = useReplaceTopologyMutation();

  const canUndo = !!bucket && bucket.cursor >= 0;
  const canRedo = !!bucket && bucket.cursor < bucket.entries.length - 1;

  async function apply(snapshot: Snapshot, newCursor: number) {
    if (!nid) return;
    try {
      const res = await replaceTopology({
        nid,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        body: snapToApi(snapshot) as any,
      }).unwrap();
      dispatch(hydrateNetwork({ nodes: res.nodes, pipes: res.pipes }));
      dispatch(setCursor({ nid, cursor: newCursor }));
    } catch (err) {
      toast.error(normalizeError(err).message ?? "Failed to sync revert");
    }
  }

  return {
    canUndo,
    canRedo,
    isLoading,
    undo: () => {
      if (!bucket || !canUndo) return;
      const entry = bucket.entries[bucket.cursor];
      apply(entry.before, bucket.cursor - 1);
    },
    redo: () => {
      if (!bucket || !canRedo) return;
      const entry = bucket.entries[bucket.cursor + 1];
      apply(entry.after, bucket.cursor + 1);
    },
    revertTo: (index: number) => {
      if (!bucket) return;
      if (index < 0 || index >= bucket.entries.length) return;
      apply(bucket.entries[index].before, index - 1);
    },
  };
}

export function UndoRedoButtons() {
  const { canUndo, canRedo, undo, redo, isLoading } = useUndoRedo();
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={undo}
        disabled={!canUndo || isLoading}
        title="Undo (last edit)"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border bg-panel hover:bg-panel-2 transition text-xs disabled:opacity-40"
      >
        <Undo2 className="h-3.5 w-3.5" />
        <span className="hidden md:inline">Undo</span>
      </button>
      <button
        onClick={redo}
        disabled={!canRedo || isLoading}
        title="Redo"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border bg-panel hover:bg-panel-2 transition text-xs disabled:opacity-40"
      >
        <Redo2 className="h-3.5 w-3.5" />
        <span className="hidden md:inline">Redo</span>
      </button>
    </div>
  );
}

function ValidateButton() {
  const nid = useSelector((s: RootState) => s.networkUi.activeNetworkId);
  const [trigger, { data, isFetching }] = useLazyValidateTopologyQuery();
  const [open, setOpen] = useState(false);
  if (!nid) return null;
  const run = async () => {
    try {
      const r = await trigger(nid).unwrap();
      setOpen(true);
      if (r.ok) toast.success("Topology is consistent");
      else
        toast.warning(
          `${r.issues.length} issue${r.issues.length === 1 ? "" : "s"} found`,
        );
    } catch (e) {
      toast.error(normalizeError(e).message ?? "Validation failed");
    }
  };
  return (
    <>
      <button
        onClick={run}
        disabled={isFetching}
        className="flex items-center gap-1 px-2 py-1 rounded border border-border bg-panel hover:bg-panel-2 text-[10px] disabled:opacity-40"
        title="Run full topology integrity check"
      >
        <ShieldCheck className="h-3 w-3" /> Validate
      </button>
      {open && data && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="panel-surface w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-border px-3 py-2 bg-panel-2/60">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span className="text-xs font-semibold">
                Topology validation report
              </span>
              <span className="ml-auto text-[10px] text-muted-foreground">
                {data.node_count} nodes · {data.pipe_count} pipes
              </span>
            </div>
            <div className="p-3 overflow-auto text-xs">
              {data.ok ? (
                <div className="text-emerald-600">
                  All checks passed. Network is consistent.
                </div>
              ) : (
                <ul className="space-y-2">
                  {data.issues.map((i, k) => (
                    <li key={k} className="rounded border border-border p-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle
                          className={`h-3.5 w-3.5 ${i.severity === "error" ? "text-red-500" : "text-amber-500"}`}
                        />
                        <span className="font-medium">{i.message}</span>
                        <span className="ml-auto text-[10px] text-muted-foreground">
                          {i.code}
                        </span>
                      </div>
                      <div className="mt-1 text-[11px] text-muted-foreground">
                        location:{" "}
                        <span className="font-mono">{i.location.kind}</span>
                        {i.location.ext_id ? ` · ${i.location.ext_id}` : ""}
                        {i.location.ext_ids?.length
                          ? ` · ${i.location.ext_ids.join(", ")}`
                          : ""}
                      </div>
                      {i.hint && (
                        <div className="mt-1 text-[11px]">Hint: {i.hint}</div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function AuditTrailPanel() {
  const nid = useSelector((s: RootState) => s.networkUi.activeNetworkId);
  const bucket = useSelector((s: RootState) =>
    nid != null ? s.audit.byNetwork[nid] : undefined,
  );
  const { revertTo, isLoading } = useUndoRedo();
  const [compare, setCompare] = useState<{
    a: AuditEntry;
    b: AuditEntry;
  } | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const entries = bucket?.entries ?? [];
  const cursor = bucket?.cursor ?? -1;

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else {
      if (next.size >= 2) next.delete([...next][0]);
      next.add(id);
    }
    setSelected(next);
  };

  const [aId, bId] = useMemo(() => [...selected], [selected]);
  const canDiff = !!aId && !!bId;

  const openDiff = () => {
    const a = entries.find((e) => e.id === aId);
    const b = entries.find((e) => e.id === bId);
    if (!a || !b) return;
    // Order by timestamp so before < after.
    const [first, second] = a.ts <= b.ts ? [a, b] : [b, a];
    setCompare({ a: first, b: second });
  };

  return (
    <div className="panel-surface">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2 bg-panel-2/60">
        <History className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">
          Audit trail
        </span>
        <span className="ml-auto text-[10px] text-muted-foreground">
          {entries.length} event{entries.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="flex items-center gap-1 px-3 py-1.5 border-b border-border bg-panel-2/30">
        <button
          onClick={openDiff}
          disabled={!canDiff}
          className="flex items-center gap-1 px-2 py-1 rounded border border-border bg-panel hover:bg-panel-2 text-[10px] disabled:opacity-40"
          title="Select two entries below then click to view diff"
        >
          <GitCompare className="h-3 w-3" /> Diff{" "}
          {selected.size ? `(${selected.size}/2)` : ""}
        </button>
        <ValidateButton />
        {selected.size > 0 && (
          <button
            onClick={() => setSelected(new Set())}
            className="ml-auto text-[10px] text-muted-foreground hover:text-foreground"
          >
            clear
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="p-4 text-xs text-muted-foreground">
          No edits yet. Add or modify nodes/pipes and they will appear here.
        </div>
      ) : (
        <ul className="max-h-44 overflow-auto divide-y divide-border text-xs">
          {entries
            .map((e, i) => ({ e, i }))
            .reverse()
            .map(({ e, i }) => {
              const isCurrent = i === cursor;
              const isFuture = i > cursor;
              const isSelected = selected.has(e.id);
              return (
                <li
                  key={e.id}
                  className={`px-3 py-2 flex items-center gap-2 ${
                    isFuture ? "opacity-50" : ""
                  } ${isCurrent ? "bg-primary/5" : ""} ${
                    isSelected ? "ring-1 ring-inset ring-primary/40" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggle(e.id)}
                    className="h-3 w-3 accent-current"
                    title="Select for diff"
                  />
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      e.rolledBack
                        ? "bg-red-500"
                        : isFuture
                          ? "bg-muted-foreground"
                          : isCurrent
                            ? "bg-primary"
                            : "bg-[oklch(0.78_0.18_155)]"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-medium">
                      {e.description}
                      {e.rolledBack && (
                        <span className="ml-1.5 text-[10px] text-red-500">
                          · rolled back
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {new Date(e.ts).toLocaleTimeString()} · {e.kind}
                      {e.rolledBackReason ? ` — ${e.rolledBackReason}` : ""}
                    </div>
                  </div>
                  <button
                    disabled={isLoading || e.rolledBack}
                    onClick={() => revertTo(i)}
                    title="Revert to state before this event"
                    className="flex items-center gap-1 px-2 py-1 rounded border border-border bg-panel hover:bg-panel-2 transition text-[10px] disabled:opacity-40"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Revert
                  </button>
                </li>
              );
            })}
        </ul>
      )}

      {compare && (
        <DiffViewer
          before={compare.a.before}
          after={compare.b.after}
          labelBefore={`${new Date(compare.a.ts).toLocaleTimeString()} · ${compare.a.description}`}
          labelAfter={`${new Date(compare.b.ts).toLocaleTimeString()} · ${compare.b.description}`}
          onClose={() => setCompare(null)}
        />
      )}
    </div>
  );
}
