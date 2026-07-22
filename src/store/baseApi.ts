import { createApi, fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import type { RootState } from "./store";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: (typeof window !== "undefined" && (window as unknown as { __API_BASE__?: string }).__API_BASE__) || "http://localhost:8000",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

export const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extra) => {
  const result = await rawBaseQuery(args, api, extra);
  return result;
};

/** Base API used by all feature slices via injectEndpoints. Split reducer per domain. */
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: [
    "Network", "Node", "Pipe", "Telemetry", "Scenario",
    "Energy", "Leak", "Forecast", "Asset", "WorkOrder", "Quality", "Carbon", "Me",
  ],
  endpoints: () => ({}),
});
