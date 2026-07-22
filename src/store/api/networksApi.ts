import { baseApi } from "../baseApi";

export interface NetworkOut { id: number; name: string; created_at: string }

export const networksApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    listNetworks: b.query<NetworkOut[], void>({
      query: () => "/api/networks",
      providesTags: (r) => r ? [...r.map((n) => ({ type: "Network" as const, id: n.id })), { type: "Network" as const, id: "LIST" }] : [{ type: "Network", id: "LIST" }],
    }),
    createNetwork: b.mutation<NetworkOut, { name: string }>({
      query: (body) => ({ url: "/api/networks", method: "POST", body }),
      invalidatesTags: [{ type: "Network", id: "LIST" }],
    }),
    exportNetwork: b.query<unknown, number>({ query: (id) => `/api/networks/${id}/export` }),
    deleteNetwork: b.mutation<void, number>({
      query: (id) => ({ url: `/api/networks/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Network", id: "LIST" }],
    }),
  }),
});

export const { useListNetworksQuery, useCreateNetworkMutation, useLazyExportNetworkQuery, useDeleteNetworkMutation } = networksApi;
