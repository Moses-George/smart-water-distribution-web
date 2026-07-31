// import { NODES, PIPES, HOURLY } from "@/lib/network-data";
// import type { NetworkNode, NetworkPipe, Tool, ScheduleResult, LeakResult, ScenarioResult, ScenarioId, NodeType } from "@/types/network";
// import { computeSchedule, detectLeaks, applyScenario, metricsFor } from "@/utils/networkAlgorithms";
// import { nextId, defaults } from "@/utils/networkHelpers";
// import { createSlice, type PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";

// export interface NetworkState {
//   nodes: NetworkNode[];
//   pipes: NetworkPipe[];
//   tool: Tool;
//   selectedId: string | null;
//   selectedPipeId: string | null;
//   connectFrom: string | null;
//   scheduleResult: ScheduleResult | null;
//   leakResult: LeakResult | null;
//   scenarioResult: ScenarioResult | null;
// }

// const initialState: NetworkState = {
//   nodes: NODES.map((n) => ({
//     ...n,
//     ...(n.type === "pump" && n.ratedKw == null ? { ratedKw: 280 } : {}),
//   })),
//   pipes: PIPES.map((p) => ({ ...p })),
//   tool: "select",
//   selectedId: null,
//   selectedPipeId: null,
//   connectFrom: null,
//   scheduleResult: null,
//   leakResult: null,
//   scenarioResult: null,
// };

// // Async thunks
// export const optimizeSchedule = createAsyncThunk(
//   "network/optimizeSchedule",
//   async (_, { getState }) => {
//     const state = getState() as { network: NetworkState };
//     return computeSchedule(state.network.nodes);
//   }
// );

// export const runLeakDetection = createAsyncThunk(
//   "network/runLeakDetection",
//   async (_, { getState }) => {
//     const state = getState() as { network: NetworkState };
//     const { nodes, pipes } = state.network;
//     const { perNode, updated } = detectLeaks(nodes, pipes);
//     const criticals = perNode.filter((r) => r.prob > 0.7).length;
//     const beforeMap = new Map(nodes.map((n) => [n.id, n.leakProb ?? 0]));
//     const changed = updated.filter(
//       (n) => Math.abs((n.leakProb ?? 0) - (beforeMap.get(n.id) ?? 0)) > 0.05
//     ).length;
//     return {
//       nodes: updated,
//       leakResult: { perNode, updatedNodes: changed, criticals, ranAt: Date.now() },
//     };
//   }
// );

// export const runScenario = createAsyncThunk(
//   "network/runScenario",
//   async (id: ScenarioId, { getState }) => {
//     const state = getState() as { network: NetworkState };
//     const { nodes, pipes } = state.network;
//     const labels: Record<ScenarioId, string> = {
//       pop: "Population +30%",
//       pump: "Pump failure",
//       burst: "Pipe burst",
//       res: "New reservoir",
//       solar: "Solar pumping 60%",
//     };
//     const applied = applyScenario(id, nodes, pipes);
//     const baseline = metricsFor(nodes, pipes, 1, 1);
//     const scenario = metricsFor(
//       applied.nodes,
//       applied.pipes,
//       applied.demandMul,
//       applied.energyMul
//     );
//     const compare = HOURLY.map((h) => ({
//       hour: h.hour,
//       baseline: +h.demand.toFixed(2),
//       scenario: +(
//         h.demand * applied.demandMul +
//         (id === "burst" && parseInt(h.hour) >= 10 && parseInt(h.hour) <= 14 ? 12 : 0)
//       ).toFixed(2),
//     }));
//     return {
//       scenarioResult: {
//         id,
//         label: labels[id],
//         baseline,
//         scenario,
//         compare,
//         scenarioNodes: applied.nodes,
//         scenarioPipes: applied.pipes,
//         ranAt: Date.now(),
//       },
//     };
//   }
// );

// const networkSlice = createSlice({
//   name: "network",
//   initialState,
//   reducers: {
//     setTool: (state, action: PayloadAction<Tool>) => {
//       state.tool = action.payload;
//       state.connectFrom = null;
//       state.selectedId = null;
//       state.selectedPipeId = null;
//     },
//     select: (state, action: PayloadAction<string | null>) => {
//       state.selectedId = action.payload;
//       if (action.payload !== null) {
//         state.selectedPipeId = null;
//       }
//     },
//     selectPipe: (state, action: PayloadAction<string | null>) => {
//       state.selectedPipeId = action.payload;
//       if (action.payload !== null) {
//         state.selectedId = null;
//       }
//     },
//     addNodeAt: {
//       reducer: (state, action: PayloadAction<{ type: NodeType; x: number; y: number }>) => {
//         const { type, x, y } = action.payload;
//         const id = nextId(state.nodes, type);
//         const label = `${type[0].toUpperCase()}${type.slice(1)} ${id}`;
//         const node: NetworkNode = {
//           id,
//           type,
//           label,
//           x,
//           y,
//           pressure: 40,
//           status: "ok",
//           ...defaults[type],
//         } as NetworkNode;
//         state.nodes.push(node);
//         state.selectedId = id;
//         state.selectedPipeId = null;
//       },
//       prepare: (type: NodeType, x: number, y: number) => ({
//         payload: { type, x, y },
//       }),
//     },
//     moveNode: (state, action: PayloadAction<{ id: string; x: number; y: number }>) => {
//       const { id, x, y } = action.payload;
//       const node = state.nodes.find((n) => n.id === id);
//       if (node) {
//         node.x = Math.max(2, Math.min(98, x));
//         node.y = Math.max(2, Math.min(98, y));
//       }
//     },
//     updateNode: (state, action: PayloadAction<{ id: string; patch: Partial<NetworkNode> }>) => {
//       const { id, patch } = action.payload;
//       const node = state.nodes.find((n) => n.id === id);
//       if (node) {
//         Object.assign(node, patch);
//       }
//     },
//     updatePipe: (state, action: PayloadAction<{ id: string; patch: Partial<NetworkPipe> }>) => {
//       const { id, patch } = action.payload;
//       const pipe = state.pipes.find((p) => p.id === id);
//       if (pipe) {
//         Object.assign(pipe, patch);
//       }
//     },
//     deleteNode: (state, action: PayloadAction<string>) => {
//       const id = action.payload;
//       state.nodes = state.nodes.filter((n) => n.id !== id);
//       state.pipes = state.pipes.filter((p) => p.from !== id && p.to !== id);
//       state.selectedId = null;
//     },
//     deletePipe: (state, action: PayloadAction<string>) => {
//       const id = action.payload;
//       state.pipes = state.pipes.filter((p) => p.id !== id);
//       state.selectedPipeId = null;
//     },
//     connectNodes: (state, action: PayloadAction<{ from: string; to: string }>) => {
//       const { from, to } = action.payload;
//       if (from === to) return;
//       if (
//         state.pipes.some(
//           (p) => (p.from === from && p.to === to) || (p.from === to && p.to === from)
//         )
//       ) {
//         return;
//       }
//       let i = 1;
//       while (state.pipes.some((p) => p.id === `PP${i}`)) i++;
//       const pipe: NetworkPipe = {
//         id: `PP${i}`,
//         from,
//         to,
//         diameter: 250,
//         flow: 20,
//         velocity: 0.8,
//         headloss: 2.0,
//         material: "PVC",
//         age: 1,
//       };
//       state.pipes.push(pipe);
//       state.connectFrom = null;
//     },
//     setConnectFrom: (state, action: PayloadAction<string | null>) => {
//       state.connectFrom = action.payload;
//     },
//     reset: (state) => {
//       state.nodes = NODES.map((n) => ({
//         ...n,
//         ...(n.type === "pump" && n.ratedKw == null ? { ratedKw: 280 } : {}),
//       }));
//       state.pipes = PIPES.map((p) => ({ ...p }));
//       state.selectedId = null;
//       state.selectedPipeId = null;
//       state.connectFrom = null;
//       state.scheduleResult = null;
//       state.leakResult = null;
//       state.scenarioResult = null;
//     },
//     clear: (state) => {
//       state.nodes = [];
//       state.pipes = [];
//       state.selectedId = null;
//       state.selectedPipeId = null;
//       state.connectFrom = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(optimizeSchedule.fulfilled, (state, action) => {
//         state.scheduleResult = action.payload;
//       })
//       .addCase(runLeakDetection.fulfilled, (state, action) => {
//         state.nodes = action.payload.nodes;
//         state.leakResult = action.payload.leakResult;
//       })
//       .addCase(runScenario.fulfilled, (state, action) => {
//         state.scenarioResult = action.payload.scenarioResult;
//       });
//   },
// });

// export const {
//   setTool,
//   select,
//   selectPipe,
//   addNodeAt,
//   moveNode,
//   updateNode,
//   updatePipe,
//   deleteNode,
//   deletePipe,
//   connectNodes,
//   setConnectFrom,
//   reset,
//   clear,
// } = networkSlice.actions;

// export default networkSlice.reducer;




import { NODES, PIPES, HOURLY } from "@/lib/network-data";
import type {
  NetworkNode,
  NetworkPipe,
  Tool,
  ScheduleResult,
  LeakResult,
  ScenarioResult,
  ScenarioId,
  NodeType,
} from "@/types/network";
import type { NodeOut } from "@/store/api/nodesApi";
import type { PipeOut } from "@/store/api/pipesApi";
import {
  computeSchedule,
  detectLeaks,
  applyScenario,
  metricsFor,
} from "@/utils/networkAlgorithms";
import { nextId, defaults } from "@/utils/networkHelpers";
import { createSlice, type PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";

export interface NetworkState {
  nodes: NetworkNode[];
  pipes: NetworkPipe[];
  /** ext_id -> backend numeric id (for PATCH/DELETE). */
  backendNodeIds: Record<string, number>;
  backendPipeIds: Record<string, number>;
  tool: Tool;
  selectedId: string | null;
  selectedPipeId: string | null;
  connectFrom: string | null;
  scheduleResult: ScheduleResult | null;
  leakResult: LeakResult | null;
  scenarioResult: ScenarioResult | null;
  hydrated: boolean;
}

const initialState: NetworkState = {
  nodes: [],
  pipes: [],
  backendNodeIds: {},
  backendPipeIds: {},
  tool: "select",
  selectedId: null,
  selectedPipeId: null,
  connectFrom: null,
  scheduleResult: null,
  leakResult: null,
  scenarioResult: null,
  hydrated: false,
};

// --- helpers to convert backend <-> frontend ------------------------------
export function nodeFromApi(n: NodeOut): NetworkNode {
  return {
    id: n.ext_id,
    type: n.type as NodeType,
    label: n.label,
    x: n.x,
    y: n.y,
    pressure: n.pressure,
    status: (n.status as NetworkNode["status"]) ?? "ok",
    demand: n.demand ?? undefined,
    level: n.level ?? undefined,
    ratedKw: n.rated_kw ?? undefined,
    elevation: n.elevation ?? undefined,
    leakProb: n.leak_prob ?? undefined,
  };
}
export function pipeFromApi(p: PipeOut): NetworkPipe {
  return {
    id: p.ext_id,
    from: p.from_ext,
    to: p.to_ext,
    diameter: p.diameter,
    flow: p.flow,
    velocity: p.velocity,
    headloss: p.headloss,
    material: (p.material as NetworkPipe["material"]) ?? "PVC",
    age: p.age,
  };
}

// Async thunks (client-side compute; still used for instant UX/fallback)
export const optimizeSchedule = createAsyncThunk(
  "network/optimizeSchedule",
  async (_, { getState }) => {
    const state = getState() as { network: NetworkState };
    return computeSchedule(state.network.nodes);
  }
);

export const runLeakDetection = createAsyncThunk(
  "network/runLeakDetection",
  async (_, { getState }) => {
    const state = getState() as { network: NetworkState };
    const { nodes, pipes } = state.network;
    const { perNode, updated } = detectLeaks(nodes, pipes);
    const criticals = perNode.filter((r) => r.prob > 0.7).length;
    const beforeMap = new Map(nodes.map((n) => [n.id, n.leakProb ?? 0]));
    const changed = updated.filter(
      (n) => Math.abs((n.leakProb ?? 0) - (beforeMap.get(n.id) ?? 0)) > 0.05
    ).length;
    return {
      nodes: updated,
      leakResult: { perNode, updatedNodes: changed, criticals, ranAt: Date.now() },
    };
  }
);

export const runScenario = createAsyncThunk(
  "network/runScenario",
  async (id: ScenarioId, { getState }) => {
    const state = getState() as { network: NetworkState };
    const { nodes, pipes } = state.network;
    const labels: Record<ScenarioId, string> = {
      pop: "Population +30%",
      pump: "Pump failure",
      burst: "Pipe burst",
      res: "New reservoir",
      solar: "Solar pumping 60%",
    };
    const applied = applyScenario(id, nodes, pipes);
    const baseline = metricsFor(nodes, pipes, 1, 1);
    const scenario = metricsFor(
      applied.nodes,
      applied.pipes,
      applied.demandMul,
      applied.energyMul
    );
    const compare = HOURLY.map((h) => ({
      hour: h.hour,
      baseline: +h.demand.toFixed(2),
      scenario: +(
        h.demand * applied.demandMul +
        (id === "burst" && parseInt(h.hour) >= 10 && parseInt(h.hour) <= 14 ? 12 : 0)
      ).toFixed(2),
    }));
    return {
      scenarioResult: {
        id,
        label: labels[id],
        baseline,
        scenario,
        compare,
        scenarioNodes: applied.nodes,
        scenarioPipes: applied.pipes,
        ranAt: Date.now(),
      },
    };
  }
);

const networkSlice = createSlice({
  name: "network",
  initialState,
  reducers: {
    /** Replace local state with fresh data from backend. */
    hydrateNetwork: (
      state,
      action: PayloadAction<{ nodes: NodeOut[]; pipes: PipeOut[] }>
    ) => {
      const { nodes, pipes } = action.payload;
      state.nodes = nodes.map(nodeFromApi);
      state.pipes = pipes.map(pipeFromApi);
      state.backendNodeIds = Object.fromEntries(nodes.map((n) => [n.ext_id, n.id]));
      state.backendPipeIds = Object.fromEntries(pipes.map((p) => [p.ext_id, p.id]));
      state.hydrated = true;
      state.selectedId = null;
      state.selectedPipeId = null;
      state.connectFrom = null;
    },
    /** Populate with static demo data (used when running fully offline). */
    seedDemo: (state) => {
      state.nodes = NODES.map((n) => ({
        ...n,
        ...(n.type === "pump" && n.ratedKw == null ? { ratedKw: 280 } : {}),
      }));
      state.pipes = PIPES.map((p) => ({ ...p }));
      state.hydrated = true;
    },
    setBackendNodeId: (state, action: PayloadAction<{ extId: string; id: number }>) => {
      state.backendNodeIds[action.payload.extId] = action.payload.id;
    },
    setBackendPipeId: (state, action: PayloadAction<{ extId: string; id: number }>) => {
      state.backendPipeIds[action.payload.extId] = action.payload.id;
    },
    setTool: (state, action: PayloadAction<Tool>) => {
      state.tool = action.payload;
      state.connectFrom = null;
      state.selectedId = null;
      state.selectedPipeId = null;
    },
    select: (state, action: PayloadAction<string | null>) => {
      state.selectedId = action.payload;
      if (action.payload !== null) state.selectedPipeId = null;
    },
    selectPipe: (state, action: PayloadAction<string | null>) => {
      state.selectedPipeId = action.payload;
      if (action.payload !== null) state.selectedId = null;
    },
    addNodeAt: {
      reducer: (state, action: PayloadAction<{ type: NodeType; x: number; y: number }>) => {
        const { type, x, y } = action.payload;
        const id = nextId(state.nodes, type);
        const label = `${type[0].toUpperCase()}${type.slice(1)} ${id}`;
        const node: NetworkNode = {
          id,
          type,
          label,
          x,
          y,
          pressure: 40,
          status: "ok",
          ...defaults[type],
        } as NetworkNode;
        state.nodes.push(node);
        state.selectedId = id;
        state.selectedPipeId = null;
      }, 
      prepare: (type: NodeType, x: number, y: number) => ({ payload: { type, x, y } }),
    },
    moveNode: (state, action: PayloadAction<{ id: string; x: number; y: number }>) => {
      const { id, x, y } = action.payload;
      const node = state.nodes.find((n) => n.id === id);
      if (node) {
        node.x = Math.max(2, Math.min(98, x));
        node.y = Math.max(2, Math.min(98, y));
      }
    },
    updateNode: (state, action: PayloadAction<{ id: string; patch: Partial<NetworkNode> }>) => {
      const { id, patch } = action.payload;
      const node = state.nodes.find((n) => n.id === id);
      if (node) Object.assign(node, patch);
    },
    updatePipe: (state, action: PayloadAction<{ id: string; patch: Partial<NetworkPipe> }>) => {
      const { id, patch } = action.payload;
      const pipe = state.pipes.find((p) => p.id === id);
      if (pipe) Object.assign(pipe, patch);
    },
    deleteNode: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.nodes = state.nodes.filter((n) => n.id !== id);
      state.pipes = state.pipes.filter((p) => p.from !== id && p.to !== id);
      state.selectedId = null;
    },
    deletePipe: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.pipes = state.pipes.filter((p) => p.id !== id);
      state.selectedPipeId = null;
    },
    connectNodes: (state, action: PayloadAction<{ from: string; to: string }>) => {
      const { from, to } = action.payload;
      if (from === to) return;
      if (
        state.pipes.some(
          (p) => (p.from === from && p.to === to) || (p.from === to && p.to === from)
        )
      ) return;
      let i = 1;
      while (state.pipes.some((p) => p.id === `PP${i}`)) i++;
      const pipe: NetworkPipe = {
        id: `PP${i}`,
        from,
        to,
        diameter: 250,
        flow: 20,
        velocity: 0.8,
        headloss: 2.0,
        material: "PVC",
        age: 1,
      };
      state.pipes.push(pipe);
      state.connectFrom = null;
    },
    setConnectFrom: (state, action: PayloadAction<string | null>) => {
      state.connectFrom = action.payload;
    },
    reset: (state) => {
      state.nodes = NODES.map((n) => ({
        ...n,
        ...(n.type === "pump" && n.ratedKw == null ? { ratedKw: 280 } : {}),
      }));
      state.pipes = PIPES.map((p) => ({ ...p }));
      state.selectedId = null;
      state.selectedPipeId = null;
      state.connectFrom = null;
      state.scheduleResult = null;
      state.leakResult = null;
      state.scenarioResult = null;
    },
    clear: (state) => {
      state.nodes = [];
      state.pipes = [];
      state.backendNodeIds = {};
      state.backendPipeIds = {};
      state.selectedId = null;
      state.selectedPipeId = null;
      state.connectFrom = null;
      state.scheduleResult = null;
      state.leakResult = null;
      state.scenarioResult = null;
      state.hydrated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(optimizeSchedule.fulfilled, (state, action) => {
        state.scheduleResult = action.payload;
      })
      .addCase(runLeakDetection.fulfilled, (state, action) => {
        state.nodes = action.payload.nodes;
        state.leakResult = action.payload.leakResult;
      })
      .addCase(runScenario.fulfilled, (state, action) => {
        state.scenarioResult = action.payload.scenarioResult;
      });
  },
});

export const {
  hydrateNetwork,
  seedDemo,
  setBackendNodeId,
  setBackendPipeId,
  setTool,
  select,
  selectPipe,
  addNodeAt,
  moveNode,
  updateNode,
  updatePipe,
  deleteNode,
  deletePipe,
  connectNodes,
  setConnectFrom,
  reset,
  clear,
} = networkSlice.actions;

export default networkSlice.reducer;