import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const TOKEN_KEY = "aquaflow.token";

interface AuthState {
  token: string | null;
}

const initialState: AuthState = {
  token:
    typeof window !== "undefined"
      ? window.localStorage.getItem(TOKEN_KEY)
      : null,
};

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload;
      if (typeof window !== "undefined") {
        if (action.payload)
          window.localStorage.setItem(TOKEN_KEY, action.payload);
        else window.localStorage.removeItem(TOKEN_KEY);
      }
    },
    logout(state) {
      state.token = null;
      if (typeof window !== "undefined")
        window.localStorage.removeItem(TOKEN_KEY);
    },
  },
});

export const { setToken, logout } = slice.actions;
export default slice.reducer;
