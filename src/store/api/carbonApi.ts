import { baseApi } from "../baseApi";

export interface CarbonOut {
  kwh_today: number;
  kg_co2_today: number;
  grid_factor: number;
  trend_7d: number[];
}

export const carbonApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    carbon: b.query<CarbonOut, number>({
      query: (nid) => `/api/networks/${nid}/carbon`,
      providesTags: (_r, _e, nid) => [{ type: "Carbon", id: `${nid}` }],
    }),
  }),
});

export const { useCarbonQuery } = carbonApi;
