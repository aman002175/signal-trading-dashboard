import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { genBars, computeAll, signalAt, INSTRUMENTS, type TF, type Bar } from "./engine";

export type Position = { id: string; sym: string; side: 1 | -1; qty: number; entry: number; openedAt: number };
export type Closed = Position & { exit: number; pnl: number; closedAt: number };
type S = { sym: string; tf: TF; seed: number; watch: string[]; positions: Position[]; closed: Closed[]; drift: Record<string, number>; capital: number };
const DEF: S = { sym: "NIFTY 50", tf: "15m", seed: 1, watch: INSTRUMENTS.map((i) => i.sym), positions: [], closed: [], drift: {}, capital: 1000000 };
const KEY = "srp-demo-state-v1";
type Ctx = S & { set: (p: Partial<S>) => void; bars: Bar[]; reset: () => void };
const C = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<S>(DEF);
  const [ready, setReady] = useState(false);
  useEffect(() => { try { const r = localStorage.getItem(KEY); if (r) setS({ ...DEF, ...JSON.parse(r) }); } catch {} setReady(true); }, []);
  useEffect(() => { if (ready) localStorage.setItem(KEY, JSON.stringify(s)); }, [s, ready]);
  const bars = useMemo(() => genBars(s.sym, s.tf, s.seed), [s.sym, s.tf, s.seed]);
  const v: Ctx = { ...s, bars, set: (p) => setS((o) => ({ ...o, ...p })), reset: () => setS(DEF) };
  return <C.Provider value={v}>{children}</C.Provider>;
}
export function useStore() { const c = useContext(C); if (!c) throw new Error("no store"); return c; }
export function useAnalysis(bars: Bar[], tf: TF) { return useMemo(() => { const ind = computeAll(bars); return { ind, sig: signalAt(bars, ind, bars.length - 1, tf) }; }, [bars, tf]); }
/** Synthetic demo price for a symbol: last close of its sample plus any simulated drift. */
export function demoPrice(sym: string, tf: TF, seed: number, drift: Record<string, number>) { const b = genBars(sym, tf, seed); return b[b.length - 1].c * (1 + (drift[sym] ?? 0)); }
