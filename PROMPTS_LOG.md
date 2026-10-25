# TraceBack AI — Engineering & AI Prompts Log

This document records the chronological prompts, architectural directives, and design decisions used during the development of TraceBack AI for the 5-day hackathon (Oct 22–27, 2026).

---

## Prompt 1: Initial Architecture & Monorepo Design
**Prompt Goal**: Scaffold a production-grade full-stack monorepo integrating Zetaris, Meterless, NVIDIA NIM, and Cursor workflows.

```text
Act as a Senior Full-Stack Engineer + AI Agent Architect.
Design a runnable monorepo "TraceBack AI — Supplier Invoice Checker" that reconciles:
(a) Purchase Orders (PO)
(b) Supplier Invoices
(c) Delivery Notes (goods received)
(d) Contract Price Lists

Enforce 4 sponsor tools with deep, real integrations:
1. Zetaris: Data virtualization layer (Live API + in-memory SQLite cross-source SQL join fallback).
2. Meterless: Agent orchestration layer (Scout Intent -> Relay Execution -> H-MEM memory).
3. Cursor: Development acceleration, prompts log, and usage docs.
4. NVIDIA: NVIDIA NIM running meta/llama-3.1-8b-instruct for audit rationale and supplier clarification email.
```

**Key Architectural Decision**:
- Configured monorepo with root `workspaces: ["backend", "frontend"]` and `concurrently` for one-command developer boot (`npm run dev`).
- Established native zero-compilation SQLite virtualization in Node 26 (`node:sqlite` DatabaseSync) to guarantee cross-source query execution on any OS without C++ compiler setup.

---

## Prompt 2: Zetaris Cross-Source Federated Virtualization
**Prompt Goal**: Implement `ZetarisClient.ts` and `unifiedView.ts` to perform a single 4-way join across heterogeneous sources without ETL data copying.

```text
Implement ZetarisClient:
- Method healthCheck(): { mode: 'live' | 'mock', latencyMs: number }
- Method unifiedOrderView(poId): Promise<UnifiedRecord>
- In Live Mode: POST to ZETARIS_API_URL/query with SQL payload.
- In Mock Mode: In-memory SQLite virtual schema that creates purchase_orders, deliveries, invoices, contract_prices, loads CSV records, and runs the EXACT same federated SQL query.
- Return sourceRefs with {file, row, column, value} citing 1-based line numbers.
```

**Key Architectural Decision**:
- Standardized the SQL query across live and mock modes to guarantee identical schema output.
- Extracted exact 1-based CSV line numbers (header = line 1, first data row = line 2) to build verifiable evidence coordinates.

---

## Prompt 3: Meterless Agent Mission & H-MEM Memory Loop
**Prompt Goal**: Implement `MeterlessMission.ts` following Meterless architecture.

```text
Implement MeterlessMission class:
- Constructor: { missionId, objective }
- Method run(poId): Promise<MissionTrace>
- Execute 5 explicit steps:
  1. scoutIntent: Determine PO to investigate, resolve scope and thresholds.
  2. fetchUnifiedData: Query Zetaris virtualization layer.
  3. detectDiscrepancies: Run 4-way comparison rules.
  4. scoreConfidence: Attach confidence scores & synthesize aggregate risk.
  5. draftExplanation: Call NVIDIA NIM explainer.
- Record durationMs, thought, action, observation per step.
- Persist mission trace and audit decisions in HMemStore (in-memory hierarchical memory).
```

**Key Architectural Decision**:
- Every step returns transparent internal reasoning (`thought`, `action`, `observation`) visible to human auditors.
- Decoupled agent orchestration from presentation, allowing the frontend to visualize the live mission trace.

---

## Prompt 4: Deterministic Reconciliation Engine & Vitest Suite
**Prompt Goal**: Ensure the reconciliation logic mathematically proves the exact $1,200 financial impact on PO-1001 while returning 0 discrepancies for clean PO-1002.

```text
Implement pure function compareRecords(record: UnifiedRecord): Discrepancy[]
Evaluate:
1. QTY_OVERBILL: Invoiced 120 vs Delivered 100 -> 20 units * $50 = $1,000. Confidence: 0.98.
2. PRICE_ABOVE_CONTRACT: Invoiced $50 vs Contract $48 -> $2/unit * 100 delivered units = $200. Confidence: 0.95.
Total Impact = $1,200.
3. PO-1002: 50 ordered, 50 delivered, 50 invoiced at $20 contract price -> 0 discrepancies.
4. Edge cases: unexpected fees and duplicate invoice IDs.
```

**Key Architectural Decision**:
- Price escalation applies to *verified delivered units* (100 units $\times$ \$2 = \$200), preventing double-counting against the 20 unreceived units already covered by quantity overbilling (\$1,000), producing the exact \$1,200 financial recovery total.
- Wrote 6 Vitest test cases that pass in <70ms.

---

## Prompt 5: NVIDIA NIM Prompt Engineering & Resilient Fallback
**Prompt Goal**: Design the system prompt and payload for NVIDIA NIM `meta/llama-3.1-8b-instruct`.

```text
Prompt for NVIDIA NIM:
You are TraceBack AI, an enterprise procurement auditor.
Analyze this supplier reconciliation finding and provide:
1. Executive Summary (2-3 sentences emphasizing financial recovery).
2. Audit Rationale (step-by-step evidence justification).
3. Supplier Clarification Email (polite, highly specific, referencing documents and exact amounts).

Ensure structured JSON response. If API key is absent or network fails, gracefully transition to deterministic fallback engine with identical shape.
```

**Key Architectural Decision**:
- Built an offline-resilient deterministic fallback that outputs professional audit letters and justifications, ensuring hackathon demonstrations never fail due to API quotas or network drops.

---

## Prompt 6: Interactive Frontend & Evidence Citations
**Prompt Goal**: Build an intuitive, high-impact UI for judges and procurement auditors in React, Vite, and Tailwind CSS.

```text
Build a modern dark-mode dashboard:
1. Sidebar: Data source panel with Zetaris status, 4 virtualized files, PO switcher.
2. SummaryCards: Overcharge total ($1,200), discrepancy count, confidence score, human review status.
3. EvidenceTrail: Discrepancy cards with interactive source chips [invoices.csv:L2] that open SourceModal.
4. SourceModal: Raw CSV data viewer with highlighted row and column.
5. AgentTrace: Step-by-step Meterless agent mission log with durations and Zetaris SQL view.
6. ApprovalBar: Human-in-the-loop approve/reject bar.
7. EmailPreview: NVIDIA-generated dispute letter with 1-click clipboard copy and dispatch simulation.
8. Footer: Mandatory sponsor tech badges (NVIDIA, Zetaris, Meterless, Cursor).
```

**Key Architectural Decision**:
- Clicking any source chip automatically pops open the raw data viewer modal with the exact line and column highlighted, giving judges tangible proof of the evidence trail.
