import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface NetworkUiState {
  activeNetworkId: number | null;
  liveKpi: { avg_pressure?: number; demand_now?: number; energy_kw?: number };
  wsConnected: boolean;
}

const initialState: NetworkUiState = {
  activeNetworkId: 1,
  liveKpi: {},
  wsConnected: false,
};

const slice = createSlice({
  name: "networkUi",
  initialState,
  reducers: {
    setActiveNetwork(state, action: PayloadAction<number | null>) {
      state.activeNetworkId = action.payload;
    },
    setLiveKpi(state, action: PayloadAction<NetworkUiState["liveKpi"]>) {
      state.liveKpi = { ...state.liveKpi, ...action.payload };
    },
    setWsConnected(state, action: PayloadAction<boolean>) {
      state.wsConnected = action.payload;
    },
  },
});

export const { setActiveNetwork, setLiveKpi, setWsConnected } = slice.actions;
export default slice.reducer;
