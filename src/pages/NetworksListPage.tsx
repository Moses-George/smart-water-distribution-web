import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Waves, Plus, Trash2, ArrowRight, LogOut } from "lucide-react";
import {
  useListNetworksQuery,
  useCreateNetworkMutation,
  useDeleteNetworkMutation,
} from "@/store/api/networksApi";
import { logout } from "@/store/slices/authSlice";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import { normalizeError } from "@/utils/helpers";

export default function NetworksListPage() {
  const dispatch = useDispatch();
  const { data: networks = [], isLoading, refetch } = useListNetworksQuery();
  const [createNetwork, { isLoading: creating }] = useCreateNetworkMutation();
  const [deleteNetwork] = useDeleteNetworkMutation();
  const [name, setName] = useState("");

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await createNetwork({ name: name.trim() }).unwrap();
      setName("");
      toast.success("Network created");
    } catch (err) {
      toast.error(normalizeError(err).message);
    }
  };

  const onDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This removes all its nodes, pipes & telemetry.`)) return;
    try {
      await deleteNetwork(id).unwrap();
      toast.success("Deleted");
      refetch();
    } catch (err) {
      toast.error(normalizeError(err).message);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/50 backdrop-blur sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto px-3 sm:px-6 py-2 sm:py-3 flex items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-2.5">
            <div
              className="h-8 w-8 rounded-lg grid place-items-center glow-aqua"
              style={{ background: "linear-gradient(135deg, oklch(0.78 0.16 200), oklch(0.85 0.14 165))" }}
            >
              <Waves className="h-4 w-4 text-[oklch(0.15_0.04_235)]" />
            </div>
            <div>
              <div className="font-semibold text-sm tracking-tight">Aquaflow</div>
              <div className="text-[10px] text-muted-foreground -mt-0.5 uppercase tracking-widest">
                Networks
              </div>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2 text-xs">
            <ThemeToggle />
            <button
              onClick={() => dispatch(logout())}
              className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-md border border-border bg-panel hover:bg-panel-2 transition"
            >
              <LogOut className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-3 sm:px-6 py-5 sm:py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Your networks</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Open a network to launch its digital twin, hydraulic sim, and AI ops modules.
          </p>
        </div>

        <form
          onSubmit={onCreate}
          className="panel-surface p-4 mb-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center"
        >
          <div className="flex-1">
            <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
              New network name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Northfield District"
              className="w-full rounded-md border border-border bg-panel px-3 py-2 text-sm focus:outline-none focus:border-primary/60"
            />
          </div>
          <button
            type="submit"
            disabled={creating || !name.trim()}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition disabled:opacity-40 sm:mt-4"
          >
            {creating ? <ClipLoader size={14} color="#fff" /> : <Plus className="h-4 w-4" />}
            Create network
          </button>
        </form>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            <ClipLoader size={24} /> Loading networks…
          </div>
        ) : networks.length === 0 ? (
          <div className="panel-surface p-12 text-center">
            <p className="text-muted-foreground">
              No networks yet. Create one above to get started.
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {networks.map((n) => (
              <li key={n.id} className="panel-surface p-4 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold">{n.name}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      #{n.id} · created {new Date(n.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={() => onDelete(n.id, n.name)}
                    className="rounded p-1.5 text-muted-foreground hover:text-[oklch(0.68_0.22_25)] hover:bg-panel-2 transition"
                    title="Delete network"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <Link
                  to={`/networks/${n.id}`}
                  className="mt-4 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-primary/10 border border-primary/30 text-primary text-xs font-medium hover:bg-primary/15 transition"
                >
                  Open dashboard <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
