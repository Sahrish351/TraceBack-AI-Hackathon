import React from "react";
import {
  FileText,
  ArrowRight,
  TrendingUp,
  ExternalLink,
  ShieldCheck,
  HelpCircle
} from "lucide-react";
import { Discrepancy } from "../types";

interface EvidenceCardProps {
  discrepancy: Discrepancy;
  onInspectSource: (fileName: string, rowNumber: number, columnName: string) => void;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({
  discrepancy,
  onInspectSource
}) => {
  const {
    type,
    severity,
    sourceA,
    sourceB,
    delta,
    financialImpact,
    currency,
    reason,
    confidence,
    remediationHint
  } = discrepancy;

  const severityColor =
    severity === "high"
      ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
      : severity === "medium"
      ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
      : "bg-blue-500/15 text-blue-300 border-blue-500/30";

  const typeLabels: Record<string, string> = {
    QTY_OVERBILL: "Quantity Overbilling (Unreceived Units)",
    PRICE_ABOVE_CONTRACT: "Contract Price Violation (Rate Escalation)",
    QTY_SHORT: "Shipment Shortage vs Order",
    UNEXPECTED_FEE: "Unauthorized Ancillary Surcharge",
    DUPLICATE_INVOICE: "Duplicate Invoice Submission"
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg shadow-slate-950/40 hover:border-slate-700 transition">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
        <div className="flex items-center space-x-2.5">
          <span
            className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${severityColor}`}
          >
            {severity} Severity
          </span>
          <h3 className="font-bold text-white text-base">
            {typeLabels[type] || type}
          </h3>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> {Math.round(confidence * 100)}% Confidence
          </span>
          <span className="text-base font-extrabold font-mono text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-xl">
            +${financialImpact.toLocaleString()} {currency}
          </span>
        </div>
      </div>

      {/* Discrepancy Evidence Coordinates (Source A vs Source B) */}
      <div className="my-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Source A Chip */}
        <div className="rounded-xl border border-slate-800 bg-slate-850/60 p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span className="font-medium text-slate-300">{sourceA.label}</span>
              <span className="font-mono text-[11px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                {sourceA.file}:L{sourceA.row}
              </span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="font-mono text-xl font-bold text-white">
                {sourceA.value}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                ({sourceA.column})
              </span>
            </div>
          </div>
          <button
            onClick={() => onInspectSource(sourceA.file, sourceA.row, sourceA.column)}
            className="mt-3 inline-flex items-center text-xs font-medium text-indigo-400 hover:text-indigo-300 transition"
          >
            <ExternalLink className="w-3.5 h-3.5 mr-1" /> View Raw Row in {sourceA.file}
          </button>
        </div>

        {/* Source B Chip */}
        <div className="rounded-xl border border-slate-800 bg-slate-850/60 p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span className="font-medium text-slate-300">{sourceB.label}</span>
              <span className="font-mono text-[11px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                {sourceB.file}:L{sourceB.row}
              </span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="font-mono text-xl font-bold text-white">
                {sourceB.value}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                ({sourceB.column})
              </span>
            </div>
          </div>
          <button
            onClick={() => onInspectSource(sourceB.file, sourceB.row, sourceB.column)}
            className="mt-3 inline-flex items-center text-xs font-medium text-indigo-400 hover:text-indigo-300 transition"
          >
            <ExternalLink className="w-3.5 h-3.5 mr-1" /> View Raw Row in {sourceB.file}
          </button>
        </div>
      </div>

      {/* Narrative Reason */}
      <div className="text-sm text-slate-300 leading-relaxed bg-slate-950/40 border border-slate-800/80 rounded-xl p-3.5">
        <span className="text-xs font-semibold uppercase text-slate-400 block mb-1">
          Evidence Justification
        </span>
        {reason}
      </div>

      {/* Remediation Action Hint */}
      <div className="mt-3 flex items-start space-x-2.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 p-3 text-xs text-indigo-200">
        <TrendingUp className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-indigo-300 mr-1.5">Recommended Remediation:</span>
          {remediationHint}
        </div>
      </div>
    </div>
  );
};
