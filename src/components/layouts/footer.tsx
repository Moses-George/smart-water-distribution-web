export function Footer() {
  return (
    <footer className="border-t border-border mt-6 sm:mt-10">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 py-4 text-[11px] text-muted-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <span>Aquaflow · Smart Water Distribution & Energy Optimization Platform</span>
        <span className="font-mono">Digital Twin v2.4 · EPANET solver · TFT forecast</span>
      </div>
    </footer>
  );
}