import { configureStore } from "@reduxjs/toolkit";
// import networkReducer from "./slices/networkSlice";
import { setupListeners } from "@reduxjs/toolkit/query";
import { baseApi } from "./baseApi";
// import authReducer from "./slices/authSlice";
// import networkUiReducer from "./slices/networkUiSlice";
import { networkSyncMiddleware } from "./middleware/syncMiddleware";
import { rootReducer } from "./rootReducer";
import { auditMiddleware } from "./middleware/auditMiddleware";

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
import "./api/topologyApi";

// export const store = configureStore({
//   reducer: {
//     network: networkReducer,
//     [baseApi.reducerPath]: baseApi.reducer,
//     auth: authReducer,
//     networkUi: networkUiReducer,
//   },
//   middleware: (gDM) => gDM().concat(baseApi.middleware, networkSyncMiddleware),
// });

export const store = configureStore({
  reducer: rootReducer,
  middleware: (gDM) =>
    gDM().concat(baseApi.middleware, auditMiddleware, networkSyncMiddleware),
});

setupListeners(store.dispatch);

// export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
