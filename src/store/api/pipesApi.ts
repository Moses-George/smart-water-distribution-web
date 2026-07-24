import { baseApi } from "../baseApi";

export interface PipeOut {
  id: number;
  ext_id: string;
  from_ext: string;
  to_ext: string;
  diameter: number;
  flow: number;
  velocity: number;
  headloss: number;
  material: string;
  age: number;
}

export const pipesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listPipes: builder.query<PipeOut[], number>({
      query: (nid) => `/api/networks/${nid}/pipes`,
      providesTags: (_r, _e, nid) => [{ type: "Pipe", id: `LIST-${nid}` }],
    }),
    createPipe: builder.mutation<
      PipeOut,
      { nid: number; body: Omit<PipeOut, "id"> }
    >({
      query: ({ nid, body }) => ({
        url: `/api/networks/${nid}/pipes`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { nid }) => [
        { type: "Pipe", id: `LIST-${nid}` },
      ],
    }),
    patchPipe: builder.mutation<
      PipeOut,
      { nid: number; id: number; body: Partial<PipeOut> }
    >({
      query: ({ nid, id, body }) => ({
        url: `/api/networks/${nid}/pipes/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, { nid }) => [
        { type: "Pipe", id: `LIST-${nid}` },
      ],
    }),
    deletePipe: builder.mutation<void, { nid: number; id: number }>({
      query: ({ nid, id }) => ({
        url: `/api/networks/${nid}/pipes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { nid }) => [
        { type: "Pipe", id: `LIST-${nid}` },
      ],
    }),
  }),
});

export const {
  useListPipesQuery,
  useCreatePipeMutation,
  usePatchPipeMutation,
  useDeletePipeMutation,
} = pipesApi;
