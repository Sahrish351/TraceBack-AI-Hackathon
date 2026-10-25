import { describe, it, expect } from "vitest";
import { compareRecords, buildAnalysisSummary } from "../src/analyzer/compare.js";
import { UnifiedRecord } from "../src/analyzer/types.js";
import { mockScenarios } from "../src/mockData.js";

describe("TraceBack AI - Core Reconciliation & Financial Audit Engine", () => {
  it("should accurately detect quantity overbilling on PO-1001 ($1,000)", () => {
    const record = mockScenarios["PO-1001"];
    const discrepancies = compareRecords(record);

    const qtyDiscrepancy = discrepancies.find((d) => d.type === "QTY_OVERBILL");
    expect(qtyDiscrepancy).toBeDefined();
    expect(qtyDiscrepancy?.delta).toBe(20);
    expect(qtyDiscrepancy?.financialImpact).toBe(1000);
    expect(qtyDiscrepancy?.confidence).toBe(0.98);
    expect(qtyDiscrepancy?.sourceA.file).toBe("invoices.csv");
    expect(qtyDiscrepancy?.sourceA.column).toBe("invoiced_qty");
    expect(qtyDiscrepancy?.sourceA.value).toBe(120);
    expect(qtyDiscrepancy?.sourceB.file).toBe("deliveries.csv");
    expect(qtyDiscrepancy?.sourceB.column).toBe("delivered_qty");
    expect(qtyDiscrepancy?.sourceB.value).toBe(100);
  });

  it("should accurately detect contract price violation on PO-1001 ($200)", () => {
    const record = mockScenarios["PO-1001"];
    const discrepancies = compareRecords(record);

    const priceDiscrepancy = discrepancies.find((d) => d.type === "PRICE_ABOVE_CONTRACT");
    expect(priceDiscrepancy).toBeDefined();
    expect(priceDiscrepancy?.delta).toBe(2);
    expect(priceDiscrepancy?.financialImpact).toBe(200);
    expect(priceDiscrepancy?.confidence).toBe(0.95);
    expect(priceDiscrepancy?.sourceA.file).toBe("invoices.csv");
    expect(priceDiscrepancy?.sourceA.column).toBe("unit_price");
    expect(priceDiscrepancy?.sourceA.value).toBe(50);
    expect(priceDiscrepancy?.sourceB.file).toBe("contract_prices.csv");
    expect(priceDiscrepancy?.sourceB.column).toBe("contract_unit_price");
    expect(priceDiscrepancy?.sourceB.value).toBe(48);
  });

  it("should compute exact cumulative financial recovery amount of $1,200 for PO-1001", () => {
    const record = mockScenarios["PO-1001"];
    const discrepancies = compareRecords(record);
    const summary = buildAnalysisSummary(record, discrepancies);

    expect(summary.totalFinancialImpact).toBe(1200);
    expect(summary.discrepancyCount).toBe(2);
    expect(summary.status).toBe("FLAGGED_FOR_REVIEW");
    expect(summary.currency).toBe("USD");
  });

  it("should produce a clean audit with 0 discrepancies for concordant PO-1002", () => {
    const record = mockScenarios["PO-1002"];
    const discrepancies = compareRecords(record);
    const summary = buildAnalysisSummary(record, discrepancies);

    expect(discrepancies.length).toBe(0);
    expect(summary.totalFinancialImpact).toBe(0);
    expect(summary.status).toBe("CLEAN");
    expect(summary.confidenceScore).toBe(1.0);
  });

  it("should detect unexpected non-contracted fees when present", () => {
    const recordWithFee: UnifiedRecord = {
      ...mockScenarios["PO-1002"],
      fees: 150
    };

    const discrepancies = compareRecords(recordWithFee);
    const feeDiscrepancy = discrepancies.find((d) => d.type === "UNEXPECTED_FEE");

    expect(feeDiscrepancy).toBeDefined();
    expect(feeDiscrepancy?.financialImpact).toBe(150);
    expect(feeDiscrepancy?.confidence).toBe(0.92);
  });

  it("should accurately audit PO-1003 for unexpected non-contracted ancillary fees ($350)", () => {
    const record = mockScenarios["PO-1003"];
    const discrepancies = compareRecords(record);
    const summary = buildAnalysisSummary(record, discrepancies);

    expect(summary.totalFinancialImpact).toBe(350);
    const feeDisc = discrepancies.find((d) => d.type === "UNEXPECTED_FEE");
    expect(feeDisc).toBeDefined();
    expect(feeDisc?.financialImpact).toBe(350);
  });

  it("should accurately audit PO-1004 for duplicate invoice billing risk ($1,000)", () => {
    const record = mockScenarios["PO-1004"];
    const discrepancies = compareRecords(record);
    const summary = buildAnalysisSummary(record, discrepancies);

    expect(summary.totalFinancialImpact).toBe(1000);
    const dupDisc = discrepancies.find((d) => d.type === "DUPLICATE_INVOICE");
    expect(dupDisc).toBeDefined();
    expect(dupDisc?.financialImpact).toBe(1000);
  });
});
