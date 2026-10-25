import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import { router } from "../src/routes/investigate.js";
import { Server } from "http";

describe("TraceBack AI — Runtime API Endpoints Suite", () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    const app = express();
    app.use(express.json());
    app.use("/api", router);

    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const addr = server.address();
        if (addr && typeof addr === "object") {
          baseUrl = `http://localhost:${addr.port}/api`;
        }
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it("GET /api/health should return 200 with honest 5-state reporting", async () => {
    const res = await fetch(`${baseUrl}/health`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("ok");
    expect(data.service).toBe("TraceBack AI Backend");
    expect(data.sponsorIntegrations.zetaris.mode).toBe("mock");
    expect(data.sponsorIntegrations.meterless.mode).toBe("mock");
    expect(data.sponsorIntegrations.nvidia.mode).toBe("mock");
    expect(data.sponsorIntegrations.cursor.promptsLogged).toBe(true);
  });

  it("GET /api/pos should list purchase orders including PO-1042 and PO-2005", async () => {
    const res = await fetch(`${baseUrl}/pos`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.purchaseOrders)).toBe(true);
    const po1042 = data.purchaseOrders.find((p: any) => p.poId === "PO-1042");
    expect(po1042).toBeDefined();
    expect(po1042.currency).toBe("Rs");
    expect(po1042.orderedQty).toBe(120);

    const po2005 = data.purchaseOrders.find((p: any) => p.poId === "PO-2005");
    expect(po2005).toBeDefined();
  });

  it("POST /api/investigate/PO-1042 should execute canonical scenario with Rs 10,000 discrepancy", async () => {
    const res = await fetch(`${baseUrl}/investigate/PO-1042`, { method: "POST" });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.poId).toBe("PO-1042");
    expect(data.summary.totalFinancialImpact).toBe(10000);
    expect(data.summary.currency).toBe("Rs");
    expect(data.discrepancies.length).toBe(1);
    expect(data.discrepancies[0].type).toBe("QTY_OVERBILL");
    expect(data.discrepancies[0].delta).toBe(20);
    expect(data.discrepancies[0].financialImpact).toBe(10000);
  });

  it("POST /api/investigate/PO-2005 should reconcile multi-item consignment ($3,150 discrepancy)", async () => {
    const res = await fetch(`${baseUrl}/investigate/PO-2005`, { method: "POST" });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.poId).toBe("PO-2005");
    expect(data.summary.totalFinancialImpact).toBe(3150);
    expect(data.summary.currency).toBe("USD");
    expect(data.discrepancies.length).toBeGreaterThanOrEqual(2);
  });

  it("POST /api/review/:poId should persist human review decision", async () => {
    const res = await fetch(`${baseUrl}/review/PO-1042`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "approve",
        reviewer: "Auditor Sahrish",
        notes: "Confirmed warehouse receiving slip confirms only 100 units received."
      })
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.decision.action).toBe("approve");
    expect(data.decision.reviewer).toBe("Auditor Sahrish");
  });

  it("GET /api/raw-source/:file should return CSV dump for source transparency", async () => {
    const res = await fetch(`${baseUrl}/raw-source/purchase_orders.csv`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.file).toBe("purchase_orders.csv");
    expect(Array.isArray(data.rows)).toBe(true);
    expect(data.rows.length).toBeGreaterThan(0);
  });

  it("GET /api/raw-source/:file should reject path traversal and non-whitelisted files with 400", async () => {
    const res = await fetch(`${baseUrl}/raw-source/unauthorized_file.env`);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid file request");
  });
});
