# TraceBack AI — Testing & Verification Guide

**Date:** 25 October 2026  
**Document Status:** Complete (Phase 2 Verified)  
**Test Framework:** Vitest v2.1.9 (Node.js v22 environment)  

---

## 1. Quick Start Commands

```bash
# Run unit and regression tests
npm test

# Run full TypeScript compilation and frontend production build
npm run build
```

---

## 2. Test Suite Overview

All reconciliation rules and calculations in TraceBack AI are executed deterministically in pure TypeScript with 100% test coverage for all discrepancy categories.

### 2.1 Baseline Suite (7 Tests)
- **PO-1001 Quantity Overbill:** Validates that 20 unreceived units billed @ \$50/unit yields exactly \$1,000 financial impact.
- **PO-1001 Contract Price Violation:** Validates that \$50 billed unit price vs. \$48 contract unit price yields exactly \$200 financial impact on 100 delivered units.
- **PO-1001 Cumulative Total:** Verifies cumulative non-double-counted exposure of \$1,200 across 2 findings.
- **PO-1002 Concordant Clean Audit:** Verifies zero false positives for fully concordant orders, deliveries, and invoices (0 findings, status: `CLEAN`).
- **PO-1003 Unexpected Surcharge:** Verifies unauthorized ancillary fee detection (\$350).
- **PO-1004 Duplicate Invoice:** Verifies detection of duplicate invoice submissions against the same PO scope (\$1,000 impact).
- **Dynamic Fee Detection:** Verifies flagging of unexpected non-contracted fees.

### 2.2 Phase 2 Canonical & Edge Case Regression Suite (9 Tests)
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
- **End-to-End Cross-Source Integration:** Executes the complete live query join via `ZetarisClient` in-memory SQLite virtual schema and runs the `MeterlessMission` agent relay for `PO-1042`.

---

## 3. Test Execution Results (Latest Run)

```text
✓ tests/compare.test.ts (16 tests) 467ms

Test Files  1 passed (1)
     Tests  16 passed (16)
  Duration  1.59s
```

