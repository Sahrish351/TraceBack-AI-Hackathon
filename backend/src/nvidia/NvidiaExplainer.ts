import { config, isNvidiaLive } from "../config.js";
import { logger } from "../utils/logger.js";
import { UnifiedRecord, Discrepancy, ExplanationOutput } from "../analyzer/types.js";

/**
 * NvidiaExplainer
 * 
 * Powered by NVIDIA NIM (Inference Microservice) running meta/llama-3.1-8b-instruct.
 * Translates multi-source reconciliation mathematics into:
 * 1. An executive audit summary for internal procurement & finance leadership.
 * 2. A supplier-ready clarification email with polite, evidence-grounded dispute citations.
 * 
 * If NVIDIA_API_KEY is not set or network fails, gracefully falls back to deterministic
 * templating so hackathon demos NEVER break.
 */
export class NvidiaExplainer {
  async generateExplanation(
    record: UnifiedRecord,
    discrepancies: Discrepancy[],
    totalFinancialImpact: number
  ): Promise<ExplanationOutput> {
    if (isNvidiaLive) {
      try {
        logger.info(`[NVIDIA NIM] Requesting inference from ${config.nvidiaModel} via NVIDIA Cloud API...`);
        const result = await this.callNvidiaNim(record, discrepancies, totalFinancialImpact);
        if (result) {
          return {
            ...result,
            modelUsed: config.nvidiaModel,
            isLive: true
          };
        }
      } catch (err) {
        logger.error({ err }, "[NVIDIA NIM] Live inference failed. Transitioning to deterministic fallback.");
      }
    }

    // High-fidelity deterministic fallback engine
    logger.info("[NVIDIA FALLBACK] Generating deterministic audit explanation and supplier clarification email.");
    return this.generateDeterministicFallback(record, discrepancies, totalFinancialImpact);
  }

  private async callNvidiaNim(
    record: UnifiedRecord,
    discrepancies: Discrepancy[],
    totalFinancialImpact: number
  ): Promise<{ executiveSummary: string; auditRationale: string; supplierEmail: any } | null> {
    const prompt = `
You are TraceBack AI, an enterprise procurement auditor.
Analyze this supplier reconciliation finding and provide:
1. An Executive Summary (2-3 sentences emphasizing financial recovery).
2. An Audit Rationale (step-by-step evidence justification).
3. A Supplier Clarification Email (polite, highly specific, referencing documents and exact amounts).

RECONCILIATION DATA:
Purchase Order: ${record.poId} (Ordered: ${record.orderedQty} units @ $${record.poUnitPrice})
Delivery Receipt: ${record.deliveryId} (Delivered: ${record.deliveredQty} units on ${record.deliveryDate})
Supplier Invoice: ${record.invoiceId} (Invoiced: ${record.invoicedQty} units @ $${record.invoiceUnitPrice} on ${record.invoiceDate})
Contract Rate: $${record.contractUnitPrice} for supplier ${record.supplierId}
Total Discrepancies: ${discrepancies.length}
Total Overcharge Amount: $${totalFinancialImpact.toLocaleString()} ${record.currency}

DISCREPANCY DETAILS:
${discrepancies
  .map(
    (d, i) =>
      `${i + 1}. [${d.type}] ${d.reason} | Financial Impact: $${d.financialImpact} | Evidence: ${d.sourceA.file} (row ${d.sourceA.row}) vs ${d.sourceB.file} (row ${d.sourceB.row})`
  )
  .join("\n")}

Respond ONLY in valid JSON format with keys:
"executiveSummary": string,
"auditRationale": string,
"supplierEmail": {
  "to": string,
  "subject": string,
  "body": string,
  "recipientName": string,
  "claimAmount": string
}
`.trim();

    const response = await fetch(config.nvidiaApiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.nvidiaApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: config.nvidiaModel,
        messages: [
          {
            role: "system",
            content: "You are an expert AI procurement auditor. Output valid JSON only, without markdown fences."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      throw new Error(`NVIDIA API returned HTTP ${response.status}: ${await response.text()}`);
    }

    const json = (await response.json()) as any;
    const content = json?.choices?.[0]?.message?.content;
    if (!content) return null;

    try {
      // Clean JSON in case model wrapped it in ```json fences
      const cleaned = content.replace(/```json/g, "").replace(/```/g, "").trim();
      return JSON.parse(cleaned);
    } catch {
      logger.warn("[NVIDIA NIM] Failed to parse model JSON output, falling back to clean template.");
      return null;
    }
  }

  private generateDeterministicFallback(
    record: UnifiedRecord,
    discrepancies: Discrepancy[],
    totalFinancialImpact: number
  ): ExplanationOutput {
    const currency = record.currency || "USD";

    if (discrepancies.length === 0) {
      return {
        executiveSummary: `Reconciliation for Purchase Order ${record.poId} completed with 100% concordance across Purchase Order, Goods Receipt, Supplier Invoice, and Contract Price List. No overcharges or anomalies identified.`,
        auditRationale: `All 4 verification checks succeeded: Invoiced quantity matches warehouse receipt (${record.deliveredQty} units), unit price matches agreed contract schedule ($${record.contractUnitPrice}/unit), no unauthorized ancillary fees exist, and zero duplicate submissions detected.`,
        supplierEmail: {
          to: `accounts-payable@${record.supplierId.toLowerCase()}.supplier-portal.com`,
          recipientName: `${record.supplierId} Accounts Receivable Team`,
          subject: `Invoice Reconciliation Approval: ${record.invoiceId || record.poId}`,
          claimAmount: "$0.00",
          body: `Dear Accounts Receivable Team,\n\nWe have completed our automated four-way reconciliation for Purchase Order ${record.poId} and Invoice ${record.invoiceId}.\n\nAll quantities, rates, and goods receipt receipts have been verified against our agreed supplier contract. Your invoice has been approved for regular payment processing according to net terms.\n\nThank you for your partnership.\n\nBest regards,\nAccounts Payable & Audit Team\nTraceBack AI Automated Reconciliation`
        },
        modelUsed: "meta/llama-3.1-8b-instruct (NVIDIA NIM Fallback Engine)",
        isLive: false
      };
    }

    // Build breakdown for email
    const breakdownBullets = discrepancies
      .map((d) => {
        const impactStr = currency === "USD" ? `$${d.financialImpact.toLocaleString()}` : `${currency} ${d.financialImpact.toLocaleString()}`;
        if (d.type === "QTY_OVERBILL") {
          const unitRate = currency === "USD" ? `$${record.invoiceUnitPrice}` : `${currency} ${record.invoiceUnitPrice}`;
          return `• Quantity Variance (${d.delta} unreceived units): Invoiced for ${record.invoicedQty} units, but warehouse receiving slip ${record.deliveryId || "N/A"} documents ${record.deliveredQty} units received. Potential overbill value: ${impactStr} (citing ${d.sourceA.file}:L${d.sourceA.row} vs ${d.sourceB.file}:L${d.sourceB.row}).`;
        }
        if (d.type === "PRICE_ABOVE_CONTRACT") {
          const deltaRate = currency === "USD" ? `$${d.delta}` : `${currency} ${d.delta}`;
          return `• Price Rate Variance (${deltaRate}/unit): Billed at ${currency === "USD" ? `$${record.invoiceUnitPrice}` : `${currency} ${record.invoiceUnitPrice}`}/unit vs master contracted rate of ${currency === "USD" ? `$${record.contractUnitPrice}` : `${currency} ${record.contractUnitPrice}`}/unit. Potential variance on ${record.deliveredQty} delivered units: ${impactStr} (citing ${d.sourceA.file}:L${d.sourceA.row} vs ${d.sourceB.file}:L${d.sourceB.row}).`;
        }
        if (d.type === "UNEXPECTED_FEE") {
          return `• Unauthorized Surcharge: Invoice includes ${currency === "USD" ? `$${d.delta}` : `${currency} ${d.delta}`} in non-contracted ancillary fees.`;
        }
        if (d.type === "MISSING_EVIDENCE") {
          return `• Missing Evidence: ${d.reason}`;
        }
        return `• ${d.type}: ${d.reason} (${impactStr})`;
      })
      .join("\n\n");

    const totalStr = currency === "USD" ? `$${totalFinancialImpact.toLocaleString()}` : `${currency} ${totalFinancialImpact.toLocaleString()}`;
    const executiveSummary = `Reconciliation analysis identified ${totalStr} in potential discrepancies across ${discrepancies.length} category/categories for Purchase Order ${record.poId} (${record.supplierId}). Primary findings: ${discrepancies.map((d) => d.reason).join(" ")} Status: Potential Discrepancy — Requires Human Review.`;

    const auditRationale = `TraceBack AI reconciled Purchase Order ${record.poId}, Delivery Slip ${record.deliveryId || "N/A"}, Invoice ${record.invoiceId || "N/A"}, and Master Contract for ${record.supplierId}. Cross-source 4-way matching observed ${discrepancies.length} variance item(s). Total calculated potential exposure is exactly ${totalStr}.`;

    const emailBody = `Dear ${record.supplierId} Accounts Receivable Team,

We are writing regarding Invoice ${record.invoiceId || "INV"} submitted against Purchase Order ${record.poId} for item ${record.item}.

Our automated cross-source reconciliation has identified a potential discrepancy variance of ${totalStr}. We kindly request clarification or an adjustment based on the verified evidence trail detailed below:

DISCREPANCY EVIDENCE TRAIL:
${breakdownBullets}

TOTAL DISCREPANCY AMOUNT: ${totalStr}

REQUESTED ACTION:
1. Please review the delivery and contract documentation referenced above.
2. If confirmed, please issue a credit note or submit a corrected invoice referencing PO ${record.poId} and Invoice ${record.invoiceId || "INV"}.

Thank you for your prompt attention to this matter.

Sincerely,
Procurement & Accounts Payable Audit Team
TraceBack AI Automated Reconciliation Platform`;

    return {
      executiveSummary,
      auditRationale,
      supplierEmail: {
        to: `billing@${record.supplierId.toLowerCase().replace(/\s+/g, "-")}.supplier-portal.com`,
        recipientName: `${record.supplierId} Accounts Receivable`,
        subject: `Discrepancy Notice: PO ${record.poId} / Inv ${record.invoiceId || "INV"} [Claim: ${totalStr}]`,
        claimAmount: totalStr,
        body: emailBody
      },
      modelUsed: "meta/llama-3.1-8b-instruct (NVIDIA NIM Fallback Engine)",
      isLive: false
    };
  }
}

export const nvidiaExplainer = new NvidiaExplainer();
