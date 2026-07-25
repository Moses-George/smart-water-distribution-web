import { baseApi } from "../baseApi";
import type { NodeOut } from "./nodesApi";
import type { PipeOut } from "./pipesApi";

export interface TopologySnapshot {
  nodes: Array<{
    ext_id: string;
    type: string;
    label: string;
    x: number;
    y: number;
    pressure: number;
    status: string;
    demand?: number | null;
    level?: number | null;
    rated_kw?: number | null;
    elevation?: number | null;
    leak_prob?: number | null;
  }>;
  pipes: Array<{
    ext_id: string;
    from_ext: string;
    to_ext: string;
    diameter: number;
    flow: number;
    velocity: number;
    headloss: number;
    material: string;
    age: number;
  }>;
}

export interface ValidationIssue {
  severity: "error" | "warning";
  code: string;
  message: string;
  /** Where the issue lives so the UI can highlight / navigate to it. */
  location: {
    kind: "node" | "pipe" | "graph";
    ext_id?: string;
    ext_ids?: string[];
    x?: number;
    y?: number;
  };
  hint?: string;
}

export interface ValidationReport {
  network_id: number;
  ok: boolean;
  node_count: number;
  pipe_count: number;
  issues: ValidationIssue[];
}

export const topologyApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    replaceTopology: b.mutation<
      { nodes: NodeOut[]; pipes: PipeOut[] },
      { nid: number; body: TopologySnapshot }
    >({
      query: ({ nid, body }) => ({
        url: `/api/networks/${nid}/topology/replace`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { nid }) => [
        { type: "Node", id: `LIST-${nid}` },
        { type: "Pipe", id: `LIST-${nid}` },
      ],
    }),
    /** Full integrity check against the persisted topology. */
    validateTopology: b.query<ValidationReport, number>({
      query: (nid) => `/api/networks/${nid}/topology/validate`,
    }),
    /** Dry-run integrity check against a candidate snapshot (no persist). */
    validateSnapshot: b.mutation<
      ValidationReport,
      { nid: number; body: TopologySnapshot }
    >({
      query: ({ nid, body }) => ({
        url: `/api/networks/${nid}/topology/validate`,
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useReplaceTopologyMutation,
  useValidateTopologyQuery,
  useLazyValidateTopologyQuery,
  useValidateSnapshotMutation,
} = topologyApi;
