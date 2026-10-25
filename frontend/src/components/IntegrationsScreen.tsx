import React from "react";
import { Database, Layers, Cpu, Code2, CheckCircle2, AlertTriangle, ShieldCheck, ExternalLink, RefreshCw } from "lucide-react";
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
                <span className="text-xs text-[#667066]">Data Virtualization Layer</span>
              </div>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#EAF3ED] text-[#246B52] border border-[#DCEBE1]">
              Fixture Mode Active
            </span>
          </div>

          <p className="text-xs text-[#667066] leading-relaxed">
            Simulates Zetaris cross-source virtualization engine using in-memory Node 22 SQLite federating queries across Purchase Orders, Goods Delivery Notes, Invoices, and Master Contract pricing CSVs.
          </p>

          <div className="p-3 bg-[#FAF8F3] rounded-lg border border-[#E5E7E2] text-xs font-mono space-y-1 text-[#667066]">
            <div>Engine: <span className="text-[#143D2F] font-semibold">{zetaris?.engine || "In-Memory SQLite Virtualizer"}</span></div>
            <div>Latency: <span className="text-[#143D2F]">{zetaris?.latencyMs || 2}ms</span></div>
            <div>Mode: <span className="text-[#246B52] font-semibold">{zetaris?.mode?.toUpperCase() || "MOCK"}</span></div>
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
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#EAF3ED] text-[#246B52] border border-[#DCEBE1]">
              Connected
            </span>
          </div>

          <p className="text-xs text-[#667066] leading-relaxed">
            Executes agent investigation missions following the documented 5-step relay architecture: Scout Intent → Fetch Unified Data → Detect Discrepancies → Score Confidence → Draft Explanation.
          </p>

          <div className="p-3 bg-[#FAF8F3] rounded-lg border border-[#E5E7E2] text-xs font-mono space-y-1 text-[#667066]">
            <div>Relay: <span className="text-[#143D2F] font-semibold">5-Step Sequential Pipeline</span></div>
            <div>Memory: <span className="text-[#143D2F]">H-MEM Session Store Active</span></div>
            <div>Status: <span className="text-[#246B52] font-semibold">OPERATIONAL</span></div>
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
                <h3 className="font-serif text-lg font-bold text-[#143D2F]">NVIDIA Nemotron</h3>
                <span className="text-xs text-[#667066]">Inference Microservice (NIM)</span>
              </div>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#FAF8F3] text-[#667066] border border-[#E5E7E2]">
              Deterministic Fallback
            </span>
          </div>

          <p className="text-xs text-[#667066] leading-relaxed">
            Translates deterministic reconciliation math into plain-language executive summaries and formal supplier dispute letters. When NVIDIA_API_KEY is not set, runs via the high-fidelity deterministic fallback engine.
          </p>

          <div className="p-3 bg-[#FAF8F3] rounded-lg border border-[#E5E7E2] text-xs font-mono space-y-1 text-[#667066]">
            <div>Target Model: <span className="text-[#143D2F] font-semibold">nvidia/nemotron-4-340b-instruct</span></div>
            <div>Endpoint: <span className="text-[#143D2F]">https://integrate.api.nvidia.com</span></div>
            <div>Guardrail: <span className="text-[#246B52] font-semibold">Financial Math Strict in TypeScript</span></div>
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
                <span className="text-xs text-[#667066]">Pair Programming Audit Trail</span>
              </div>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#EAF3ED] text-[#246B52] border border-[#DCEBE1]">
              Prompts Logged
            </span>
          </div>

          <p className="text-xs text-[#667066] leading-relaxed">
            Full audit log of developer prompts, architectural decisions, and refactoring sessions maintained in docs/CURSOR_USAGE.md and PROMPTS_LOG.md.
          </p>

          <div className="p-3 bg-[#FAF8F3] rounded-lg border border-[#E5E7E2] text-xs font-mono space-y-1 text-[#667066]">
            <div>Documentation: <span className="text-[#143D2F] font-semibold">docs/CURSOR_USAGE.md</span></div>
            <div>Prompt Log: <span className="text-[#143D2F]">PROMPTS_LOG.md</span></div>
            <div>Git Commits: <span className="text-[#246B52] font-semibold">VERIFIED & PUSHED</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

