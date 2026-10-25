import React, { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Check,
  X,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  User,
  Clock
} from "lucide-react";
import { InvestigationResult, ReviewDecision } from "../types";

interface HumanReviewScreenProps {
  investigation: InvestigationResult;
  onBack: () => void;
  onSubmitReview: (action: "approve" | "reject" | "request_clarification", notes: string) => Promise<void>;
  onViewSourceFile: (fileName: string) => void;
}

export const HumanReviewScreen: React.FC<HumanReviewScreenProps> = ({
  investigation,
  onBack,
  onSubmitReview,
  onViewSourceFile
}) => {
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(
    investigation.reviewDecision?.action !== "pending" ? investigation.reviewDecision?.action || null : null
  );

  const { unifiedRecord, summary, discrepancies } = investigation;
  const currency = unifiedRecord.currency || "USD";

  const handleDecision = async (action: "approve" | "reject" | "request_clarification") => {
    setSubmitting(true);
    try {
      await onSubmitReview(action, notes);
      setLastAction(action);
    } catch (err) {
      console.error("Failed to submit review:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* 1. Breadcrumb & Back Action */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs text-[#667066]">
          <button onClick={onBack} className="hover:text-[#246B52] transition">
            Investigations
          </button>
          <span>/</span>
          <span>{unifiedRecord.invoiceId || unifiedRecord.poId}</span>
          <span>/</span>
          <span className="font-semibold text-[#143D2F]">Human Review</span>
        </div>

        <button
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-[#E5E7E2] bg-white hover:bg-[#FAF8F3] text-xs font-medium text-[#143D2F] transition shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Investigation</span>
        </button>
      </div>

      {/* 2. Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-[#143D2F]">Human Review</h1>
        <p className="text-sm text-[#667066] mt-1">
          Review flagged findings, verify cross-source procurement evidence, and record an audit decision.
        </p>
      </div>

      {/* Success banner if decision recorded */}
      {lastAction && (
        <div className="p-4 rounded-xl bg-[#EAF3ED] border border-[#DCEBE1] flex items-center justify-between">
          <div className="flex items-center space-x-2.5 text-xs text-[#246B52] font-semibold">
            <CheckCircle2 className="w-4 h-4 text-[#246B52]" />
            <span>
              Decision recorded: {lastAction.toUpperCase()} by Lead Auditor Sahrish. Logged in audit history.
            </span>
          </div>
          <span className="text-[11px] text-[#8F9A8F]">Persistent H-MEM committed</span>
        </div>
      )}

      {/* 3. Main Split Grid: Finding Info vs Decision Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Finding Card & Sources */}
        <div className="lg:col-span-7 space-y-6">
          {/* Finding Card */}
          <div className="bg-white p-6 rounded-xl border border-[#E5E7E2] shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#667066] uppercase tracking-wide">
                Finding #F-001
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#FDF1ED] text-[#C66A4A] border border-[#F3C5B5]">
                Requires Review
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="font-serif text-xl font-bold text-[#143D2F]">
                Quantity Mismatch — {unifiedRecord.invoiceId}
              </h3>
              <p className="text-xs text-[#667066]">
                Physical warehouse goods receipt note does not substantiate the invoiced quantity.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-[#E5E7E2] text-xs">
              <div>
                <span className="text-[#8F9A8F] block">Supplier</span>
                <span className="font-semibold text-[#143D2F]">{unifiedRecord.supplierId}</span>
              </div>
              <div>
                <span className="text-[#8F9A8F] block">Invoice #</span>
                <span className="font-semibold text-[#143D2F] font-mono">{unifiedRecord.invoiceId}</span>
              </div>
              <div>
                <span className="text-[#8F9A8F] block">Potential Amount</span>
                <span className="font-semibold text-[#C66A4A] font-serif text-sm">
                  {currency} {summary.totalFinancialImpact.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[#8F9A8F] block">Analysis Date</span>
                <span className="font-semibold text-[#143D2F]">{unifiedRecord.orderDate}</span>
              </div>
            </div>

            {/* Source Evidence Cards */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-[#667066] uppercase tracking-wide block">
                Source Evidence
              </span>

              <div className="space-y-2">
                {[
                  { label: "Purchase Order - " + unifiedRecord.poId, desc: `${unifiedRecord.orderedQty} units • ${currency} ${unifiedRecord.poUnitPrice}/unit`, file: "purchase_orders.csv" },
                  { label: "Delivery Note - " + (unifiedRecord.deliveryId || "N/A"), desc: `${unifiedRecord.deliveredQty} units • Verified Warehouse Receipt`, file: "deliveries.csv" },
                  { label: "Supplier Invoice - " + unifiedRecord.invoiceId, desc: `${unifiedRecord.invoicedQty} units • ${currency} ${unifiedRecord.invoiceUnitPrice}/unit`, file: "invoices.csv" },
                  { label: "Contract Price List", desc: `${currency} ${unifiedRecord.contractUnitPrice}/unit fixed schedule`, file: "contract_prices.csv" }
                ].map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-[#FAF8F3] border border-[#E5E7E2] text-xs">
                    <div>
                      <div className="font-semibold text-[#143D2F]">{doc.label}</div>
                      <div className="text-[11px] text-[#667066]">{doc.desc}</div>
                    </div>
                    <button
                      onClick={() => onViewSourceFile(doc.file)}
                      className="inline-flex items-center space-x-1 text-xs text-[#246B52] font-medium hover:underline"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Decision Actions & Audit History */}
        <div className="lg:col-span-5 space-y-6">
          {/* Decision Card */}
          <div className="bg-white p-6 rounded-xl border border-[#E5E7E2] shadow-card space-y-4">
            <h3 className="font-serif text-base font-bold text-[#143D2F]">Auditor Decision</h3>

            {/* 3 Decision Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                disabled={submitting}
                onClick={() => handleDecision("approve")}
                className="inline-flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-lg bg-[#246B52] hover:bg-[#1D5642] text-white text-xs font-semibold transition shadow-sm disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>Accept Finding</span>
              </button>

              <button
                disabled={submitting}
                onClick={() => handleDecision("request_clarification")}
                className="inline-flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-lg bg-white hover:bg-[#FAF8F3] text-[#143D2F] border border-[#E5E7E2] text-xs font-semibold transition shadow-sm disabled:opacity-50"
              >
                <HelpCircle className="w-4 h-4 text-[#667066]" />
                <span>Clarification</span>
              </button>

              <button
                disabled={submitting}
                onClick={() => handleDecision("reject")}
                className="inline-flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-lg bg-white hover:bg-[#FDF1ED] text-[#C66A4A] border border-[#F3C5B5] text-xs font-semibold transition shadow-sm disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                <span>Reject Finding</span>
              </button>
            </div>

            {/* Reviewer Notes Textarea */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-semibold text-[#667066] block">
                Reviewer Notes (Optional)
              </label>
              <textarea
                rows={3}
                maxLength={500}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter justification or specific instructions for supplier communication..."
                className="w-full p-3 rounded-lg border border-[#E5E7E2] bg-[#FAF8F3] text-xs text-[#202720] focus:outline-none focus:border-[#246B52] transition resize-none placeholder-[#8F9A8F]"
              />
              <div className="text-[10px] text-[#8F9A8F] text-right">
                {notes.length}/500
              </div>
            </div>

            {/* Finding Details Summary Table */}
            <div className="border-t border-[#E5E7E2] pt-3 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-[#667066]">
                <span>Ordered Quantity:</span>
                <span className="text-[#143D2F]">{unifiedRecord.orderedQty} units</span>
              </div>
              <div className="flex justify-between text-[#667066]">
                <span>Delivered Quantity:</span>
                <span className="text-[#143D2F]">{unifiedRecord.deliveredQty} units</span>
              </div>
              <div className="flex justify-between text-[#667066]">
                <span>Invoiced Quantity:</span>
                <span className="text-[#C66A4A] font-bold">{unifiedRecord.invoicedQty} units</span>
              </div>
              <div className="flex justify-between text-[#667066]">
                <span>Agreed Unit Price:</span>
                <span className="text-[#143D2F]">{currency} {unifiedRecord.contractUnitPrice}</span>
              </div>
            </div>
          </div>

          {/* Audit History Timeline */}
          <div className="bg-white p-5 rounded-xl border border-[#E5E7E2] shadow-card space-y-3">
            <h4 className="font-serif text-base font-bold text-[#143D2F]">Audit History</h4>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-[#FAF8F3] border border-[#E5E7E2] space-y-1">
                <div className="flex items-center justify-between text-[11px] text-[#8F9A8F]">
                  <span>24 Oct 2026, 17:05</span>
                  <span className="font-semibold text-[#143D2F]">System Agent</span>
                </div>
                <div className="text-[#202720] font-medium">
                  Finding created: 20-unit variance detected via 4-way matching.
                </div>
              </div>

              {lastAction && (
                <div className="p-2.5 rounded-lg bg-[#EAF3ED] border border-[#DCEBE1] space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-[#246B52]">
                    <span>Just now</span>
                    <span className="font-semibold">Sahrish (Auditor)</span>
                  </div>
                  <div className="text-[#143D2F] font-medium">
                    Review decision: {lastAction.toUpperCase()}
                  </div>
                  {notes && <p className="text-[11px] text-[#667066] italic font-sans">"{notes}"</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
