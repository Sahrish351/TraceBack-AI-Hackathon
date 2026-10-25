import React from "react";
import { Database, Layers, Cpu, Code2, CheckCircle2, AlertTriangle, ShieldCheck, ExternalLink, RefreshCw, KeyRound, Server } from "lucide-react";
import { SystemHealth } from "../types";

interface IntegrationsScreenProps {
  systemHealth: SystemHealth | null;
  loading: boolean;
  onRefresh: () => void;
}

export const IntegrationsScreen: React.FC<IntegrationsScreenProps> = ({
  systemHealth,
  loading,
  onRefresh
}) => {
  const zetaris = systemHealth?.sponsorIntegrations.zetaris;
  const meterless = systemHealth?.sponsorIntegrations.meterless;
  const nvidia = systemHealth?.sponsorIntegrations.nvidia;
  const cursor = systemHealth?.sponsorIntegrations.cursor;

  const renderStatusPill = (status?: string) => {
    const s = status || "Not configured";
    if (s.includes("Connected and verified")) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EAF3ED] text-[#246B52] border border-[#DCEBE1]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#246B52] mr-1.5"></span>
          Connected & Verified
        </span>
      );
    }
    if (s.includes("Configured but not verified")) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1E40AF] mr-1.5"></span>
          Configured (Unverified)
        </span>
      );
    }
    if (s.includes("Blocked")) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FDF1ED] text-[#C66A4A] border border-[#F3C5B5]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C66A4A] mr-1.5"></span>
          Blocked by Credentials
        </span>
      );
    }
    if (s.includes("Local / demo mode")) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FAF8F3] text-[#143D2F] border border-[#DCEBE1]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#246B52] mr-1.5"></span>
          Local / Demo Mode
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FAF8F3] text-[#667066] border border-[#E5E7E2]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#8F9A8F] mr-1.5"></span>
        Not Configured
      </span>
    );
  };

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#143D2F]">Integrations & Sponsor Technology</h1>
          <p className="text-sm text-[#667066] mt-1">
            Real-time status, endpoint diagnostics, and honest fallback reporting.
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center space-x-2 bg-white hover:bg-[#FAF8F3] text-[#143D2F] border border-[#E5E7E2] px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#246B52]" : ""}`} />
          <span>Refresh Health Checks</span>
        </button>
      </div>

      {/* Honesty Policy Notice */}
      <div className="p-4 rounded-xl bg-[#FAF8F3] border border-[#DCEBE1] flex items-start space-x-3 text-xs text-[#202720]">
        <ShieldCheck className="w-4 h-4 text-[#246B52] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-[#143D2F]">Hackathon Transparency Guarantee: </span>
          Services display <span className="font-semibold text-[#246B52]">Connected and verified</span> only when confirmed by live network health checks. In the absence of live production credentials, TraceBack AI operates seamlessly via deterministic local adapters and in-memory data virtualization.
        </div>
      </div>

      {/* Integration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Zetaris */}
        <div className="bg-white p-6 rounded-xl border border-[#E5E7E2] shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-[#FAF8F3] border border-[#E5E7E2] flex items-center justify-center text-[#246B52]">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#143D2F]">Zetaris</h3>
                <span className="text-xs text-[#667066]">Cross-Source Data Virtualization</span>
              </div>
            </div>
            {renderStatusPill(zetaris?.status)}
          </div>

          <p className="text-xs text-[#667066] leading-relaxed">
            Federates 4 disparate procurement datasets (Purchase Orders, Delivery Receipts, Invoices, Contract Prices) into a single virtualized view using Node 22 SQLite engine when remote credentials are unconfigured.
          </p>

          <div className="p-3 bg-[#FAF8F3] rounded-lg border border-[#E5E7E2] text-xs font-mono space-y-1 text-[#667066]">
            <div>Engine: <span className="text-[#143D2F] font-semibold">{zetaris?.engine || "In-Memory SQLite Virtualizer"}</span></div>
            <div>Latency: <span className="text-[#143D2F]">{zetaris?.latencyMs || 2}ms</span></div>
            <div>State: <span className="text-[#246B52] font-semibold">{zetaris?.status || "Local / demo mode"}</span></div>
            {zetaris?.reason && <div className="text-[11px] text-[#8F9A8F]">Note: {zetaris.reason}</div>}
          </div>
        </div>

        {/* Meterless */}
        <div className="bg-white p-6 rounded-xl border border-[#E5E7E2] shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-[#FAF8F3] border border-[#E5E7E2] flex items-center justify-center text-[#246B52]">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#143D2F]">Meterless</h3>
                <span className="text-xs text-[#667066]">Agent Mission Orchestration & H-MEM</span>
              </div>
            </div>
            {renderStatusPill(meterless?.status)}
          </div>

          <p className="text-xs text-[#667066] leading-relaxed">
            Coordinates the 5-step agent investigation workflow (Scout Intent → Fetch Unified Data → Detect Discrepancies → Score Confidence → Draft Explanation) with hierarchical session memory tracking.
          </p>

          <div className="p-3 bg-[#FAF8F3] rounded-lg border border-[#E5E7E2] text-xs font-mono space-y-1 text-[#667066]">
            <div>Pipeline: <span className="text-[#143D2F] font-semibold">5-Step Sequential Agent Relay</span></div>
            <div>Memory: <span className="text-[#143D2F]">H-MEM In-Memory Session Store</span></div>
            <div>State: <span className="text-[#246B52] font-semibold">{meterless?.status || "Local / demo mode"}</span></div>
            {meterless?.reason && <div className="text-[11px] text-[#8F9A8F]">Note: {meterless.reason}</div>}
          </div>
        </div>

        {/* NVIDIA */}
        <div className="bg-white p-6 rounded-xl border border-[#E5E7E2] shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-[#FAF8F3] border border-[#E5E7E2] flex items-center justify-center text-[#143D2F]">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#143D2F]">NVIDIA NIM</h3>
                <span className="text-xs text-[#667066]">Inference Microservice & Dispute Drafter</span>
              </div>
            </div>
            {renderStatusPill(nvidia?.status)}
          </div>

          <p className="text-xs text-[#667066] leading-relaxed">
            Translates deterministic reconciliation findings into audit summaries and supplier dispute emails. Strictly guarded: numerical calculations are computed server-side in TypeScript, preventing LLM hallucinations.
          </p>

          <div className="p-3 bg-[#FAF8F3] rounded-lg border border-[#E5E7E2] text-xs font-mono space-y-1 text-[#667066]">
            <div>Model: <span className="text-[#143D2F] font-semibold">{nvidia?.model || "meta/llama-3.1-8b-instruct"}</span></div>
            <div>Endpoint: <span className="text-[#143D2F] truncate block">https://integrate.api.nvidia.com</span></div>
            <div>State: <span className="text-[#246B52] font-semibold">{nvidia?.status || "Local / demo mode"}</span></div>
            {nvidia?.reason && <div className="text-[11px] text-[#8F9A8F]">Note: {nvidia.reason}</div>}
          </div>
        </div>

        {/* Cursor */}
        <div className="bg-white p-6 rounded-xl border border-[#E5E7E2] shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-[#FAF8F3] border border-[#E5E7E2] flex items-center justify-center text-[#143D2F]">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#143D2F]">Cursor</h3>
                <span className="text-xs text-[#667066]">Developer Velocity & Pair Programming</span>
              </div>
            </div>
            {renderStatusPill(cursor?.status)}
          </div>

          <p className="text-xs text-[#667066] leading-relaxed">
            Full audit log of developer prompts, architectural decisions, and refactoring sessions maintained in docs/CURSOR_USAGE.md.
          </p>

          <div className="p-3 bg-[#FAF8F3] rounded-lg border border-[#E5E7E2] text-xs font-mono space-y-1 text-[#667066]">
            <div>Documentation: <span className="text-[#143D2F] font-semibold">docs/CURSOR_USAGE.md</span></div>
            <div>Prompt Log: <span className="text-[#143D2F]">PROMPTS_LOG.md</span></div>
            <div>State: <span className="text-[#246B52] font-semibold">Audit Logged (Git Tracked)</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};
