import { baseApi } from "../baseApi";

export interface QualityOut {
  id: number; node_ext: string; ts: string;
  chlorine: number | null; turbidity: number | null; ph: number | null; temperature: number | null;
}

export const qualityApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    listQuality: b.query<QualityOut[], { nid: number; limit?: number }>({
      query: ({ nid, limit = 100 }) => `/api/networks/${nid}/quality?limit=${limit}`,
      providesTags: (_r, _e, { nid }) => [{ type: "Quality", id: `LIST-${nid}` }],
    }),
    addQuality: b.mutation<QualityOut, { nid: number; body: Partial<QualityOut> & { node_ext: string } }>({
      query: ({ nid, body }) => ({ url: `/api/networks/${nid}/quality`, method: "POST", body }),
      invalidatesTags: (_r, _e, { nid }) => [{ type: "Quality", id: `LIST-${nid}` }],
    }),
  }),
});

export const { useListQualityQuery, useAddQualityMutation } = qualityApi;
