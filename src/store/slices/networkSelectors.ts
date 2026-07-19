import { type RootState } from "../store";

export const selectNodes = (state: RootState) => state.network.nodes;
export const selectPipes = (state: RootState) => state.network.pipes;
export const selectTool = (state: RootState) => state.network.tool;
export const selectSelectedId = (state: RootState) => state.network.selectedId;
export const selectSelectedPipeId = (state: RootState) =>
  state.network.selectedPipeId;
export const selectConnectFrom = (state: RootState) =>
  state.network.connectFrom;
export const selectScheduleResult = (state: RootState) =>
  state.network.scheduleResult;
export const selectLeakResult = (state: RootState) => state.network.leakResult;
export const selectScenarioResult = (state: RootState) =>
  state.network.scenarioResult;
