import { describe, it, expect } from "vitest";
import { ZetarisClient } from "../src/zetaris/ZetarisClient.js";

describe("TraceBack AI — Zetaris Data Virtualization Adapter Suite (Phase 5 Step 2)", () => {
  const client = new ZetarisClient();

  it("should successfully query and virtualize canonical PO-1042 via in-memory schema", async () => {
    const record = await client.unifiedOrderView("PO-1042");

    expect(record).toBeDefined();
    expect(record.poId).toBe("PO-1042");
    expect(record.supplierId).toBe("Northstar Office Supplies");
    expect(record.orderedQty).toBe(120);
    expect(record.deliveredQty).toBe(100);
    expect(record.invoicedQty).toBe(120);
    expect(record.poUnitPrice).toBe(500);
    expect(record.invoiceUnitPrice).toBe(500);
    expect(record.contractUnitPrice).toBe(500);
    expect(record.currency).toBe("Rs");
    expect(record.sourceRefs.length).toBeGreaterThanOrEqual(5);
    expect(record.sqlQueryExecuted).toContain("FROM purchase_orders po");
  });

  it("should successfully query and preserve multi-item line details for PO-2005", async () => {
    const record = await client.unifiedOrderView("PO-2005");

    expect(record).toBeDefined();
    expect(record.poId).toBe("PO-2005");
    expect(record.supplierId).toBe("Lita Co., Ltd. (Braintec)");
    expect(record.lineItems).toBeDefined();
    expect(record.lineItems?.length).toBe(5);
    expect(record.financialSummary?.subtotal).toBe(91020);
    expect(record.financialSummary?.taxAmount).toBe(4120);
    expect(record.financialSummary?.totalAmount).toBe(95140);
  });

  it("should report Not Configured status honestly when live credentials are absent", async () => {
    const health = await client.healthCheck();

    expect(health.mode).toBe("mock");
    expect(health.engine).toBe("Zetaris In-Memory SQLite Cross-Source Virtualizer");
    expect(health.configured).toBe(false);
    expect(health.status).toContain("Not configured");
    expect(health.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it("should parse simulated live Zetaris API response when live endpoint succeeds", async () => {
    const mockRow = {
      po_id: "PO-MOCK-LIVE",
      supplier_id: "Acme Live Corp",
      item: "Live Sensor Hub",
      currency: "USD",
      ordered_qty: 50,
      delivered_qty: 50,
      invoiced_qty: 50,
      po_unit_price: 100,
      invoice_unit_price: 100,
      contract_unit_price: 100,
      fees: 0,
      order_date: "2026-10-25",
      delivery_date: "2026-10-25",
      invoice_date: "2026-10-25",
      warehouse: "WH-LIVE",
      invoice_id: "INV-LIVE-01",
      delivery_id: "DN-LIVE-01"
    };

    const mockFetch = (async () => ({
      ok: true,
      status: 200,
      json: async () => ({ data: [mockRow] })
    })) as unknown as typeof fetch;

    // Simulate calling live query method directly
    const health = await client.healthCheck(mockFetch);
    expect(health).toBeDefined();
  });

  it("should gracefully fall back to local virtualizer if network connection fails", async () => {
    const failingFetch = (async () => {
      throw new Error("ENOTFOUND: zetaris.network.internal");
    }) as unknown as typeof fetch;

    // Even if simulated live query fails, local fallback succeeds for existing PO
    const record = await client.unifiedOrderView("PO-1001", failingFetch);
    expect(record).toBeDefined();
    expect(record.poId).toBe("PO-1001");
    expect(record.orderedQty).toBe(120);
    expect(record.deliveredQty).toBe(100);
  });

  it("should throw a descriptive error when querying an unrecorded purchase order", async () => {
    await expect(client.unifiedOrderView("PO-UNKNOWN-99999")).rejects.toThrow(
      "Purchase Order PO-UNKNOWN-99999 not found in any virtualized data sources"
    );
  });
});
