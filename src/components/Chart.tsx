import { useState } from "react";
import type { Bar, Ind } from "@/lib/engine";
import { fmt } from "@/lib/engine";

export function CandleChart({ bars, ind, show = 90, levels }: { bars: Bar[]; ind: Ind; show?: number; levels?: { entry: number; stop: number; t1: number; t2: number; t3: number } | null }) {
  const [hover, setHover] = useState<number | null>(null);
  const s = Math.max(0, bars.length - show), b = bars.slice(s);
  const W = 800, H = 320, VH = 60, P = 6, R = 56;
  const extra = levels ? [levels.stop, levels.t3] : [];
  const hi = Math.max(...b.map((x) => x.h), ...extra), lo = Math.min(...b.map((x) => x.l), ...extra);
  const pad = (hi - lo) * 0.05, y = (v: number) => P + ((hi + pad - v) / (hi - lo + 2 * pad)) * (H - 2 * P);
  const cw = (W - R) / b.length, x = (i: number) => i * cw + cw / 2;
  const vmax = Math.max(...b.map((k) => k.v));
  const line = (arr: number[]) => b.map((_, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(arr[s + i]).toFixed(1)}`).join("");
  const hb = hover != null ? b[hover] : b[b.length - 1];
  const lv = levels ? ([["T3", levels.t3, "var(--bull)"], ["T2", levels.t2, "var(--bull)"], ["T1", levels.t1, "var(--bull)"], ["Entry", levels.entry, "var(--info)"], ["Stop", levels.stop, "var(--bear)"]] as const) : [];
  return (
    <div className="relative">
      <div className="num mb-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
        <span>O <b className="text-foreground">{fmt(hb.o)}</b></span><span>H <b className="text-foreground">{fmt(hb.h)}</b></span><span>L <b className="text-foreground">{fmt(hb.l)}</b></span><span>C <b className={hb.c >= hb.o ? "text-bull" : "text-bear"}>{fmt(hb.c)}</b></span><span>V {hb.v.toLocaleString("en-IN")}</span>
        <span className="text-chart-1">— EMA9</span><span className="text-chart-2">— EMA21</span><span className="text-chart-3">··· VWAP</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H + VH}`} className="w-full touch-none select-none" onPointerLeave={() => setHover(null)}
        onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); const i = Math.floor((((e.clientX - r.left) / r.width) * W) / cw); setHover(i >= 0 && i < b.length ? i : null); }}>
        {[0.2, 0.4, 0.6, 0.8].map((f) => { const v = lo - pad + (hi - lo + 2 * pad) * f; return <g key={f}><line x1={0} x2={W - R} y1={y(v)} y2={y(v)} stroke="var(--border)" strokeDasharray="2 4" /><text x={W - R + 4} y={y(v) + 3} fontSize={10} fill="var(--muted-foreground)" className="num">{fmt(v, 0)}</text></g>; })}
        <text x={(W - R) / 2} y={H / 2} textAnchor="middle" fontSize={44} fontWeight={800} fill="var(--warn)" opacity={0.06}>SYNTHETIC DEMO</text>
        {b.map((k, i) => { const up = k.c >= k.o, c = up ? "var(--bull)" : "var(--bear)"; return <g key={i}>
          <rect x={x(i) - cw * 0.35} y={H + VH - (k.v / vmax) * (VH - 6)} width={cw * 0.7} height={(k.v / vmax) * (VH - 6)} fill={c} opacity={0.3} />
          <line x1={x(i)} x2={x(i)} y1={y(k.h)} y2={y(k.l)} stroke={c} strokeWidth={1} />
          <rect x={x(i) - cw * 0.35} y={y(Math.max(k.o, k.c))} width={cw * 0.7} height={Math.max(1, Math.abs(y(k.o) - y(k.c)))} fill={c} rx={0.5} /></g>; })}
        <path d={line(ind.vwap)} fill="none" stroke="var(--chart-3)" strokeWidth={1.2} strokeDasharray="3 3" />
        <path d={line(ind.e21)} fill="none" stroke="var(--chart-2)" strokeWidth={1.5} />
        <path d={line(ind.e9)} fill="none" stroke="var(--chart-1)" strokeWidth={1.5} />
        {lv.map(([n, v, c]) => <g key={n}><line x1={0} x2={W - R} y1={y(v)} y2={y(v)} stroke={c} strokeDasharray="6 4" opacity={0.8} /><rect x={W - R} y={y(v) - 8} width={R} height={16} fill={c} rx={3} /><text x={W - R + 4} y={y(v) + 4} fontSize={10} fontWeight={700} fill="var(--primary-foreground)" className="num">{n}</text></g>)}
        {hover != null && <line x1={x(hover)} x2={x(hover)} y1={0} y2={H + VH} stroke="var(--muted-foreground)" opacity={0.5} />}
      </svg>
    </div>
  );
}

export function MiniLine({ data, height = 80, zero = false, color = "var(--primary)" }: { data: number[]; height?: number; zero?: boolean; color?: string }) {
  const d = data.filter((v) => !isNaN(v)); if (d.length < 2) return <div className="text-xs text-muted-foreground">Not enough data</div>;
  const W = 400, hi = Math.max(...d, zero ? 0 : -Infinity), lo = Math.min(...d, zero ? 0 : Infinity), r = hi - lo || 1;
  const y = (v: number) => 4 + ((hi - v) / r) * (height - 8);
  const p = d.map((v, i) => `${i ? "L" : "M"}${((i / (d.length - 1)) * W).toFixed(1)},${y(v).toFixed(1)}`).join("");
  return <svg viewBox={`0 0 ${W} ${height}`} className="w-full" preserveAspectRatio="none">{zero && <line x1={0} x2={W} y1={y(0)} y2={y(0)} stroke="var(--border)" strokeDasharray="3 3" />}<path d={`${p}L${W},${height}L0,${height}Z`} fill={color} opacity={0.08} /><path d={p} fill="none" stroke={color} strokeWidth={2} vectorEffect="non-scaling-stroke" /></svg>;
}
