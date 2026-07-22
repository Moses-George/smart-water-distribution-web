import { baseApi } from "../baseApi";

export interface HourSchedule { hour: number; tariff: number; pump_kw: number; duty: number }
export interface ScheduleOut {
  schedule: HourSchedule[];
  daily_kwh: number; daily_cost: number;
  baseline_cost: number; savings: number; co2_kg: number;
}

export const energyApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    optimizeSchedule: b.mutation<ScheduleOut, number>({
      query: (nid) => ({ url: `/api/networks/${nid}/energy/optimize`, method: "POST" }),
      invalidatesTags: ["Energy"],
    }),
  }),
});

export const { useOptimizeScheduleMutation } = energyApi;
