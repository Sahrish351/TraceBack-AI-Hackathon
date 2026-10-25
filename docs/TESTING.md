# TraceBack AI — Testing & Verification Guide

**Date:** 25 October 2026  
**Document Status:** Complete (Phase 5 Verified)  
**Test Framework:** Vitest v2.1.9 (Node.js v22 environment)  

---

## 1. Quick Start Commands

```bash
# Run unit and regression tests across all test suites
npm test

# Run full TypeScript compilation and production build
npm run build
```

---

## 2. Test Suite Architecture (38 Total Tests)

All reconciliation rules, mathematical calculations, adapter contracts, and fallback behaviors in TraceBack AI are executed deterministically with 100% automated test coverage.

### 2.1 Baseline Suite (`backend/tests/compare.test.ts` — 7 Tests)
- **PO-1001 Quantity Overbill:** Validates that 20 unreceived units billed @ \$50/unit yields exactly \$1,000 financial impact.
- **PO-1001 Contract Price Violation:** Validates that \$50 billed unit price vs. \$48 contract unit price yields exactly \$200 financial impact on 100 delivered units.
- **PO-1001 Cumulative Total:** Verifies cumulative non-double-counted exposure of \$1,200 across 2 findings.
- **PO-1002 Concordant Clean Audit:** Verifies zero false positives for fully concordant orders, deliveries, and invoices (0 findings, status: `CLEAN`).
- **PO-1003 Unexpected Surcharge:** Verifies unauthorized ancillary fee detection (\$350).
- **PO-1004 Duplicate Invoice:** Verifies detection of duplicate invoice submissions against the same PO scope (\$1,000 impact).
- **Dynamic Fee Detection:** Verifies flagging of unexpected non-contracted fees.

### 2.2 Canonical & Edge Case Regression Suite (`backend/tests/compare.test.ts` — 9 Tests)
- **Canonical Demo Scenario (PO-1042 — Northstar Office Supplies):**
  - **Supplier:** Northstar Office Supplies
  - **PO ID:** `PO-1042` | **Delivery Note:** `DN-1042` | **Invoice:** `INV-7781`
  - **Quantities:** 120 ordered, 100 delivered, 120 invoiced.
  - **Rates:** Agreed unit price Rs 500.
  - **Deterministic Formula:** `(120 invoiced − 100 delivered) × Rs 500 = Rs 10,000`.
  - **Review Status:** `FLAGGED_FOR_REVIEW` (Potential Discrepancy — Requires Human Review).
  - **Evidence Trail:** Linked to `invoices.csv:L7` vs `deliveries.csv:L6`.
- **Concordant Match (Zero Discrepancy):** Confirms that an order with 100% match across all 4 data sources returns status `CLEAN` and confidence `1.0`.
- **Missing Delivery Evidence:** Confirms that when delivery documentation is missing, the system reports `MISSING_EVIDENCE` with an uncertainty label rather than assuming delivered quantity is zero.
- **Missing Contract Price:** Confirms that missing contract rates are flagged as incomplete rather than inventing an assumed price.
- **Data Integrity & Invalid Quantities:** Confirms that negative counts are immediately caught and flagged as data integrity errors.
- **Non-Double-Counting Calculation:** Proves that an invoice having both unreceived units and price rate escalation calculates price variance strictly on delivered units, eliminating double-counting.
- **Decimal Precision:** Confirms high-precision rounding (`roundMoney`) prevents floating-point inaccuracies.
- **Duplicate Invoice Detection:** Confirms multi-invoice matching logic for duplicate scopes.
- **End-to-End Cross-Source Integration:** Executes the complete query join via `ZetarisClient` in-memory SQLite virtual schema and runs the `MeterlessMission` agent relay for `PO-1042`.

### 2.3 Phase 4 Multi-Item & Complex Reconciliations Suite (`backend/tests/compare.test.ts` — 8 Tests)
- **Multi-Line Item Invoices:** Reconciles an invoice containing multiple distinct line items against individual purchase order lines, delivery notes, and contract catalogs (e.g., Furniture Consignment with standing desk, ergonomic mesh chair, and LED lamp).
- **Partial Deliveries:** Distinguishes between under-deliveries where the supplier honestly bills only received goods (no financial loss; logs backorder quantity) vs. overbilling for unreceived goods.
- **Combined Item-Level Quantity & Price Variances:** Reconciles line items suffering from both unreceived units and rate variance without double-counting.
- **Subtotal & Statutory Tax Calculations:** Evaluates net subtotal, computes statutory sales/VAT tax against agreed rate schedules (e.g., 10% tax on $10,000 subtotal is $1,000), and flags billing tax calculation discrepancies.
- **Data Integrity & Invalid Values:** Guards against negative counts or NaN values in line items, outputting transparent error descriptions.
- **Duplicate Line Items:** Detects duplicate line entries within the same invoice for the same item code and calculates the duplicated financial impact.
- **Multi-Item Concordance (Zero Discrepancy):** Verifies clean zero-discrepancy status across multiple line items.
- **Currency Safety & Conflict Guard:** Rejects cross-currency blending (e.g. EUR item on a USD order) without an authorized exchange rate schedule.

### 2.4 Phase 5 Sponsor Adapter Test Suites (14 Tests)
- **Zetaris Adapter Suite (`backend/tests/zetaris.test.ts` — 6 Tests):**
  - Canonical `PO-1042` query virtualization and citation ref binding.
  - Multi-line item `PO-2005` virtualized retrieval.
  - Honest status reporting when credentials unconfigured.
  - Simulated live REST API query response handling.
  - Graceful fallback to in-memory schema upon network failure.
  - Descriptive rejection when querying unrecorded purchase orders.
- **Meterless Mission Suite (`backend/tests/meterless.test.ts` — 4 Tests):**
  - 5-step local sequential mission pipeline (`scoutIntent` → `fetchUnifiedData` → `detectDiscrepancies` → `scoreConfidence` → `draftExplanation`).
  - Multi-item mission execution with H-MEM persistent storage.
  - Honest status reporting (`Not configured (Local / demo mode)`).
  - Remote relay timeout/failure fallback to local workflow.
- **NVIDIA NIM Suite (`backend/tests/nvidia.test.ts` — 4 Tests):**
  - Honest status reporting when `NVIDIA_API_KEY` is not set.
  - Grounded deterministic fallback explanation citing exact line coordinates and Rs 10,000 amount.
  - Concordant zero-discrepancy approval email generation.
  - Network timeout (HTTP 504) and error resilience without uncaught exceptions.

---

## 3. Supported Features & Known Limitations

### Supported Features
1. **Multi-Item Line Reconciliation:** Supports arbitrary numbers of line items with per-item 4-way matching.
2. **Transparent Mathematical Formulas:** Every discrepancy emits a human-readable formula string (e.g., `(120 invoiced - 100 received) × Rs 500 = Rs 10,000`).
3. **Partial Delivery Distinctions:** Clearly separates legitimate partial fulfillment from overbilling.
4. **Statutory Tax Reconciliation:** Verifies invoiced tax vs. calculated statutory tax based on net line subtotal.
5. **Non-Double-Counting Engine:** Price escalation is strictly evaluated against delivered units, preventing inflated claims.
6. **Currency Protection:** Rejects mathematical blending of disparate currencies.
7. **Human Oversight First:** Findings are consistently labelled *"Potential Discrepancy — Requires Human Review"*.
8. **Honest Integration Reporting:** Screen displays real operational statuses: *Connected and verified*, *Configured but not verified*, *Not configured*, *Blocked by credentials*, or *Local / demo mode*.

### Known Limitations
1. **Foreign Exchange Conversion:** Mismatched currencies are flagged for auditor review rather than auto-converted using external live FX feeds.
2. **ERP General Ledger Posting:** TraceBack AI is an audit and evidence reconciliation system; it does not directly debit or modify enterprise ERP general ledgers.

---

## 4. Test Execution Results (Latest Run)

```text
✓ tests/zetaris.test.ts (6 tests) 130ms
✓ tests/meterless.test.ts (4 tests) 292ms
✓ tests/compare.test.ts (24 tests) 991ms
✓ tests/nvidia.test.ts (4 tests) 73ms

Test Files  4 passed (4)
     Tests  38 passed (38)
  Duration  2.97s
```
