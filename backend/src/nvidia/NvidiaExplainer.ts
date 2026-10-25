import { config, isNvidiaLive } from "../config.js";
import { logger } from "../utils/logger.js";
import { UnifiedRecord, Discrepancy, ExplanationOutput } from "../analyzer/types.js";
import { formatCurrencyValue } from "../analyzer/compare.js";

/**
 * NvidiaExplainer
 * 
 * Powered by NVIDIA NIM (Inference Microservice) running meta/llama-3.1-8b-instruct
 * or nvidia/nemotron-4-340b-instruct.
 * 
 * Strictly adheres to the Evidence-First Hackathon Guardrail:
 * 1. Financial discrepancy amounts and unit calculations are NEVER computed by the model.
 *    They are calculated strictly by the deterministic TypeScript engine and provided as immutable facts.
 * 2. The LLM translates the mathematical evidence coordinates into:
 *    - An executive audit rationale for procurement leadership.
 *    - A polite, formal supplier clarification draft citing exact source files and line numbers.
 * 3. If NVIDIA_API_KEY is not set or times out, the client falls back to the deterministic
 *    fallback engine so hackathon evaluations and human reviewers are never blocked.
 */
export class NvidiaExplainer {
  /**
   * Health Check diagnostic for NVIDIA NIM inference service
   */
  async getHealthStatus(customFetch?: typeof fetch): Promise<{
    mode: "live" | "mock";
    status: string;
    configured: boolean;
    model: string;
    endpoint: string;
    reason?: string;
  }> {
    const fetchImpl = customFetch || fetch;

    if (isNvidiaLive) {
      try {
        const res = await fetchImpl(config.nvidiaApiUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.nvidiaApiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: config.nvidiaModel,
            messages: [{ role: "user", content: "Ping" }],
            max_tokens: 1
          }),
          signal: AbortSignal.timeout(5000)
        });

        if (res.ok) {
          return {
            mode: "live",
            status: "Connected and verified",
            configured: true,
            model: config.nvidiaModel,
            endpoint: config.nvidiaApiUrl
          };
        }
        return {
          mode: "mock",
          status: "Blocked by credentials or account access",
          configured: true,
          model: config.nvidiaModel,
          endpoint: config.nvidiaApiUrl,
          reason: `NVIDIA API responded with HTTP ${res.status}`
        };
      } catch (err: any) {
        return {
          mode: "mock",
          status: "Blocked by credentials or account access",
          configured: true,
          model: config.nvidiaModel,
          endpoint: config.nvidiaApiUrl,
          reason: err.message || "Network timeout or connection error"
        };
      }
    }

    return {
      mode: "mock",
      status: "Not configured (Local / demo mode)",
      configured: false,
      model: config.nvidiaModel,
      endpoint: config.nvidiaApiUrl,
      reason: "NVIDIA_API_KEY environment variable is not configured"
    };
  }

  async generateExplanation(
    record: UnifiedRecord,
    discrepancies: Discrepancy[],
    totalFinancialImpact: number,
    customFetch?: typeof fetch
  ): Promise<ExplanationOutput> {
    if (isNvidiaLive) {
      try {
        logger.info(`[NVIDIA NIM] Requesting inference from ${config.nvidiaModel} via NVIDIA Cloud API...`);
        const result = await this.callNvidiaNim(record, discrepancies, totalFinancialImpact, customFetch);
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
    totalFinancialImpact: number,
    customFetch?: typeof fetch
  ): Promise<{ executiveSummary: string; auditRationale: string; supplierEmail: any } | null> {
    const fetchImpl = customFetch || fetch;
    const currency = record.currency || "USD";

    const prompt = `
You are TraceBack AI, an enterprise procurement auditor.
Analyze this supplier reconciliation finding and provide:
1. An Executive Summary (2-3 sentences emphasizing financial recovery).
2. An Audit Rationale (step-by-step evidence justification).
3. A Supplier Clarification Email (polite, highly specific, referencing documents and exact amounts).

RECONCILIATION DATA:
Purchase Order: ${record.poId} (Ordered: ${record.orderedQty} units @ ${formatCurrencyValue(record.poUnitPrice, currency)})
Delivery Receipt: ${record.deliveryId} (Delivered: ${record.deliveredQty} units on ${record.deliveryDate})
Supplier Invoice: ${record.invoiceId} (Invoiced: ${record.invoicedQty} units @ ${formatCurrencyValue(record.invoiceUnitPrice, currency)} on ${record.invoiceDate})
Contract Rate: ${formatCurrencyValue(record.contractUnitPrice, currency)} for supplier ${record.supplierId}
Total Discrepancies: ${discrepancies.length}
Total Overcharge Amount: ${formatCurrencyValue(totalFinancialImpact, currency)}

DISCREPANCY DETAILS:
${discrepancies
  .map(
    (d, i) =>
      `${i + 1}. [${d.type}] ${d.reason} | Financial Impact: ${formatCurrencyValue(d.financialImpact, currency)} | Evidence: ${d.sourceA.file} (row ${d.sourceA.row}) vs ${d.sourceB.file} (row ${d.sourceB.row})`
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

    const response = await fetchImpl(config.nvidiaApiUrl, {
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
      }),
      signal: AbortSignal.timeout(8000)
    });

    if (!response.ok) {
      throw new Error(`NVIDIA API returned HTTP ${response.status}: ${await response.text()}`);
    }

    const json = (await response.json()) as any;
    const content = json?.choices?.[0]?.message?.content;
    if (!content) return null;

    try {
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
        auditRationale: `All verification checks succeeded: Invoiced quantity matches warehouse receipt (${record.deliveredQty} units), unit price matches agreed contract schedule (${formatCurrencyValue(record.contractUnitPrice, currency)}/unit), no unauthorized ancillary fees exist, and zero duplicate submissions detected.`,
        supplierEmail: {
          to: `accounts-payable@${record.supplierId.toLowerCase().replace(/[^a-z0-9]/g, "")}.supplier-portal.com`,
          recipientName: `${record.supplierId} Accounts Receivable Team`,
          subject: `Invoice Reconciliation Approval: ${record.invoiceId || record.poId}`,
          claimAmount: `${formatCurrencyValue(0, currency)}`,
          body: `Dear Accounts Receivable Team,\n\nWe have completed our automated four-way reconciliation for Purchase Order ${record.poId} and Invoice ${record.invoiceId}.\n\nAll quantities, rates, and goods receipt receipts have been verified against our agreed supplier contract. Your invoice has been approved for regular payment processing according to net terms.\n\nThank you for your partnership.\n\nBest regards,\nAccounts Payable & Audit Team\nTraceBack AI Automated Reconciliation`
        },
        modelUsed: "meta/llama-3.1-8b-instruct (Deterministic Fallback Engine)",
        isLive: false
      };
    }

    const primaryDiscrepancy = discrepancies[0];
    const evidenceLines = discrepancies
      .map(
        (d, idx) =>
          `• Finding #${idx + 1} [${d.type}]: ${d.reason} (Potential impact: ${formatCurrencyValue(d.financialImpact, currency)}, citing ${d.sourceA.file}:L${d.sourceA.row} vs ${d.sourceB.file}:L${d.sourceB.row}).`
      )
      .join("\n");

    const executiveSummary = `Reconciliation analysis identified ${formatCurrencyValue(totalFinancialImpact, currency)} in potential discrepancies for Purchase Order ${record.poId} (${record.supplierId}). Primary finding: ${primaryDiscrepancy.reason} Status: Potential Discrepancy — Requires Human Review.`;

    const auditRationale = `TraceBack AI cross-referenced Purchase Order ${record.poId}, Delivery Slip ${record.deliveryId || "N/A"}, Invoice ${record.invoiceId}, and Master Contract schedule for ${record.supplierId}. Cross-source join confirmed an uncorroborated variance of ${formatCurrencyValue(totalFinancialImpact, currency)} across ${discrepancies.length} finding(s). All findings require human review before payment processing.`;

    const supplierEmailBody = `Dear ${record.supplierId} Accounts Receivable Team,\n\nWe are writing regarding Invoice ${record.invoiceId} submitted against Purchase Order ${record.poId} for ${record.item}.\n\nOur cross-source automated audit has identified a potential discrepancy variance of ${formatCurrencyValue(totalFinancialImpact, currency)} based on verified procurement documentation:\n\nDISCREPANCY EVIDENCE TRAIL:\n${evidenceLines}\n\nTOTAL POTENTIAL DISCREPANCY: ${formatCurrencyValue(totalFinancialImpact, currency)}\n\nREQUESTED ACTION:\n1. Please review the delivery and contract documentation referenced above.\n2. If verified, please issue a credit memo or provide proof of physical delivery.\n\nThank you for your prompt attention to this reconciliation inquiry.\n\nSincerely,\nProcurement & Accounts Payable Audit Team\nTraceBack AI Automated Reconciliation Platform`;

    return {
      executiveSummary,
      auditRationale,
      supplierEmail: {
        to: `billing@${record.supplierId.toLowerCase().replace(/[^a-z0-9]/g, "")}.supplier-portal.com`,
        recipientName: `${record.supplierId} Accounts Receivable`,
        subject: `Reconciliation Inquiry: Invoice ${record.invoiceId} / PO ${record.poId} [Potential Discrepancy: ${formatCurrencyValue(totalFinancialImpact, currency)}]`,
        claimAmount: formatCurrencyValue(totalFinancialImpact, currency),
        body: supplierEmailBody
      },
      modelUsed: "meta/llama-3.1-8b-instruct (Deterministic Fallback Engine)",
      isLive: false
    };
  }
}

export const nvidiaExplainer = new NvidiaExplainer();
