import { baseApi } from "../baseApi";

export interface ForecastPoint { t: string; actual: number | null; forecast: number; lower: number; upper: number }
export interface ForecastOut { horizon: string; points: ForecastPoint[] }

export const forecastApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    hourlyForecast: b.query<ForecastOut, number>({
      query: (nid) => `/api/networks/${nid}/forecast/hourly`,
      providesTags: (_r, _e, nid) => [{ type: "Forecast", id: `H-${nid}` }],
    }),
    weeklyForecast: b.query<ForecastOut, number>({
      query: (nid) => `/api/networks/${nid}/forecast/weekly`,
      providesTags: (_r, _e, nid) => [{ type: "Forecast", id: `W-${nid}` }],
    }),
  }),
});

export const { useHourlyForecastQuery, useWeeklyForecastQuery } = forecastApi;
