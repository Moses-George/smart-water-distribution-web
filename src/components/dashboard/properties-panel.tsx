import { cn } from "@/lib/utils";
import { Sliders, X } from "lucide-react";
import { useNetworkStore } from "@/hooks/useNetwork";
import type { NetworkNode, NetworkPipe } from "@/types/network";

export function PropertiesPanel() {
  const {
    selectedId,
    selectedPipeId,
    nodes,
    pipes,
    updateNode,
    updatePipe,
    select,
    selectPipe,
  } = useNetworkStore();
  // const selectedPipeId = useNetwork((s) => s.selectedPipeId);
  const node = nodes.find((n) => n.id === selectedId) ?? null;
  const pipe = pipes.find((p) => p.id === selectedPipeId) ?? null;
  // const updateNode = useNetwork((s) => s.updateNode);
  // const updatePipe = useNetwork((s) => s.updatePipe);
  // const select = useNetwork((s) => s.select);
  // const selectPipe = useNetwork((s) => s.selectPipe);

  if (!node && !pipe) {
    return (
      <div className="panel-surface p-4">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
          <Sliders className="h-3.5 w-3.5" /> Properties
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Select a node or pipe (with the Select tool) to edit its hydraulic
          properties.
        </p>
      </div>
    );
  }

  return (
    <div className="panel-surface p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
          <Sliders className="h-3.5 w-3.5" />
          {node ? `${node.type} · ${node.id}` : `Pipe · ${pipe!.id}`}
        </div>
        <button
          onClick={() => {
            select(null);
            selectPipe(null);
          }}
          className="rounded p-1 hover:bg-panel-2 text-muted-foreground"
          title="Close"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {node && (
        <NodeEditor node={node} onChange={(p) => updateNode(node.id, p)} />
      )}
      {pipe && (
        <PipeEditor pipe={pipe} onChange={(p) => updatePipe(pipe.id, p)} />
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-center justify-between gap-3 text-xs">
      <span className="text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "w-32 rounded border border-border bg-panel px-2 py-1 text-xs font-mono text-right focus:outline-none focus:border-primary/60";

function NodeEditor({
  node,
  onChange,
}: {
  node: NetworkNode;
  onChange: (p: Partial<NetworkNode>) => void;
}) {
  return (
    <div className="space-y-2.5">
      <Field label="Label">
        <input
          className={cn(inputCls, "text-left w-40")}
          value={node.label}
          onChange={(e) => onChange({ label: e.target.value })}
        />
      </Field>
      <Field label="Pressure (m)">
        <input
          type="number"
          className={inputCls}
          value={node.pressure}
          onChange={(e) => onChange({ pressure: +e.target.value })}
        />
      </Field>
      <Field label="Status">
        <select
          className={inputCls}
          value={node.status}
          onChange={(e) =>
            onChange({ status: e.target.value as NetworkNode["status"] })
          }
        >
          <option value="ok">ok</option>
          <option value="warn">warn</option>
          <option value="alert">alert</option>
        </select>
      </Field>
      <Field label="Elevation (m)">
        <input
          type="number"
          className={inputCls}
          value={node.elevation ?? 0}
          onChange={(e) => onChange({ elevation: +e.target.value })}
        />
      </Field>

      {node.type === "consumer" && (
        <Field label="Demand (L/s)">
          <input
            type="number"
            className={inputCls}
            value={node.demand ?? 0}
            onChange={(e) => onChange({ demand: +e.target.value })}
          />
        </Field>
      )}
      {node.type === "tank" && (
        <Field label="Level (%)">
          <input
            type="number"
            min={0}
            max={100}
            className={inputCls}
            value={node.level ?? 0}
            onChange={(e) => onChange({ level: +e.target.value })}
          />
        </Field>
      )}
      {node.type === "pump" && (
        <Field label="Rated power (kW)">
          <input
            type="number"
            className={inputCls}
            value={node.ratedKw ?? 0}
            onChange={(e) => onChange({ ratedKw: +e.target.value })}
          />
        </Field>
      )}
      {(node.type === "junction" || node.type === "consumer") && (
        <Field label="Leak prob (0-1)">
          <input
            type="number"
            step="0.01"
            min={0}
            max={1}
            className={inputCls}
            value={node.leakProb ?? 0}
            onChange={(e) => onChange({ leakProb: +e.target.value })}
          />
        </Field>
      )}

      <div className="pt-2 mt-2 border-t border-border grid grid-cols-2 gap-2 text-[10px] text-muted-foreground font-mono">
        <span>x {node.x.toFixed(1)}</span>
        <span>y {node.y.toFixed(1)}</span>
      </div>
    </div>
  );
}

function PipeEditor({
  pipe,
  onChange,
}: {
  pipe: NetworkPipe;
  onChange: (p: Partial<NetworkPipe>) => void;
}) {
  return (
    <div className="space-y-2.5">
      <div className="text-[11px] text-muted-foreground font-mono">
        {pipe.from} → {pipe.to}
      </div>
      <Field label="Diameter (mm)">
        <input
          type="number"
          className={inputCls}
          value={pipe.diameter}
          onChange={(e) => onChange({ diameter: +e.target.value })}
        />
      </Field>
      <Field label="Material">
        <select
          className={inputCls}
          value={pipe.material}
          onChange={(e) =>
            onChange({ material: e.target.value as NetworkPipe["material"] })
          }
        >
          <option>PVC</option>
          <option>DI</option>
          <option>Steel</option>
          <option>HDPE</option>
        </select>
      </Field>
      <Field label="Age (years)">
        <input
          type="number"
          className={inputCls}
          value={pipe.age}
          onChange={(e) => onChange({ age: +e.target.value })}
        />
      </Field>
      <Field label="Flow (L/s)">
        <input
          type="number"
          className={inputCls}
          value={pipe.flow}
          onChange={(e) => onChange({ flow: +e.target.value })}
        />
      </Field>
      <Field label="Velocity (m/s)">
        <input
          type="number"
          step="0.1"
          className={inputCls}
          value={pipe.velocity}
          onChange={(e) => onChange({ velocity: +e.target.value })}
        />
      </Field>
      <Field label="Head loss (m)">
        <input
          type="number"
          step="0.1"
          className={inputCls}
          value={pipe.headloss}
          onChange={(e) => onChange({ headloss: +e.target.value })}
        />
      </Field>
    </div>
  );
}
