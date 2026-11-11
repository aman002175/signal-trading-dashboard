import { createFileRoute } from "@tanstack/react-router";
import { useStore, useAnalysis } from "@/lib/store";
import { CandleChart, MiniLine } from "@/components/Chart";
import { Selectors } from "@/components/Selectors";
import { Panel, Stat, Synthetic, DemoBadge } from "@/components/ui-kit";
import { fmt, orb } from "@/lib/engine";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Dashboard — Signal Robot Pro (Demo)" },
    { name: "description", content: "Synthetic demo chart, indicators and transparent BUY/SELL/WAIT alignment score." },
    { property: "og:title", content: "Signal Robot Pro Dashboard" },
    { property: "og:description", content: "Demo signal terminal on synthetic data with EMA, RSI, MACD, ATR, ADX, VWAP and ORB." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Dashboard,
});

function Dashboard() {
  const { bars, tf, sym } = useStore();
  const { ind, sig } = useAnalysis(bars, tf);
  const i = bars.length - 1, last = bars[i], prev = bars[i - 1];
  const chg = ((last.c - prev.c) / prev.c) * 100;
  const o = orb(bars, i, tf);
  const tone = sig.action === "BUY" ? "bull" : sig.action === "SELL" ? "bear" : "warn";
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div><div className="flex items-center gap-2 text-xs text-muted-foreground">{sym} · {tf} <DemoBadge /></div>
          <div className="num mt-1 text-3xl font-bold">{fmt(last.c)} <span className={cn("text-base", chg >= 0 ? "text-bull" : "text-bear")}>{chg >= 0 ? "+" : ""}{chg.toFixed(2)}%</span></div></div>
        <Selectors />
      </div>
      <Synthetic />
      <div className="grid gap-3 lg:grid-cols-3">
        <Panel title="Price · synthetic OHLCV" className="lg:col-span-2" right={<DemoBadge />}><CandleChart bars={bars} ind={ind} levels={sig.levels} /></Panel>
        <Panel title="Signal" right={<DemoBadge />}>
          <div className={cn("rounded-xl border p-4 text-center", tone === "bull" && "border-bull/50 bg-bull/10", tone === "bear" && "border-bear/50 bg-bear/10", tone === "warn" && "border-warn/50 bg-warn/10")}>
            <div className={cn("text-4xl font-black tracking-tight", `text-${tone}`)}>{sig.action}</div>
            <div className="num mt-1 text-sm">Score {sig.score > 0 ? "+" : ""}{sig.score} / ±{sig.max}</div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted"><div className={cn("h-full", `bg-${tone}`)} style={{ width: `${sig.alignment}%` }} /></div>
            <div className="mt-1.5 text-xs text-muted-foreground">Alignment score <b className="num text-foreground">{sig.alignment}%</b> — share of indicators agreeing. <b>Not a win probability.</b></div>
          </div>
          {sig.guards.length > 0 && <div className="mt-3 space-y-1"><div className="text-[10px] uppercase tracking-wider text-muted-foreground">WAIT guards triggered</div>{sig.guards.map((g) => <div key={g} className="rounded-md bg-warn/10 px-2 py-1 text-xs text-warn">• {g}</div>)}</div>}
          {sig.levels ? <div className="mt-3 grid grid-cols-2 gap-2">
            <Stat label="Entry ref" value={fmt(sig.levels.entry)} /><Stat label="Stop (1.5×ATR)" value={fmt(sig.levels.stop)} tone="bear" />
            <Stat label="T1 · 1R" value={fmt(sig.levels.t1)} tone="bull" /><Stat label="T2 · 2R" value={fmt(sig.levels.t2)} tone="bull" />
            <Stat label="T3 · 3R" value={fmt(sig.levels.t3)} tone="bull" /><Stat label="Risk/Reward" value="1 : 1 / 2 / 3" />
          </div> : <p className="mt-3 text-xs text-muted-foreground">No illustrative levels while WAIT. Levels appear only when all guards pass.</p>}
          <p className="mt-3 text-[11px] text-muted-foreground">Illustrative reference levels on synthetic data only. Not a recommendation.</p>
        </Panel>
      </div>
      <Panel title="Score breakdown (transparent)">
        <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground"><th className="py-1.5">Factor</th><th>Value</th><th className="hidden sm:table-cell">Rule</th><th className="text-right">Pts</th></tr></thead>
          <tbody>{sig.factors.map((f) => <tr key={f.name} className="border-t border-border"><td className="py-2 font-medium">{f.name}</td><td className="num text-xs">{f.value}</td><td className="hidden text-xs text-muted-foreground sm:table-cell">{f.note}</td><td className={cn("num text-right font-bold", f.pts > 0 ? "text-bull" : f.pts < 0 ? "text-bear" : "text-muted-foreground")}>{f.pts > 0 ? "+1" : f.pts < 0 ? "−1" : "0"}</td></tr>)}</tbody></table></div>
        <p className="mt-2 text-xs text-muted-foreground">BUY/SELL requires |score| ≥ 4, ADX ≥ 18, relative volume ≥ 0.8 and no RSI extreme. Otherwise WAIT.</p>
      </Panel>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <Stat label="RSI 14 (Wilder)" value={fmt(ind.rsi[i], 1)} tone={ind.rsi[i] > 70 ? "bear" : ind.rsi[i] < 30 ? "bull" : undefined} />
        <Stat label="ATR 14" value={fmt(ind.atr[i])} />
        <Stat label="ADX 14" value={fmt(ind.adx.adx[i], 1)} />
        <Stat label="Rel. volume" value={`${fmt(ind.rvol[i])}×`} />
        <Stat label="MACD" value={fmt(ind.macd.m[i])} /><Stat label="MACD signal" value={fmt(ind.macd.s[i])} />
        <Stat label="Session VWAP" value={fmt(ind.vwap[i])} />
        <Stat label="ORB high / low" value={!o ? "N/A" : o.forming ? "Forming" : `${fmt(o.hi, 0)} / ${fmt(o.lo, 0)}`} />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Panel title="RSI 14"><MiniLine data={ind.rsi.slice(-90)} color="var(--chart-2)" /></Panel>
        <Panel title="MACD histogram"><MiniLine data={ind.macd.h.slice(-90)} zero color="var(--chart-1)" /></Panel>
      </div>
      <Panel title="Methodology & disclaimer">
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Bars are generated by a deterministic pseudo-random walk seeded by instrument, timeframe and sample number. Indicators are computed in your browser from those bars. Nothing here comes from an exchange.</p>
          <p>The signal is a simple vote of seven rules. The alignment score shows how many agree — it is <b className="text-foreground">not</b> a probability of profit. There is <b className="text-foreground">no guarantee of profit</b>.</p>
          <p>Before any real use you would need genuine licensed market data, realistic costs and slippage, and out-of-sample / walk-forward validation. This prototype places no orders with any broker.</p>
        </div>
      </Panel>
    </div>
  );
}
