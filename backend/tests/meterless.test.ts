import { describe, it, expect } from "vitest";
import { MeterlessMission, hMem } from "../src/meterless/MeterlessMission.js";

describe("TraceBack AI — Meterless Agent Mission Runner Suite (Phase 5 Step 3)", () => {
  it("should execute complete 5-step local agent mission on canonical PO-1042", async () => {
    const mission = new MeterlessMission({
      objective: "Audit canonical PO-1042 for Northstar Office Supplies"
    });

    const result = await mission.run("PO-1042");

    expect(result).toBeDefined();
    expect(result.mode).toBe("local_demo");
    expect(result.missionTrace.steps.length).toBe(5);

    const stepNames = result.missionTrace.steps.map((s) => s.name);
    expect(stepNames).toEqual([
      "scoutIntent",
      "fetchUnifiedData",
      "detectDiscrepancies",
      "scoreConfidence",
      "draftExplanation"
    ]);

    for (const step of result.missionTrace.steps) {
      expect(step.status).toBe("completed");
      expect(step.durationMs).toBeGreaterThanOrEqual(0);
    }

    // Verify reconciliation result
    expect(result.summary.totalFinancialImpact).toBe(10000);
    expect(result.summary.currency).toBe("Rs");
    expect(result.summary.status).toBe("FLAGGED_FOR_REVIEW");

    // Verify H-MEM persistent storage
    const hMemKey = `mission:PO-1042:${mission.missionId}`;
    expect(hMem.has(hMemKey)).toBe(true);
    const stored = hMem.get(hMemKey);
    expect(stored.summary.totalFinancialImpact).toBe(10000);
  });

  it("should execute mission on multi-item scenario PO-2005", async () => {
    const mission = new MeterlessMission();
    const result = await mission.run("PO-2005");

    expect(result).toBeDefined();
    expect(result.unifiedRecord.lineItems?.length).toBe(5);
    expect(result.summary.totalFinancialImpact).toBe(3150);
    expect(result.summary.currency).toBe("USD");
    expect(result.discrepancies.length).toBe(2);
  });

  it("should report Not Configured status honestly when live credentials are absent", async () => {
    const health = await MeterlessMission.getHealthStatus();

    expect(health.mode).toBe("mock");
    expect(health.configured).toBe(false);
    expect(health.status).toContain("Not configured");
    expect(health.architecture).toContain("Scout Intent -> Relay Execution -> H-MEM Session Memory");
  });

  it("should gracefully fall back to local workflow if live remote relay fails", async () => {
    const failingFetch = (async () => {
      throw new Error("Connection refused: api.meterless.ai");
    }) as unknown as typeof fetch;

    const mission = new MeterlessMission();
    const result = await mission.run("PO-1002", failingFetch);

    expect(result).toBeDefined();
    expect(result.mode).toBe("local_demo");
    expect(result.summary.status).toBe("CLEAN");
    expect(result.summary.totalFinancialImpact).toBe(0);
  });
});
