import { RefreshCw } from "lucide-react";
import { INSTRUMENTS, TFS } from "@/lib/engine";
import { useStore } from "@/lib/store";
import { Seg } from "./ui-kit";
export function Selectors() {
  const s = useStore();
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select value={s.sym} onChange={(e) => s.set({ sym: e.target.value })} className="rounded-lg border border-input bg-secondary px-3 py-1.5 text-sm font-semibold">
        {INSTRUMENTS.map((i) => <option key={i.sym}>{i.sym}</option>)}
      </select>
      <Seg value={s.tf} options={TFS} onChange={(tf) => s.set({ tf })} />
      <button onClick={() => s.set({ seed: s.seed + 1 })} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-medium hover:bg-accent" title="Generate a new synthetic sample"><RefreshCw className="size-3.5" />New demo sample <span className="num text-muted-foreground">#{s.seed}</span></button>
    </div>
  );
}
