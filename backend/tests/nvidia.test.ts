import { describe, it, expect } from "vitest";
import { NvidiaExplainer } from "../src/nvidia/NvidiaExplainer.js";
import { mockScenarios } from "../src/mockData.js";
import { compareRecords } from "../src/analyzer/compare.js";

describe("TraceBack AI — NVIDIA NIM Inference Adapter Suite (Phase 5 Step 4)", () => {
  const explainer = new NvidiaExplainer();

  it("should report Not Configured status honestly when NVIDIA_API_KEY is absent", async () => {
    const health = await explainer.getHealthStatus();

    expect(health.mode).toBe("mock");
    expect(health.configured).toBe(false);
    expect(health.status).toContain("Not configured");
    expect(health.model).toBeDefined();
    expect(health.endpoint).toContain("https://integrate.api.nvidia.com");
  });

  it("should generate deterministic fallback explanation for canonical PO-1042 citing Rs 10,000", async () => {
    const record = mockScenarios["PO-1042"];
    const discrepancies = compareRecords(record);
    const explanation = await explainer.generateExplanation(record, discrepancies, 10000);

    expect(explanation).toBeDefined();
    expect(explanation.isLive).toBe(false);
    expect(explanation.modelUsed).toContain("Deterministic Fallback Engine");
    expect(explanation.executiveSummary).toContain("Rs 10,000");
    expect(explanation.auditRationale).toContain("Northstar Office Supplies");
    expect(explanation.supplierEmail.claimAmount).toBe("Rs 10,000");
    expect(explanation.supplierEmail.body).toContain("Rs 10,000");
    expect(explanation.supplierEmail.body).toContain("invoices.csv:L7 vs deliveries.csv:L6");
  });

  it("should generate clean approval email for concordant zero-discrepancy scenario", async () => {
    const cleanRecord = mockScenarios["PO-1002"];
    const explanation = await explainer.generateExplanation(cleanRecord, [], 0);

    expect(explanation).toBeDefined();
    expect(explanation.isLive).toBe(false);
    expect(explanation.executiveSummary).toContain("100% concordance");
    expect(explanation.supplierEmail.subject).toContain("Invoice Reconciliation Approval");
  });

  it("should handle live API error or timeout gracefully by falling back without crashing", async () => {
    const timeoutFetch = (async () => {
      throw new Error("HTTP 504 Gateway Timeout: api.nvidia.com");
    }) as unknown as typeof fetch;

    const record = mockScenarios["PO-1001"];
    const discrepancies = compareRecords(record);
    const explanation = await explainer.generateExplanation(record, discrepancies, 1200, timeoutFetch);

    expect(explanation).toBeDefined();
    expect(explanation.isLive).toBe(false);
    expect(explanation.executiveSummary).toContain("$1,200");
  });
});
