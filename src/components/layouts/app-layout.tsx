import type { ModuleId } from "@/lib/constants";
import { type ReactNode } from "react";
import { Footer } from "./footer";
import { TopBar } from "./top-bar";
import { Sidebar } from "./sidebar";


interface AppLayoutProps {
  children: ReactNode;
  activeModule: ModuleId;
  onModuleChange: (id: ModuleId) => void;
}

export function AppLayout({ children, activeModule, onModuleChange }: AppLayoutProps) {
  return (
    <div className="min-h-screen">
      <TopBar />
      <div className="max-w-[1600px] mx-auto px-6 py-6 grid grid-cols-[240px_1fr] gap-6">
        <Sidebar activeModule={activeModule} onModuleChange={onModuleChange} />
        <main className="min-w-0">{children}</main>
      </div>
      <Footer />
    </div>
  );
}