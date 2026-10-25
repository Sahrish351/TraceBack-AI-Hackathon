import React from "react";
import { DollarSign, AlertCircle, ShieldCheck, CheckCircle2, UserCheck, Layers } from "lucide-react";
import { AnalysisSummary, ReviewDecision } from "../types";

interface SummaryCardsProps {
  summary: AnalysisSummary;
  reviewDecision?: ReviewDecision;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  summary,
  reviewDecision
}) => {
  const isOvercharge = summary.totalFinancialImpact > 0;
  const isApproved = reviewDecision?.action === "approve";
  const isRejected = reviewDecision?.action === "reject";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Financial Impact Card */}
      <div
        className={`relative overflow-hidden rounded-2xl border p-5 transition-all shadow-lg ${
          isOvercharge
            ? "bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900 border-rose-500/30 shadow-rose-950/20"
            : "bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-900 border-emerald-500/30 shadow-emerald-950/20"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Overcharge Detected
          </span>
          <div
            className={`p-2 rounded-xl ${
              isOvercharge
                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            }`}
          >
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-3">
          <div
            className={`text-3xl font-extrabold font-mono tracking-tight ${
              isOvercharge ? "text-rose-400" : "text-emerald-400"
            }`}
          >
            ${summary.totalFinancialImpact.toLocaleString()}{" "}
            <span className="text-sm font-normal text-slate-400">{summary.currency}</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {isOvercharge
              ? "Recoverable financial leakage across 2 variances"
              : "100% concordance — no overcharges found"}
          </p>
        </div>
      </div>

      {/* Discrepancies Count Card */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/50">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Discrepancies
          </span>
          <div
            className={`p-2 rounded-xl ${
              isOvercharge
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
            }`}
          >
            {isOvercharge ? (
              <AlertCircle className="w-5 h-5" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
          </div>
        </div>

        <div className="mt-3">
          <div className="text-3xl font-extrabold font-mono text-white tracking-tight">
            {summary.discrepancyCount}{" "}
            <span className="text-sm font-normal text-slate-400">
              {summary.discrepancyCount === 1 ? "Issue" : "Issues"}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {isOvercharge
              ? "Quantity Overbill + Contract Price Escalation"
              : "Zero variances detected across 4 sources"}
          </p>
        </div>
      </div>

      {/* Confidence Score Card */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/50">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Audit Confidence
          </span>
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-3">
          <div className="text-3xl font-extrabold font-mono text-white tracking-tight">
            {Math.round(summary.confidenceScore * 100)}%
          </div>
          <p className="mt-1 text-xs text-slate-400 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-cyan-400" /> Grounded in 4-Way Virtualized Data
          </p>
        </div>
      </div>

      {/* Human-in-the-Loop Review Status */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/50">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Review Status
          </span>
          <div
            className={`p-2 rounded-xl ${
              isApproved
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : isRejected
                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                : isOvercharge
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
            }`}
          >
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-3">
          <div className="text-xl font-bold tracking-tight">
            {isApproved ? (
              <span className="text-emerald-400">Claim Approved</span>
            ) : isRejected ? (
              <span className="text-rose-400">Finding Rejected</span>
            ) : isOvercharge ? (
              <span className="text-amber-400">Pending Review</span>
            ) : (
              <span className="text-indigo-300">Auto-Reconciled</span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {isApproved
              ? `Authorized by ${reviewDecision?.reviewer || "Auditor"}`
              : isRejected
              ? "Marked as waived by reviewer"
              : isOvercharge
              ? "Requires human authorization"
              : "Standard terms payment approved"}
          </p>
        </div>
      </div>
    </div>
  );
};
