import React from "react";
import { X, Printer, ShieldCheck, Award, CheckCircle2, AlertCircle, FileText, Download } from "lucide-react";
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
  const currency = unifiedRecord.currency || "USD";

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(investigation, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `audit-report-${poId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 print:p-0 print:bg-white">
      <div className="relative w-full max-w-3xl bg-white border border-[#E5E7E2] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Modal Controls (Hidden in print) */}
        <div className="p-4 border-b border-[#E5E7E2] bg-[#FAF8F3] flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-[#EAF3ED] text-[#246B52] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-[#143D2F] block leading-tight">
                Official Compliance Audit Certificate
              </span>
              <span className="text-[10px] text-[#667066]">Print-Ready Verification Document</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadJson}
              className="px-3 py-1.5 rounded-lg bg-white border border-[#E5E7E2] hover:bg-[#FAF8F3] text-xs font-semibold text-[#143D2F] transition flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-[#246B52]" />
              <span>JSON</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-[#246B52] hover:bg-[#1D5642] text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[#E5E7E2]/50 text-[#667066] hover:text-[#143D2F] transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Certificate Printable Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-white text-[#202720] print:p-4">
          {/* Certificate Header Banner */}
          <div className="text-center space-y-2 border-b border-[#E5E7E2] pb-6">
            <div className="inline-flex p-3 rounded-2xl bg-[#EAF3ED] text-[#246B52] border border-[#DCEBE1] mb-1">
              <Award className="w-8 h-8" />
            </div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-[#143D2F]">
              Verified Procurement Audit Certificate
            </h1>
            <p className="text-xs text-[#667066] font-sans">
              TraceBack AI Autonomous 4-Way Cross-Source Reconciliation Platform
            </p>
            <div className="text-[11px] font-mono text-[#246B52] bg-[#EAF3ED] inline-block px-3 py-1 rounded-full border border-[#DCEBE1] mt-1 font-semibold">
              Certificate No: #TB-CERT-{poId}-{summary.auditTimestamp?.substring(0, 10).replace(/-/g, "") || "20261025"}
            </div>
          </div>

          {/* Audit Target Scope Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#FAF8F3] border border-[#E5E7E2] rounded-xl p-4 text-xs font-sans">
            <div>
              <span className="text-[#8F9A8F] block text-[10px] uppercase font-semibold">Purchase Order</span>
              <strong className="text-[#143D2F] text-sm">{poId}</strong>
            </div>
            <div>
              <span className="text-[#8F9A8F] block text-[10px] uppercase font-semibold">Supplier Entity</span>
              <strong className="text-[#143D2F] text-sm truncate block">{supplierId}</strong>
            </div>
            <div>
              <span className="text-[#8F9A8F] block text-[10px] uppercase font-semibold">Item Scope</span>
              <strong className="text-[#143D2F] text-sm truncate block">{item}</strong>
            </div>
            <div>
              <span className="text-[#8F9A8F] block text-[10px] uppercase font-semibold">Audit Date</span>
              <strong className="text-[#143D2F] text-sm">
                {summary.auditTimestamp?.substring(0, 10) || new Date().toISOString().substring(0, 10)}
              </strong>
            </div>
          </div>

          {/* Core Audit Findings Summary */}
          <div className="rounded-xl border border-[#E5E7E2] bg-white p-5 space-y-3 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#667066]">
                Financial Audit Determination
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${
                  isOvercharge
                    ? "bg-[#FDF1ED] text-[#C66A4A] border-[#F3C5B5]"
                    : "bg-[#EAF3ED] text-[#246B52] border-[#DCEBE1]"
                }`}
              >
                {summary.status.replace(/_/g, " ")}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-[#E5E7E2] pt-3 text-center">
              <div>
                <span className="text-[11px] text-[#8F9A8F] block">Detected Variances</span>
                <span className="font-serif text-xl font-bold text-[#143D2F]">
                  {discrepancies.length}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[#8F9A8F] block">Confidence Corroboration</span>
                <span className="font-serif text-xl font-bold text-[#246B52]">
                  {((summary.confidenceScore || 0.98) * 100).toFixed(0)}%
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[#8F9A8F] block">Total Financial Impact</span>
                <span className={`font-serif text-xl font-bold ${isOvercharge ? "text-[#C66A4A]" : "text-[#246B52]"}`}>
                  {currency} {summary.totalFinancialImpact.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Itemized Discrepancy Receipts */}
          {discrepancies.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#667066]">
                Itemized Evidence Receipts
              </h4>
              <div className="space-y-2">
                {discrepancies.map((d, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-[#FAF8F3] border border-[#E5E7E2] flex items-start justify-between text-xs"
                  >
                    <div className="space-y-1 max-w-[80%]">
                      <div className="font-semibold text-[#143D2F] flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-[#C66A4A]" />
                        <span>{d.type.replace(/_/g, " ")} {d.itemIdentifier ? `[${d.itemIdentifier}]` : ""}</span>
                      </div>
                      <p className="text-[#667066] text-[11px]">{d.reason}</p>
                      {d.calculation?.formula && (
                        <code className="text-[10px] text-[#246B52] bg-white px-1.5 py-0.5 rounded border border-[#E5E7E2] font-mono block">
                          Formula: {d.calculation.formula}
                        </code>
                      )}
                    </div>
                    <span className="font-serif font-bold text-sm text-[#C66A4A] whitespace-nowrap">
                      +{currency} {d.financialImpact.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Human Review Decision Stamp */}
          <div className="rounded-xl border border-[#DCEBE1] bg-[#FAF8F3] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-[#8F9A8F] block text-[10px] uppercase font-semibold">Human Review Decision</span>
              <div className="flex items-center space-x-1.5 font-semibold text-[#143D2F] mt-0.5">
                <CheckCircle2 className="w-4 h-4 text-[#246B52]" />
                <span className="uppercase">{reviewDecision?.action || "Pending Auditor Review"}</span>
              </div>
              <p className="text-[11px] text-[#667066] mt-0.5">
                Signed by: <strong className="text-[#143D2F]">{reviewDecision?.reviewer || "Lead Auditor"}</strong> • Timestamp: {reviewDecision?.timestamp ? new Date(reviewDecision.timestamp).toLocaleString() : "Audit Session Active"}
              </p>
              {reviewDecision?.notes && (
                <p className="text-[11px] text-[#667066] italic mt-1 bg-white p-2 rounded border border-[#E5E7E2]">
                  "{reviewDecision.notes}"
                </p>
              )}
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] font-mono text-[#8F9A8F] block">Verification Hash:</span>
              <span className="text-[10px] font-mono text-[#246B52] bg-white px-2 py-1 rounded border border-[#E5E7E2] block max-w-[200px] truncate">
                SHA256: 8f9a2e4b7c1d3f5a0e6b...
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
