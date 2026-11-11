import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { LayoutDashboard, List, Wallet, FlaskConical, Settings, Bot } from "lucide-react";
import { DemoBadge } from "./ui-kit";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/watchlist", label: "Watchlist", icon: List },
  { to: "/paper", label: "Paper", icon: Wallet },
  { to: "/backtest", label: "Backtest", icon: FlaskConical },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen pb-24 md:pb-10">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Bot className="size-5" /></div>
          <div className="leading-tight"><div className="font-bold tracking-tight">Signal Robot <span className="text-primary">Pro</span></div><div className="text-[10px] uppercase tracking-widest text-muted-foreground">Trial prototype</div></div>
          <nav className="ml-6 hidden gap-1 md:flex">{NAV.map((n) => <Link key={n.to} to={n.to} activeOptions={{ exact: true }} className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground" activeProps={{ className: "bg-secondary text-foreground" }}>{n.label}</Link>)}</nav>
          <DemoBadge className="ml-auto" />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-3 py-4 md:px-4">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        {NAV.map((n) => <Link key={n.to} to={n.to} activeOptions={{ exact: true }} className="flex flex-col items-center gap-1 py-2.5 text-[10px] text-muted-foreground" activeProps={{ className: "text-primary" }}><n.icon className="size-5" />{n.label}</Link>)}
      </nav>
    </div>
  );
}
