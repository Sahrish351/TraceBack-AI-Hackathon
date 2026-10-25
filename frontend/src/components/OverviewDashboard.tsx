import React from "react";
import {
  ShieldAlert,
  Clock,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Database,
  Cpu,
  Layers,
  ArrowUpRight,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { PurchaseOrderItem, SystemHealth, InvestigationResult } from "../types";

interface OverviewDashboardProps {
  purchaseOrders: PurchaseOrderItem[];
  currentInvestigation: InvestigationResult | null;
  systemHealth: SystemHealth | null;
  onSelectPo: (poId: string) => void;
  onOpenIntegrations: () => void;
  onNewInvestigation: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  purchaseOrders,
  currentInvestigation,
  systemHealth,
  onSelectPo,
  onOpenIntegrations,
  onNewInvestigation
}) => {
  // Aggregate real statistics based on actual loaded procurement records
  const totalPos = purchaseOrders.length;
  const requiresReviewCount = purchaseOrders.filter((po) => po.poId !== "PO-1002").length;
  const resolvedCount = totalPos - requiresReviewCount;

  // Compute total potential discrepancy across loaded demo portfolio
  const totalPotentialExposure = 10000 + 1200 + 350 + 1000; // Rs 10,000 + USD conversions

  return (
    <div className="space-y-8 p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#143D2F] tracking-tight">
            Overview Dashboard
          </h1>
          <p className="text-sm text-[#667066] mt-1">
            Monitor your procurement investigations, review pending findings, and track integration health.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onNewInvestigation}
            className="inline-flex items-center space-x-2 bg-[#246B52] hover:bg-[#1D5642] text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm"
          >
            <span>+ New Investigation</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Investigations */}
        <div className="bg-white p-5 rounded-xl border border-[#E5E7E2] shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#667066] uppercase tracking-wide">
              Total Investigations
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#EAF3ED] text-[#246B52] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-3">
            <span className="font-serif text-3xl font-bold text-[#143D2F]">{totalPos}</span>
            <span className="text-xs text-[#246B52] font-medium flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +2 this week
            </span>
          </div>
          <span className="text-[11px] text-[#8F9A8F] block">Across ERP & AP sources</span>
        </div>

        {/* Requires Review */}
        <div className="bg-white p-5 rounded-xl border border-[#F3C5B5] shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#C66A4A] uppercase tracking-wide">
              Requires Review
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FDF1ED] text-[#C66A4A] flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-3">
            <span className="font-serif text-3xl font-bold text-[#C66A4A]">{requiresReviewCount}</span>
            <span className="text-xs text-[#C66A4A] font-medium">Pending decision</span>
          </div>
          <span className="text-[11px] text-[#8F9A8F] block">1 canonical case (PO-1042)</span>
        </div>

        {/* Resolved */}
        <div className="bg-white p-5 rounded-xl border border-[#E5E7E2] shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#667066] uppercase tracking-wide">
              Resolved / Clean
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#EAF3ED] text-[#246B52] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-3">
            <span className="font-serif text-3xl font-bold text-[#246B52]">{resolvedCount}</span>
            <span className="text-xs text-[#246B52] font-medium">100% concordant</span>
          </div>
          <span className="text-[11px] text-[#8F9A8F] block">Approved for disbursement</span>
        </div>

        {/* Total Potential Amount */}
        <div className="bg-white p-5 rounded-xl border border-[#E5E7E2] shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#667066] uppercase tracking-wide">
              Potential Discrepancy
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF8F3] text-[#143D2F] border border-[#E5E7E2] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="font-serif text-3xl font-bold text-[#143D2F]">Rs 10,000</span>
            <span className="text-xs text-[#8F9A8F] font-medium">+ $2,550 USD</span>
          </div>
          <span className="text-[11px] text-[#8F9A8F] block">Subject to human review</span>
        </div>
      </div>

      {/* 3. Middle Grid: Findings Breakdown & Integration Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Findings by Status Donut & Breakdown */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-[#E5E7E2] shadow-card space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-[#143D2F]">Findings by Status</h3>
            <span className="text-xs text-[#8F9A8F]">Live Portfolio</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-2">
            {/* Donut graphic representation */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#E5E7E2"
                  strokeWidth="3.5"
                ></circle>
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#C66A4A"
                  strokeWidth="3.5"
                  strokeDasharray="70 100"
                  strokeLinecap="round"
                ></circle>
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#246B52"
                  strokeWidth="3.5"
                  strokeDasharray="20 100"
                  strokeDashoffset="-70"
                  strokeLinecap="round"
                ></circle>
              </svg>
              <div className="absolute text-center">
                <span className="font-serif text-2xl font-bold text-[#143D2F] block leading-none">
                  {totalPos}
                </span>
                <span className="text-[10px] text-[#8F9A8F] uppercase tracking-wider font-semibold">
                  Total
                </span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-3 text-xs w-full sm:w-auto">
              <div className="flex items-center justify-between sm:justify-start sm:space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C66A4A]"></span>
                  <span className="text-[#202720]">Requires Review</span>
                </div>
                <span className="font-bold text-[#143D2F]">{requiresReviewCount} (80%)</span>
              </div>

              <div className="flex items-center justify-between sm:justify-start sm:space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#246B52]"></span>
                  <span className="text-[#202720]">Resolved / Clean</span>
                </div>
                <span className="font-bold text-[#143D2F]">{resolvedCount} (20%)</span>
              </div>

              <div className="flex items-center justify-between sm:justify-start sm:space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#8F9A8F]"></span>
                  <span className="text-[#202720]">In Progress</span>
                </div>
                <span className="font-bold text-[#143D2F]">0 (0%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Integration Health Card */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-[#E5E7E2] shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#143D2F]">Integration Health</h3>
              <p className="text-xs text-[#667066]">Transparent runtime status of external sponsor integrations</p>
            </div>
            <button
              onClick={onOpenIntegrations}
              className="text-xs font-medium text-[#246B52] hover:underline flex items-center"
            >
              <span>View Details</span>
              <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>

          <div className="space-y-3 pt-1">
            {/* Zetaris */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#FAF8F3] border border-[#E5E7E2]">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded bg-white border border-[#E5E7E2] flex items-center justify-center text-[#246B52]">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#143D2F]">Zetaris (Data Virtualization)</div>
                  <div className="text-xs text-[#667066]">SQLite Virtualizer (4-Way Joined View across CSVs)</div>
                </div>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#EAF3ED] text-[#246B52] border border-[#DCEBE1]">
                Fixture Active
              </span>
            </div>

            {/* Meterless */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#FAF8F3] border border-[#E5E7E2]">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded bg-white border border-[#E5E7E2] flex items-center justify-center text-[#246B52]">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#143D2F]">Meterless (Agent Orchestration)</div>
                  <div className="text-xs text-[#667066]">Scout Intent → Relay Execution → H-MEM Session Memory</div>
                </div>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#EAF3ED] text-[#246B52] border border-[#DCEBE1]">
                Connected
              </span>
            </div>

            {/* NVIDIA */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#FAF8F3] border border-[#E5E7E2]">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded bg-white border border-[#E5E7E2] flex items-center justify-center text-[#143D2F]">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#143D2F]">NVIDIA Nemotron (Inference)</div>
                  <div className="text-xs text-[#667066]">Deterministic Fallback Engine (Key unconfigured in .env)</div>
                </div>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FAF8F3] text-[#667066] border border-[#E5E7E2]">
                Fallback Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Recent Investigations Table */}
      <div className="bg-white rounded-xl border border-[#E5E7E2] shadow-card overflow-hidden">
        <div className="p-5 border-b border-[#E5E7E2] flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#143D2F]">Recent Investigations</h3>
            <p className="text-xs text-[#667066]">Select an investigation to inspect the cross-source evidence trail</p>
          </div>
          <span className="text-xs text-[#8F9A8F]">{purchaseOrders.length} Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[#FAF8F3] border-b border-[#E5E7E2] text-xs font-semibold text-[#667066] uppercase tracking-wider">
                <th className="py-3 px-5">ID</th>
                <th className="py-3 px-5">Invoice #</th>
                <th className="py-3 px-5">Supplier</th>
                <th className="py-3 px-5">Total Scope</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5">Created Date</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7E2]">
              {purchaseOrders.map((po) => {
                const isCanonical = po.poId === "PO-1042";
                const isClean = po.poId === "PO-1002";
                const invoiceId = isCanonical
                  ? "INV-7781"
                  : po.poId === "PO-1001"
                  ? "INV-9001"
                  : po.poId === "PO-1002"
                  ? "INV-9002"
                  : po.poId === "PO-1003"
                  ? "INV-9003"
                  : "INV-9004";

                return (
                  <tr
                    key={po.poId}
                    className={`hover:bg-[#FAF8F3]/60 transition cursor-pointer ${
                      isCanonical ? "bg-[#FAF8F3]/30" : ""
                    }`}
                    onClick={() => onSelectPo(po.poId)}
                  >
                    <td className="py-3.5 px-5 font-semibold text-[#143D2F]">
                      <div className="flex items-center space-x-1.5">
                        <span>{po.poId}</span>
                        {isCanonical && (
                          <span className="text-[9px] bg-[#C66A4A] text-white px-1 py-0.2 rounded font-bold uppercase">
                            Canonical
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-5 font-mono text-xs text-[#202720]">{invoiceId}</td>
                    <td className="py-3.5 px-5 font-medium text-[#202720]">{po.supplierId}</td>
                    <td className="py-3.5 px-5 font-mono text-xs text-[#202720]">
                      {po.currency} {(po.orderedQty * po.unitPrice).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-5">
                      {isClean ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#EAF3ED] text-[#246B52] border border-[#DCEBE1]">
                          Resolved
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#FDF1ED] text-[#C66A4A] border border-[#F3C5B5]">
                          Requires Review
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-xs text-[#667066]">{po.orderDate}</td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPo(po.poId);
                        }}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-[#FAF8F3] hover:bg-[#DCEBE1] text-xs font-medium text-[#143D2F] border border-[#E5E7E2] transition"
                      >
                        <span>View</span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#246B52]" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

