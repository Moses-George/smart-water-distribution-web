import { baseApi } from "../baseApi";

export interface LeakOut {
  node_ext: string;
  prob: number;
  zone: string;
  severity: string;
}
export interface LeaksResponse {
  leaks: LeakOut[];
  updated_nodes: number;
}

export const leaksApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    detectLeaks: builder.mutation<LeaksResponse, number>({
      query: (nid) => ({
        url: `/api/networks/${nid}/leaks/detect`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, nid) => [
        { type: "Node", id: `LIST-${nid}` },
        "Leak",
      ],
    }),
  }),
});

export const { useDetectLeaksMutation } = leaksApi;
