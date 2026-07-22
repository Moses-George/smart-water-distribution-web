import { configureStore } from "@reduxjs/toolkit";
import networkReducer from "./slices/networkSlice";
import { setupListeners } from "@reduxjs/toolkit/query";
import { baseApi } from "./baseApi";
import authReducer from "./slices/authSlice";
import networkUiReducer from "./slices/networkUiSlice";

// Register endpoint injections (side-effect imports).
import "./api/authApi";
import "./api/networksApi";
import "./api/nodesApi";
import "./api/pipesApi";
import "./api/telemetryApi";
import "./api/scenariosApi";
import "./api/energyApi";
import "./api/leaksApi";
import "./api/forecastApi";
import "./api/maintenanceApi";
import "./api/qualityApi";
import "./api/carbonApi";

export const store = configureStore({
  reducer: {
    network: networkReducer,
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    networkUi: networkUiReducer,
  },
  middleware: (gDM) => gDM().concat(baseApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
