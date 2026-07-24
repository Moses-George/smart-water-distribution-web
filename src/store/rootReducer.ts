import { combineReducers } from "@reduxjs/toolkit";
import networkReducer from "./slices/networkSlice";
import authReducer from "./slices/authSlice";
import networkUiReducer from "./slices/networkUiSlice";
import { baseApi } from "./baseApi";

export const rootReducer = combineReducers({
    network: networkReducer,
    auth: authReducer,
    networkUi: networkUiReducer,
    [baseApi.reducerPath]: baseApi.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;