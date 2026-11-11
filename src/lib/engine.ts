// All data here is SYNTHETIC DEMO DATA generated in-browser. Not live exchange data.
export type TF = "5m" | "15m" | "1h" | "1d";
export type Bar = { t: number; o: number; h: number; l: number; c: number; v: number; day: number };
export const INSTRUMENTS = [
  { sym: "NIFTY 50", base: 24500, vol: 0.0016, kind: "Index" },
  { sym: "BANKNIFTY", base: 52000, vol: 0.002, kind: "Index" },
  { sym: "SENSEX", base: 80500, vol: 0.0015, kind: "Index" },
  { sym: "RELIANCE", base: 2900, vol: 0.0025, kind: "Equity" },
  { sym: "TCS", base: 4100, vol: 0.0022, kind: "Equity" },
  { sym: "INFY", base: 1850, vol: 0.0026, kind: "Equity" },
] as const;
export const TFS: TF[] = ["5m", "15m", "1h", "1d"];
const TF_MIN: Record<TF, number> = { "5m": 5, "15m": 15, "1h": 60, "1d": 375 };

function hash(s: string) { let h = 2166136261; for (const ch of s) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
export function rng(seed: number) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

export function genBars(sym: string, tf: TF, seed: number, n = 240): Bar[] {
  const inst = INSTRUMENTS.find((i) => i.sym === sym) ?? INSTRUMENTS[0];
  const r = rng(hash(`${sym}|${tf}|${seed}`));
  const scale = Math.sqrt(TF_MIN[tf] / 5);
  const sigma = inst.vol * scale;
  const perDay = tf === "1d" ? 1 : Math.floor(375 / TF_MIN[tf]);
  let p = inst.base * (0.95 + r() * 0.1);
  let drift = 0; const out: Bar[] = [];
  const start = Date.UTC(2026, 0, 1, 3, 45);
  for (let i = 0; i < n; i++) {
    if (i % 30 === 0) drift = (r() - 0.5) * sigma * 0.6;
    const day = Math.floor(i / perDay), slot = i % perDay;
    const o = p * (1 + (slot === 0 && tf !== "1d" ? (r() - 0.5) * sigma * 2 : 0));
    const ch = drift + (r() + r() + r() - 1.5) * sigma;
    const c = o * (1 + ch);
    const h = Math.max(o, c) * (1 + r() * sigma * 0.7), l = Math.min(o, c) * (1 - r() * sigma * 0.7);
    const u = slot === 0 || slot === perDay - 1 ? 1.8 : 1;
    const v = Math.round((inst.kind === "Index" ? 2e5 : 5e4) * scale * u * (0.5 + r() + Math.abs(ch) / sigma * 0.4));
    const t = tf === "1d" ? start + day * 864e5 : start + day * 864e5 + slot * TF_MIN[tf] * 6e4;
    out.push({ t, o, h, l, c, v, day }); p = c;
  }
  return out;
}

export function ema(x: number[], n: number) { const k = 2 / (n + 1); const o: number[] = []; x.forEach((v, i) => o.push(i === 0 ? v : v * k + o[i - 1] * (1 - k))); return o; }
function wilder(x: number[], n: number) { const o: number[] = new Array(x.length).fill(NaN); let s = 0; for (let i = 0; i < x.length; i++) { if (i < n) { s += x[i]; if (i === n - 1) o[i] = s / n; } else o[i] = (o[i - 1] * (n - 1) + x[i]) / n; } return o; }
export function rsi(c: number[], n = 14) { const g = [0], l = [0]; for (let i = 1; i < c.length; i++) { const d = c[i] - c[i - 1]; g.push(Math.max(d, 0)); l.push(Math.max(-d, 0)); } const ag = wilder(g.slice(1), n), al = wilder(l.slice(1), n); return [NaN, ...ag.map((a, i) => (al[i] === 0 ? 100 : 100 - 100 / (1 + a / al[i])))]; }
export function macd(c: number[]) { const m = ema(c, 12).map((v, i) => v - ema(c, 26)[i]); const s = ema(m, 9); return { m, s, h: m.map((v, i) => v - s[i]) }; }
function tr(b: Bar[]) { return b.map((x, i) => (i === 0 ? x.h - x.l : Math.max(x.h - x.l, Math.abs(x.h - b[i - 1].c), Math.abs(x.l - b[i - 1].c)))); }
export function atr(b: Bar[], n = 14) { return wilder(tr(b), n); }
export function adx(b: Bar[], n = 14) {
  const pd = [0], md = [0];
  for (let i = 1; i < b.length; i++) { const up = b[i].h - b[i - 1].h, dn = b[i - 1].l - b[i].l; pd.push(up > dn && up > 0 ? up : 0); md.push(dn > up && dn > 0 ? dn : 0); }
  const a = wilder(tr(b), n), p = wilder(pd, n), m = wilder(md, n);
  const pdi = p.map((v, i) => (100 * v) / a[i]), mdi = m.map((v, i) => (100 * v) / a[i]);
  const dx = pdi.map((v, i) => (isNaN(v) ? NaN : (100 * Math.abs(v - mdi[i])) / (v + mdi[i] || 1)));
  const first = dx.findIndex((v) => !isNaN(v)); const ad = new Array(b.length).fill(NaN);
  const w = wilder(dx.slice(first), n); w.forEach((v, i) => (ad[i + first] = v));
  return { adx: ad, pdi, mdi };
}
export function vwap(b: Bar[]) { let pv = 0, vv = 0, d = -1; return b.map((x) => { if (x.day !== d) { pv = 0; vv = 0; d = x.day; } const tp = (x.h + x.l + x.c) / 3; pv += tp * x.v; vv += x.v; return pv / vv; }); }
export function rvol(b: Bar[], n = 20) { return b.map((x, i) => { if (i < n) return NaN; let s = 0; for (let j = i - n; j < i; j++) s += b[j].v; return x.v / (s / n); }); }
export function engulf(b: Bar[], i: number): 1 | -1 | 0 { if (i < 1) return 0; const p = b[i - 1], c = b[i]; if (p.c < p.o && c.c > c.o && c.c >= p.o && c.o <= p.c) return 1; if (p.c > p.o && c.c < c.o && c.o >= p.c && c.c <= p.o) return -1; return 0; }
export function orb(b: Bar[], i: number, tf: TF) {
  if (tf === "1d" || tf === "1h") return null;
  const k = tf === "5m" ? 3 : 1; const d = b[i].day; const s = b.findIndex((x) => x.day === d);
  if (i < s + k) return { hi: NaN, lo: NaN, state: 0 as const, forming: true };
  const r = b.slice(s, s + k); const hi = Math.max(...r.map((x) => x.h)), lo = Math.min(...r.map((x) => x.l));
  return { hi, lo, state: (b[i].c > hi ? 1 : b[i].c < lo ? -1 : 0) as 1 | -1 | 0, forming: false };
}

export type Ind = ReturnType<typeof computeAll>;
export function computeAll(b: Bar[]) { const c = b.map((x) => x.c); return { e9: ema(c, 9), e21: ema(c, 21), rsi: rsi(c), macd: macd(c), atr: atr(b), adx: adx(b), vwap: vwap(b), rvol: rvol(b) }; }

export type Factor = { name: string; value: string; pts: number; note: string };
export type Signal = { action: "BUY" | "SELL" | "WAIT"; score: number; max: number; alignment: number; factors: Factor[]; guards: string[]; levels: null | { entry: number; stop: number; t1: number; t2: number; t3: number; risk: number } };
export const MAX_SCORE = 7;
export function signalAt(b: Bar[], ind: Ind, i: number, tf: TF): Signal {
  const x = b[i], f: Factor[] = [], g: string[] = [];
  const sgn = (v: boolean, w: boolean) => (v ? 1 : w ? -1 : 0);
  f.push({ name: "EMA 9/21", value: `${ind.e9[i].toFixed(1)} / ${ind.e21[i].toFixed(1)}`, pts: sgn(ind.e9[i] > ind.e21[i], ind.e9[i] < ind.e21[i]), note: "Fast vs slow trend" });
  f.push({ name: "VWAP", value: ind.vwap[i].toFixed(1), pts: sgn(x.c > ind.vwap[i], x.c < ind.vwap[i]), note: "Price vs session VWAP" });
  const r = ind.rsi[i];
  f.push({ name: "RSI 14", value: r.toFixed(1), pts: sgn(r > 52 && r < 70, r < 48 && r > 30), note: "Momentum band 52–70 / 30–48" });
  const h = ind.macd.h[i];
  f.push({ name: "MACD hist", value: h.toFixed(2), pts: sgn(h > 0 && h > ind.macd.h[i - 1], h < 0 && h < ind.macd.h[i - 1]), note: "Histogram sign + slope" });
  const { adx: A, pdi, mdi } = ind.adx;
  f.push({ name: "ADX / DI", value: `${A[i].toFixed(1)} · +${pdi[i].toFixed(0)} −${mdi[i].toFixed(0)}`, pts: A[i] >= 20 ? sgn(pdi[i] > mdi[i], mdi[i] > pdi[i]) : 0, note: "Directional only if ADX ≥ 20" });
  const e = engulf(b, i);
  f.push({ name: "Engulfing", value: e === 1 ? "Bullish" : e === -1 ? "Bearish" : "None", pts: e, note: "Last two candles" });
  const o = orb(b, i, tf);
  f.push({ name: "ORB", value: !o ? "N/A (TF)" : o.forming ? "Forming" : o.state === 1 ? "Above range" : o.state === -1 ? "Below range" : "Inside", pts: o && !o.forming ? o.state : 0, note: "Opening range (first 15 min)" });
  const score = f.reduce((s, z) => s + z.pts, 0);
  const rv = ind.rvol[i];
  if (!(A[i] >= 18)) g.push(`ADX ${isNaN(A[i]) ? "n/a" : A[i].toFixed(1)} < 18: no trend`);
  if (!(rv >= 0.8)) g.push(`Relative volume ${isNaN(rv) ? "n/a" : rv.toFixed(2)} < 0.8`);
  if (score > 0 && r >= 72) g.push("RSI overbought ≥ 72");
  if (score < 0 && r <= 28) g.push("RSI oversold ≤ 28");
  if (Math.abs(score) < 4) g.push(`|score| ${Math.abs(score)} below threshold 4`);
  const action = g.length ? "WAIT" : score > 0 ? "BUY" : "SELL";
  const a = ind.atr[i];
  const levels = action === "WAIT" || isNaN(a) ? null : (() => { const d = action === "BUY" ? 1 : -1, risk = 1.5 * a; return { entry: x.c, stop: x.c - d * risk, t1: x.c + d * risk, t2: x.c + d * risk * 2, t3: x.c + d * risk * 3, risk }; })();
  return { action, score, max: MAX_SCORE, alignment: Math.round((Math.abs(score) / MAX_SCORE) * 100), factors: f, guards: g, levels };
}

export type BTTrade = { side: 1 | -1; entryI: number; exitI: number; entry: number; exit: number; r: number; why: string };
export function backtest(b: Bar[], tf: TF, maxHold = 20) {
  const ind = computeAll(b); const trades: BTTrade[] = [];
  let i = 40;
  while (i < b.length - 2) {
    const s = signalAt(b, ind, i, tf);
    if (!s.levels) { i++; continue; }
    const side = s.action === "BUY" ? 1 : -1, ent = b[i + 1].o, risk = s.levels.risk;
    const stop = ent - side * risk, tgt = ent + side * risk * 2;
    let j = i + 1, exit = b[b.length - 1].c, why = "End of data";
    for (; j < b.length && j <= i + maxHold; j++) {
      const k = b[j];
      if (side === 1 ? k.l <= stop : k.h >= stop) { exit = stop; why = "Stop"; break; }
      if (side === 1 ? k.h >= tgt : k.l <= tgt) { exit = tgt; why = "Target 2R"; break; }
      exit = k.c; why = "Time exit";
    }
    j = Math.min(j, b.length - 1);
    trades.push({ side, entryI: i + 1, exitI: j, entry: ent, exit, r: ((exit - ent) * side) / risk, why });
    i = j + 1;
  }
  const wins = trades.filter((t) => t.r > 0), loss = trades.filter((t) => t.r <= 0);
  let eq = 0, peak = 0, dd = 0; const curve = trades.map((t) => { eq += t.r; peak = Math.max(peak, eq); dd = Math.min(dd, eq - peak); return eq; });
  const gw = wins.reduce((s, t) => s + t.r, 0), gl = -loss.reduce((s, t) => s + t.r, 0);
  return { trades, curve, n: trades.length, winRate: trades.length ? wins.length / trades.length : 0, totalR: eq, avgR: trades.length ? eq / trades.length : 0, maxDD: dd, pf: gl ? gw / gl : gw ? Infinity : 0 };
}
export const fmt = (v: number, d = 2) => (isNaN(v) ? "—" : v.toLocaleString("en-IN", { minimumFractionDigits: d, maximumFractionDigits: d }));
