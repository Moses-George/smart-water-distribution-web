import type { Middleware } from "@reduxjs/toolkit";
import {
  addNodeAt,
  moveNode,
  updateNode,
  updatePipe,
  deleteNode,
  deletePipe,
  connectNodes,
  reset,
} from "@/store/slices/networkSlice";
import {
  record,
  type AuditKind,
  type Snapshot,
} from "@/store/slices/auditSlice";
import type { AppDispatch } from "@/store/store";
import type { RootState } from "../rootReducer";

// Debounce moves so drags produce one entry per gesture.
const moveTimers = new Map<string, ReturnType<typeof setTimeout>>();
const moveOrigins = new Map<string, Snapshot>();

function snap(state: RootState): Snapshot {
  return {
    nodes: state.network.nodes.map((n) => ({ ...n })),
    pipes: state.network.pipes.map((p) => ({ ...p })),
  };
}

function push(
  store: { getState: () => RootState; dispatch: AppDispatch },
  nid: number,
  kind: AuditKind,
  description: string,
  before: Snapshot,
  targetId?: string,
) {
  store.dispatch(
    record({
      nid,
      entry: {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        ts: Date.now(),
        kind,
        description,
        before,
        after: snap(store.getState()),
        targetId,
      },
    }),
  );
}

export const auditMiddleware: Middleware<{}, RootState> =
  (store) => (next) => (action) => {
    const before = snap(store.getState());
    const result = next(action);
    const state = store.getState();
    const nid = state.networkUi.activeNetworkId;
    if (!nid || !state.network.hydrated) return result;

    if (addNodeAt.match(action)) {
      const node = state.network.nodes[state.network.nodes.length - 1];
      push(
        store,
        nid,
        "add-node",
        `Add ${node?.type} ${node?.id}`,
        before,
        node?.id,
      );
    } else if (moveNode.match(action)) {
      const id = action.payload.id;
      if (!moveOrigins.has(id)) moveOrigins.set(id, before);
      const prev = moveTimers.get(id);
      if (prev) clearTimeout(prev);
      moveTimers.set(
        id,
        setTimeout(() => {
          const origin = moveOrigins.get(id)!;
          moveTimers.delete(id);
          moveOrigins.delete(id);
          push(store, nid, "move-node", `Move node ${id}`, origin, id);
        }, 500),
      );
    } else if (updateNode.match(action)) {
      const id = action.payload.id;
      push(store, nid, "update-node", `Edit node ${id}`, before, id);
    } else if (updatePipe.match(action)) {
      const id = action.payload.id;
      push(store, nid, "update-pipe", `Edit pipe ${id}`, before, id);
    } else if (deleteNode.match(action)) {
      push(
        store,
        nid,
        "delete-node",
        `Delete node ${action.payload}`,
        before,
        action.payload,
      );
    } else if (deletePipe.match(action)) {
      push(
        store,
        nid,
        "delete-pipe",
        `Delete pipe ${action.payload}`,
        before,
        action.payload,
      );
    } else if (connectNodes.match(action)) {
      const pipe = state.network.pipes[state.network.pipes.length - 1];
      const beforePipes = before.pipes.length;
      if (state.network.pipes.length > beforePipes) {
        push(
          store,
          nid,
          "connect-pipe",
          `Connect ${action.payload.from} → ${action.payload.to}`,
          before,
          pipe?.id,
        );
      }
    } else if (reset.match(action)) {
      push(store, nid, "reset", "Reset network to demo", before);
    }
    return result;
  };
