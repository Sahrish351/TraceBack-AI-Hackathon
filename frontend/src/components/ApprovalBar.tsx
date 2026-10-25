import React, { useState } from "react";
import { Check, X, Mail, ShieldAlert, CheckCircle2, AlertOctagon, RotateCcw } from "lucide-react";
import { ReviewDecision } from "../types";

interface ApprovalBarProps {
  poId: string;
  totalFinancialImpact: number;
  currency: string;
  reviewDecision?: ReviewDecision;
  onDecision: (action: "approve" | "reject" | "request_clarification") => void;
  onOpenEmail: () => void;
}

export const ApprovalBar: React.FC<ApprovalBarProps> = ({
  poId,
  totalFinancialImpact,
  currency,
  reviewDecision,
  onDecision,
  onOpenEmail
}) => {
  const [submitting, setSubmitting] = useState(false);

  const handleAction = async (action: "approve" | "reject" | "request_clarification") => {
    setSubmitting(true);
    try {
      await onDecision(action);
    } finally {
      setSubmitting(false);
    }
  };

  const action = reviewDecision?.action;

  if (totalFinancialImpact === 0) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-sm font-bold text-white block">
              Auto-Reconciliation Validated (Concordant)
            </span>
            <span className="text-xs text-slate-400">
              No human intervention required. PO {poId} cleared for standard net terms payment.
            </span>
          </div>
        </div>
        <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
          Payment Status: Cleared
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl shadow-slate-950/50">
      {action === "approve" ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-white flex items-center gap-2">
                Recovery Claim Authorized: ${totalFinancialImpact.toLocaleString()} {currency}
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Approved
                </span>
              </span>
              <span className="text-xs text-slate-400">
                Auditor {reviewDecision?.reviewer || "Auditor"} approved debit note generation on{" "}
                {reviewDecision?.timestamp ? new Date(reviewDecision.timestamp).toLocaleTimeString() : "recently"}.
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenEmail}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5"
            >
              <Mail className="w-4 h-4" /> Send Supplier Letter
            </button>
            <button
              onClick={() => handleAction("request_clarification")}
              disabled={submitting}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              title="Reset Decision"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : action === "reject" ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-white flex items-center gap-2">
                Discrepancy Waived / Rejected
                <span className="text-xs font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                  Rejected
                </span>
              </span>
              <span className="text-xs text-slate-400">
                Auditor waived recovery claim for {poId}. Regular invoice payment will resume.
              </span>
            </div>
          </div>
          <button
            onClick={() => handleAction("approve")}
            disabled={submitting}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
          >
            Re-evaluate Claim
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block">
                Human-in-the-Loop Review Required
              </span>
              <span className="text-xs text-slate-400">
                Confirm overcharge recovery of{" "}
                <strong className="text-rose-400 font-mono">
                  ${totalFinancialImpact.toLocaleString()} {currency}
                </strong>{" "}
                before triggering supplier communication.
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleAction("approve")}
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/30 transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              Approve Claim (${totalFinancialImpact.toLocaleString()})
            </button>
            <button
              onClick={() => handleAction("reject")}
              disabled={submitting}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <X className="w-4 h-4" /> Reject Finding
            </button>
            <button
              onClick={onOpenEmail}
              className="px-3 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition flex items-center gap-1.5"
            >
              <Mail className="w-4 h-4" /> Preview Email
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
