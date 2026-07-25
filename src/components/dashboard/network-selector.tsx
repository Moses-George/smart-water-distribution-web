import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronsUpDown, Plus, Check, Waves } from "lucide-react";
import {
  useListNetworksQuery,
  useCreateNetworkMutation,
} from "@/store/api/networksApi";
import { toast } from "react-toastify";
import { normalizeError } from "@/utils/helpers";
import { ClipLoader } from "react-spinners";

export function NetworkSelector() {
  const { nid: nidStr } = useParams();
  const nid = nidStr ? Number(nidStr) : null;
  const navigate = useNavigate();
  const { data: networks = [], isLoading } = useListNetworksQuery();
  const [createNetwork, { isLoading: creating }] = useCreateNetworkMutation();
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const active = networks.find((n) => n.id === nid);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      const created = await createNetwork({ name: newName.trim() }).unwrap();
      setNewName("");
      setOpen(false);
      toast.success(`Created ${created.name}`);
      navigate(`/networks/${created.id}`);
    } catch (err) {
      toast.error(normalizeError(err).message);
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-panel hover:bg-panel-2 transition text-xs min-w-[180px]"
      >
        <Waves className="h-3.5 w-3.5 text-primary" />
        <span className="truncate flex-1 text-left font-medium">
          {active ? active.name : nid ? `Network #${nid}` : "Choose network"}
        </span>
        <ChevronsUpDown className="h-3 w-3 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute left-0 mt-1 w-72 rounded-lg border border-border bg-background shadow-xl z-50 overflow-hidden">
          <div className="px-3 py-2 border-b border-border text-[10px] uppercase tracking-widest text-muted-foreground">
            Switch network
          </div>
          <div className="max-h-56 overflow-auto">
            {isLoading ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                <ClipLoader size={14} /> Loading…
              </div>
            ) : networks.length === 0 ? (
              <div className="p-4 text-xs text-muted-foreground">
                No networks yet. Create one below.
              </div>
            ) : (
              <ul>
                {networks.map((n) => (
                  <li key={n.id}>
                    <button
                      onClick={() => {
                        setOpen(false);
                        navigate(`/networks/${n.id}`);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-panel-2 transition text-left"
                    >
                      <span className="flex-1 truncate">{n.name}</span>
                      <span className="text-[10px] text-muted-foreground">#{n.id}</span>
                      {n.id === nid && <Check className="h-3.5 w-3.5 text-primary" />}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <form onSubmit={onCreate} className="border-t border-border p-2 flex gap-2 bg-panel-2/40">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New network name"
              className="flex-1 rounded-md border border-border bg-panel px-2 py-1.5 text-xs focus:outline-none focus:border-primary/60"
            />
            <button
              type="submit"
              disabled={creating || !newName.trim()}
              className="flex items-center gap-1 px-2 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium disabled:opacity-40"
            >
              {creating ? <ClipLoader size={12} color="#fff" /> : <Plus className="h-3 w-3" />}
              Create
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
