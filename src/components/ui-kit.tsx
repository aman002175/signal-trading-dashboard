import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
export function Panel({ title, right, children, className }: { title?: ReactNode; right?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={cn("card-surface p-4", className)}>{(title || right) && <div className="mb-3 flex items-center justify-between gap-2"><h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{title}</h2>{right}</div>}{children}</section>;
}
export function DemoBadge({ className }: { className?: string }) {
  return <span className={cn("inline-flex items-center gap-1.5 rounded-md border border-warn/60 bg-warn/15 px-2 py-0.5 text-[10px] font-bold tracking-widest text-warn num", className)}><span className="size-1.5 rounded-full bg-warn" />DEMO DATA</span>;
}
export function Synthetic({ children }: { children?: ReactNode }) {
  return <div className="demo-stripe rounded-lg border border-warn/40 px-3 py-2 text-xs text-warn">⚠ {children ?? "Synthetic demo data generated in your browser. Not live exchange data. Not investment advice."}</div>;
}
export function Stat({ label, value, tone }: { label: string; value: ReactNode; tone?: "bull" | "bear" | "warn" }) {
  return <div className="rounded-lg bg-muted/60 p-2.5"><div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div><div className={cn("num mt-0.5 text-sm font-semibold", tone === "bull" && "text-bull", tone === "bear" && "text-bear", tone === "warn" && "text-warn")}>{value}</div></div>;
}
export function Seg<T extends string>({ value, options, onChange }: { value: T; options: readonly T[]; onChange: (v: T) => void }) {
  return <div className="inline-flex rounded-lg bg-muted p-0.5">{options.map((o) => <button key={o} onClick={() => onChange(o)} className={cn("num rounded-md px-2.5 py-1 text-xs font-medium transition", o === value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>{o}</button>)}</div>;
}
export function Btn({ children, onClick, variant = "primary", className, disabled }: { children: ReactNode; onClick?: () => void; variant?: "primary" | "ghost" | "bull" | "bear"; className?: string; disabled?: boolean }) {
  const v = { primary: "bg-primary text-primary-foreground hover:opacity-90", ghost: "border border-border bg-secondary text-secondary-foreground hover:bg-accent", bull: "bg-bull text-primary-foreground hover:opacity-90", bear: "bg-bear text-destructive-foreground hover:opacity-90" }[variant];
  return <button disabled={disabled} onClick={onClick} className={cn("inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition disabled:opacity-40", v, className)}>{children}</button>;
}
