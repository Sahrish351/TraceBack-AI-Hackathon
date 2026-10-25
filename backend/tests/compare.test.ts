import { describe, it, expect } from "vitest";
import { compareRecords, buildAnalysisSummary, roundMoney, formatCurrencyValue } from "../src/analyzer/compare.js";
import { UnifiedRecord } from "../src/analyzer/types.js";
import { mockScenarios } from "../src/mockData.js";

describe("TraceBack AI - Core Reconciliation & Financial Audit Engine (Baseline)", () => {
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

describe("TraceBack AI - Phase 2 Canonical Scenario & Comprehensive Regression Suite", () => {
  it("should accurately reconcile the canonical demo scenario PO-1042 (Northstar Office Supplies)", () => {
    const record = mockScenarios["PO-1042"];
    expect(record).toBeDefined();
    expect(record.supplierId).toBe("Northstar Office Supplies");
    expect(record.poId).toBe("PO-1042");
    expect(record.deliveryId).toBe("DN-1042");
    expect(record.invoiceId).toBe("INV-7781");
    expect(record.orderedQty).toBe(120);
    expect(record.deliveredQty).toBe(100);
    expect(record.invoicedQty).toBe(120);
    expect(record.invoiceUnitPrice).toBe(500);
    expect(record.contractUnitPrice).toBe(500);
    expect(record.currency).toBe("Rs");

    const discrepancies = compareRecords(record);
    expect(discrepancies.length).toBe(1);

    const overbill = discrepancies.find((d) => d.type === "QTY_OVERBILL");
    expect(overbill).toBeDefined();
    expect(overbill?.delta).toBe(20);
    // Deterministic formula: (120 invoiced - 100 received) * Rs 500 = Rs 10,000
    expect(overbill?.financialImpact).toBe(10000);
    expect(overbill?.currency).toBe("Rs");
    expect(overbill?.reason).toContain("20 unreceived units billed");
    expect(overbill?.sourceA.file).toBe("invoices.csv");
    expect(overbill?.sourceA.value).toBe(120);
    expect(overbill?.sourceB.file).toBe("deliveries.csv");
    expect(overbill?.sourceB.value).toBe(100);

    const summary = buildAnalysisSummary(record, discrepancies);
    expect(summary.totalFinancialImpact).toBe(10000);
    expect(summary.currency).toBe("Rs");
    expect(summary.status).toBe("FLAGGED_FOR_REVIEW");
  });

  it("should handle a fully matched order, delivery, and invoice with zero discrepancy", () => {
    const perfectRecord: UnifiedRecord = {
      poId: "PO-CONCORDANT",
      supplierId: "Northstar Office Supplies",
      item: "Ergonomic Office Chairs",
      currency: "Rs",
      orderedQty: 100,
      deliveredQty: 100,
      invoicedQty: 100,
      poUnitPrice: 500,
      invoiceUnitPrice: 500,
      contractUnitPrice: 500,
      fees: 0,
      orderDate: "2026-10-24",
      deliveryDate: "2026-10-24",
      invoiceDate: "2026-10-24",
      warehouse: "WH-01",
      invoiceId: "INV-OK",
      deliveryId: "DN-OK",
      sqlQueryExecuted: "SELECT 1;",
      sourceRefs: []
    };

    const discrepancies = compareRecords(perfectRecord);
    expect(discrepancies.length).toBe(0);

    const summary = buildAnalysisSummary(perfectRecord, discrepancies);
    expect(summary.totalFinancialImpact).toBe(0);
    expect(summary.status).toBe("CLEAN");
    expect(summary.confidenceScore).toBe(1.0);
  });

  it("should report missing delivery evidence as insufficient evidence without assuming zero delivered", () => {
    const missingDeliveryRecord: UnifiedRecord = {
      ...mockScenarios["PO-1042"],
      deliveryId: "",
      deliveredQty: 0
    };

    const discrepancies = compareRecords(missingDeliveryRecord);
    const missingDel = discrepancies.find((d) => d.type === "MISSING_EVIDENCE" && d.field === "deliveries.delivery_id");
    expect(missingDel).toBeDefined();
    // PRD constraint: Missing evidence returns uncertainty state, not assumed 100% loss
    expect(missingDel?.financialImpact).toBe(0);
    expect(missingDel?.reason).toContain("Missing delivery record");
  });

  it("should report missing contract price schedule as incomplete without inventing a price", () => {
    const missingContractRecord: UnifiedRecord = {
      ...mockScenarios["PO-1042"],
      contractUnitPrice: 0
    };

    const discrepancies = compareRecords(missingContractRecord);
    const missingContract = discrepancies.find(
      (d) => d.type === "MISSING_EVIDENCE" && d.field === "contract_prices.contract_unit_price"
    );
    expect(missingContract).toBeDefined();
    expect(missingContract?.financialImpact).toBe(0);
    expect(missingContract?.reason).toContain("Contract price not found");
  });

  it("should detect conflicting/negative quantities as data integrity discrepancies", () => {
    const invalidQtyRecord: UnifiedRecord = {
      ...mockScenarios["PO-1042"],
      invoicedQty: -50
    };

    const discrepancies = compareRecords(invalidQtyRecord);
    expect(discrepancies.length).toBe(1);
    expect(discrepancies[0].type).toBe("MISSING_EVIDENCE");
    expect(discrepancies[0].reason).toContain("Invalid negative quantity");
  });

  it("should avoid double-counting when both quantity overbilling and price escalation occur", () => {
    // 120 invoiced @ $55/unit, 100 delivered, contract rate $50/unit
    // 20 unreceived units * $55 = $1,100 overbill
    // 100 delivered units * ($55 - $50 = $5 delta) = $500 price escalation
    // Total exposure = $1,100 + $500 = $1,600 (not double-counting the 20 unreceived units at both rates)
    const combinedRecord: UnifiedRecord = {
      poId: "PO-COMBINED",
      supplierId: "SUP-TEST",
      item: "Hardware-Kit",
      currency: "USD",
      orderedQty: 120,
      deliveredQty: 100,
      invoicedQty: 120,
      poUnitPrice: 55,
      invoiceUnitPrice: 55,
      contractUnitPrice: 50,
      fees: 0,
      orderDate: "2026-10-24",
      deliveryDate: "2026-10-24",
      invoiceDate: "2026-10-24",
      warehouse: "WH-01",
      invoiceId: "INV-COMBINED",
      deliveryId: "DN-COMBINED",
      sqlQueryExecuted: "SELECT 1;",
      sourceRefs: []
    };

    const discrepancies = compareRecords(combinedRecord);
    expect(discrepancies.length).toBe(2);

    const qtyDisc = discrepancies.find((d) => d.type === "QTY_OVERBILL");
    const priceDisc = discrepancies.find((d) => d.type === "PRICE_ABOVE_CONTRACT");

    expect(qtyDisc?.financialImpact).toBe(1100);
    expect(priceDisc?.financialImpact).toBe(500);

    const summary = buildAnalysisSummary(combinedRecord, discrepancies);
    expect(summary.totalFinancialImpact).toBe(1600);
  });

  it("should maintain decimal arithmetic precision without floating point drift", () => {
    expect(roundMoney(0.1 + 0.2)).toBe(0.3);
    expect(roundMoney(19.99 * 3)).toBe(59.97);
    expect(formatCurrencyValue(10000, "Rs")).toBe("Rs 10,000");
    expect(formatCurrencyValue(1200, "USD")).toBe("$1,200");
  });

  it("should detect duplicate invoices correctly", () => {
    const dupRecord: UnifiedRecord = {
      ...mockScenarios["PO-1004"],
      allInvoicesForPo: [
        { invoiceId: "INV-ORIG", invoicedQty: 50, unitPrice: 100, fees: 0 },
        { invoiceId: "INV-DUP", invoicedQty: 50, unitPrice: 100, fees: 0 }
      ]
    };

    const discrepancies = compareRecords(dupRecord);
    const dupDisc = discrepancies.find((d) => d.type === "DUPLICATE_INVOICE");
    expect(dupDisc).toBeDefined();
    expect(dupDisc?.financialImpact).toBe(5000);
    expect(dupDisc?.reason).toContain("Duplicate invoice submission detected");
  });

  it("should run full end-to-end mission on PO-1042 through Zetaris client and Meterless runner", async () => {
    const { zetarisClient } = await import("../src/zetaris/ZetarisClient.js");
    const { MeterlessMission } = await import("../src/meterless/MeterlessMission.js");

    const record = await zetarisClient.unifiedOrderView("PO-1042");
    expect(record.poId).toBe("PO-1042");
    expect(record.supplierId).toBe("Northstar Office Supplies");
    expect(record.orderedQty).toBe(120);
    expect(record.deliveredQty).toBe(100);
    expect(record.invoicedQty).toBe(120);
    expect(record.currency).toBe("Rs");

    const mission = new MeterlessMission();
    const result = await mission.run("PO-1042");

    expect(result.summary.totalFinancialImpact).toBe(10000);
    expect(result.summary.currency).toBe("Rs");
    expect(result.summary.status).toBe("FLAGGED_FOR_REVIEW");
    expect(result.discrepancies.length).toBe(1);
    expect(result.discrepancies[0].type).toBe("QTY_OVERBILL");
    expect(result.discrepancies[0].delta).toBe(20);
    expect(result.discrepancies[0].financialImpact).toBe(10000);
    expect(result.explanation.executiveSummary).toContain("Rs 10,000");
  });
});
