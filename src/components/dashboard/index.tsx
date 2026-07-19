import { useState } from "react";
import { AppLayout } from "@/components/layouts/app-layout";
import { KPIStrip } from "@/components/dashboard/KPIStrip";
import { type ModuleId } from "@/lib/constants";
import CarbonView from "../views/carbon-view";
import EnergyView from "../views/energy-view";
import ForecastView from "../views/forecast-view";
import GisView from "../views/gis-view";
import HydraulicView from "../views/hydraulic-view";
import LeaksView from "../views/leaks-view";
import MaintenanceView from "../views/maintenance-view";
import QualityView from "../views/quality-view";
import ScenarioView from "../views/scenario-view";
import TwinView from "../views/twin-view";

export default function Dashboard() {
  const [activeModule, setActiveModule] = useState<ModuleId>("twin");

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
      <KPIStrip />
      {renderModule()}
    </AppLayout>
  );
}
