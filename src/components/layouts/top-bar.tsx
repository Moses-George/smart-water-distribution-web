// import { Waves, Cloud, Settings2 } from "lucide-react";
// // import { DownloadSourceButton } from "@/components/dashboard/download-source-button";
// import { ThemeToggle } from "@/components/dashboard/theme-toggle";

// export function TopBar() {
//   return (
//     <header className="border-b border-border bg-background/50 backdrop-blur sticky top-0 z-30">
//       <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center gap-6">
//         <div className="flex items-center gap-2.5">
//           <div
//             className="h-8 w-8 rounded-lg grid place-items-center glow-aqua"
//             style={{ background: "linear-gradient(135deg, oklch(0.78 0.16 200), oklch(0.85 0.14 165))" }}
//           >
//             <Waves className="h-4 w-4 text-[oklch(0.15_0.04_235)]" />
//           </div>
//           <div>
//             <div className="font-semibold text-sm tracking-tight">Aquaflow</div>
//             <div className="text-[10px] text-muted-foreground -mt-0.5 uppercase tracking-widest">Ops Console</div>
//           </div>
//         </div>

//         <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground ml-4">
//           <span className="h-2 w-2 rounded-full bg-[oklch(0.78_0.18_155)] animate-pulse" />
//           Live · Northfield District · Last sync 14s ago
//         </div>

//         <div className="ml-auto flex items-center gap-2 text-xs">
//           <span className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-panel">
//             <Cloud className="h-3.5 w-3.5" /> 18°C · Clear
//           </span>
//           {/* <DownloadSourceButton /> */}
//           <ThemeToggle />
//           <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-panel hover:bg-panel-2 transition">
//             <Settings2 className="h-3.5 w-3.5" /> Operator
//           </button>
//         </div>
//       </div>
//     </header>
//   );
// }

// import { Waves, Cloud, LogOut } from "lucide-react";
// import { useDispatch, useSelector } from "react-redux";
// import { Link } from "react-router-dom";
// import { ThemeToggle } from "@/components/dashboard/theme-toggle";
// import { logout } from "@/store/slices/authSlice";
// import type { RootState } from "@/store/rootReducer";
// // import type { RootState } from "@/store/store";

// export function TopBar() {
//   const dispatch = useDispatch();
//   const wsConnected = useSelector((s: RootState) => s.networkUi.wsConnected);
//   const nid = useSelector((s: RootState) => s.networkUi.activeNetworkId);

//   return (
//     <header className="border-b border-border bg-background/50 backdrop-blur sticky top-0 z-30">
//       <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center gap-6">
//         <Link to="/networks" className="flex items-center gap-2.5">
//           <div
//             className="h-8 w-8 rounded-lg grid place-items-center glow-aqua"
//             style={{
//               background:
//                 "linear-gradient(135deg, oklch(0.78 0.16 200), oklch(0.85 0.14 165))",
//             }}
//           >
//             <Waves className="h-4 w-4 text-[oklch(0.15_0.04_235)]" />
//           </div>
//           <div>
//             <div className="font-semibold text-sm tracking-tight">Aquaflow</div>
//             <div className="text-[10px] text-muted-foreground -mt-0.5 uppercase tracking-widest">
//               {nid ? `Network #${nid}` : "Ops Console"}
//             </div>
//           </div>
//         </Link>

//         <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground ml-4">
//           <span
//             className={`h-2 w-2 rounded-full ${
//               wsConnected ? "bg-[oklch(0.78_0.18_155)] animate-pulse" : "bg-muted-foreground"
//             }`}
//           />
//           {wsConnected ? "Live telemetry" : "Reconnecting…"}
//         </div>

//         <div className="ml-auto flex items-center gap-2 text-xs">
//           <span className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-panel">
//             <Cloud className="h-3.5 w-3.5" /> 18°C · Clear
//           </span>
//           <ThemeToggle />
//           <button
//             onClick={() => dispatch(logout())}
//             className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-panel hover:bg-panel-2 transition"
//           >
//             <LogOut className="h-3.5 w-3.5" /> Logout
//           </button>
//         </div>
//       </div>
//     </header>
//   );
// }

import { Waves, Cloud, LogOut } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { logout } from "@/store/slices/authSlice";
import { NetworkSelector } from "@/components/dashboard/network-selector";
import { UndoRedoButtons } from "@/components/dashboard/audit-trail";
import type { RootState } from "@/store/rootReducer";

export function TopBar() {
  const dispatch = useDispatch();
  const wsConnected = useSelector((s: RootState) => s.networkUi.wsConnected);

  return (
    <header className="border-b border-border bg-background/50 backdrop-blur sticky top-0 z-30">
      <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center gap-4 flex-wrap">
        <Link to="/networks" className="flex items-center gap-2.5">
          <div
            className="h-8 w-8 rounded-lg grid place-items-center glow-aqua"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.78 0.16 200), oklch(0.85 0.14 165))",
            }}
          >
            <Waves className="h-4 w-4 text-[oklch(0.15_0.04_235)]" />
          </div>
          <div>
            <div className="font-semibold text-sm tracking-tight">Aquaflow</div>
            <div className="text-[10px] text-muted-foreground -mt-0.5 uppercase tracking-widest">
              Ops Console
            </div>
          </div>
        </Link>

        <NetworkSelector />

        <UndoRedoButtons />

        <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground ml-2">
          <span
            className={`h-2 w-2 rounded-full ${
              wsConnected
                ? "bg-[oklch(0.78_0.18_155)] animate-pulse"
                : "bg-muted-foreground"
            }`}
          />
          {wsConnected ? "Live telemetry" : "Reconnecting…"}
        </div>

        <div className="ml-auto flex items-center gap-2 text-xs">
          <span className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-panel">
            <Cloud className="h-3.5 w-3.5" /> 18°C · Clear
          </span>
          <ThemeToggle />
          <button
            onClick={() => dispatch(logout())}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-panel hover:bg-panel-2 transition"
          >
            <LogOut className="h-3.5 w-3.5" /> Logout
          </button>
        </div>
      </div>
    </header>
  );
}
