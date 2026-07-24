// import { useRef, useState } from "react";
// import {
//   MousePointer2,
//   Link2,
//   Trash2,
//   RotateCcw,
//   Waves,
//   Cylinder,
//   Fan,
//   Diamond,
//   Circle,
//   Home,
// } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { NodeIcon, IconDefs } from "./network-icons";
// import { useNetworkStore } from "@/hooks/useNetwork";
// import type { NetworkNode, NodeType, Tool } from "@/types/network";

// const statusRing: Record<NetworkNode["status"], string> = {
//   ok: "#1f6f4a",
//   warn: "#c48a1a",
//   alert: "#b02a1a",
// };

// const TOOLS: {
//   id: Tool;
//   label: string;
//   icon: React.ComponentType<{ className?: string }>;
//   group: "action" | "add";
// }[] = [
//   {
//     id: "select",
//     label: "Select / Move",
//     icon: MousePointer2,
//     group: "action",
//   },
//   { id: "connect", label: "Connect (pipe)", icon: Link2, group: "action" },
//   { id: "delete", label: "Delete", icon: Trash2, group: "action" },
//   { id: "add-reservoir", label: "Reservoir", icon: Waves, group: "add" },
//   { id: "add-tank", label: "Tank", icon: Cylinder, group: "add" },
//   { id: "add-pump", label: "Pump", icon: Fan, group: "add" },
//   { id: "add-valve", label: "Valve", icon: Diamond, group: "add" },
//   { id: "add-junction", label: "Junction", icon: Circle, group: "add" },
//   { id: "add-consumer", label: "Consumer", icon: Home, group: "add" },
// ];

// function toolToType(t: Tool): NodeType | null {
//   if (!t.startsWith("add-")) return null;
//   return t.slice(4) as NodeType;
// }

// export function NetworkMap({
//   highlightLeaks = false,
//   interactive = true,
//   height = 520,
// }: {
//   highlightLeaks?: boolean;
//   interactive?: boolean;
//   height?: number;
// }) {
//   const {
//     nodes,
//     pipes,
//     tool,
//     selectedId,
//     selectedPipeId,
//     connectFrom,
//     setTool,
//     select,
//     selectPipe,
//     addNodeAt,
//     moveNode,
//     deleteNode,
//     deletePipe,
//     connectNodes,
//     setConnectFrom,
//     reset,
//   } = useNetworkStore();

//   const svgRef = useRef<SVGSVGElement | null>(null);
//   const [dragId, setDragId] = useState<string | null>(null);
//   const [hover, setHover] = useState<NetworkNode | null>(null);

//   const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));

//   function svgCoords(evt: React.PointerEvent | React.MouseEvent) {
//     const svg = svgRef.current;
//     if (!svg) return { x: 50, y: 50 };
//     const rect = svg.getBoundingClientRect();
//     const x = ((evt.clientX - rect.left) / rect.width) * 100;
//     const y = ((evt.clientY - rect.top) / rect.height) * 100;
//     return { x, y };
//   }

//   function onCanvasClick(evt: React.MouseEvent) {
//     if (!interactive) return;
//     if ((evt.target as Element).closest("[data-node-hit]")) return;
//     if ((evt.target as Element).closest("[data-pipe-hit]")) return;
//     const type = toolToType(tool);
//     if (type) {
//       const { x, y } = svgCoords(evt);
//       addNodeAt(type, x, y);
//     } else {
//       select(null);
//       setConnectFrom(null);
//     }
//   }

//   function onNodePointerDown(evt: React.PointerEvent, n: NetworkNode) {
//     if (!interactive) return;
//     evt.stopPropagation();
//     if (tool === "delete") {
//       deleteNode(n.id);
//       return;
//     }
//     if (tool === "connect") {
//       if (!connectFrom) setConnectFrom(n.id);
//       else {
//         connectNodes(connectFrom, n.id);
//       }
//       return;
//     }
//     if (tool === "select") {
//       select(n.id);
//       setDragId(n.id);
//       (evt.currentTarget as Element).setPointerCapture(evt.pointerId);
//     }
//   }

//   function onPointerMove(evt: React.PointerEvent) {
//     if (!dragId) return;
//     const { x, y } = svgCoords(evt);
//     moveNode(dragId, x, y);
//   }

//   function onPointerUp() {
//     setDragId(null);
//   }

//   const addingType = toolToType(tool);
//   const cursor =
//     tool === "delete"
//       ? "not-allowed"
//       : addingType
//         ? "crosshair"
//         : tool === "connect"
//           ? "cell"
//           : "default";

//   return (
//     <div className="relative panel-surface overflow-hidden">
//       {interactive && (
//         <div className="flex flex-wrap items-center gap-1.5 border-b border-border px-3 py-2 bg-panel-2/60 text-xs">
//           <span className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mr-2">
//             Tools
//           </span>
//           {TOOLS.filter((t) => t.group === "action").map((t) => (
//             <ToolBtn
//               key={t.id}
//               t={t}
//               active={tool === t.id}
//               onClick={() => setTool(t.id)}
//             />
//           ))}
//           <span className="mx-1 h-4 w-px bg-border" />
//           <span className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mr-1">
//             Add
//           </span>
//           {TOOLS.filter((t) => t.group === "add").map((t) => (
//             <ToolBtn
//               key={t.id}
//               t={t}
//               active={tool === t.id}
//               onClick={() => setTool(t.id)}
//             />
//           ))}
//           <div className="ml-auto flex items-center gap-2">
//             <span className="text-muted-foreground">
//               {nodes.length} nodes · {pipes.length} pipes
//             </span>
//             <button
//               onClick={reset}
//               className="inline-flex items-center gap-1 rounded-md border border-border bg-panel px-2 py-1 hover:bg-panel-2 transition"
//             >
//               <RotateCcw className="h-3 w-3" /> Reset
//             </button>
//           </div>
//         </div>
//       )}

//       <div className="relative">
//         <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
//         <svg
//           ref={svgRef}
//           viewBox="0 0 100 100"
//           preserveAspectRatio="none"
//           className="relative block w-full"
//           style={{ height, cursor }}
//           onClick={onCanvasClick}
//           onPointerMove={onPointerMove}
//           onPointerUp={onPointerUp}
//           onPointerLeave={onPointerUp}
//         >
//           <IconDefs />
//           <defs>
//             <linearGradient id="flow" x1="0" x2="1">
//               <stop offset="0%" stopColor="#3b82c4" stopOpacity="0.85" />
//               <stop offset="100%" stopColor="#2ea38a" stopOpacity="0.85" />
//             </linearGradient>
//           </defs>

//           {/* Pipes */}
//           {pipes.map((p) => {
//             const a = byId[p.from];
//             const b = byId[p.to];
//             if (!a || !b) return null;
//             const width = Math.max(0.35, Math.min(1.3, p.diameter / 350));
//             const isPipeSelected = selectedPipeId === p.id;
//             return (
//               <g key={p.id}>
//                 {/* Hit target */}
//                 <line
//                   data-pipe-hit
//                   x1={a.x}
//                   y1={a.y}
//                   x2={b.x}
//                   y2={b.y}
//                   stroke="transparent"
//                   strokeWidth={2.5}
//                   onClick={(e) => {
//                     if (!interactive) return;
//                     e.stopPropagation();
//                     if (tool === "delete") deletePipe(p.id);
//                     else if (tool === "select") selectPipe(p.id);
//                   }}
//                   style={{
//                     cursor: tool === "delete" ? "not-allowed" : "pointer",
//                   }}
//                 />
//                 {isPipeSelected && (
//                   <line
//                     x1={a.x}
//                     y1={a.y}
//                     x2={b.x}
//                     y2={b.y}
//                     stroke="#f59e0b"
//                     strokeWidth={width + 0.9}
//                     strokeLinecap="round"
//                     opacity={0.55}
//                     pointerEvents="none"
//                   />
//                 )}
//                 <line
//                   x1={a.x}
//                   y1={a.y}
//                   x2={b.x}
//                   y2={b.y}
//                   stroke="url(#flow)"
//                   strokeWidth={width}
//                   strokeLinecap="round"
//                   opacity={0.9}
//                   pointerEvents="none"
//                 />
//                 <line
//                   x1={a.x}
//                   y1={a.y}
//                   x2={b.x}
//                   y2={b.y}
//                   stroke="#fff"
//                   strokeWidth={width * 0.35}
//                   strokeLinecap="round"
//                   strokeDasharray="0.6 1.4"
//                   opacity={0.75}
//                   pointerEvents="none"
//                 >
//                   <animate
//                     attributeName="stroke-dashoffset"
//                     from="0"
//                     to="-8"
//                     dur={`${Math.max(1.2, 4 - p.velocity)}s`}
//                     repeatCount="indefinite"
//                   />
//                 </line>
//               </g>
//             );
//           })}

//           {/* Nodes */}
//           {nodes.map((n) => {
//             const isLeak = highlightLeaks && (n.leakProb ?? 0) > 0.5;
//             const ring = isLeak ? "#b02a1a" : statusRing[n.status];
//             const isSelected = selectedId === n.id;
//             const isConnectSource = connectFrom === n.id;
//             return (
//               <g
//                 key={n.id}
//                 data-node-hit
//                 transform={`translate(${n.x} ${n.y})`}
//                 style={{
//                   cursor: interactive
//                     ? tool === "delete"
//                       ? "not-allowed"
//                       : tool === "connect"
//                         ? "cell"
//                         : "grab"
//                     : "pointer",
//                 }}
//                 onPointerDown={(e) => onNodePointerDown(e, n)}
//                 onMouseEnter={() => setHover(n)}
//                 onMouseLeave={() => setHover(null)}
//               >
//                 {isLeak && (
//                   <circle
//                     r={3.5}
//                     fill="none"
//                     stroke="#b02a1a"
//                     strokeWidth={0.3}
//                   >
//                     <animate
//                       attributeName="r"
//                       from="2"
//                       to="5"
//                       dur="1.5s"
//                       repeatCount="indefinite"
//                     />
//                     <animate
//                       attributeName="opacity"
//                       from="0.9"
//                       to="0"
//                       dur="1.5s"
//                       repeatCount="indefinite"
//                     />
//                   </circle>
//                 )}
//                 {(isSelected || isConnectSource) && (
//                   <circle
//                     r={3.6}
//                     fill="none"
//                     stroke={isConnectSource ? "#f59e0b" : "#3b82c4"}
//                     strokeWidth={0.35}
//                     strokeDasharray="0.8 0.6"
//                   />
//                 )}
//                 <NodeIcon type={n.type} ring={ring} />
//                 <text
//                   y={5.2}
//                   textAnchor="middle"
//                   fontSize={1.6}
//                   fill="currentColor"
//                   opacity={0.75}
//                   style={{ pointerEvents: "none" }}
//                 >
//                   {n.id}
//                 </text>
//               </g>
//             );
//           })}
//         </svg>

//         {/* Legend / help overlay */}
//         {interactive && (
//           <div className="absolute left-3 bottom-3 flex flex-wrap gap-1.5 text-[10px]">
//             <Legend color="#4aa8d8" label="Reservoir" />
//             <Legend color="#9fb6c2" label="Tank" />
//             <Legend color="#f2c94c" label="Pump" />
//             <Legend color="#b58cd8" label="Valve" />
//             <Legend color="#7f8c94" label="Junction" />
//             <Legend color="#7dd3a0" label="Consumer" />
//           </div>
//         )}

//         {hover && (
//           <div className="absolute right-3 top-3 z-10 rounded-lg border border-border bg-background/95 backdrop-blur px-3 py-2 text-xs shadow-xl pointer-events-none">
//             <div className="font-semibold text-foreground">{hover.label}</div>
//             <div className="text-muted-foreground capitalize">
//               {hover.type} · {hover.id}
//             </div>
//             <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-0.5">
//               <span className="text-muted-foreground">Pressure</span>
//               <span className="text-right font-mono">
//                 {hover.pressure.toFixed(1)} m
//               </span>
//               {hover.demand != null && (
//                 <>
//                   <span className="text-muted-foreground">Demand</span>
//                   <span className="text-right font-mono">
//                     {hover.demand} L/s
//                   </span>
//                 </>
//               )}
//               {hover.level != null && (
//                 <>
//                   <span className="text-muted-foreground">Level</span>
//                   <span className="text-right font-mono">{hover.level}%</span>
//                 </>
//               )}
//               {hover.leakProb != null && (
//                 <>
//                   <span className="text-muted-foreground">Leak prob.</span>
//                   <span className="text-right font-mono">
//                     {(hover.leakProb * 100).toFixed(0)}%
//                   </span>
//                 </>
//               )}
//             </div>
//           </div>
//         )}

//         {interactive && tool === "connect" && (
//           <div className="absolute right-3 bottom-3 rounded-md bg-primary/10 border border-primary/30 text-primary px-2 py-1 text-[11px]">
//             {connectFrom
//               ? `Connecting from ${connectFrom} → pick target`
//               : "Pick source node"}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// function ToolBtn({
//   t,
//   active,
//   onClick,
// }: {
//   t: {
//     id: Tool;
//     label: string;
//     icon: React.ComponentType<{ className?: string }>;
//   };
//   active: boolean;
//   onClick: () => void;
// }) {
//   const Icon = t.icon;
//   return (
//     <button
//       onClick={onClick}
//       title={t.label}
//       className={cn(
//         "inline-flex items-center gap-1 rounded-md border px-2 py-1 transition text-[11px]",
//         active
//           ? "border-primary/40 bg-primary/10 text-primary"
//           : "border-border bg-panel hover:bg-panel-2 text-muted-foreground",
//       )}
//     >
//       <Icon className="h-3 w-3" />
//       <span className="hidden sm:inline">{t.label}</span>
//     </button>
//   );
// }

// function Legend({ color, label }: { color: string; label: string }) {
//   return (
//     <span className="flex items-center gap-1 rounded-full bg-background/70 backdrop-blur px-2 py-0.5 border border-border">
//       <span className="h-2 w-2 rounded-full" style={{ background: color }} />
//       <span className="text-muted-foreground">{label}</span>
//     </span>
//   );
// }


import { useRef, useState } from "react";
import {
  MousePointer2,
  Link2,
  Trash2,
  RotateCcw,
  Waves,
  Cylinder,
  Fan,
  Diamond,
  Circle,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NodeIcon, IconDefs } from "./network-icons";
import { useNetworkStore } from "@/hooks/useNetwork";
import type { NetworkNode, NodeType, Tool } from "@/types/network";

const statusRing: Record<NetworkNode["status"], string> = {
  ok: "#1f6f4a",
  warn: "#c48a1a",
  alert: "#b02a1a",
};

const TOOLS: {
  id: Tool;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  group: "action" | "add";
}[] = [
  {
    id: "select",
    label: "Select / Move",
    icon: MousePointer2,
    group: "action",
  },
  { id: "connect", label: "Connect (pipe)", icon: Link2, group: "action" },
  { id: "delete", label: "Delete", icon: Trash2, group: "action" },
  { id: "add-reservoir", label: "Reservoir", icon: Waves, group: "add" },
  { id: "add-tank", label: "Tank", icon: Cylinder, group: "add" },
  { id: "add-pump", label: "Pump", icon: Fan, group: "add" },
  { id: "add-valve", label: "Valve", icon: Diamond, group: "add" },
  { id: "add-junction", label: "Junction", icon: Circle, group: "add" },
  { id: "add-consumer", label: "Consumer", icon: Home, group: "add" },
];

function toolToType(t: Tool): NodeType | null {
  if (!t.startsWith("add-")) return null;
  return t.slice(4) as NodeType;
}

export function NetworkMap({
  highlightLeaks = false,
  interactive = true,
  height = 520,
}: {
  highlightLeaks?: boolean;
  interactive?: boolean;
  height?: number;
}) {
  const {
    nodes,
    pipes,
    tool,
    selectedId,
    selectedPipeId,
    connectFrom,
    setTool,
    select,
    selectPipe,
    addNodeAt,
    moveNode,
    deleteNode,
    deletePipe,
    connectNodes,
    setConnectFrom,
    reset,
  } = useNetworkStore();
  // const pipes = useNetwork((s) => s.pipes);
  // const tool = useNetwork((s) => s.tool);
  // const selectedId = useNetwork((s) => s.selectedId);
  // const selectedPipeId = useNetwork((s) => s.selectedPipeId);
  // const connectFrom = useNetwork((s) => s.connectFrom);
  // const setTool = useNetwork((s) => s.setTool);
  // const select = useNetwork((s) => s.select);
  // const selectPipe = useNetwork((s) => s.selectPipe);
  // const addNodeAt = useNetwork((s) => s.addNodeAt);
  // const moveNode = useNetwork((s) => s.moveNode);
  // const deleteNode = useNetwork((s) => s.deleteNode);
  // const deletePipe = useNetwork((s) => s.deletePipe);
  // const connectNodes = useNetwork((s) => s.connectNodes);
  // const setConnectFrom = useNetwork((s) => s.setConnectFrom);
  // const reset = useNetwork((s) => s.reset);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [hover, setHover] = useState<NetworkNode | null>(null);

  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));

  function svgCoords(evt: React.PointerEvent | React.MouseEvent) {
    const svg = svgRef.current;
    if (!svg) return { x: 50, y: 50 };
    const rect = svg.getBoundingClientRect();
    const x = ((evt.clientX - rect.left) / rect.width) * 100;
    const y = ((evt.clientY - rect.top) / rect.height) * 100;
    return { x, y };
  }

  function onCanvasClick(evt: React.MouseEvent) {
    if (!interactive) return;
    if ((evt.target as Element).closest("[data-node-hit]")) return;
    if ((evt.target as Element).closest("[data-pipe-hit]")) return;
    const type = toolToType(tool);
    if (type) {
      const { x, y } = svgCoords(evt);
      addNodeAt(type, x, y);
    } else {
      select(null);
      setConnectFrom(null);
    }
  }

  function onNodePointerDown(evt: React.PointerEvent, n: NetworkNode) {
    if (!interactive) return;
    evt.stopPropagation();
    if (tool === "delete") {
      deleteNode(n.id);
      return;
    }
    if (tool === "connect") {
      if (!connectFrom) setConnectFrom(n.id);
      else {
        connectNodes(connectFrom, n.id);
      }
      return;
    }
    if (tool === "select") {
      select(n.id);
      setDragId(n.id);
      (evt.currentTarget as Element).setPointerCapture(evt.pointerId);
    }
  }

  function onPointerMove(evt: React.PointerEvent) {
    if (!dragId) return;
    const { x, y } = svgCoords(evt);
    moveNode(dragId, x, y);
  }

  function onPointerUp() {
    setDragId(null);
  }

  const addingType = toolToType(tool);
  const cursor =
    tool === "delete"
      ? "not-allowed"
      : addingType
        ? "crosshair"
        : tool === "connect"
          ? "cell"
          : "default";

  return (
    <div className="relative panel-surface overflow-hidden">
      {interactive && (
        <div className="flex flex-wrap items-center gap-1.5 border-b border-border px-3 py-2 bg-panel-2/60 text-xs">
          <span className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mr-2">
            Tools
          </span>
          {TOOLS.filter((t) => t.group === "action").map((t) => (
            <ToolBtn
              key={t.id}
              t={t}
              active={tool === t.id}
              onClick={() => setTool(t.id)}
            />
          ))}
          <span className="mx-1 h-4 w-px bg-border" />
          <span className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mr-1">
            Add
          </span>
          {TOOLS.filter((t) => t.group === "add").map((t) => (
            <ToolBtn
              key={t.id}
              t={t}
              active={tool === t.id}
              onClick={() => setTool(t.id)}
            />
          ))}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-muted-foreground">
              {nodes.length} nodes · {pipes.length} pipes
            </span>
            <button
              onClick={reset}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-panel px-2 py-1 hover:bg-panel-2 transition"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          </div>
        </div>
      )}

      <div className="relative">
        <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
        <svg
          ref={svgRef}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="relative block w-full"
          style={{ height, cursor }}
          onClick={onCanvasClick}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          <IconDefs />
          <defs>
            <linearGradient id="flow" x1="0" x2="1">
              <stop offset="0%" stopColor="#3b82c4" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#2ea38a" stopOpacity="0.85" />
            </linearGradient>
          </defs>

          {/* Pipes */}
          {pipes.map((p) => {
            const a = byId[p.from];
            const b = byId[p.to];
            if (!a || !b) return null;
            const width = Math.max(0.35, Math.min(1.3, p.diameter / 350));
            const isPipeSelected = selectedPipeId === p.id;
            return (
              <g key={p.id}>
                {/* Hit target */}
                <line
                  data-pipe-hit
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke="transparent"
                  strokeWidth={2.5}
                  onClick={(e) => {
                    if (!interactive) return;
                    e.stopPropagation();
                    if (tool === "delete") deletePipe(p.id);
                    else if (tool === "select") selectPipe(p.id);
                  }}
                  style={{
                    cursor: tool === "delete" ? "not-allowed" : "pointer",
                  }}
                />
                {isPipeSelected && (
                  <line
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke="#f59e0b"
                    strokeWidth={width + 0.9}
                    strokeLinecap="round"
                    opacity={0.55}
                    pointerEvents="none"
                  />
                )}
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke="url(#flow)"
                  strokeWidth={width}
                  strokeLinecap="round"
                  opacity={0.9}
                  pointerEvents="none"
                />
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke="#fff"
                  strokeWidth={width * 0.35}
                  strokeLinecap="round"
                  strokeDasharray="0.6 1.4"
                  opacity={0.75}
                  pointerEvents="none"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="0"
                    to="-8"
                    dur={`${Math.max(1.2, 4 - p.velocity)}s`}
                    repeatCount="indefinite"
                  />
                </line>
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((n) => {
            const isLeak = highlightLeaks && (n.leakProb ?? 0) > 0.5;
            const ring = isLeak ? "#b02a1a" : statusRing[n.status];
            const isSelected = selectedId === n.id;
            const isConnectSource = connectFrom === n.id;
            return (
              <g
                key={n.id}
                data-node-hit
                transform={`translate(${n.x} ${n.y})`}
                style={{
                  cursor: interactive
                    ? tool === "delete"
                      ? "not-allowed"
                      : tool === "connect"
                        ? "cell"
                        : "grab"
                    : "pointer",
                }}
                onPointerDown={(e) => onNodePointerDown(e, n)}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(null)}
              >
                {isLeak && (
                  <circle
                    r={3.5}
                    fill="none"
                    stroke="#b02a1a"
                    strokeWidth={0.3}
                  >
                    <animate
                      attributeName="r"
                      from="2"
                      to="5"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      from="0.9"
                      to="0"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
                {(isSelected || isConnectSource) && (
                  <circle
                    r={3.6}
                    fill="none"
                    stroke={isConnectSource ? "#f59e0b" : "#3b82c4"}
                    strokeWidth={0.35}
                    strokeDasharray="0.8 0.6"
                  />
                )}
                <NodeIcon type={n.type} ring={ring} />
                <text
                  y={5.2}
                  textAnchor="middle"
                  fontSize={1.6}
                  fill="currentColor"
                  opacity={0.75}
                  style={{ pointerEvents: "none" }}
                >
                  {n.id}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend / help overlay */}
        {interactive && (
          <div className="absolute left-3 bottom-3 flex flex-wrap gap-1.5 text-[10px]">
            <Legend color="#4aa8d8" label="Reservoir" />
            <Legend color="#9fb6c2" label="Tank" />
            <Legend color="#f2c94c" label="Pump" />
            <Legend color="#b58cd8" label="Valve" />
            <Legend color="#7f8c94" label="Junction" />
            <Legend color="#7dd3a0" label="Consumer" />
          </div>
        )}

        {hover && (
          <div className="absolute right-3 top-3 z-10 rounded-lg border border-border bg-background/95 backdrop-blur px-3 py-2 text-xs shadow-xl pointer-events-none">
            <div className="font-semibold text-foreground">{hover.label}</div>
            <div className="text-muted-foreground capitalize">
              {hover.type} · {hover.id}
            </div>
            <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-0.5">
              <span className="text-muted-foreground">Pressure</span>
              <span className="text-right font-mono">
                {hover.pressure.toFixed(1)} m
              </span>
              {hover.demand != null && (
                <>
                  <span className="text-muted-foreground">Demand</span>
                  <span className="text-right font-mono">
                    {hover.demand} L/s
                  </span>
                </>
              )}
              {hover.level != null && (
                <>
                  <span className="text-muted-foreground">Level</span>
                  <span className="text-right font-mono">{hover.level}%</span>
                </>
              )}
              {hover.leakProb != null && (
                <>
                  <span className="text-muted-foreground">Leak prob.</span>
                  <span className="text-right font-mono">
                    {(hover.leakProb * 100).toFixed(0)}%
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {interactive && tool === "connect" && (
          <div className="absolute right-3 bottom-3 rounded-md bg-primary/10 border border-primary/30 text-primary px-2 py-1 text-[11px]">
            {connectFrom
              ? `Connecting from ${connectFrom} → pick target`
              : "Pick source node"}
          </div>
        )}
      </div>
    </div>
  );
}

function ToolBtn({
  t,
  active,
  onClick,
}: {
  t: {
    id: Tool;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  };
  active: boolean;
  onClick: () => void;
}) {
  const Icon = t.icon;
  return (
    <button
      onClick={onClick}
      title={t.label}
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-1 transition text-[11px]",
        active
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-border bg-panel hover:bg-panel-2 text-muted-foreground",
      )}
    >
      <Icon className="h-3 w-3" />
      <span className="hidden sm:inline">{t.label}</span>
    </button>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1 rounded-full bg-background/70 backdrop-blur px-2 py-0.5 border border-border">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      <span className="text-muted-foreground">{label}</span>
    </span>
  );
}
