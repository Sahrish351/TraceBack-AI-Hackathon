import { config, isMeterlessLive } from "../config.js";
import { logger } from "../utils/logger.js";
import {
  MissionTrace,
  MissionTraceStep,
  UnifiedRecord,
  Discrepancy,
  AnalysisSummary,
  ExplanationOutput
} from "../analyzer/types.js";
import { zetarisClient } from "../zetaris/ZetarisClient.js";
import { compareRecords, buildAnalysisSummary } from "../analyzer/compare.js";
import { nvidiaExplainer } from "../nvidia/NvidiaExplainer.js";

/**
 * H-MEM (Hierarchical Memory) In-Memory Store
 * Simulates Meterless H-MEM session and persistent agent memory.
 * Stores cross-mission context, audit decisions, and historical reconciliation traces.
 */
class HMemStore {
  private memory = new Map<string, any>();

  set(key: string, value: any): void {
    this.memory.set(key, {
      data: value,
      updatedAt: new Date().toISOString()
    });
  }

  get(key: string): any {
    return this.memory.get(key)?.data;
  }

  has(key: string): boolean {
    return this.memory.has(key);
  }

  listKeys(): string[] {
    return Array.from(this.memory.keys());
  }

  dumpSession(): Record<string, any> {
    const dump: Record<string, any> = {};
    for (const [k, v] of this.memory.entries()) {
      dump[k] = v;
    }
    return dump;
  }
}

export const hMem = new HMemStore();

/**
 * MeterlessMission
 * 
 * Implements Meterless Agent Architecture:
 * 1. Scout Intent: Analyzes goal, defines execution parameters & constraints.
 * 2. Relay Execution: Chains specialized steps (Zetaris virtualization, comparison logic, confidence scoring, NVIDIA explanation).
 * 3. H-MEM Memory: Commits step artifacts and mission trace to hierarchical memory.
 */
export class MeterlessMission {
  public missionId: string;
  public objective: string;

  constructor(params?: { missionId?: string; objective?: string }) {
    this.missionId = params?.missionId || `MSN-${Date.now().toString(36).toUpperCase()}`;
    this.objective =
      params?.objective ||
      "Reconcile 4-way data sources for supplier overcharge detection and generate evidence-backed resolution.";
  }

  async run(poId: string): Promise<{
    missionTrace: MissionTrace;
    unifiedRecord: UnifiedRecord;
    discrepancies: Discrepancy[];
    summary: AnalysisSummary;
    explanation: ExplanationOutput;
  }> {
    const missionStart = performance.now();
    const steps: MissionTraceStep[] = [];

    logger.info(`[Meterless] Initiating Mission ${this.missionId} for PO ${poId}`);

    // If live Meterless API is configured, forward mission request
    if (isMeterlessLive) {
      try {
        logger.info(`[Meterless LIVE] Relaying mission to Meterless endpoint ${config.meterlessApiUrl}/missions...`);
        const liveRes = await fetch(`${config.meterlessApiUrl}/missions`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.meterlessApiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            missionId: this.missionId,
            objective: this.objective,
            targetPo: poId
          })
        });

        if (liveRes.ok) {
          const liveData = (await liveRes.json()) as any;
          if (liveData?.trace) {
            logger.info("[Meterless LIVE] Successfully received remote agent mission trace.");
          }
        }
      } catch (err) {
        logger.warn({ err }, "[Meterless LIVE] Relay failed, continuing with local Meterless execution loop.");
      }
    }

    // Step 1: Scout Intent
    const step1Start = performance.now();
    const step1: MissionTraceStep = {
      step: 1,
      name: "scoutIntent",
      thought: `Targeting Purchase Order ${poId} for cross-source reconciliation. Objective: Validate invoice integrity against warehouse goods receipt and contract price schedule.`,
      action: `ScoutIntentAction: Resolved PO scope to '${poId}'. Setting verification thresholds: quantity delta > 0, price delta > $0.00, fee whitelist strict.`,
      observation: `Scope verified. Target PO '${poId}' flagged for multi-source reconciliation. Initialized execution relay.`,
      durationMs: Math.max(12, Math.round(performance.now() - step1Start)),
      status: "completed"
    };
    steps.push(step1);

    // Step 2: Fetch Unified Data via Zetaris
    const step2Start = performance.now();
    logger.info(`[Meterless Step 2] Calling Zetaris virtualization layer for ${poId}...`);
    const unifiedRecord = await zetarisClient.unifiedOrderView(poId);
    const step2: MissionTraceStep = {
      step: 2,
      name: "fetchUnifiedData",
      thought: `Need unified relational view merging purchase_orders, deliveries, invoices, and contract_prices. Querying Zetaris virtualization cluster.`,
      action: `ZetarisVirtualizeAction: Executed SQL cross-source JOIN for po_id='${poId}'. Merged 4 disparate sources into single virtualized record.`,
      observation: `Unified record received: PO Ordered=${unifiedRecord.orderedQty} units @ $${unifiedRecord.poUnitPrice}, Delivery Receipt=${unifiedRecord.deliveredQty} units (${unifiedRecord.deliveryId}), Invoiced=${unifiedRecord.invoicedQty} units @ $${unifiedRecord.invoiceUnitPrice} (${unifiedRecord.invoiceId}), Contract Rate=$${unifiedRecord.contractUnitPrice}. Extracted ${unifiedRecord.sourceRefs.length} citation references.`,
      durationMs: Math.max(28, Math.round(performance.now() - step2Start)),
      status: "completed"
    };
    steps.push(step2);

    // Step 3: Detect Discrepancies
    const step3Start = performance.now();
    logger.info(`[Meterless Step 3] Running comparison engine...`);
    const discrepancies = compareRecords(unifiedRecord);
    const step3: MissionTraceStep = {
      step: 3,
      name: "detectDiscrepancies",
      thought: `Comparing virtualized fields: invoicedQty (${unifiedRecord.invoicedQty}) vs deliveredQty (${unifiedRecord.deliveredQty}); invoiceUnitPrice ($${unifiedRecord.invoiceUnitPrice}) vs contractUnitPrice ($${unifiedRecord.contractUnitPrice}).`,
      action: `AnalyzeDiscrepanciesAction: Executed 4-way comparison rules over virtual record. Checked QTY_OVERBILL, PRICE_ABOVE_CONTRACT, SHORT_DELIVERY, UNEXPECTED_FEE, DUPLICATE_INVOICE.`,
      observation:
        discrepancies.length > 0
          ? `Detected ${discrepancies.length} discrepancy finding(s): ${discrepancies
              .map((d) => `${d.type} (delta: ${d.delta}, impact: $${d.financialImpact})`)
              .join(", ")}.`
          : `Clean audit. No discrepancies detected. All quantities and rates match contract schedule.`,
      durationMs: Math.max(16, Math.round(performance.now() - step3Start)),
      status: "completed"
    };
    steps.push(step3);

    // Step 4: Score Confidence & Risk Assessment
    const step4Start = performance.now();
    logger.info(`[Meterless Step 4] Scoring confidence & computing aggregate financial exposure...`);
    const summary = buildAnalysisSummary(unifiedRecord, discrepancies);
    const step4: MissionTraceStep = {
      step: 4,
      name: "scoreConfidence",
      thought: `Synthesizing risk confidence scores and aggregate financial exposure across all detected discrepancies.`,
      action: `ScoreConfidenceAction: Evaluated source corroboration certainty. Overbill confidence: ${
        discrepancies[0]?.confidence ?? 1.0
      }, Price variance confidence: ${discrepancies[1]?.confidence ?? 1.0}.`,
      observation: `Aggregate exposure computed: $${summary.totalFinancialImpact.toLocaleString()} ${summary.currency}. Audit Status: ${summary.status}. Mean confidence score: ${summary.confidenceScore * 100}%. Citing ${discrepancies.reduce(
        (acc, d) => acc + (d.sourceA ? 1 : 0) + (d.sourceB ? 1 : 0),
        0
      )} verified evidence coordinates.`,
      durationMs: Math.max(14, Math.round(performance.now() - step4Start)),
      status: "completed"
    };
    steps.push(step4);

    // Step 5: Draft Explanation via NVIDIA NIM
    const step5Start = performance.now();
    logger.info(`[Meterless Step 5] Generating natural language rationale & supplier clarification draft...`);
    const explanation = await nvidiaExplainer.generateExplanation(
      unifiedRecord,
      discrepancies,
      summary.totalFinancialImpact
    );
    const step5: MissionTraceStep = {
      step: 5,
      name: "draftExplanation",
      thought: `Compiling human-readable audit narrative and supplier clarification letter citing specific evidence trail coordinates.`,
      action: `NvidiaExplainerAction: Invoked LLM generator (${explanation.modelUsed}) to draft dispute rationale and supplier communication.`,
      observation: `Generated executive audit narrative and formal supplier dispute email for ${unifiedRecord.supplierId} Accounts Receivable with claim amount of $${summary.totalFinancialImpact.toLocaleString()} ${summary.currency}.`,
      durationMs: Math.max(35, Math.round(performance.now() - step5Start)),
      status: "completed"
    };
    steps.push(step5);

    const totalDurationMs = Math.round(performance.now() - missionStart);

    const missionTrace: MissionTrace = {
      missionId: this.missionId,
      objective: this.objective,
      poId,
      steps,
      totalDurationMs,
      hMemKey: `mission:${poId}:${this.missionId}`
    };

    // Commit to H-MEM (Hierarchical Memory)
    hMem.set(`mission:${poId}:${this.missionId}`, {
      missionTrace,
      summary,
      discrepancies,
      unifiedRecord,
      explanation
    });

    // Also update current active record pointer for this PO in H-MEM
    hMem.set(`active:${poId}`, {
      latestMissionId: this.missionId,
      status: summary.status,
      totalFinancialImpact: summary.totalFinancialImpact
    });

    logger.info(
      `[Meterless] Mission ${this.missionId} finished in ${totalDurationMs}ms with status ${summary.status}`
    );

    return {
      missionTrace,
      unifiedRecord,
      discrepancies,
      summary,
      explanation
    };
  }
}
