import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { Star } from "lucide-react";
import { useStore } from "@/lib/store";
import { INSTRUMENTS, genBars, computeAll, signalAt, fmt } from "@/lib/engine";
import { Panel, Synthetic, DemoBadge } from "@/components/ui-kit";
import { MiniLine } from "@/components/Chart";
import { Seg } from "@/components/ui-kit";
import { TFS } from "@/lib/engine";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/watchlist")({
  head: () => ({ meta: [
    { title: "Watchlist — Signal Robot Pro (Demo)" },
    { name: "description", content: "Demo watchlist of NIFTY 50, BANKNIFTY, SENSEX, RELIANCE, TCS and INFY on synthetic data." },
    { property: "og:title", content: "Signal Robot Pro Watchlist" }, { property: "og:description", content: "Switch symbols and compare demo signals." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Watchlist,
});

function Watchlist() {
  const s = useStore(); const nav = useNavigate();
  const rows = useMemo(() => INSTRUMENTS.map((inst) => { const b = genBars(inst.sym, s.tf, s.seed); const ind = computeAll(b); const sig = signalAt(b, ind, b.length - 1, s.tf); const l = b[b.length - 1].c, p = b[b.length - 2].c; return { inst, l, chg: ((l - p) / p) * 100, sig, spark: b.slice(-50).map((x) => x.c) }; }), [s.tf, s.seed]);
  const toggle = (sym: string) => s.set({ watch: s.watch.includes(sym) ? s.watch.filter((x) => x !== sym) : [...s.watch, sym] });
  const sorted = [...rows].sort((a, b) => Number(s.watch.includes(b.inst.sym)) - Number(s.watch.includes(a.inst.sym)));
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between"><h1 className="text-xl font-bold">Watchlist</h1><Seg value={s.tf} options={TFS} onChange={(tf) => s.set({ tf })} /></div>
      <Synthetic>All prices below are synthetic demo values, sample #{s.seed}. Tap a row to open it on the dashboard.</Synthetic>
      <div className="grid gap-2 md:grid-cols-2">
        {sorted.map((r) => (
          <Panel key={r.inst.sym} className={cn("cursor-pointer p-3 transition hover:border-primary/50", s.sym === r.inst.sym && "border-primary/60")}>
            <div className="flex items-center gap-3" onClick={() => { s.set({ sym: r.inst.sym }); nav({ to: "/" }); }}>
              <button onClick={(e) => { e.stopPropagation(); toggle(r.inst.sym); }} aria-label="Toggle favourite"><Star className={cn("size-5", s.watch.includes(r.inst.sym) ? "fill-warn text-warn" : "text-muted-foreground")} /></button>
              <div className="min-w-0 flex-1"><div className="font-semibold">{r.inst.sym}</div><div className="text-[11px] text-muted-foreground">{r.inst.kind} · <DemoBadge className="scale-90" /></div></div>
              <div className="w-20"><MiniLine data={r.spark} height={36} color={r.chg >= 0 ? "var(--bull)" : "var(--bear)"} /></div>
              <div className="text-right"><div className="num text-sm font-semibold">{fmt(r.l)}</div><div className={cn("num text-xs", r.chg >= 0 ? "text-bull" : "text-bear")}>{r.chg >= 0 ? "+" : ""}{r.chg.toFixed(2)}%</div></div>
              <span className={cn("num w-14 rounded-md py-1 text-center text-xs font-bold", r.sig.action === "BUY" ? "bg-bull/15 text-bull" : r.sig.action === "SELL" ? "bg-bear/15 text-bear" : "bg-warn/15 text-warn")}>{r.sig.action}</span>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
