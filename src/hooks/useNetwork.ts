import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/store/store";
// import {
//   selectNodes,
//   selectPipes,
//   selectTool,
//   selectSelectedId,
//   selectSelectedPipeId,
//   selectConnectFrom,
//   selectScheduleResult,
//   selectLeakResult,
//   selectScenarioResult,
// } from "@/store/slices/networkSelectors";
import {
  setTool,
  select,
  selectPipe,
  addNodeAt,
  moveNode,
  updateNode,
  updatePipe,
  deleteNode,
  deletePipe,
  connectNodes,
  setConnectFrom,
  reset,
  clear,
  optimizeSchedule,
  runLeakDetection,
  runScenario,
} from "@/store/slices/networkSlice";
import type { RootState } from "@/store/rootReducer";

// // This hook takes a selector function
// export const useNetwork = <T>(selector: (state: RootState["network"]) => T): T => {
//   return useSelector((state: RootState) => selector(state.network));
// };

// // For actions - keep as separate hook or combine
// export const useNetworkActions = () => {
//   const dispatch = useDispatch<AppDispatch>();

//   return {
//     setTool: (t: Parameters<typeof setTool>[0]) => dispatch(setTool(t)),
//     select: (id: Parameters<typeof select>[0]) => dispatch(select(id)),
//     selectPipe: (id: Parameters<typeof selectPipe>[0]) => dispatch(selectPipe(id)),
//     addNodeAt: (type: Parameters<typeof addNodeAt>[0], x: Parameters<typeof addNodeAt>[1], y: Parameters<typeof addNodeAt>[2]) =>
//       dispatch(addNodeAt(type, x, y)),
//     moveNode: (id: Parameters<typeof moveNode>[0]["id"], x: Parameters<typeof moveNode>[0]["x"], y: Parameters<typeof moveNode>[0]["y"]) =>
//       dispatch(moveNode({ id, x, y })),
//     updateNode: (id: Parameters<typeof updateNode>[0]["id"], patch: Parameters<typeof updateNode>[0]["patch"]) =>
//       dispatch(updateNode({ id, patch })),
//     updatePipe: (id: Parameters<typeof updatePipe>[0]["id"], patch: Parameters<typeof updatePipe>[0]["patch"]) =>
//       dispatch(updatePipe({ id, patch })),
//     deleteNode: (id: Parameters<typeof deleteNode>[0]) => dispatch(deleteNode(id)),
//     deletePipe: (id: Parameters<typeof deletePipe>[0]) => dispatch(deletePipe(id)),
//     connectNodes: (from: Parameters<typeof connectNodes>[0]["from"], to: Parameters<typeof connectNodes>[0]["to"]) =>
//       dispatch(connectNodes({ from, to })),
//     setConnectFrom: (id: Parameters<typeof setConnectFrom>[0]) => dispatch(setConnectFrom(id)),
//     reset: () => dispatch(reset()),
//     clear: () => dispatch(clear()),
//     optimizeSchedule: () => dispatch(optimizeSchedule()),
//     runLeakDetection: () => dispatch(runLeakDetection()),
//     runScenario: (id: Parameters<typeof runScenario>[0]) => dispatch(runScenario(id)),
//   };
// };

// Combined hook that returns both state and actions (like Zustand)
export const useNetworkStore = () => {
  const dispatch = useDispatch<AppDispatch>();

  const state = {
    nodes: useSelector((state: RootState) => state.network.nodes),
    pipes: useSelector((state: RootState) => state.network.pipes),
    tool: useSelector((state: RootState) => state.network.tool),
    selectedId: useSelector((state: RootState) => state.network.selectedId),
    selectedPipeId: useSelector(
      (state: RootState) => state.network.selectedPipeId,
    ),
    connectFrom: useSelector((state: RootState) => state.network.connectFrom),
    scheduleResult: useSelector(
      (state: RootState) => state.network.scheduleResult,
    ),
    leakResult: useSelector((state: RootState) => state.network.leakResult),
    scenarioResult: useSelector(
      (state: RootState) => state.network.scenarioResult,
    ),
  };

  const actions = {
    setTool: (t: Parameters<typeof setTool>[0]) => dispatch(setTool(t)),
    select: (id: Parameters<typeof select>[0]) => dispatch(select(id)),
    selectPipe: (id: Parameters<typeof selectPipe>[0]) =>
      dispatch(selectPipe(id)),
    addNodeAt: (
      type: Parameters<typeof addNodeAt>[0],
      x: Parameters<typeof addNodeAt>[1],
      y: Parameters<typeof addNodeAt>[2],
    ) => dispatch(addNodeAt(type, x, y)),
    moveNode: (
      id: Parameters<typeof moveNode>[0]["id"],
      x: Parameters<typeof moveNode>[0]["x"],
      y: Parameters<typeof moveNode>[0]["y"],
    ) => dispatch(moveNode({ id, x, y })),
    updateNode: (
      id: Parameters<typeof updateNode>[0]["id"],
      patch: Parameters<typeof updateNode>[0]["patch"],
    ) => dispatch(updateNode({ id, patch })),
    updatePipe: (
      id: Parameters<typeof updatePipe>[0]["id"],
      patch: Parameters<typeof updatePipe>[0]["patch"],
    ) => dispatch(updatePipe({ id, patch })),
    deleteNode: (id: Parameters<typeof deleteNode>[0]) =>
      dispatch(deleteNode(id)),
    deletePipe: (id: Parameters<typeof deletePipe>[0]) =>
      dispatch(deletePipe(id)),
    connectNodes: (
      from: Parameters<typeof connectNodes>[0]["from"],
      to: Parameters<typeof connectNodes>[0]["to"],
    ) => dispatch(connectNodes({ from, to })),
    setConnectFrom: (id: Parameters<typeof setConnectFrom>[0]) =>
      dispatch(setConnectFrom(id)),
    reset: () => dispatch(reset()),
    clear: () => dispatch(clear()),
    optimizeSchedule: () => dispatch(optimizeSchedule()),
    runLeakDetection: () => dispatch(runLeakDetection()),
    runScenario: (id: Parameters<typeof runScenario>[0]) =>
      dispatch(runScenario(id)),
  };

  return { ...state, ...actions };
};
