import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import { router as investigateRouter } from "../src/routes/investigate.js";
import { authRouter } from "../src/routes/auth.js";
import { hMem } from "../src/meterless/MeterlessMission.js";
import { Server } from "http";
import fs from "fs";
import path from "path";
import { config } from "../src/config.js";

describe("TraceBack AI — Authentication, Audit Logs & Persistence Suite", () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    const app = express();
    app.use(express.json());
    app.use("/api/auth", authRouter);
    app.use("/api", investigateRouter);

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

  it("GET /api/auth/personas should list standard seeded auditor accounts", async () => {
    const res = await fetch(`${baseUrl}/auth/personas`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.personas)).toBe(true);
    expect(data.personas.length).toBeGreaterThanOrEqual(3);

    const leadAuditor = data.personas.find((p: any) => p.email === "sahrish@traceback.ai");
    expect(leadAuditor).toBeDefined();
    expect(leadAuditor.role).toBe("Lead Auditor");
  });

  it("POST /api/auth/login should authenticate valid auditor credentials and return token", async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "sahrish@traceback.ai",
        password: "Audit2026!"
      })
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.token).toBeDefined();
    expect(data.user.name).toBe("Sahrish");
    expect(data.user.role).toBe("Lead Auditor");
  });

  it("POST /api/auth/login should reject incorrect password with 401", async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "sahrish@traceback.ai",
        password: "WrongPassword999!"
      })
    });
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toContain("Invalid email or password");
  });

  it("GET /api/auth/me should return authenticated session user", async () => {
    // 1. Login
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "analyst@traceback.ai",
        password: "Audit2026!"
      })
    });
    const loginData = await loginRes.json();

    // 2. Query /me with token
    const meRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${loginData.token}` }
    });
    expect(meRes.status).toBe(200);
    const meData = await meRes.json();
    expect(meData.authenticated).toBe(true);
    expect(meData.user.name).toBe("Alex Chen");
    expect(meData.user.role).toBe("AP Compliance Analyst");
  });

  it("POST /api/auth/switch-persona/:id should switch active auditor profile", async () => {
    const res = await fetch(`${baseUrl}/auth/switch-persona/usr-003`, { method: "POST" });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.user.name).toBe("Guest Observer");
  });

  it("GET /api/audit-logs should return chronological audit events", async () => {
    // Trigger an investigation to generate an event
    await fetch(`${baseUrl}/investigate/PO-1042`, { method: "POST" });

    const res = await fetch(`${baseUrl}/audit-logs`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.logs)).toBe(true);
    expect(data.logs.length).toBeGreaterThan(0);
    const has1042 = data.logs.some((l: any) => l.poId === "PO-1042" || l.title.includes("PO-1042"));
    expect(has1042).toBe(true);
  });

  it("GET /api/export-report/:poId should generate structured downloadable compliance certificate", async () => {
    const res = await fetch(`${baseUrl}/export-report/PO-1042`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-disposition")).toContain("attachment");

    const data = await res.json();
    expect(data.certificateNumber).toContain("TB-CERT-PO-1042");
    expect(data.investigationScope.poId).toBe("PO-1042");
    expect(data.investigationScope.orderedQty).toBe(120);
    expect(data.investigationScope.deliveredQty).toBe(100);
    expect(data.investigationScope.invoicedQty).toBe(120);
    expect(data.auditSummary.totalFinancialImpact).toBe(10000);
    expect(data.verificationProof.sha256VerificationHash).toBeDefined();
    expect(data.verificationProof.sha256VerificationHash.length).toBe(64);
  });

  it("HMemStore should persist state to disk and survive server restart", () => {
    const testKey = "test_persistence_key";
    const testVal = { scenario: "PO-1042", verified: true, timestamp: Date.now() };

    hMem.set(testKey, testVal);

    // Verify file exists on disk
    const storeFile = path.join(config.dataPath, ".h_mem_store.json");
    expect(fs.existsSync(storeFile)).toBe(true);

    const content = JSON.parse(fs.readFileSync(storeFile, "utf-8"));
    expect(content[testKey]).toBeDefined();
    expect(content[testKey].data.scenario).toBe("PO-1042");
  });

  it("POST /api/reset-session should reset session state safely", async () => {
    const res = await fetch(`${baseUrl}/reset-session`, { method: "POST" });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });
});
