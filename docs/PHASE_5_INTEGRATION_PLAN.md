# TraceBack AI — Phase 5 Sponsor Integration Plan & Pre-Integration Audit

**Date:** 25 October 2026  
**Status:** Pre-Integration Audit Completed (Milestone 1)  
**Target Branch:** `feature/redesign-and-integration`  
**Base Commit:** `aa1595b`  

---

## 1. Executive Summary

TraceBack AI is designed around an evidence-first, human-in-the-loop paradigm for supplier invoice reconciliation. Under Phases 1–4, the application's core reconciliation engine was built with 100% deterministic rules, decimal rounding protection, non-double-counting guarantees, multi-line item invoice support, and a complete enterprise SaaS UI.

Phase 5 audits and transitions the four hackathon sponsor integrations—**Zetaris**, **Meterless**, **NVIDIA NIM**, and **Cursor**—from initial scaffolds into verified adapters with honest status reporting, safe fallback behavior, and zero credential leakage.

---

## 2. Sponsor Integration Audit Matrix

| Sponsor Technology | Target Role | Implementation File | Configured Endpoint | Required Credentials | Current Live Status | Active Operational State |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Zetaris** | Cross-source data virtualization across 4 disparate datasets (PO, Delivery, Invoice, Contract) | `backend/src/zetaris/ZetarisClient.ts`<br>`backend/src/zetaris/unifiedView.ts` | `https://api.zetaris.io/v1` (or tenant URL) | `ZETARIS_API_URL`<br>`ZETARIS_API_KEY` | **Not Configured / Blocked by Credentials** | **Local / Demo Mode**<br>(In-memory Node 22 SQLite virtualizer executing federated SQL JOINs across CSVs) |
| **Meterless** | 5-step agent mission orchestration & hierarchical session memory (H-MEM) | `backend/src/meterless/MeterlessMission.ts` | `https://api.meterless.ai/v1` | `METERLESS_API_URL`<br>`METERLESS_API_KEY` | **Not Configured / Blocked by Credentials** | **Local / Demo Mode**<br>(Sequential agent runner: Scout Intent → Fetch Unified Data → Detect Discrepancies → Score Confidence → Draft Explanation) |
| **NVIDIA NIM** | Plain-language audit rationale & supplier dispute drafts | `backend/src/nvidia/NvidiaExplainer.ts` | `https://integrate.api.nvidia.com/v1/chat/completions` | `NVIDIA_API_KEY` | **Not Configured / Blocked by Credentials** | **Local / Demo Mode**<br>(Deterministic explanation engine citing exact CSV row/column coordinates; LLM prevented from calculating numbers) |
| **Cursor** | AI pair-programming velocity & audit trail | `docs/CURSOR_USAGE.md`<br>`PROMPTS_LOG.md` | Local IDE Environment | N/A (IDE tool) | **Verified (Tool Usage)** | **Audit Logged**<br>(Step-by-step prompt logs, refactoring records, and Git commits) |

---

## 3. Detailed Component Audit

### 3.1 Zetaris Data Virtualization
- **Existing Architecture:**
  - `ZetarisClient.ts` contains an in-memory SQLite virtualization schema using Node 22 native `node:sqlite` (`DatabaseSync`).
  - Executes a single 4-way federated SQL query (`UNIFIED_VIEW_SQL`) that joins Purchase Orders, Delivery Notes, Invoices, and Master Contract catalogs.
  - When live credentials (`ZETARIS_API_KEY` and `ZETARIS_API_URL`) are supplied, the client sends an authenticated query request to the Zetaris SaaS REST API.
- **Current Finding:**
  - No `.env` file exists on disk, and `ZETARIS_API_KEY` is undefined.
  - The in-memory virtualizer correctly loads all normalized CSV files (`purchase_orders.csv`, `deliveries.csv`, `invoices.csv`, `contract_prices.csv`) and handles both single-item (`PO-1042`) and multi-item (`PO-2005`) procurement records.
- **Milestone 2 Goal:**
  - Build dedicated adapter tests verifying:
    1. Graceful fallback to in-memory virtualizer when credentials are missing.
    2. Proper authentication header generation when credentials exist.
    3. Network timeout and error resilience without application crash.
    4. Strict separation of live data vs. fixture markers.

### 3.2 Meterless Agent Mission Runner
- **Existing Architecture:**
  - Implements the documented 5-step agent relay:
    1. `scoutIntent`: Resolves PO scope and sets verification thresholds.
    2. `fetchUnifiedData`: Queries the Zetaris virtualized data layer.
    3. `detectDiscrepancies`: Executes deterministic multi-item reconciliation rules.
    4. `scoreConfidence`: Computes aggregate financial exposure and corroboration score.
    5. `draftExplanation`: Calls NVIDIA NIM (or fallback) for natural language dispute generation.
  - Stores audit steps, timings, and decision artifacts in an in-memory `HMemStore` (`hMem`).
- **Current Finding:**
  - Live remote orchestration API (`METERLESS_API_KEY`) is not configured.
  - The local runner executes the complete 5-step relay with full trace tracking and latency reporting.
- **Milestone 3 Goal:**
  - Enhance `MeterlessMission.ts` to cleanly isolate live remote runner calls from local workflow execution.
  - Update status reporting to never falsely claim "Connected and verified" when running locally.
  - Add comprehensive unit tests covering mission execution, step status progression, and error isolation.

### 3.3 NVIDIA NIM Inference Microservice
- **Existing Architecture:**
  - `NvidiaExplainer.ts` targets `https://integrate.api.nvidia.com/v1/chat/completions` with model `meta/llama-3.1-8b-instruct` or `nvidia/nemotron-4-340b-instruct`.
  - **Strict Guardrail:** The model prompt accepts pre-calculated financial discrepancy amounts from the deterministic TypeScript engine. The LLM is never allowed to perform financial calculations or alter numbers.
- **Current Finding:**
  - `NVIDIA_API_KEY` is not configured in `.env`.
  - The system gracefully routes to the deterministic explanation engine, outputting an evidence-grounded summary and supplier dispute letter citing line coordinates (e.g. `invoices.csv:L7 vs deliveries.csv:L6`).
- **Milestone 4 Goal:**
  - Ensure backend error handling catches HTTP 401 (Invalid Key), 429 (Rate Limit), and 504 (Gateway Timeout) without throwing uncaught exceptions.
  - Add unit tests for live call simulation, fallback invocation, and schema enforcement.

### 3.4 Integration Health Reporting (Honesty Policy)
- **Current Finding:**
  - The UI previously displayed green "Connected" pills for local mock services, which could confuse evaluators.
- **Milestone 5 Goal:**
  - Refactor `/api/health` and `IntegrationsScreen.tsx` to strictly use the 5 standardized statuses:
    1. `Connected and verified` (Requires successful live ping/query with valid token).
    2. `Configured but not verified`.
    3. `Not configured` (Default when API key is blank).
    4. `Blocked by credentials or account access`.
    5. `Local / demo mode` (Clearly indicates in-memory simulation).

---

## 4. Execution Roadmap for Phase 5

1. **Step 1 (Current):** Complete pre-integration audit, commit, and push `docs/PHASE_5_INTEGRATION_PLAN.md`.
2. **Step 2:** Harden Zetaris adapter, add error/fallback test suite, document credentials setup. Commit & push.
3. **Step 3:** Harden Meterless mission runner, ensure clear local vs. remote demarcation, add unit tests. Commit & push.
4. **Step 4:** Harden NVIDIA NIM client, test error/missing-key safety, verify strict arithmetic guardrails. Commit & push.
5. **Step 5:** Update Integration Health Screen and API contracts to the 5 honest states. Commit & push.
6. **Step 6:** Run full test suite, verify production build, verify canonical scenario `PO-1042`, generate `docs/PHASE_5_REPORT.md`. Final commit & push.
