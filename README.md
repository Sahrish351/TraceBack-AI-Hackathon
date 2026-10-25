# TraceBack AI — Supplier Invoice Reconciliation & Audit Agent

> **Hackathon 2026 | Track: *The Agent That Can Explain Why***  
> *Evidence-first supplier invoice reconciliation agent. Compares purchase orders, invoices, delivery notes, and contract prices; detects potential discrepancies deterministically; links every finding to source evidence; and provides an audit trail for human review.*

[![GitHub Repository](https://img.shields.io/badge/GitHub-Sahrish351%2FTraceBack--AI--Hackathon-143D2F.svg)](https://github.com/Sahrish351/TraceBack-AI-Hackathon.git)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff.svg)](https://vitejs.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-45%2F45%20Passing-green.svg)](https://vitest.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![NVIDIA NIM](https://img.shields.io/badge/NVIDIA%20NIM-Llama%203.1-76b900.svg)](https://build.nvidia.com/)
[![Zetaris](https://img.shields.io/badge/Zetaris-Data%20Virtualization-00bcd4.svg)](https://www.zetaris.com/)
[![Meterless](https://img.shields.io/badge/Meterless-Agent%20Missions-10b981.svg)](https://meterless.ai/)
[![Cursor](https://img.shields.io/badge/Cursor-AI%20Pair%20Programming-slate.svg)](https://www.cursor.com/)

---

## 📌 Executive Summary

Supplier invoice checking is manual, error-prone, and fragmented across ERP systems, warehouse receiving docks, and contract folders. When discrepancies occur, organizations leak **1.5% to 4% of total procurement spend**.

Generic AI chatbots hallucinate calculations and accuse suppliers without receipts. **TraceBack AI solves this by keeping calculations 100% deterministic, grounding every finding in verified row-level source evidence, and placing a human reviewer in complete control.**

All findings are strictly labelled:
> **"Potential Discrepancy — Requires Human Review"**  
> *(TraceBack AI never auto-accuses suppliers of fraud or makes unapproved financial disbursements).*

---

## 🎯 Key Benchmark Scenarios

### 1. Canonical Demo Case: Northstar Office Supplies (`PO-1042`)
*The primary benchmark scenario specified in the hackathon PRD:*
- **Supplier:** Northstar Office Supplies (Fictional benchmark fixture)
- **Purchase Order (`PO-1042`):** 120 units @ Rs 500
- **Delivery Note (`DN-1042`):** 100 units accepted by warehouse
- **Supplier Invoice (`INV-7781`):** 120 units billed @ Rs 500
- **Agreed Contract Unit Price:** Rs 500
- **Reconciliation Finding:**
  - Invoiced Quantity above Received: **20 unreceived units**
  - Deterministic Formula: `(120 invoiced - 100 received) × Rs 500`
  - Potential Discrepancy Amount: **Rs 10,000**
  - Evidence Trail: `invoices.csv:L7` vs `deliveries.csv:L6`
  - Review Status: *Potential Discrepancy — Requires Human Review*

### 2. Multi-Item Consignment Case: Lita Co. / Braintec (`PO-2005`)
*Demonstrates complex multi-line item reconciliation:*
- Reconciles an invoice with 5 distinct furniture line items.
- Identifies **2 unreceived 3-seat sofas** billed ($2,400 variance) and **$150/unit contract rate escalation** on 5 lounge chairs ($750 variance).
- Total financial impact: **$3,150.00 USD**, evaluated item-by-item without double-counting.

### 3. Concordant Zero-Discrepancy Case (`PO-1002`)
- 50 units ordered, 50 delivered, 50 invoiced at $20/unit.
- Zero discrepancies detected; verified clean for immediate disbursement.

---

## 🌟 Sponsor Technology Architecture & Honest Integration Status

In accordance with strict hackathon integrity standards, TraceBack AI **never falsifies a live connection**. The application features an **Integration Health Screen** reflecting the 5 standard states:

| Sponsor Integration | Current Operational State | Architecture & Tested Reality |
| :--- | :--- | :--- |
| **Cursor** | **Connected & Verified** | Used throughout development for architecture design, refactoring, test authoring, and prompt pack generation (`PRD/TraceBack_AI_Cursor_Prompt_Pack.md`). |
| **Zetaris** | **Local / Demo Mode** | Virtualizes multi-source joins across 4 procurement datasets using an in-memory SQLite schema. When `ZETARIS_API_URL` and `ZETARIS_API_KEY` are provided, it calls live REST endpoints; otherwise it falls back gracefully with full citation coordinates. |
| **Meterless** | **Local / Demo Mode** | Runs the complete 5-step autonomous mission (`scoutIntent` → `fetchUnifiedData` → `detectDiscrepancies` → `scoreConfidence` → `draftExplanation`) with persistent H-MEM memory store. Remote webhook fallback verified. |
| **NVIDIA NIM** | **Local / Demo Mode** | Server-side explainer client targeting `meta/llama-3.1-8b-instruct`. When `NVIDIA_API_KEY` (`nvapi-...`) is provided, sends live requests with an 8s timeout; otherwise falls back to deterministic rule templates. **Strict arithmetic guardrail:** LLM is never permitted to perform math. |

---

## 🏗️ System Workflow Architecture

```
┌────────────────────────────────────────────────────────┐
│               Enterprise Procurement Data               │
│  purchase_orders.csv | deliveries.csv | invoices.csv    │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│            Zetaris Data Virtualization Layer            │
│  Federated SQL Cross-Source Join (Live / Local SQLite) │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│          Deterministic Reconciliation Engine           │
│  Pure TypeScript math: quantity, price, duplicate, tax │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│             Meterless Agent Mission Runner             │
│   5-Step Chain: Scout -> Virtualize -> Detect ->       │
│                 Score -> Explain (H-MEM State)         │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│              Constrained Explainer (NVIDIA NIM)        │
│  Evidence-grounded rationale & clarification draft     │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│            Human-in-the-Loop Review & Audit Log         │
│  Approve / Reject / Request Info with audit stamps     │
└────────────────────────────────────────────────────────┘
```

---

## ⚡ Quick Start & Installation

### Prerequisites
- **Node.js** v18+ (tested on Node v20, v22, and v26)
- **npm** v9+

### 1. Clone & Install
```bash
git clone https://github.com/Sahrish351/TraceBack-AI-Hackathon.git
cd TraceBack-AI-Hackathon

# Install workspace dependencies
npm install
```

### 2. Configure Environment (Optional)
TraceBack AI runs **100% out of the box** in verified Local / Demo Mode without requiring external API keys.
To connect live sponsor APIs, copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your optional keys locally:
```env
PORT=4000
NODE_ENV=development

# Zetaris (Optional - leave blank for local SQLite virtualization)
ZETARIS_API_URL=https://api.zetaris.example.com/v1
ZETARIS_API_KEY=

# Meterless (Optional - leave blank for local 5-step runner)
METERLESS_API_URL=https://agent.meterless.example.com/v1
METERLESS_API_KEY=

# NVIDIA NIM (Optional - get free key at build.nvidia.com)
NVIDIA_API_KEY=nvapi-your-key-here
```

### 3. Start the Full Stack Application
```bash
npm run dev
```
- **Backend API:** `http://localhost:4000/api`
- **Frontend Dashboard:** `http://localhost:3000`

---

## 🧪 Comprehensive Automated Testing (45 / 45 Tests Passing)

All reconciliation logic, sponsor adapters, fallbacks, and security boundaries are backed by automated tests:

```bash
npm test
```

### Test Suite Breakdown:
1. `backend/tests/compare.test.ts` (24 tests):
   - Canonical `PO-1042` Rs 10,000 quantity overbill
   - Multi-item consignment `PO-2005` ($3,150)
   - Contract price violations & non-double-counting
   - Partial delivery tracking (informational backorder)
   - Sales tax / VAT computation differences
   - Currency conflict protections & duplicate invoice checks
2. `backend/tests/zetaris.test.ts` (6 tests):
   - In-memory SQLite virtualization joins
   - Multi-item record preservation
   - Unconfigured status handling & network error fallbacks
3. `backend/tests/meterless.test.ts` (4 tests):
   - 5-step mission execution chain
   - Multi-item mission execution with H-MEM persistence
   - Unconfigured status & remote failure fallbacks
4. `backend/tests/nvidia.test.ts` (4 tests):
   - Unconfigured API key status reporting
   - Grounded deterministic fallback explanation
   - Concordant zero-discrepancy scenario
   - HTTP timeout (8s) and error resilience
5. `backend/tests/api_endpoints.test.ts` (7 tests):
   - Health endpoint honest 5-state reporting
   - Purchase order listing
   - Canonical PO-1042 and multi-item PO-2005 endpoints
   - Human review decision persistence
   - Source CSV inspection & **path traversal security rejection**

---

## 🔒 Security & Safe Engineering

- **Zero Exposed Secrets:** Automated scanner confirms 0 API keys, passwords, or tokens in git history.
- **Path Traversal Guard:** `/api/raw-source/:file` strictly whitelists valid procurement CSV files.
- **Zod Validation:** Review actions and custom audit inputs are validated with strict schemas.
- **No Automatic Actions:** TraceBack AI never auto-sends emails to suppliers or debits financial ledgers.

---

## 📚 Hackathon Documentation & Links

- **Phase 6 Readiness Report:** [`docs/PHASE_6_READINESS_REPORT.md`](file:///docs/PHASE_6_READINESS_REPORT.md)
- **Video Demo Script (1–4 mins):** [`docs/DEMO_SCRIPT.md`](file:///docs/DEMO_SCRIPT.md)
- **Final Submission Checklist:** [`docs/FINAL_SUBMISSION_CHECKLIST.md`](file:///docs/FINAL_SUBMISSION_CHECKLIST.md)
- **Sponsor Integration Reality Check:** [`docs/INTEGRATION_REALITY_CHECK.md`](file:///docs/INTEGRATION_REALITY_CHECK.md)
- **Hackathon Requirements Matrix:** [`docs/HACKATHON_REQUIREMENTS_CHECKLIST.md`](file:///docs/HACKATHON_REQUIREMENTS_CHECKLIST.md)
- **Cursor Usage Transcripts:** [`docs/CURSOR_USAGE.md`](file:///docs/CURSOR_USAGE.md)
