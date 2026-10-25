import React from "react";
import {
  Database,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Server,
  Layers,
  Sparkles,
  RefreshCw,
  Cpu
} from "lucide-react";
import { PurchaseOrderItem, SystemHealth } from "../types";

interface SidebarProps {
  purchaseOrders: PurchaseOrderItem[];
  selectedPoId: string;
  onSelectPo: (poId: string) => void;
  systemHealth: SystemHealth | null;
  loading: boolean;
  onRefresh: () => void;
  dataSourcesStatus: {
    purchaseOrders: { loaded: boolean; rowCount: number; file: string };
    deliveries: { loaded: boolean; rowCount: number; file: string };
    invoices: { loaded: boolean; rowCount: number; file: string };
    contractPrices: { loaded: boolean; rowCount: number; file: string };
  } | null;
  onViewSourceFile: (fileName: string) => void;
  onOpenSimulation: () => void;
  onOpenCertificate: () => void;
  onOpenSponsorHub?: (tab: "nvidia" | "zetaris" | "meterless" | "cursor") => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  purchaseOrders,
  selectedPoId,
  onSelectPo,
  systemHealth,
  loading,
  onRefresh,
  dataSourcesStatus,
  onViewSourceFile,
  onOpenSimulation,
  onOpenCertificate,
  onOpenSponsorHub
}) => {
  const zetaris = systemHealth?.sponsorIntegrations.zetaris;
  const meterless = systemHealth?.sponsorIntegrations.meterless;
  const nvidia = systemHealth?.sponsorIntegrations.nvidia;

  return (
    <aside className="w-80 bg-slate-900/90 border-r border-slate-800 flex flex-col h-screen shrink-0 text-slate-300">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
              TraceBack <span className="text-indigo-400">AI</span>
            </h1>
            <p className="text-xs text-slate-400">Supplier Invoice Auditor</p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          title="Re-run reconciliation"
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-400" : ""}`} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Quick Action Tools */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onOpenSimulation}
            className="p-2.5 rounded-xl bg-indigo-600/15 hover:bg-indigo-600/25 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Simulate Order</span>
          </button>
          <button
            onClick={onOpenCertificate}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Audit Seal</span>
          </button>
        </div>

        {/* PO Investigation Selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Select Purchase Order
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono">
              {purchaseOrders.length} Scenarios
            </span>
          </div>
          <div className="space-y-2">
            {purchaseOrders.map((po) => {
              const isSelected = po.poId === selectedPoId;
              const isClean = po.poId === "PO-1002";

              return (
                <button
                  key={po.poId}
                  onClick={() => onSelectPo(po.poId)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    isSelected
                      ? "bg-indigo-600/15 border-indigo-500/50 shadow-md shadow-indigo-950/50 ring-1 ring-indigo-500/30"
                      : "bg-slate-850/60 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-white text-sm">{po.poId}</span>
                    {isClean ? (
                      <span className="inline-flex items-center text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Clean
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[10px] font-medium text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                        <AlertTriangle className="w-3 h-3 mr-1" /> Overcharge
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
                    <span>{po.supplierId} • {po.item}</span>
                    <span className="font-mono">${(po.orderedQty * po.unitPrice).toLocaleString()}</span>
                  </div>
                  <div className="mt-2 text-[11px] text-slate-400 line-clamp-1 italic">
                    {po.demoBadge}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Zetaris Virtualization Status Card */}
        <div
          onClick={() => onOpenSponsorHub?.("zetaris")}
          className="rounded-xl border border-slate-800 hover:border-cyan-500/50 bg-slate-850/40 hover:bg-slate-800/60 p-3.5 space-y-3 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-200 group-hover:text-cyan-300">
                Zetaris Virtualizer
              </span>
            </div>
            <span
              className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border ${
                zetaris?.mode === "live"
                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                  : "bg-amber-500/15 text-amber-300 border-amber-500/30"
              }`}
            >
              {zetaris?.mode === "live" ? "ZETARIS LIVE" : "ZETARIS MOCK"}
            </span>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Federated SQL query joins across 4 independent sources without data duplication.
          </p>

          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Engine</span>
              <span className="font-mono text-slate-300 text-[11px]">
                {zetaris?.mode === "live" ? "Zetaris Cloud Hub" : "SQLite In-Memory Virtual"}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Query Latency</span>
              <span className="font-mono text-cyan-400 text-[11px]">
                {zetaris?.latencyMs || 2}ms
              </span>
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between text-[11px] text-cyan-400/80 group-hover:text-cyan-300 font-medium border-t border-slate-800/80">
            <span>Inspect Virtual SQL Query</span>
            <span className="group-hover:translate-x-0.5 transition-transform">↗</span>
          </div>
        </div>

        {/* 4 Data Sources Virtualized */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" /> 4 Virtualized Sources
            </span>
          </div>
          <div className="space-y-1.5">
            {[
              {
                name: "Purchase Orders (PO)",
                file: "purchase_orders.csv",
                records: dataSourcesStatus?.purchaseOrders.rowCount ?? 2,
                color: "text-blue-400"
              },
              {
                name: "Delivery Notes (WMS)",
                file: "deliveries.csv",
                records: dataSourcesStatus?.deliveries.rowCount ?? 2,
                color: "text-amber-400"
              },
              {
                name: "Supplier Invoices (AP)",
                file: "invoices.csv",
                records: dataSourcesStatus?.invoices.rowCount ?? 2,
                color: "text-rose-400"
              },
              {
                name: "Contract Price Lists",
                file: "contract_prices.csv",
                records: dataSourcesStatus?.contractPrices.rowCount ?? 2,
                color: "text-emerald-400"
              }
            ].map((src) => (
              <button
                key={src.file}
                onClick={() => onViewSourceFile(src.file)}
                className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-850/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/60 text-left transition group"
              >
                <div className="flex items-center space-x-2">
                  <FileSpreadsheet className={`w-3.5 h-3.5 ${src.color}`} />
                  <span className="text-xs text-slate-300 group-hover:text-white font-medium">
                    {src.name}
                  </span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] font-mono text-slate-400">
                    {src.records} rows
                  </span>
                  <span className="text-[10px] text-indigo-400 group-hover:underline">
                    View
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Agent Stack Badges */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-850/30 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Architecture Stack
            </span>
            <button
              onClick={() => onOpenSponsorHub?.("cursor")}
              className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 hover:underline"
            >
              Cursor Mode ↗
            </button>
          </div>
          <div className="space-y-1.5 text-xs">
            <button
              onClick={() => onOpenSponsorHub?.("meterless")}
              className="w-full flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-800/60 transition text-left cursor-pointer group"
            >
              <span className="text-slate-400 group-hover:text-slate-200 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-emerald-400" /> Meterless Agent
              </span>
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                {meterless?.isLive ? "Remote Relay" : "Scout → H-MEM"}
                <span className="text-slate-500 group-hover:text-emerald-300">↗</span>
              </span>
            </button>
            <button
              onClick={() => onOpenSponsorHub?.("nvidia")}
              className="w-full flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-800/60 transition text-left cursor-pointer group"
            >
              <span className="text-slate-400 group-hover:text-slate-200 flex items-center gap-1">
                <Server className="w-3.5 h-3.5 text-purple-400" /> NVIDIA NIM
              </span>
              <span className="text-[11px] font-mono text-purple-400 flex items-center gap-1">
                {nvidia?.isLive ? "Llama 3.1 Live" : "Local Engine"}
                <span className="text-slate-500 group-hover:text-purple-300">↗</span>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400 text-center font-mono">
        Build Window: Oct 22–27, 2026
      </div>
    </aside>
  );
};
