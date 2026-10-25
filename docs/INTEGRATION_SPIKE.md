# TraceBack AI — Integration Spike & Access Proof

**Date:** 25 October 2026  
**Document Status:** Living Technical Spike Document  
**Objective:** Verify official documentation, endpoint paths, authentication requirements, and runtime readiness for all external dependencies and sponsor technologies before UI implementation.

---

## 1. Summary Integration Matrix

| Technology | Role in TraceBack AI | Official Endpoint / Target | Status | Fallback / Fixture Mode |
| :--- | :--- | :--- | :--- | :--- |
| **Zetaris** | Cross-source data virtualization (PO, Delivery, Invoice, Contract) | Zetaris SaaS / Enterprise API (`https://api.saas.enterprise.zetaris.com`) | **BLOCKED** | In-memory SQLite federated virtualizer reading normalized CSV files |
| **Meterless** | Multi-step agent mission orchestration & context tracking | Official Agentathon Starter (`meterless/meterless/templates/agentathon-starter`) | **VERIFIED (LOCAL)** | Deterministic step runner simulating Scout -> Fetch -> Compare -> Review relay |
| **NVIDIA Nemotron** | Plain-language explanation grounded in verified evidence | `https://integrate.api.nvidia.com/v1/chat/completions` (model: `nvidia/nemotron-4-340b-instruct`) | **BLOCKED** | Deterministic audit summary & supplier clarification email generator |
| **Cursor** | Developer Velocity & AI pair-programming audit | Cursor IDE environment & prompt logging | **VERIFIED** | Prompts and pairing decisions logged in `PROMPTS_LOG.md` and `docs/CURSOR_USAGE.md` |

---

## 2. Zetaris Integration Details

### 2.1 Official Documentation & Requirements
- **Documentation:** [Accessing Zetaris Using API](https://kbase.zetaris.com/knowledge/accessing-zetaris-using-api)
- **API Reference:** [Zetaris Enterprise SaaS ReDoc](https://api.saas.enterprise.zetaris.com/redoc/index.html)
- **Prerequisites for Live Query:**
  1. Organization ID (`ORG_ID`) and Tenant Base URL (`ZETARIS_API_URL`).
  2. Authentication Bearer Token / API Key (`ZETARIS_API_KEY`).
  3. Pre-configured tables or registered data sources (ERP, WMS, AP Portal, Pricing Master).

### 2.2 Canonical SQL Query Required
```sql
SELECT 
  po.po_id,
  po.supplier_id,
  po.item,
  po.ordered_qty,
  po.unit_price AS po_unit_price,
  po.currency,
  po.order_date,
  del.delivery_id,
  del.delivered_qty,
  del.delivery_date,
  del.warehouse,
  inv.invoice_id,
  inv.invoiced_qty,
  inv.unit_price AS invoice_unit_price,
  inv.fees,
  inv.invoice_date,
  cp.contract_unit_price,
  cp.valid_from,
  cp.valid_to
FROM purchase_orders po
LEFT JOIN deliveries del ON po.po_id = del.po_id
LEFT JOIN invoices inv ON po.po_id = inv.po_id
LEFT JOIN contract_prices cp ON po.supplier_id = cp.supplier_id AND po.item = cp.item
WHERE po.po_id = ?;
```

### 2.3 Status & Action Required
- **Status:** **BLOCKED**
- **Blocker:** No live Zetaris API credentials or tenant URL have been provided in `.env`.
- **Action for User / Organizers:** Provide `ZETARIS_API_URL`, `ZETARIS_API_KEY`, and `ZETARIS_ORG_ID`.
- **Honest Handling:** The UI and backend explicitly display `Zetaris: Fixture Mode (In-Memory SQLite Virtualizer)`. No fake "Live Connected" badges are rendered.

---

## 3. Meterless Agent Integration Details

### 3.1 Official Repository & Starter
- **Repository:** https://github.com/Meterless/Meterless
- **Agentathon Template:** `templates/agentathon-starter`
- **Execution Flow:**
  1. **Scout Intent:** Parse investigation scope and verification rules.
  2. **Fetch Unified Data:** Retrieve virtualized 4-way joined records from Zetaris adapter.
  3. **Detect Discrepancies:** Execute deterministic calculations (quantity variance, contract price delta, duplicate invoices, unexpected fees).
  4. **Synthesize Findings:** Aggregate potential exposure (Rs 10,000 for Northstar) and cited source coordinates.
  5. **Draft Explanation:** Prepare grounded narrative and editable supplier clarification letter.

### 3.2 Status & Action Required
- **Status:** **VERIFIED (LOCAL)**
- **Starter Compatibility:** The current local step relay follows the documented 5-step intent-execution pattern.
- **Action for Phase 5:** Wire the official Meterless workflow dependencies into the backend runner once verified against participant instructions.

---

## 4. NVIDIA Nemotron Integration Details

### 4.1 Official Endpoints & Model Specification
- **Portal:** [NVIDIA Build](https://build.nvidia.com/)
- **Target Model:** `nvidia/nemotron-4-340b-instruct` (or `meta/llama-3.1-8b-instruct` as fallback).
- **Endpoint:** `https://integrate.api.nvidia.com/v1/chat/completions`
- **Strict Guardrail:** LLM is strictly prohibited from calculating financial exposure. Exposure amounts are calculated server-side in TypeScript and passed to the model prompt as verified facts.

### 4.2 Status & Action Required
- **Status:** **BLOCKED**
- **Blocker:** `NVIDIA_API_KEY` is not currently set in `.env`.
- **Action for User:** Obtain an API key from `build.nvidia.com` and add `NVIDIA_API_KEY=nvapi-...` to `.env`.
- **Honest Handling:** If the key is not provided, the application runs in labeled **Deterministic Fallback Engine** mode. The UI states: `Generated via Deterministic Fallback Engine (NVIDIA NIM key unconfigured)`.

---

## 5. Hackathon Rules & Deadline Clarification

1. **Submission Deadline Conflict:**
   - Uploaded PDF states: **28 October 2026 at 4:45 AM Pakistan Standard Time (PKT)**.
   - Public online hackathon portals cite varying dates.
   - *Recommendation:* Confirm the official hard deadline with organizers.
2. **Cursor Requirement:**
   - Official rule PDF states Cursor is required, while verbal guidance suggested optional.
   - *Recommendation:* Log all prompts and architectural pairing sessions in `PROMPTS_LOG.md` and commit with clean Git commits to maintain compliance under either interpretation.
