import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const KEY = "aquaflow-theme";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    const isDark = saved === "dark";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem(KEY, next ? "dark" : "light");
  }

  return (
    <button
      onClick={toggle}
      title="Toggle theme"
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-panel hover:bg-panel-2 transition text-xs"
    >
      {dark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
      {dark ? "Light" : "Dark"}
    </button>
  );
}