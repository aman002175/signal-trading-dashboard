import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { backtest, genBars, fmt } from "@/lib/engine";
import { Panel, Synthetic, Stat, Seg, DemoBadge } from "@/components/ui-kit";
import { Selectors } from "@/components/Selectors";
import { MiniLine } from "@/components/Chart";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/backtest")({
  head: () => ({ meta: [
    { title: "Backtest — Signal Robot Pro (Demo)" },
    { name: "description", content: "Sample backtest of the rule-based signal over synthetic generated bars." },
    { property: "og:title", content: "Signal Robot Pro Backtest" }, { property: "og:description", content: "Illustrative trade metrics on synthetic bars only." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Backtest,
});

const SIZES = ["240", "500", "1000"] as const;
function Backtest() {
  const s = useStore();
  const [n, setN] = useState<(typeof SIZES)[number]>("500");
  const r = useMemo(() => backtest(genBars(s.sym, s.tf, s.seed, +n), s.tf), [s.sym, s.tf, s.seed, n]);
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between"><h1 className="text-xl font-bold">Backtest <DemoBadge /></h1><Selectors /></div>
      <div className="demo-stripe rounded-xl border-2 border-warn/60 p-4 text-sm text-warn"><b className="block text-base">Synthetic data backtest — not evidence of edge</b>These results come from randomly generated bars. They say nothing about real markets, exclude costs and slippage, and must never be used to judge real-world performance.</div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">Bars <Seg value={n} options={SIZES} onChange={setN} /></div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-6">
        <Stat label="Trades" value={r.n} /><Stat label="Win rate" value={`${(r.winRate * 100).toFixed(0)}%`} />
        <Stat label="Total R" value={fmt(r.totalR)} tone={r.totalR >= 0 ? "bull" : "bear"} /><Stat label="Avg R" value={fmt(r.avgR)} />
        <Stat label="Max DD (R)" value={fmt(r.maxDD)} tone="bear" /><Stat label="Profit factor" value={isFinite(r.pf) ? fmt(r.pf) : "∞"} />
      </div>
      <Panel title="Equity curve (R multiples)"><MiniLine data={[0, ...r.curve]} height={120} zero /></Panel>
      <Panel title="Sample trades">
        {r.n === 0 ? <p className="text-sm text-muted-foreground">No trades passed the conservative guards on this sample. Try another sample or timeframe.</p> :
        <div className="max-h-96 overflow-auto"><table className="w-full text-sm"><thead className="sticky top-0 bg-card"><tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground"><th className="py-1.5">#</th><th>Side</th><th>Entry</th><th>Exit</th><th className="hidden sm:table-cell">Reason</th><th className="text-right">R</th></tr></thead>
          <tbody>{r.trades.map((t, i) => <tr key={i} className="num border-t border-border text-xs"><td className="py-1.5">{i + 1}</td><td className={t.side === 1 ? "text-bull" : "text-bear"}>{t.side === 1 ? "Long" : "Short"}</td><td>{fmt(t.entry)}</td><td>{fmt(t.exit)}</td><td className="hidden text-muted-foreground sm:table-cell">{t.why}</td><td className={cn("text-right font-bold", t.r >= 0 ? "text-bull" : "text-bear")}>{t.r.toFixed(2)}</td></tr>)}</tbody></table></div>}
        <p className="mt-2 text-xs text-muted-foreground">Rules: enter next bar open on signal; stop 1.5×ATR; target 2R; time exit after 20 bars.</p>
      </Panel>
      <Synthetic>Real validation requires genuine market data and out-of-sample / walk-forward testing.</Synthetic>
    </div>
  );
}
