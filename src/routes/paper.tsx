import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, demoPrice } from "@/lib/store";
import { INSTRUMENTS, fmt, rng } from "@/lib/engine";
import { Panel, Synthetic, Btn, Stat } from "@/components/ui-kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/paper")({
  head: () => ({ meta: [
    { title: "Paper Trade — Signal Robot Pro (Demo)" },
    { name: "description", content: "Hypothetical long/short sandbox with simulated P&L on synthetic prices. No broker execution." },
    { property: "og:title", content: "Signal Robot Pro Paper Trade" }, { property: "og:description", content: "Practice hypothetical trades on demo prices." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Paper,
});

function Paper() {
  const s = useStore();
  const [qty, setQty] = useState(10);
  const px = (sym: string) => demoPrice(sym, s.tf, s.seed, s.drift);
  const cur = px(s.sym);
  const open = (side: 1 | -1) => { if (qty <= 0) return; s.set({ positions: [...s.positions, { id: crypto.randomUUID(), sym: s.sym, side, qty, entry: cur, openedAt: Date.now() }] }); };
  const close = (id: string) => { const p = s.positions.find((x) => x.id === id)!; const exit = px(p.sym); s.set({ positions: s.positions.filter((x) => x.id !== id), closed: [{ ...p, exit, pnl: (exit - p.entry) * p.side * p.qty, closedAt: Date.now() }, ...s.closed].slice(0, 50) }); };
  const simulate = () => { const r = rng(Date.now() & 0xffffffff); const d = { ...s.drift }; INSTRUMENTS.forEach((i) => (d[i.sym] = (d[i.sym] ?? 0) + (r() - 0.5) * 0.008)); s.set({ drift: d }); };
  const unreal = s.positions.reduce((t, p) => t + (px(p.sym) - p.entry) * p.side * p.qty, 0);
  const real = s.closed.reduce((t, p) => t + p.pnl, 0);
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold">Paper Trade Sandbox</h1>
      <Synthetic>Hypothetical positions on synthetic demo prices. No orders are sent to any broker. P&L is simulated.</Synthetic>
      <div className="grid grid-cols-3 gap-2"><Stat label="Virtual capital" value={`₹${fmt(s.capital, 0)}`} /><Stat label="Unrealised" value={`₹${fmt(unreal)}`} tone={unreal >= 0 ? "bull" : "bear"} /><Stat label="Realised" value={`₹${fmt(real)}`} tone={real >= 0 ? "bull" : "bear"} /></div>
      <Panel title="New hypothetical order">
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-xs text-muted-foreground">Symbol<select value={s.sym} onChange={(e) => s.set({ sym: e.target.value })} className="mt-1 block rounded-lg border border-input bg-secondary px-3 py-2 text-sm text-foreground">{INSTRUMENTS.map((i) => <option key={i.sym}>{i.sym}</option>)}</select></label>
          <label className="text-xs text-muted-foreground">Quantity<input type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(0, Math.floor(+e.target.value)))} className="num mt-1 block w-24 rounded-lg border border-input bg-secondary px-3 py-2 text-sm text-foreground" /></label>
          <div className="text-xs text-muted-foreground">Demo price<div className="num mt-1 py-2 text-sm font-semibold text-foreground">{fmt(cur)}</div></div>
          <div className="ml-auto flex gap-2"><Btn variant="bull" onClick={() => open(1)} disabled={qty <= 0}>Long</Btn><Btn variant="bear" onClick={() => open(-1)} disabled={qty <= 0}>Short</Btn></div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2"><Btn variant="ghost" onClick={simulate}>Simulate price move</Btn><Btn variant="ghost" onClick={() => s.set({ drift: {} })}>Reset price drift</Btn></div>
      </Panel>
      <Panel title={`Open positions (${s.positions.length})`}>
        {s.positions.length === 0 ? <p className="text-sm text-muted-foreground">No open hypothetical positions.</p> : <div className="space-y-2">{s.positions.map((p) => { const now = px(p.sym), pnl = (now - p.entry) * p.side * p.qty; return (
          <div key={p.id} className="flex items-center gap-3 rounded-lg bg-muted/60 p-2.5">
            <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold", p.side === 1 ? "bg-bull/20 text-bull" : "bg-bear/20 text-bear")}>{p.side === 1 ? "LONG" : "SHORT"}</span>
            <div className="min-w-0 flex-1"><div className="text-sm font-semibold">{p.sym} × {p.qty}</div><div className="num text-[11px] text-muted-foreground">{fmt(p.entry)} → {fmt(now)}</div></div>
            <div className={cn("num text-sm font-bold", pnl >= 0 ? "text-bull" : "text-bear")}>₹{fmt(pnl)}</div>
            <Btn variant="ghost" className="px-2 py-1 text-xs" onClick={() => close(p.id)}>Close</Btn>
          </div>); })}</div>}
      </Panel>
      <Panel title="Closed (simulated)" right={s.closed.length > 0 && <button className="text-xs text-muted-foreground hover:text-foreground" onClick={() => s.set({ closed: [] })}>Clear</button>}>
        {s.closed.length === 0 ? <p className="text-sm text-muted-foreground">No closed trades yet.</p> : <div className="divide-y divide-border">{s.closed.map((p) => <div key={p.id} className="flex justify-between py-2 text-sm"><span>{p.side === 1 ? "Long" : "Short"} {p.sym} × {p.qty}</span><span className={cn("num font-semibold", p.pnl >= 0 ? "text-bull" : "text-bear")}>₹{fmt(p.pnl)}</span></div>)}</div>}
      </Panel>
    </div>
  );
}
