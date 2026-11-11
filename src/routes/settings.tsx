import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { Panel, Btn, Synthetic } from "@/components/ui-kit";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [
    { title: "Settings — Signal Robot Pro (Demo)" },
    { name: "description", content: "Data source status, AI review status and local demo settings." },
    { property: "og:title", content: "Signal Robot Pro Settings" }, { property: "og:description", content: "Live market data not connected. Demo mode only." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Settings,
});

function Row({ label, status, tone }: { label: string; status: string; tone: "warn" | "bear" | "muted" }) {
  return <div className="flex items-center justify-between border-t border-border py-2.5 first:border-0"><span className="text-sm">{label}</span><span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${tone === "warn" ? "bg-warn/15 text-warn" : tone === "bear" ? "bg-bear/15 text-bear" : "bg-muted text-muted-foreground"}`}>{status}</span></div>;
}
function Settings() {
  const s = useStore();
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold">Settings</h1>
      <Panel title="Connections">
        <Row label="Live market data" status="Not connected" tone="bear" />
        <Row label="Data source in use" status="Synthetic demo generator" tone="warn" />
        <Row label="Broker execution" status="Disabled — none" tone="muted" />
        <Row label="AI review" status="Not connected" tone="muted" />
        <p className="mt-3 text-xs text-muted-foreground">This app makes no live market API requests. Every price is generated in your browser.</p>
      </Panel>
      <Panel title="Optional AI review">
        <p className="text-sm text-muted-foreground">An AI commentary feature could be added later through a secure server. It is not connected in this prototype.</p>
        <p className="mt-2 rounded-lg bg-bear/10 p-3 text-sm text-bear">Never place secret API keys (AI, broker or data vendor) in browser code — anyone can read them from the page. Secrets belong on a server only.</p>
      </Panel>
      <Panel title="Local demo state">
        <p className="mb-3 text-sm text-muted-foreground">Your selections, watchlist and paper trades are stored only in this browser.</p>
        <div className="flex flex-wrap gap-2"><Btn variant="ghost" onClick={() => s.set({ seed: 1 })}>Reset demo sample to #1</Btn><Btn variant="ghost" onClick={() => s.set({ positions: [], closed: [], drift: {} })}>Clear paper trades</Btn><Btn variant="bear" onClick={() => { if (confirm("Reset all local demo state?")) s.reset(); }}>Reset everything</Btn></div>
      </Panel>
      <Synthetic>Signal Robot Pro is a trial prototype. No profit guarantee. Not investment advice.</Synthetic>
    </div>
  );
}
