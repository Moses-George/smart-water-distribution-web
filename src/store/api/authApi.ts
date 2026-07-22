import { baseApi } from "../baseApi";

interface Token {
  access_token: string;
  token_type: string;
}
interface Me {
  id: number;
  email: string;
  role: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    login: b.mutation<Token, { email: string; password: string }>({
      query: (body) => ({ url: "/api/auth/login", method: "POST", body }),
    }),
    register: b.mutation<Token, { email: string; password: string }>({
      query: (body) => ({ url: "/api/auth/register", method: "POST", body }),
    }),
    me: b.query<Me, void>({
      query: () => "/api/auth/me",
      providesTags: ["Me"],
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useMeQuery } = authApi;
