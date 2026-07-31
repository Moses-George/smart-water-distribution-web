import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// const TOKEN_KEY = "aquaflow.token";

export interface IUser {
  id: number;
  email: string;
  role: string;
  created_at: Date;
  updated_at: Date;
}

interface IPayload {
  user: IUser | null;
  token: string | null;
}

interface AuthState extends IPayload {
  isAuthenticated: boolean;
}

const token = localStorage.getItem("access_token");
const user = localStorage.getItem("user");

const initialState: AuthState = {
  token,
  user: user ? JSON.parse(user) : null,
  isAuthenticated: !!token,
};

// const initialState: AuthState = {
//   token:
//     typeof window !== "undefined"
//       ? window.localStorage.getItem(TOKEN_KEY)
//       : null,
//   user: null,
// };

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<IPayload>) {
      state.token = action.payload?.token;
      state.user = action.payload?.user;
      if (typeof window !== "undefined") {
        if (action.payload) {
          state.isAuthenticated = true;
          window.localStorage.setItem("access_token", action.payload.token!);
          window.localStorage.setItem(
            "user",
            JSON.stringify(action.payload.user),
          );
          // window.localStorage.setItem(TOKEN_KEY, action.payload.token!);
        } else {
          window.localStorage.removeItem("access_token");
          window.localStorage.removeItem("user");
          // window.localStorage.removeItem(TOKEN_KEY);
        }
      }
    },
    logout(state) {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("access_token");
        window.localStorage.removeItem("user");
      }
    },
  },
});

export const { setCredentials, logout } = slice.actions;
export default slice.reducer;
