import { baseApi } from "../baseApi";

export interface ScenarioOut {
  id: number;
  name: string;
  kind: string;
  params: Record<string, unknown> | null;
  baseline_metrics: Record<string, number> | null;
  scenario_metrics: Record<string, number> | null;
  created_at: string;
}

export const scenariosApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listScenarios: builder.query<ScenarioOut[], number>({
      query: (nid) => `/api/networks/${nid}/scenarios`,
      providesTags: (_r, _e, nid) => [{ type: "Scenario", id: `LIST-${nid}` }],
    }),
    runScenario: builder.mutation<
      ScenarioOut,
      {
        nid: number;
        body: { name: string; kind: string; params?: Record<string, unknown> };
      }
    >({
      query: ({ nid, body }) => ({
        url: `/api/networks/${nid}/scenarios/run`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { nid }) => [
        { type: "Scenario", id: `LIST-${nid}` },
      ],
    }),
    deleteScenario: builder.mutation<void, { nid: number; id: number }>({
      query: ({ nid, id }) => ({
        url: `/api/networks/${nid}/scenarios/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { nid }) => [
        { type: "Scenario", id: `LIST-${nid}` },
      ],
    }),
  }),
});

export const {
  useListScenariosQuery,
  useRunScenarioMutation,
  useDeleteScenarioMutation,
} = scenariosApi;
