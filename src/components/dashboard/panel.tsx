// import type { ReactNode } from "react";
// import { cn } from "@/lib/utils";

// export function Panel({ title, subtitle, right, children, className }: {
//   title?: string; subtitle?: string; right?: ReactNode; children: ReactNode; className?: string;
// }) {
//   return (
//     <section className={cn("panel-surface p-5", className)}>
//       {(title || right) && (
//         <header className="flex items-start justify-between mb-4 gap-4">
//           <div>
//             {title && <h3 className="text-sm font-semibold tracking-wide text-foreground uppercase">{title}</h3>}
//             {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
//           </div>
//           {right}
//         </header>
//       )}
//       {children}
//     </section>
//   );
// }

// export function Stat({ label, value, unit, trend, tone = "default" }: {
//   label: string; value: string | number; unit?: string; trend?: string;
//   tone?: "default" | "aqua" | "energy" | "success" | "danger" | "warning";
// }) {
//   const toneClass = {
//     default: "text-foreground",
//     aqua: "text-gradient-aqua",
//     energy: "text-[oklch(0.82_0.18_90)]",
//     success: "text-[oklch(0.78_0.18_155)]",
//     danger: "text-[oklch(0.68_0.22_25)]",
//     warning: "text-[oklch(0.82_0.17_65)]",
//   }[tone];
//   return (
//     <div className="panel-surface p-4 flex flex-col gap-1">
//       <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
//       <div className="flex items-baseline gap-1.5">
//         <span className={cn("text-3xl font-semibold font-mono tabular-nums", toneClass)}>{value}</span>
//         {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
//       </div>
//       {trend && <span className="text-[11px] text-muted-foreground">{trend}</span>}
//     </div>
//   );
// }

// export function Bar({ value, max = 100, tone = "aqua" }: { value: number; max?: number; tone?: "aqua" | "energy" | "danger" | "success" }) {
//   const pct = Math.min(100, (value / max) * 100);
//   const bg = {
//     aqua: "oklch(0.78 0.16 200)",
//     energy: "oklch(0.82 0.18 90)",
//     danger: "oklch(0.68 0.22 25)",
//     success: "oklch(0.78 0.18 155)",
//   }[tone];
//   return (
//     <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
//       <div className="h-full rounded-full" style={{ width: `${pct}%`, background: bg }} />
//     </div>
//   );
// }


import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Panel({ title, subtitle, right, children, className }: {
  title?: string; subtitle?: string; right?: ReactNode; children: ReactNode; className?: string;
}) {
  return (
    <section className={cn("panel-surface p-3 sm:p-5", className)}>
      {(title || right) && (
        <header className="flex flex-wrap items-start justify-between mb-4 gap-2 sm:gap-4">
          <div>
            {title && <h3 className="text-sm font-semibold tracking-wide text-foreground uppercase">{title}</h3>}
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
          {right}
        </header>
      )}
      {children}
    </section>
  );
}

export function Stat({ label, value, unit, trend, tone = "default" }: {
  label: string; value: string | number; unit?: string; trend?: string;
  tone?: "default" | "aqua" | "energy" | "success" | "danger" | "warning";
}) {
  const toneClass = {
    default: "text-foreground",
    aqua: "text-gradient-aqua",
    energy: "text-[oklch(0.82_0.18_90)]",
    success: "text-[oklch(0.78_0.18_155)]",
    danger: "text-[oklch(0.68_0.22_25)]",
    warning: "text-[oklch(0.82_0.17_65)]",
  }[tone];
  return (
    <div className="panel-surface p-3 sm:p-4 flex flex-col gap-1 min-w-0">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="flex items-baseline gap-1.5">
        <span className={cn("text-2xl sm:text-3xl font-semibold font-mono tabular-nums break-words", toneClass)}>{value}</span>
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </div>
      {trend && <span className="text-[11px] text-muted-foreground">{trend}</span>}
    </div>
  );
}

export function Bar({ value, max = 100, tone = "aqua" }: { value: number; max?: number; tone?: "aqua" | "energy" | "danger" | "success" }) {
  const pct = Math.min(100, (value / max) * 100);
  const bg = {
    aqua: "oklch(0.78 0.16 200)",
    energy: "oklch(0.82 0.18 90)",
    danger: "oklch(0.68 0.22 25)",
    success: "oklch(0.78 0.18 155)",
  }[tone];
  return (
    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: bg }} />
    </div>
  );
}