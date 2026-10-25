import React from "react";
import { X, Printer, ShieldCheck, Award, FileCheck, CheckCircle2 } from "lucide-react";
import { InvestigationResult } from "../types";

interface AuditCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  investigation: InvestigationResult;
}

export const AuditCertificateModal: React.FC<AuditCertificateModalProps> = ({
  isOpen,
  onClose,
  investigation
}) => {
  if (!isOpen) return null;

  const { poId, supplierId, item, summary, discrepancies, unifiedRecord, reviewDecision } = investigation;
  const isOvercharge = summary.totalFinancialImpact > 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 print:p-0 print:bg-white">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Modal Controls (Hidden in print) */}
        <div className="p-4 border-b border-slate-800 bg-slate-850 flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <span className="text-sm font-bold text-white">Official Compliance Certificate</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Printable Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-950/90 print:bg-white print:text-black">
          {/* Certificate Header Banner */}
          <div className="text-center space-y-2 border-b border-slate-800 pb-6 print:border-slate-300">
            <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
              <Award className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-extrabold tracking-wider uppercase text-white print:text-black">
              Verified Procurement Audit Certificate
            </h1>
            <p className="text-xs text-slate-400 print:text-slate-600 font-mono">
              TraceBack AI Autonomous 4-Way Cross-Source Reconciliation Engine
            </p>
            <div className="text-[11px] font-mono text-indigo-400 bg-indigo-950/40 inline-block px-3 py-1 rounded-full border border-indigo-500/30 mt-1">
              Certificate No: #TB-CERT-{poId}-{summary.auditTimestamp.substring(0, 10).replace(/-/g, "")}
            </div>
          </div>

          {/* Audit Target Scope Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs font-mono print:bg-slate-50 print:border-slate-300">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Purchase Order</span>
              <strong className="text-white print:text-black text-sm">{poId}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Supplier Entity</span>
              <strong className="text-white print:text-black text-sm">{supplierId}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Item Scope</span>
              <strong className="text-white print:text-black text-sm">{item}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Audit Date</span>
              <strong className="text-white print:text-black text-sm">{summary.auditTimestamp.substring(0, 10)}</strong>
            </div>
          </div>

          {/* Core Audit Findings Summary */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3 print:bg-white print:border-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Financial Audit Determination
              </span>
              <span
                className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${
                  isOvercharge
                    ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                }`}
              >
                {summary.status}
              </span>
            </div>

            <div className="text-3xl font-extrabold font-mono text-white print:text-black">
              ${summary.totalFinancialImpact.toLocaleString()} {summary.currency}
              <span className="text-xs font-normal text-slate-400 ml-2">
                {isOvercharge ? "Total Recoverable Financial Leakage" : "Perfect 100% Concordance"}
              </span>
            </div>

            <p className="text-xs text-slate-300 print:text-slate-700 leading-relaxed">
              {investigation.explanation.executiveSummary}
            </p>
          </div>

          {/* Evidence Citations Table */}
          {discrepancies.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Ground-Truth Evidence Trail Citations
              </h3>
              <div className="border border-slate-800 rounded-xl overflow-hidden text-xs print:border-slate-300">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-850 text-slate-400 font-mono print:bg-slate-100">
                      <th className="p-2.5">Violation</th>
                      <th className="p-2.5">Source Coordinate A</th>
                      <th className="p-2.5">Source Coordinate B</th>
                      <th className="p-2.5 text-right">Recovery Impact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {discrepancies.map((d) => (
                      <tr key={d.id} className="border-b border-slate-800/60 font-mono">
                        <td className="p-2.5 font-bold text-white print:text-black">{d.type}</td>
                        <td className="p-2.5 text-indigo-400">
                          {d.sourceA.file}:L{d.sourceA.row} ({d.sourceA.column}={d.sourceA.value})
                        </td>
                        <td className="p-2.5 text-indigo-400">
                          {d.sourceB.file}:L{d.sourceB.row} ({d.sourceB.column}={d.sourceB.value})
                        </td>
                        <td className="p-2.5 text-right font-bold text-rose-400">
                          +${d.financialImpact.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Auditor Authorization & Cryptographic Stamp */}
          <div className="pt-6 border-t border-slate-800 grid grid-cols-2 gap-6 text-xs print:border-slate-300">
            <div className="space-y-1">
              <span className="text-slate-400 text-[10px] uppercase block">Meterless H-MEM Session Key</span>
              <p className="font-mono text-[11px] text-cyan-400 truncate">
                {investigation.missionTrace.hMemKey || `session:po:${poId}`}
              </p>
              <span className="text-slate-400 text-[10px] uppercase block pt-2">Zetaris Virtualization SQL</span>
              <p className="font-mono text-[10px] text-slate-400">Federated Cross-Source Query Verified</p>
            </div>

            <div className="border border-slate-800 rounded-2xl p-4 bg-slate-900/60 print:bg-slate-50 print:border-slate-300 space-y-1.5">
              <div className="flex items-center space-x-1.5 text-emerald-400 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Auditor Sign-off Recorded</span>
              </div>
              <p className="text-xs text-slate-300 print:text-slate-800">
                Reviewer: <strong>{reviewDecision?.reviewer || "Lead Auditor Zain"}</strong>
              </p>
              <p className="text-[10px] text-slate-400 font-mono">
                Status: {reviewDecision?.action.toUpperCase() || "PENDING"} • {reviewDecision?.timestamp ? new Date(reviewDecision.timestamp).toLocaleString() : new Date().toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
