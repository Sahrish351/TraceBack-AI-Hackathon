import React, { useState } from "react";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Calendar,
  Layers,
  ArrowRight,
  Calculator,
  Receipt,
  Tag
} from "lucide-react";
import { InvestigationResult } from "../types";

interface InvestigationDetailProps {
  investigation: InvestigationResult;
  onBack: () => void;
  onOpenReview: () => void;
  onViewSourceFile: (fileName: string) => void;
}

export const InvestigationDetail: React.FC<InvestigationDetailProps> = ({
  investigation,
  onBack,
  onOpenReview,
  onViewSourceFile
}) => {
  const [activeTab, setActiveTab] = useState<"summary" | "sources" | "evidence" | "timeline" | "explanation">("summary");
  const [copiedEmail, setCopiedEmail] = useState(false);

  const { unifiedRecord, summary, discrepancies, missionTrace, explanation } = investigation;
  const isCanonical = unifiedRecord.poId === "PO-1042";
  const currency = unifiedRecord.currency || "USD";
  const isClean = summary.status === "CLEAN" || discrepancies.length === 0;
  const hasLineItems = Boolean(unifiedRecord.lineItems && unifiedRecord.lineItems.length > 0);

  const handleCopyEmail = () => {
    if (explanation?.supplierEmail?.body) {
      navigator.clipboard.writeText(explanation.supplierEmail.body);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const formatMoney = (amount: number) => {
    return `${currency} ${amount.toLocaleString(undefined, { minimumFractionDigits: Number.isInteger(amount) ? 0 : 2, maximumFractionDigits: 2 })}`;
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
          <span className="font-semibold text-[#143D2F]">
            {unifiedRecord.invoiceId || unifiedRecord.poId}
          </span>
        </div>

        <button
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-[#E5E7E2] bg-white hover:bg-[#FAF8F3] text-xs font-medium text-[#143D2F] transition shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Investigations</span>
        </button>
      </div>

      {/* 2. Investigation Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E5E7E2] pb-6">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="font-serif text-3xl font-bold text-[#143D2F]">
              {unifiedRecord.invoiceId || unifiedRecord.poId}
            </h1>
            {isClean ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EAF3ED] text-[#246B52] border border-[#DCEBE1]">
                Concordant (Clean)
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FDF1ED] text-[#C66A4A] border border-[#F3C5B5]">
                Requires Human Review
              </span>
            )}
            {isCanonical && (
              <span className="text-[10px] bg-[#143D2F] text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                Canonical Demo Case
              </span>
            )}
            {hasLineItems && (
              <span className="text-[10px] bg-[#EAF3ED] text-[#246B52] border border-[#DCEBE1] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                {unifiedRecord.lineItems?.length} Line Items
              </span>
            )}
          </div>
          <p className="text-xs text-[#667066] mt-1.5 flex flex-wrap items-center gap-2">
            <span className="font-medium text-[#202720]">{unifiedRecord.supplierId}</span>
            <span>•</span>
            <span>PO: {unifiedRecord.poId}</span>
            <span>•</span>
            <span>DN: {unifiedRecord.deliveryId || "N/A"}</span>
            <span>•</span>
            <span>Date: {unifiedRecord.orderDate}</span>
          </p>
        </div>

        {/* Action Button */}
        {!isClean && (
          <button
            onClick={onOpenReview}
            className="inline-flex items-center space-x-2 bg-[#246B52] hover:bg-[#1D5642] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition shadow-sm"
          >
            <span>Review Finding</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 3. Potential Discrepancy Banner */}
      {!isClean && (
        <div className="p-5 rounded-xl bg-[#FDF1ED] border border-[#F3C5B5] shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="w-9 h-9 rounded-lg bg-[#F3C5B5]/50 text-[#C66A4A] flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-[#C66A4A]">
                Potential Discrepancy Detected — Requires Human Review
              </h3>
              <p className="text-xs text-[#667066] mt-0.5">
                {discrepancies[0]?.reason || "Quantity and price variance observed between procurement records."}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-6 border-t md:border-t-0 md:border-l border-[#F3C5B5] pt-3 md:pt-0 md:pl-6 shrink-0">
            <div>
              <div className="font-serif text-xl font-bold text-[#143D2F]">
                {discrepancies.length} {discrepancies.length === 1 ? "finding" : "findings"}
              </div>
              <div className="text-[11px] text-[#667066]">Flagged variances</div>
            </div>
            <div>
              <div className="font-serif text-2xl font-bold text-[#C66A4A]">
                {formatMoney(summary.totalFinancialImpact)}
              </div>
              <div className="text-[11px] text-[#C66A4A] font-semibold">Potential amount</div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Tab Navigation */}
      <div className="border-b border-[#E5E7E2]">
        <nav className="flex space-x-8 text-sm font-medium">
          {[
            { id: "summary", label: "Summary" },
            { id: "sources", label: "Source Records" },
            { id: "evidence", label: "Evidence Trail" },
            { id: "timeline", label: "Timeline" },
            { id: "explanation", label: "AI Explanation" }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-1 border-b-2 font-medium transition ${
                  isActive
                    ? "border-[#246B52] text-[#246B52] font-semibold"
                    : "border-transparent text-[#667066] hover:text-[#143D2F] hover:border-[#E5E7E2]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* 5. Tab Content: Summary */}
      {activeTab === "summary" && (
        <div className="space-y-6">
          {/* Multi-Line Items Table if present */}
          {hasLineItems ? (
            <div className="bg-white rounded-xl border border-[#E5E7E2] shadow-card overflow-hidden">
              <div className="p-4 border-b border-[#E5E7E2] flex items-center justify-between bg-[#FAF8F3]/50">
                <div className="flex items-center space-x-2">
                  <Receipt className="w-4 h-4 text-[#246B52]" />
                  <h3 className="font-serif text-base font-bold text-[#143D2F]">
                    Line Items & Multi-Source Reconciliation
                  </h3>
                </div>
                <span className="text-xs text-[#8F9A8F]">
                  {unifiedRecord.lineItems?.length} items verified against PO, Delivery & Contract
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-[#FAF8F3] border-b border-[#E5E7E2] text-xs font-semibold text-[#667066] uppercase">
                      <th className="py-3 px-4">Item Code & Description</th>
                      <th className="py-3 px-4 text-center">Ordered (PO)</th>
                      <th className="py-3 px-4 text-center">Delivered (DN)</th>
                      <th className="py-3 px-4 text-center">Invoiced</th>
                      <th className="py-3 px-4 text-right">Unit Price</th>
                      <th className="py-3 px-4 text-right">Contract Price</th>
                      <th className="py-3 px-4 text-right">Line Total</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7E2]">
                    {unifiedRecord.lineItems?.map((line, idx) => {
                      const isQtyDiscrepant = line.invoicedQty > line.deliveredQty;
                      const isPriceDiscrepant = line.contractUnitPrice > 0 && line.invoiceUnitPrice > line.contractUnitPrice;
                      const isDiscrepant = isQtyDiscrepant || isPriceDiscrepant;

                      return (
                        <tr
                          key={idx}
                          className={`hover:bg-[#FAF8F3]/60 transition ${
                            isDiscrepant ? "bg-[#FDF1ED]/30" : ""
                          }`}
                        >
                          <td className="py-3 px-4">
                            <div className="font-semibold text-xs text-[#143D2F] font-mono">
                              {line.itemId}
                            </div>
                            <div className="text-xs text-[#667066]">{line.description}</div>
                          </td>
                          <td className="py-3 px-4 text-center text-xs text-[#667066]">
                            {line.orderedQty}
                          </td>
                          <td className="py-3 px-4 text-center text-xs font-semibold text-[#143D2F]">
                            {line.deliveredQty}
                          </td>
                          <td
                            className={`py-3 px-4 text-center text-xs font-bold ${
                              isQtyDiscrepant ? "text-[#C66A4A]" : "text-[#143D2F]"
                            }`}
                          >
                            {line.invoicedQty}
                          </td>
                          <td
                            className={`py-3 px-4 text-right text-xs font-mono ${
                              isPriceDiscrepant ? "text-[#C66A4A] font-bold" : "text-[#202720]"
                            }`}
                          >
                            {formatMoney(line.invoiceUnitPrice)}
                          </td>
                          <td className="py-3 px-4 text-right text-xs font-mono text-[#667066]">
                            {line.contractUnitPrice > 0 ? formatMoney(line.contractUnitPrice) : "—"}
                          </td>
                          <td className="py-3 px-4 text-right text-xs font-mono font-bold text-[#143D2F]">
                            {formatMoney(line.invoicedQty * line.invoiceUnitPrice)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {isQtyDiscrepant ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FDF1ED] text-[#C66A4A] border border-[#F3C5B5]">
                                +{line.invoicedQty - line.deliveredQty} unreceived
                              </span>
                            ) : isPriceDiscrepant ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FDF1ED] text-[#C66A4A] border border-[#F3C5B5]">
                                Rate above contract
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#EAF3ED] text-[#246B52] border border-[#DCEBE1]">
                                Matched
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Financial Calculation Breakdown Footer */}
              {unifiedRecord.financialSummary && (
                <div className="p-4 bg-[#FAF8F3] border-t border-[#E5E7E2] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-[#667066]">Billed Net Subtotal:</span>
                    <div className="font-serif text-sm font-bold text-[#143D2F]">
                      {formatMoney(unifiedRecord.financialSummary.subtotal)}
                    </div>
                  </div>
                  <div>
                    <span className="text-[#667066]">
                      Tax ({(unifiedRecord.financialSummary.taxRate * 100).toFixed(1)}%):
                    </span>
                    <div className="font-serif text-sm font-bold text-[#143D2F]">
                      {formatMoney(unifiedRecord.financialSummary.taxAmount)}
                    </div>
                  </div>
                  <div>
                    <span className="text-[#667066]">Total Invoiced Amount:</span>
                    <div className="font-serif text-sm font-bold text-[#143D2F]">
                      {formatMoney(unifiedRecord.financialSummary.totalAmount)}
                    </div>
                  </div>
                  <div>
                    <span className="text-[#667066]">Audit Status:</span>
                    <div className="font-bold text-[#C66A4A]">
                      {summary.status === "CLEAN" ? "All Lines Matched" : "Requires Human Review"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Single-Item Comparison Summary Grid (Canonical PO-1042 / Baseline) */
            <div className="bg-white rounded-xl border border-[#E5E7E2] shadow-card overflow-hidden">
              <div className="p-4 border-b border-[#E5E7E2] flex items-center justify-between bg-[#FAF8F3]/50">
                <h3 className="font-serif text-base font-bold text-[#143D2F]">Comparison Summary</h3>
                <span className="text-xs text-[#8F9A8F]">4-Way Cross-Source Matching</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-[#FAF8F3] border-b border-[#E5E7E2] text-xs font-semibold text-[#667066] uppercase">
                      <th className="py-3 px-5">Record Type</th>
                      <th className="py-3 px-5">Document Reference</th>
                      <th className="py-3 px-5">Quantity</th>
                      <th className="py-3 px-5">Unit Price</th>
                      <th className="py-3 px-5 text-right">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7E2]">
                    <tr>
                      <td className="py-3 px-5 font-medium text-[#143D2F]">Purchase Order</td>
                      <td className="py-3 px-5 font-mono text-xs">{unifiedRecord.poId}</td>
                      <td className="py-3 px-5">{unifiedRecord.orderedQty} units</td>
                      <td className="py-3 px-5 font-mono text-xs">{formatMoney(unifiedRecord.poUnitPrice)}</td>
                      <td className="py-3 px-5 text-right font-mono text-xs">
                        {formatMoney(unifiedRecord.orderedQty * unifiedRecord.poUnitPrice)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-5 font-medium text-[#143D2F]">Delivery Note (Goods Receipt)</td>
                      <td className="py-3 px-5 font-mono text-xs">{unifiedRecord.deliveryId || "N/A"}</td>
                      <td className="py-3 px-5 font-semibold text-[#143D2F]">{unifiedRecord.deliveredQty} units</td>
                      <td className="py-3 px-5 font-mono text-xs">{formatMoney(unifiedRecord.poUnitPrice)}</td>
                      <td className="py-3 px-5 text-right font-mono text-xs">
                        {formatMoney(unifiedRecord.deliveredQty * unifiedRecord.poUnitPrice)}
                      </td>
                    </tr>
                    <tr className={isClean ? "" : "bg-[#FDF1ED]/30"}>
                      <td className="py-3 px-5 font-medium text-[#C66A4A]">Supplier Invoice</td>
                      <td className="py-3 px-5 font-mono text-xs font-bold text-[#C66A4A]">{unifiedRecord.invoiceId}</td>
                      <td className="py-3 px-5 font-bold text-[#C66A4A]">{unifiedRecord.invoicedQty} units</td>
                      <td className="py-3 px-5 font-mono text-xs">{formatMoney(unifiedRecord.invoiceUnitPrice)}</td>
                      <td className="py-3 px-5 text-right font-mono text-xs font-bold text-[#C66A4A]">
                        {formatMoney(unifiedRecord.invoicedQty * unifiedRecord.invoiceUnitPrice)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Key Findings & Transparent Calculation Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Key Findings */}
            <div className="bg-white p-5 rounded-xl border border-[#E5E7E2] shadow-card space-y-3">
              <h4 className="font-serif text-base font-bold text-[#143D2F]">Key Findings</h4>
              <ul className="space-y-2.5 text-xs text-[#202720]">
                {discrepancies.length > 0 ? (
                  discrepancies.map((d, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C66A4A] mt-1.5 shrink-0"></span>
                      <div>
                        <span className="font-semibold text-[#C66A4A]">{d.type}: </span>
                        <span>{d.reason}</span>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="flex items-center space-x-2 text-[#246B52]">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>All records match perfectly. Invoiced quantities and prices align with receipts.</span>
                  </li>
                )}
              </ul>
            </div>

            {/* Formula & Calculation Box */}
            <div className="bg-white p-5 rounded-xl border border-[#E5E7E2] shadow-card space-y-3">
              <div className="flex items-center space-x-2">
                <Calculator className="w-4 h-4 text-[#246B52]" />
                <h4 className="font-serif text-base font-bold text-[#143D2F]">Calculation Breakdown</h4>
              </div>

              {discrepancies.length > 0 ? (
                <div className="space-y-2.5">
                  {discrepancies.map((d, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-[#FAF8F3] border border-[#E5E7E2] text-xs space-y-1">
                      <div className="flex items-center justify-between font-semibold text-[#143D2F]">
                        <span>{d.itemIdentifier ? `Item ${d.itemIdentifier}` : d.field}</span>
                        <span className="text-[#C66A4A] font-bold font-mono">
                          {formatMoney(d.financialImpact)}
                        </span>
                      </div>
                      <div className="font-mono text-xs text-[#246B52] bg-white p-2 rounded border border-[#E5E7E2]/80">
                        {d.calculation?.formula || `${d.delta} delta × price variance`}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3.5 rounded-lg bg-[#FAF8F3] border border-[#E5E7E2] text-xs text-[#246B52]">
                  Zero discrepancy detected. Subtotal and quantities fully reconciled.
                </div>
              )}

              <p className="text-[11px] text-[#8F9A8F]">
                Status: Potential Discrepancy — Requires Human Review. (Not classified as fraud or loss).
              </p>
            </div>
          </div>

          {/* AI Explanation & Dispute Draft Preview */}
          {explanation && (
            <div className="bg-white p-6 rounded-xl border border-[#E5E7E2] shadow-card space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-md bg-[#EAF3ED] text-[#246B52] flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="font-serif text-base font-bold text-[#143D2F]">Agent Explanation & Dispute Draft</h4>
                </div>
                <span className="text-[11px] text-[#8F9A8F]">{explanation.modelUsed}</span>
              </div>

              <div className="p-4 rounded-lg bg-[#FAF8F3] border border-[#E5E7E2] text-xs text-[#202720] leading-relaxed">
                {explanation.executiveSummary}
              </div>

              {explanation.supplierEmail && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#667066]">
                    <span>Suggested Supplier Clarification Draft (Non-Sending)</span>
                    <button
                      onClick={handleCopyEmail}
                      className="inline-flex items-center space-x-1 text-[#246B52] hover:underline"
                    >
                      {copiedEmail ? <Check className="w-3.5 h-3.5 text-[#246B52]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedEmail ? "Copied" : "Copy Draft"}</span>
                    </button>
                  </div>
                  <pre className="p-4 rounded-lg bg-white border border-[#E5E7E2] text-xs text-[#202720] font-sans whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                    {explanation.supplierEmail.body}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 5b. Tab Content: Source Records */}
      {activeTab === "sources" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { label: "Purchase Order", file: "purchase_orders.csv", id: unifiedRecord.poId, qty: `${unifiedRecord.orderedQty} units`, rate: `${formatMoney(unifiedRecord.poUnitPrice)}` },
            { label: "Delivery Note", file: "deliveries.csv", id: unifiedRecord.deliveryId || "N/A", qty: `${unifiedRecord.deliveredQty} units`, rate: "Verified Receipt" },
            { label: "Supplier Invoice", file: "invoices.csv", id: unifiedRecord.invoiceId, qty: `${unifiedRecord.invoicedQty} units`, rate: `${formatMoney(unifiedRecord.invoiceUnitPrice)}` },
            { label: "Contract Price Catalog", file: "contract_prices.csv", id: unifiedRecord.supplierId, qty: "Active Schedule", rate: `${formatMoney(unifiedRecord.contractUnitPrice)}` }
          ].map((src, i) => (
            <div key={i} className="bg-white p-5 rounded-xl border border-[#E5E7E2] shadow-card space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-serif text-base font-bold text-[#143D2F]">{src.label}</span>
                <button
                  onClick={() => onViewSourceFile(src.file)}
                  className="inline-flex items-center space-x-1 text-xs text-[#246B52] hover:underline font-medium"
                >
                  <span>View Raw CSV</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
              <div className="text-xs space-y-1 font-mono text-[#667066]">
                <div>File: <span className="text-[#143D2F] font-semibold">{src.file}</span></div>
                <div>Ref ID: <span className="text-[#143D2F]">{src.id}</span></div>
                <div>Scope: <span className="text-[#143D2F]">{src.qty}</span> @ {src.rate}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5c. Tab Content: Evidence Trail */}
      {activeTab === "evidence" && (
        <div className="bg-white rounded-xl border border-[#E5E7E2] shadow-card overflow-hidden">
          <div className="p-4 border-b border-[#E5E7E2] bg-[#FAF8F3]/50">
            <h3 className="font-serif text-base font-bold text-[#143D2F]">Grounded Evidence Coordinates</h3>
            <p className="text-xs text-[#667066]">Exact file rows and cell values cited by deterministic reconciliation</p>
          </div>

          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-[#FAF8F3] border-b border-[#E5E7E2] text-xs font-semibold text-[#667066] uppercase">
                <th className="py-3 px-5">Evidence Element</th>
                <th className="py-3 px-5">Source File</th>
                <th className="py-3 px-5">Row Number</th>
                <th className="py-3 px-5">Column</th>
                <th className="py-3 px-5 text-right">Observed Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7E2]">
              {unifiedRecord.sourceRefs?.map((ref, idx) => (
                <tr key={idx} className="hover:bg-[#FAF8F3]/60 transition">
                  <td className="py-3 px-5 font-medium text-[#143D2F]">{ref.label}</td>
                  <td className="py-3 px-5 font-mono text-xs text-[#246B52]">{ref.file}</td>
                  <td className="py-3 px-5 font-mono text-xs">Line {ref.row}</td>
                  <td className="py-3 px-5 font-mono text-xs">{ref.column}</td>
                  <td className="py-3 px-5 text-right font-mono text-xs font-bold text-[#143D2F]">
                    {String(ref.value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 5d. Tab Content: Timeline */}
      {activeTab === "timeline" && (
        <div className="bg-white p-6 rounded-xl border border-[#E5E7E2] shadow-card space-y-6">
          <h3 className="font-serif text-base font-bold text-[#143D2F]">Investigation Audit Timeline</h3>

          <div className="relative border-l-2 border-[#DCEBE1] ml-4 pl-6 space-y-6">
            <div className="relative">
              <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-[#246B52] border-2 border-white"></span>
              <div className="text-xs font-semibold text-[#143D2F]">Purchase Order Issued: {unifiedRecord.poId}</div>
              <div className="text-[11px] text-[#667066]">{unifiedRecord.orderDate} • Ordered {unifiedRecord.orderedQty} units @ {formatMoney(unifiedRecord.poUnitPrice)}</div>
            </div>

            <div className="relative">
              <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-[#246B52] border-2 border-white"></span>
              <div className="text-xs font-semibold text-[#143D2F]">Warehouse Goods Receipt: {unifiedRecord.deliveryId || "N/A"}</div>
              <div className="text-[11px] text-[#667066]">{unifiedRecord.deliveryDate} • Received & Accepted {unifiedRecord.deliveredQty} units at {unifiedRecord.warehouse}</div>
            </div>

            <div className="relative">
              <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-[#C66A4A] border-2 border-white"></span>
              <div className="text-xs font-semibold text-[#C66A4A]">Supplier Invoice Received: {unifiedRecord.invoiceId}</div>
              <div className="text-[11px] text-[#667066]">{unifiedRecord.invoiceDate} • Invoiced for {unifiedRecord.invoicedQty} units @ {formatMoney(unifiedRecord.invoiceUnitPrice)}</div>
            </div>

            <div className="relative">
              <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-[#143D2F] border-2 border-white"></span>
              <div className="text-xs font-semibold text-[#143D2F]">TraceBack AI Automated 4-Way Analysis</div>
              <div className="text-[11px] text-[#667066]">Observed variance of {unifiedRecord.invoicedQty - unifiedRecord.deliveredQty} units. Logged for Human Review.</div>
            </div>
          </div>
        </div>
      )}

      {/* 5e. Tab Content: AI Explanation */}
      {activeTab === "explanation" && explanation && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-[#E5E7E2] shadow-card space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#143D2F]">Audit Rationale</h3>
            <p className="text-xs text-[#202720] leading-relaxed bg-[#FAF8F3] p-4 rounded-lg border border-[#E5E7E2]">
              {explanation.auditRationale}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#E5E7E2] shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-base font-bold text-[#143D2F]">Supplier Dispute Draft</h3>
              <button
                onClick={handleCopyEmail}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded bg-[#246B52] text-white text-xs font-medium hover:bg-[#1D5642] transition shadow-sm"
              >
                {copiedEmail ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                <span>{copiedEmail ? "Copied to Clipboard" : "Copy Draft"}</span>
              </button>
            </div>
            <pre className="p-4 bg-[#FAF8F3] border border-[#E5E7E2] rounded-lg text-xs font-mono whitespace-pre-wrap leading-relaxed text-[#202720]">
              {explanation.supplierEmail?.body}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
