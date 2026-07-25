import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { NetworkNode, NetworkPipe } from "@/types/network";

export type AuditKind =
  | "add-node"
  | "move-node"
  | "update-node"
  | "delete-node"
  | "connect-pipe"
  | "update-pipe"
  | "delete-pipe"
  | "scenario"
  | "reset";

export interface Snapshot {
  nodes: NetworkNode[];
  pipes: NetworkPipe[];
}

export interface AuditEntry {
  id: string;
  ts: number;
  kind: AuditKind;
  description: string;
  before: Snapshot;
  after: Snapshot;
  targetId?: string;
  /** Set true when the backend rejected the mutation and the local state was rolled back. */
  rolledBack?: boolean;
  /** Server-reported reason for the rollback. */
  rolledBackReason?: string;
}

interface AuditNetworkState {
  entries: AuditEntry[];
  /** cursor points at the entry that was most recently applied. -1 = at base. */
  cursor: number;
}

interface AuditState {
  byNetwork: Record<number, AuditNetworkState>;
}

const initialState: AuditState = { byNetwork: {} };

function ensure(state: AuditState, nid: number): AuditNetworkState {
  if (!state.byNetwork[nid]) state.byNetwork[nid] = { entries: [], cursor: -1 };
  return state.byNetwork[nid];
}

const slice = createSlice({
  name: "audit",
  initialState,
  reducers: {
    record: (
      state,
      action: PayloadAction<{ nid: number; entry: AuditEntry }>,
    ) => {
      const bucket = ensure(state, action.payload.nid);
      // Drop any redo tail
      bucket.entries = bucket.entries.slice(0, bucket.cursor + 1);
      bucket.entries.push(action.payload.entry);
      if (bucket.entries.length > 200) {
        bucket.entries.splice(0, bucket.entries.length - 200);
      }
      bucket.cursor = bucket.entries.length - 1;
    },
    /**
     * Mark the most recent entry for the given target as rolled back and
     * move the cursor back one step so undo/redo stays consistent.
     */
    markRolledBack: (
      state,
      action: PayloadAction<{ nid: number; entryId?: string; reason: string }>,
    ) => {
      const bucket = ensure(state, action.payload.nid);
      const idx = action.payload.entryId
        ? bucket.entries.findIndex((e) => e.id === action.payload.entryId)
        : bucket.entries.length - 1;
      if (idx < 0) return;
      const entry = bucket.entries[idx];
      entry.rolledBack = true;
      entry.rolledBackReason = action.payload.reason;
      if (bucket.cursor >= idx) bucket.cursor = idx - 1;
    },
    setCursor: (
      state,
      action: PayloadAction<{ nid: number; cursor: number }>,
    ) => {
      const bucket = ensure(state, action.payload.nid);
      bucket.cursor = Math.max(
        -1,
        Math.min(bucket.entries.length - 1, action.payload.cursor),
      );
    },
    clearNetwork: (state, action: PayloadAction<number>) => {
      delete state.byNetwork[action.payload];
    },
  },
});

export const { record, markRolledBack, setCursor, clearNetwork } =
  slice.actions;
export default slice.reducer;
