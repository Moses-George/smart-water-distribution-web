import { combineReducers } from "@reduxjs/toolkit";
import networkReducer from "./slices/networkSlice";
import authReducer from "./slices/authSlice";
import networkUiReducer from "./slices/networkUiSlice";
import auditReducer from "./slices/auditSlice";
import { baseApi } from "./baseApi";

export const rootReducer = combineReducers({
  network: networkReducer,
  audit: auditReducer,
  auth: authReducer,
  networkUi: networkUiReducer,
  [baseApi.reducerPath]: baseApi.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;
