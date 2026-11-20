// import { useEffect, useState } from "react";
// import { Link, useParams, Navigate } from "react-router-dom";
// import { useDispatch } from "react-redux";
// import { AppLayout } from "@/components/layouts/app-layout";
// import { KPIStrip } from "@/components/dashboard/KPIStrip";
// import { type ModuleId } from "@/lib/constants";
// import CarbonView from "@/components/views/carbon-view";
// import EnergyView from "@/components/views/energy-view";
// import ForecastView from "@/components/views/forecast-view";
// import GisView from "@/components/views/gis-view";
// import HydraulicView from "@/components/views/hydraulic-view";
// import LeaksView from "@/components/views/leaks-view";
// import MaintenanceView from "@/components/views/maintenance-view";
// import QualityView from "@/components/views/quality-view";
// import ScenarioView from "@/components/views/scenario-view";
// import TwinView from "@/components/views/twin-view";
// import { setActiveNetwork } from "@/store/slices/networkUiSlice";
// import { useListNodesQuery } from "@/store/api/nodesApi";
// import { useListPipesQuery } from "@/store/api/pipesApi";
// import { hydrateNetwork, clear } from "@/store/slices/networkSlice";
// import { useTelemetryWs } from "@/hooks/useTelemetryWs";
// import { ArrowLeft } from "lucide-react";
// import { ClipLoader } from "react-spinners";

// export default function NetworkDashboardPage() {
//   const { nid: nidStr } = useParams();
//   const nid = Number(nidStr);
//   const dispatch = useDispatch();
//   const [activeModule, setActiveModule] = useState<ModuleId>("twin");

//   useTelemetryWs();

//   const {
//     data: nodes,
//     isLoading: nodesLoading,
//     isError: nodesError,
//   } = useListNodesQuery(nid, { skip: !nid });
//   const {
//     data: pipes,
//     isLoading: pipesLoading,
//   } = useListPipesQuery(nid, { skip: !nid });

//   // Set active nid & hydrate slice once both loaded
//   useEffect(() => {
//     if (!nid) return;
//     dispatch(setActiveNetwork(nid));
//     return () => {
//       dispatch(setActiveNetwork(null));
//       dispatch(clear());
//     };
//   }, [nid, dispatch]);

//   useEffect(() => {
//     if (nodes && pipes) {
//       dispatch(hydrateNetwork({ nodes, pipes }));
//     }
//   }, [nodes, pipes, dispatch]);

//   if (!nid || Number.isNaN(nid)) return <Navigate to="/networks" replace />;

//   if (nodesError) {
//     return (
//       <div className="min-h-screen grid place-items-center p-6">
//         <div className="panel-surface p-6 max-w-md text-center">
//           <div className="text-sm">Could not load network #{nid}.</div>
//           <Link to="/networks" className="mt-3 inline-flex items-center gap-1 text-primary text-xs">
//             <ArrowLeft className="h-3.5 w-3.5" /> Back to networks
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   if (nodesLoading || pipesLoading || !nodes || !pipes) {
//     return (
//       <div className="min-h-screen grid place-items-center">
//         <div className="flex items-center gap-3 text-sm text-muted-foreground">
//           <ClipLoader size={18} /> Loading network #{nid}…
//         </div>
//       </div>
//     );
//   }

//   const renderModule = () => {
//     switch (activeModule) {
//       case "twin": return <TwinView />;
//       case "hydraulic": return <HydraulicView />;
//       case "energy": return <EnergyView />;
//       case "forecast": return <ForecastView />;
//       case "leaks": return <LeaksView />;
//       case "maintenance": return <MaintenanceView />;
//       case "quality": return <QualityView />;
//       case "gis": return <GisView />;
//       case "carbon": return <CarbonView />;
//       case "scenario": return <ScenarioView />;
//       default: return null;
//     }
//   };

//   return (
//     <AppLayout activeModule={activeModule} onModuleChange={setActiveModule}>
//       <div className="mb-4">
//         <Link
//           to="/networks"
//           className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition"
//         >
//           <ArrowLeft className="h-3 w-3" /> All networks
//         </Link>
//       </div>
//       <KPIStrip />
//       {renderModule()}
//     </AppLayout>
//   );
// }

import { useEffect, useRef, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AppLayout } from "@/components/layouts/app-layout";
import { KPIStrip } from "@/components/dashboard/KPIStrip";
import { type ModuleId } from "@/lib/constants";
import CarbonView from "@/components/views/carbon-view";
import EnergyView from "@/components/views/energy-view";
import ForecastView from "@/components/views/forecast-view";
import GisView from "@/components/views/gis-view";
import HydraulicView from "@/components/views/hydraulic-view";
import LeaksView from "@/components/views/leaks-view";
import MaintenanceView from "@/components/views/maintenance-view";
import QualityView from "@/components/views/quality-view";
import ScenarioView from "@/components/views/scenario-view";
import TwinView from "@/components/views/twin-view";
import { setActiveNetwork } from "@/store/slices/networkUiSlice";
import { useListNodesQuery } from "@/store/api/nodesApi";
import { useListPipesQuery } from "@/store/api/pipesApi";
import { hydrateNetwork, clear } from "@/store/slices/networkSlice";
import { clearNetwork } from "@/store/slices/auditSlice";
import { useTelemetryWs } from "@/hooks/useTelemetryWs";
import { ArrowLeft } from "lucide-react";
import { ClipLoader } from "react-spinners";
import { AuditTrailPanel } from "@/components/dashboard/audit-trail";

export default function NetworkDashboardPage() {
  const { nid: nidStr } = useParams();
  const nid = Number(nidStr);
  const dispatch = useDispatch();
  const [activeModule, setActiveModule] = useState<ModuleId>("twin");

  useTelemetryWs();

  const {
    data: nodes,
    isLoading: nodesLoading,
    isError: nodesError,
  } = useListNodesQuery(nid, { skip: !nid });
  const { data: pipes, isLoading: pipesLoading } = useListPipesQuery(nid, {
    skip: !nid,
  });

  // Track the network id we've most-recently hydrated. Refetches caused by
  // RTK Query cache invalidation (e.g. after edits) MUST NOT clear the audit
  // trail — only a genuine network switch clears it.
  const hydratedFor = useRef<number | null>(null);

  useEffect(() => {
    if (!nid) return;
    dispatch(setActiveNetwork(nid));
    return () => {
      dispatch(setActiveNetwork(null));
      dispatch(clear());
      hydratedFor.current = null;
    };
  }, [nid, dispatch]);

  useEffect(() => {
    if (!nodes || !pipes || !nid) return;
    // First hydration for this network id → reset audit for it.
    if (hydratedFor.current !== nid) {
      dispatch(clearNetwork(nid));
      hydratedFor.current = nid;
    }
    dispatch(hydrateNetwork({ nodes, pipes }));
  }, [nodes, pipes, nid, dispatch]);

  if (!nid || Number.isNaN(nid)) return <Navigate to="/networks" replace />;

  if (nodesError) {
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <div className="panel-surface p-6 max-w-md text-center">
          <div className="text-sm">Could not load network #{nid}.</div>
          <Link
            to="/networks"
            className="mt-3 inline-flex items-center gap-1 text-primary text-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to networks
          </Link>
        </div>
      </div>
    );
  }

  if (nodesLoading || pipesLoading || !nodes || !pipes) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <ClipLoader size={18} /> Loading network #{nid}…
        </div>
      </div>
    );
  }

  const renderModule = () => {
    switch (activeModule) {
      case "twin":
        return <TwinView />;
      case "hydraulic":
        return <HydraulicView />;
      case "energy":
        return <EnergyView />;
      case "forecast":
        return <ForecastView />;
      case "leaks":
        return <LeaksView />;
      case "maintenance":
        return <MaintenanceView />;
      case "quality":
        return <QualityView />;
      case "gis":
        return <GisView />;
      case "carbon":
        return <CarbonView />;
      case "scenario":
        return <ScenarioView />;
      default:
        return null;
    }
  };

  return (
    <AppLayout activeModule={activeModule} onModuleChange={setActiveModule}>
      <div className="mb-4">
        <Link
          to="/networks"
          className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="h-3 w-3" /> All networks
        </Link>
      </div>
      {/* <div className="grid grid-cols-[6fr_4fr] gap-4"> */}
      <KPIStrip />
      {(activeModule === "twin" ||
        activeModule === "leaks" ||
        activeModule === "gis") && (
        <aside className=" xl:top-24 h-max">
          <AuditTrailPanel />
        </aside>
      )}
      {/* </div> */}
      <div className="grid grid-cols-1 gap-4 mt-4">
        <div className="min-w-0">{renderModule()}</div>
        {/* <aside className="xl:sticky xl:top-24 h-max">
          <AuditTrailPanel />
        </aside> */}
      </div>
    </AppLayout>
  );
}
