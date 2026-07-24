import type { Middleware } from "@reduxjs/toolkit";
import { nodesApi } from "@/store/api/nodesApi";
import { pipesApi } from "@/store/api/pipesApi";
import {
  addNodeAt,
  moveNode,
  updateNode,
  updatePipe,
  deleteNode,
  deletePipe,
  connectNodes,
  setBackendNodeId,
  setBackendPipeId,
} from "@/store/slices/networkSlice";
import type { NetworkNode, NetworkPipe } from "@/types/network";
import type { RootState } from "../rootReducer";
import type { AppDispatch } from "../store";
// import type { RootState, AppDispatch } from "@/store/store";

// Debounce map for high-frequency actions (drag).
const debounce = new Map<string, ReturnType<typeof setTimeout>>();
function debounced(key: string, ms: number, fn: () => void) {
  const prev = debounce.get(key);
  if (prev) clearTimeout(prev);
  debounce.set(
    key,
    setTimeout(() => {
      debounce.delete(key);
      fn();
    }, ms)
  );
}

function nodeToApi(n: NetworkNode) {
  return {
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
  };
}
function pipeToApi(p: NetworkPipe) {
  return {
    ext_id: p.id,
    from_ext: p.from,
    to_ext: p.to,
    diameter: p.diameter,
    flow: p.flow,
    velocity: p.velocity,
    headloss: p.headloss,
    material: p.material,
    age: p.age,
  };
}
function nodePatch(patch: Partial<NetworkNode>) {
  const p: Record<string, unknown> = {};
  if (patch.label !== undefined) p.label = patch.label;
  if (patch.x !== undefined) p.x = patch.x;
  if (patch.y !== undefined) p.y = patch.y;
  if (patch.pressure !== undefined) p.pressure = patch.pressure;
  if (patch.status !== undefined) p.status = patch.status;
  if (patch.demand !== undefined) p.demand = patch.demand;
  if (patch.level !== undefined) p.level = patch.level;
  if (patch.ratedKw !== undefined) p.rated_kw = patch.ratedKw;
  if (patch.elevation !== undefined) p.elevation = patch.elevation;
  if (patch.leakProb !== undefined) p.leak_prob = patch.leakProb;
  return p;
}
function pipePatch(patch: Partial<NetworkPipe>) {
  const p: Record<string, unknown> = {};
  if (patch.diameter !== undefined) p.diameter = patch.diameter;
  if (patch.flow !== undefined) p.flow = patch.flow;
  if (patch.velocity !== undefined) p.velocity = patch.velocity;
  if (patch.headloss !== undefined) p.headloss = patch.headloss;
  if (patch.material !== undefined) p.material = patch.material;
  if (patch.age !== undefined) p.age = patch.age;
  return p;
}

/**
 * Watches network mutations and pushes them to the backend.
 * Local Redux stays the source of truth for optimistic UI; the backend is
 * kept in sync in the background so refreshes / other clients get the changes.
 */
export const networkSyncMiddleware: Middleware<{}, RootState> =
  (store) => (next) => (action) => {
    const result = next(action);
    const state = store.getState();
    const nid = state.networkUi.activeNetworkId;
    if (!nid || !state.network.hydrated) return result;

    const dispatch = store.dispatch as AppDispatch;

    // --- Node create ---
    if (addNodeAt.match(action)) {
      const node = state.network.nodes[state.network.nodes.length - 1];
      if (!node) return result;
      dispatch(
        nodesApi.endpoints.createNode.initiate({ nid, body: nodeToApi(node) as never })
      )
        .unwrap()
        .then((created) => {
          dispatch(setBackendNodeId({ extId: node.id, id: created.id }));
        })
        .catch(() => {/* toast handled elsewhere */});
    }

    // --- Node move (debounced) ---
    if (moveNode.match(action)) {
      const { id } = action.payload;
      const backendId = state.network.backendNodeIds[id];
      if (!backendId) return result;
      debounced(`node-move-${id}`, 400, () => {
        const latest = store.getState().network.nodes.find((n) => n.id === id);
        if (!latest) return;
        dispatch(
          nodesApi.endpoints.patchNode.initiate({
            nid,
            id: backendId,
            body: { x: latest.x, y: latest.y },
          })
        );
      });
    }

    // --- Node update (properties) ---
    if (updateNode.match(action)) {
      const { id, patch } = action.payload;
      const backendId = state.network.backendNodeIds[id];
      if (!backendId) return result;
      debounced(`node-upd-${id}`, 300, () => {
        dispatch(
          nodesApi.endpoints.patchNode.initiate({
            nid,
            id: backendId,
            body: nodePatch(patch),
          })
        );
      });
    }

    // --- Node delete ---
    if (deleteNode.match(action)) {
      const extId = action.payload;
      // action ran before this middleware step? No — next() already ran; the
      // node is already removed from local state, but backendNodeIds map still
      // holds the id (we intentionally do not clear it in the reducer so we
      // can DELETE here).
      const backendId = state.network.backendNodeIds[extId];
      if (backendId) {
        dispatch(nodesApi.endpoints.deleteNode.initiate({ nid, id: backendId }));
      }
    }

    // --- Pipe create via connectNodes ---
    if (connectNodes.match(action)) {
      const pipe = state.network.pipes[state.network.pipes.length - 1];
      if (!pipe) return result;
      // only sync if it was actually added (connectNodes may be a no-op)
      if (state.network.backendPipeIds[pipe.id]) return result;
      dispatch(
        pipesApi.endpoints.createPipe.initiate({ nid, body: pipeToApi(pipe) as never })
      )
        .unwrap()
        .then((created) => {
          dispatch(setBackendPipeId({ extId: pipe.id, id: created.id }));
        })
        .catch(() => {});
    }

    // --- Pipe update ---
    if (updatePipe.match(action)) {
      const { id, patch } = action.payload;
      const backendId = state.network.backendPipeIds[id];
      if (!backendId) return result;
      debounced(`pipe-upd-${id}`, 300, () => {
        dispatch(
          pipesApi.endpoints.patchPipe.initiate({
            nid,
            id: backendId,
            body: pipePatch(patch),
          })
        );
      });
    }

    // --- Pipe delete ---
    if (deletePipe.match(action)) {
      const extId = action.payload;
      const backendId = state.network.backendPipeIds[extId];
      if (backendId) {
        dispatch(pipesApi.endpoints.deletePipe.initiate({ nid, id: backendId }));
      }
    }

    return result;
  };
