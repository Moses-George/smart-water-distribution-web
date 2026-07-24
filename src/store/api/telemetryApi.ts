import { baseApi } from "../baseApi";

export interface TelemetryOut {
  id: number;
  node_ext: string;
  metric: string;
  value: number;
  ts: string;
}

export const telemetryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    recentTelemetry: builder.query<
      TelemetryOut[],
      { nid: number; limit?: number }
    >({
      query: ({ nid, limit = 200 }) =>
        `/api/networks/${nid}/telemetry?limit=${limit}`,
      providesTags: (_r, _e, { nid }) => [
        { type: "Telemetry", id: `LIST-${nid}` },
      ],
    }),
    ingestTelemetry: builder.mutation<
      TelemetryOut,
      { nid: number; body: { node_ext: string; metric: string; value: number } }
    >({
      query: ({ nid, body }) => ({
        url: `/api/networks/${nid}/telemetry`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { nid }) => [
        { type: "Telemetry", id: `LIST-${nid}` },
      ],
    }),
  }),
});

export const { useRecentTelemetryQuery, useIngestTelemetryMutation } =
  telemetryApi;
