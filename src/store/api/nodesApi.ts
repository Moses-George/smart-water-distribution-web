import { baseApi } from "../baseApi";

export interface NodeOut {
  id: number;
  ext_id: string;
  type: string;
  label: string;
  x: number;
  y: number;
  pressure: number;
  demand?: number | null;
  level?: number | null;
  rated_kw?: number | null;
  elevation?: number | null;
  leak_prob?: number | null;
  status: string;
}

export const nodesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listNodes: builder.query<NodeOut[], number>({
      query: (nid) => `/api/networks/${nid}/nodes`,
      providesTags: (_r, _e, nid) => [{ type: "Node", id: `LIST-${nid}` }],
    }),
    createNode: builder.mutation<
      NodeOut,
      { nid: number; body: Omit<NodeOut, "id"> }
    >({
      query: ({ nid, body }) => ({
        url: `/api/networks/${nid}/nodes`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { nid }) => [
        { type: "Node", id: `LIST-${nid}` },
      ],
    }),
    patchNode: builder.mutation<
      NodeOut,
      { nid: number; id: number; body: Partial<NodeOut> }
    >({
      query: ({ nid, id, body }) => ({
        url: `/api/networks/${nid}/nodes/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, { nid }) => [
        { type: "Node", id: `LIST-${nid}` },
      ],
    }),
    deleteNode: builder.mutation<void, { nid: number; id: number }>({
      query: ({ nid, id }) => ({
        url: `/api/networks/${nid}/nodes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { nid }) => [
        { type: "Node", id: `LIST-${nid}` },
      ],
    }),
  }),
});

export const {
  useListNodesQuery,
  useCreateNodeMutation,
  usePatchNodeMutation,
  useDeleteNodeMutation,
} = nodesApi;
