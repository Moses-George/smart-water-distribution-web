import { baseApi } from "../baseApi";
import type { IUser } from "../slices/authSlice";

interface ICredentials {
  access_token: string;
  token_type: string;
  user: IUser
}
interface Me {
  id: number;
  email: string;
  role: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<ICredentials, { email: string; password: string }>({
      query: (body) => ({ url: "/api/auth/login", method: "POST", body }),
    }),
    register: builder.mutation<ICredentials, { email: string; password: string }>({
      query: (body) => ({ url: "/api/auth/register", method: "POST", body }),
    }),
    me: builder.query<Me, void>({
      query: () => "/api/auth/me",
      providesTags: ["Me"],
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useMeQuery } = authApi;
