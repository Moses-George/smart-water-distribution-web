import { baseApi } from "../baseApi";

export interface AssetHealth {
  id: string;
  type: string;
  rul: number;
  health: number;
  cycles: number;
  note: string;
}
export interface WorkOrderOut {
  id: number;
  asset_id: string;
  title: string;
  priority: string;
  status: string;
  notes: string | null;
  created_at: string;
}

export const maintenanceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    assetHealth: builder.query<AssetHealth[], number>({
      query: (nid) => `/api/networks/${nid}/maintenance/health`,
      providesTags: (_r, _e, nid) => [{ type: "Asset", id: `LIST-${nid}` }],
    }),
    listWorkOrders: builder.query<WorkOrderOut[], number>({
      query: (nid) => `/api/networks/${nid}/maintenance/orders`,
      providesTags: (_r, _e, nid) => [{ type: "WorkOrder", id: `LIST-${nid}` }],
    }),
    createWorkOrder: builder.mutation<
      WorkOrderOut,
      {
        nid: number;
        body: {
          asset_id: string;
          title: string;
          priority?: string;
          notes?: string;
        };
      }
    >({
      query: ({ nid, body }) => ({
        url: `/api/networks/${nid}/maintenance/orders`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { nid }) => [
        { type: "WorkOrder", id: `LIST-${nid}` },
      ],
    }),
    closeWorkOrder: builder.mutation<WorkOrderOut, { nid: number; id: number }>(
      {
        query: ({ nid, id }) => ({
          url: `/api/networks/${nid}/maintenance/orders/${id}/close`,
          method: "PATCH",
        }),
        invalidatesTags: (_r, _e, { nid }) => [
          { type: "WorkOrder", id: `LIST-${nid}` },
        ],
      },
    ),
  }),
});

export const {
  useAssetHealthQuery,
  useListWorkOrdersQuery,
  useCreateWorkOrderMutation,
  useCloseWorkOrderMutation,
} = maintenanceApi;
