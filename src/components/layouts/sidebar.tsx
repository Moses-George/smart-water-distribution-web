import { type ModuleId, MODULES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Bar } from "../dashboard/panel";
import { Activity } from "lucide-react";

interface SidebarProps {
  activeModule: ModuleId;
  onModuleChange: (id: ModuleId) => void;
}

export function Sidebar({ activeModule, onModuleChange }: SidebarProps) {
  return (
    <nav className="panel-surface p-3 h-fit sticky top-[76px]">
      <div className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground px-2 py-2">
        Modules
      </div>
      <ul className="flex flex-col gap-0.5">
        {MODULES.map((m) => {
          const Icon = m.icon;
          const isActive = activeModule === m.id;
          return (
            <li key={m.id}>
              <button
                onClick={() => onModuleChange(m.id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition text-left",
                  isActive
                    ? "bg-primary/15 text-foreground border border-primary/30"
                    : "text-muted-foreground hover:bg-panel-2 hover:text-foreground border border-transparent"
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-primary")} />
                <span className="truncate">{m.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
      
      <div className="mt-4 p-3 rounded-md bg-panel-2 border border-border">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-[oklch(0.78_0.18_155)]">
          <Activity className="h-3 w-3" /> System Health
        </div>
        <div className="mt-2 font-mono text-2xl">94<span className="text-sm text-muted-foreground">/100</span></div>
        <Bar value={94} tone="success" />
        <div className="text-[10px] text-muted-foreground mt-2">2 alerts · 6 warnings</div>
      </div>
    </nav>
  );
}