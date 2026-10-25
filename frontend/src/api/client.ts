import {
  SystemHealth,
  PurchaseOrderItem,
  InvestigationResult,
  CsvFileDump,
  ReviewDecision,
  BatchAuditResult,
  CustomAuditParams
} from "../types";

const BASE_URL = "/api";

// In-Memory Storage for GitHub Pages static review actions
const staticReviewStorage: Record<string, ReviewDecision> = {};

// Fallback Mock Datasets for GitHub Pages static hosting
const STATIC_CSV_DUMPS: Record<string, CsvFileDump> = {
  "purchase_orders.csv": {
    file: "purchase_orders.csv",
    headers: ["po_id", "supplier_id", "item", "ordered_qty", "unit_price", "currency", "order_date"],
    rows: [
      {
        rowNumber: 2,
        values: {
          po_id: "PO-1001",
          supplier_id: "SUP-42",
          item: "Widget-A",
          ordered_qty: "120",
          unit_price: "50",
          currency: "USD",
          order_date: "2026-10-01"
        }
      },
      {
        rowNumber: 3,
        values: {
          po_id: "PO-1002",
          supplier_id: "SUP-17",
          item: "Gadget-B",
          ordered_qty: "50",
          unit_price: "20",
          currency: "USD",
          order_date: "2026-10-02"
        }
      },
      {
        rowNumber: 4,
        values: {
          po_id: "PO-1003",
          supplier_id: "SUP-88",
          item: "Sensor-X",
          ordered_qty: "200",
          unit_price: "15",
          currency: "USD",
          order_date: "2026-10-03"
        }
      },
      {
        rowNumber: 5,
        values: {
          po_id: "PO-1004",
          supplier_id: "SUP-99",
          item: "Cable-Z",
          ordered_qty: "100",
          unit_price: "10",
          currency: "USD",
          order_date: "2026-10-04"
        }
      }
    ]
  },
  "deliveries.csv": {
    file: "deliveries.csv",
    headers: ["delivery_id", "po_id", "item", "delivered_qty", "delivery_date", "warehouse"],
    rows: [
      {
        rowNumber: 2,
        values: {
          delivery_id: "DN-045",
          po_id: "PO-1001",
          item: "Widget-A",
          delivered_qty: "100",
          delivery_date: "2026-10-08",
          warehouse: "WH-01"
        }
      },
      {
        rowNumber: 3,
        values: {
          delivery_id: "DN-046",
          po_id: "PO-1002",
          item: "Gadget-B",
          delivered_qty: "50",
          delivery_date: "2026-10-09",
          warehouse: "WH-01"
        }
      },
      {
        rowNumber: 4,
        values: {
          delivery_id: "DN-047",
          po_id: "PO-1003",
          item: "Sensor-X",
          delivered_qty: "200",
          delivery_date: "2026-10-10",
          warehouse: "WH-02"
        }
      },
      {
        rowNumber: 5,
        values: {
          delivery_id: "DN-048",
          po_id: "PO-1004",
          item: "Cable-Z",
          delivered_qty: "100",
          delivery_date: "2026-10-12",
          warehouse: "WH-01"
        }
      }
    ]
  },
  "invoices.csv": {
    file: "invoices.csv",
    headers: ["invoice_id", "po_id", "item", "invoiced_qty", "unit_price", "currency", "fees", "invoice_date"],
    rows: [
      {
        rowNumber: 2,
        values: {
          invoice_id: "INV-9001",
          po_id: "PO-1001",
          item: "Widget-A",
          invoiced_qty: "120",
          unit_price: "50",
          currency: "USD",
          fees: "0",
          invoice_date: "2026-10-10"
        }
      },
      {
        rowNumber: 3,
        values: {
          invoice_id: "INV-9002",
          po_id: "PO-1002",
          item: "Gadget-B",
          invoiced_qty: "50",
          unit_price: "20",
          currency: "USD",
          fees: "0",
          invoice_date: "2026-10-11"
        }
      },
      {
        rowNumber: 4,
        values: {
          invoice_id: "INV-9003",
          po_id: "PO-1003",
          item: "Sensor-X",
          invoiced_qty: "200",
          unit_price: "15",
          currency: "USD",
          fees: "350",
          invoice_date: "2026-10-13"
        }
      },
      {
        rowNumber: 5,
        values: {
          invoice_id: "INV-9004",
          po_id: "PO-1004",
          item: "Cable-Z",
          invoiced_qty: "100",
          unit_price: "10",
          currency: "USD",
          fees: "0",
          invoice_date: "2026-10-14"
        }
      },
      {
        rowNumber: 6,
        values: {
          invoice_id: "INV-9004-DUP",
          po_id: "PO-1004",
          item: "Cable-Z",
          invoiced_qty: "100",
          unit_price: "10",
          currency: "USD",
          fees: "0",
          invoice_date: "2026-10-15"
        }
      }
    ]
  },
  "contract_prices.csv": {
    file: "contract_prices.csv",
    headers: ["supplier_id", "item", "contract_unit_price", "valid_from", "valid_to"],
    rows: [
      {
        rowNumber: 2,
        values: {
          supplier_id: "SUP-42",
          item: "Widget-A",
          contract_unit_price: "48",
          valid_from: "2026-01-01",
          valid_to: "2026-12-31"
        }
      },
      {
        rowNumber: 3,
        values: {
          supplier_id: "SUP-17",
          item: "Gadget-B",
          contract_unit_price: "20",
          valid_from: "2026-01-01",
          valid_to: "2026-12-31"
        }
      },
      {
        rowNumber: 4,
        values: {
          supplier_id: "SUP-88",
          item: "Sensor-X",
          contract_unit_price: "15",
          valid_from: "2026-01-01",
          valid_to: "2026-12-31"
        }
      },
      {
        rowNumber: 5,
        values: {
          supplier_id: "SUP-99",
          item: "Cable-Z",
          contract_unit_price: "10",
          valid_from: "2026-01-01",
          valid_to: "2026-12-31"
        }
      }
    ]
  }
};

const STATIC_HEALTH: SystemHealth = {
  status: "ok",
  timestamp: new Date().toISOString(),
  service: "TraceBack AI (GitHub Pages Live)",
  version: "1.0.0",
  hackathonWindow: "Oct 22–27, 2026",
  sponsorIntegrations: {
    zetaris: {
      layer: "Data Virtualization & Cross-Source Integration",
      mode: "mock",
      engine: "Zetaris Cross-Source Virtualizer",
      latencyMs: 2,
      isLive: false,
      endpoint: "in-memory-sqlite-virtualizer"
    },
    meterless: {
      layer: "Agent Mission Orchestration & H-MEM",
      mode: "local-orchestrator",
      isLive: false,
      architecture: "Scout Intent -> Relay Execution -> H-MEM Session Memory"
    },
    nvidia: {
      layer: "Inference & Natural Language Generation",
      model: "meta/llama-3.1-8b-instruct",
      isLive: false,
      mode: "deterministic-fallback"
    },
    cursor: {
      layer: "Developer Velocity & AI Agent Pair Programming",
      promptsLogged: true,
      documentationPath: "docs/CURSOR_USAGE.md"
    }
  }
};

const STATIC_POS: PurchaseOrderItem[] = [
  {
    poId: "PO-1001",
    supplierId: "SUP-42",
    item: "Widget-A",
    orderedQty: 120,
    unitPrice: 50,
    currency: "USD",
    orderDate: "2026-10-01",
    demoBadge: "Overcharges Detected ($1,200)"
  },
  {
    poId: "PO-1002",
    supplierId: "SUP-17",
    item: "Gadget-B",
    orderedQty: 50,
    unitPrice: 20,
    currency: "USD",
    orderDate: "2026-10-02",
    demoBadge: "Clean Audit (Concordant)"
  },
  {
    poId: "PO-1003",
    supplierId: "SUP-88",
    item: "Sensor-X",
    orderedQty: 200,
    unitPrice: 15,
    currency: "USD",
    orderDate: "2026-10-03",
    demoBadge: "Unauthorized Fees ($350)"
  },
  {
    poId: "PO-1004",
    supplierId: "SUP-99",
    item: "Cable-Z",
    orderedQty: 100,
    unitPrice: 10,
    currency: "USD",
    orderDate: "2026-10-04",
    demoBadge: "Duplicate Invoice ($1,000)"
  }
];

function getStaticInvestigation(poId: string): InvestigationResult {
  const existingReview = staticReviewStorage[poId] || {
    action: "pending",
    reviewer: "Unassigned",
    timestamp: new Date().toISOString()
  };

  if (poId === "PO-1003") {
    return {
      poId: "PO-1003",
      supplierId: "SUP-88",
      item: "Sensor-X",
      summary: {
        poId: "PO-1003",
        supplierId: "SUP-88",
        item: "Sensor-X",
        totalFinancialImpact: 350,
        currency: "USD",
        discrepancies: [
          {
            id: "DISC-FEE-PO-1003-01",
            type: "UNEXPECTED_FEE",
            severity: "medium",
            field: "fees",
            sourceA: { label: "Invoice Surcharges/Fees", file: "invoices.csv", row: 4, column: "fees", value: 350 },
            sourceB: { label: "Contract Schedule (Excludes Surcharges)", file: "contract_prices.csv", row: 4, column: "valid_to", value: "Excluded" },
            delta: 350,
            financialImpact: 350,
            currency: "USD",
            reason: "Invoice INV-9003 charges $350 in uncontracted logistics and expediting surcharges not stipulated in the master supplier contract.",
            confidence: 0.92,
            remediationHint: "Reject $350 non-contractual surcharge line item."
          }
        ],
        discrepancyCount: 1,
        status: "FLAGGED_FOR_REVIEW",
        confidenceScore: 0.92,
        auditTimestamp: new Date().toISOString()
      },
      discrepancies: [
        {
          id: "DISC-FEE-PO-1003-01",
          type: "UNEXPECTED_FEE",
          severity: "medium",
          field: "fees",
          sourceA: { label: "Invoice Surcharges/Fees", file: "invoices.csv", row: 4, column: "fees", value: 350 },
          sourceB: { label: "Contract Schedule (Excludes Surcharges)", file: "contract_prices.csv", row: 4, column: "valid_to", value: "Excluded" },
          delta: 350,
          financialImpact: 350,
          currency: "USD",
          reason: "Invoice INV-9003 charges $350 in uncontracted logistics and expediting surcharges not stipulated in the master supplier contract.",
          confidence: 0.92,
          remediationHint: "Reject $350 non-contractual surcharge line item."
        }
      ],
      unifiedRecord: {
        poId: "PO-1003",
        supplierId: "SUP-88",
        item: "Sensor-X",
        currency: "USD",
        orderedQty: 200,
        deliveredQty: 200,
        invoicedQty: 200,
        poUnitPrice: 15,
        invoiceUnitPrice: 15,
        contractUnitPrice: 15,
        fees: 350,
        orderDate: "2026-10-03",
        deliveryDate: "2026-10-10",
        invoiceDate: "2026-10-13",
        warehouse: "WH-02",
        invoiceId: "INV-9003",
        deliveryId: "DN-047",
        sqlQueryExecuted: "SELECT * FROM virtualized_reconciliation WHERE po_id = 'PO-1003';",
        sourceRefs: [
          { label: "Purchase Order", file: "purchase_orders.csv", row: 4, column: "ordered_qty", value: 200 },
          { label: "Delivery Note", file: "deliveries.csv", row: 4, column: "delivered_qty", value: 200 },
          { label: "Invoice Surcharges", file: "invoices.csv", row: 4, column: "fees", value: 350 }
        ]
      },
      missionTrace: {
        missionId: "MSN-PO1003-FEE",
        objective: "Audit PO-1003 for ancillary surcharge compliance.",
        poId: "PO-1003",
        totalDurationMs: 91,
        hMemKey: "mission:PO-1003",
        steps: [
          { step: 1, name: "scoutIntent", thought: "Scouting PO-1003 scope and fee allowances.", action: "Verified baseline.", observation: "Targeted uncontracted surcharges.", durationMs: 12, status: "completed" },
          { step: 2, name: "fetchUnifiedData", thought: "Virtualizing cross-source tables via Zetaris.", action: "Executed SQL.", observation: "Fetched PO, DN, INV, Contract rates.", durationMs: 25, status: "completed" },
          { step: 3, name: "detectDiscrepancies", thought: "Evaluating unauthorized fee rule.", action: "Detected $350 ancillary charge.", observation: "Flagged unauthorized fee.", durationMs: 16, status: "completed" },
          { step: 4, name: "scoreConfidence", thought: "Calculating exposure.", action: "Computed total impact.", observation: "$350 unauthorized fee at 92% confidence.", durationMs: 14, status: "completed" },
          { step: 5, name: "draftExplanation", thought: "Drafting dispute letter via NVIDIA NIM.", action: "Generated letter.", observation: "Completed.", durationMs: 24, status: "completed" }
        ]
      },
      explanation: {
        executiveSummary: "Automated audit identified $350.00 USD in non-contracted ancillary fee overcharges on Invoice INV-9003 from SUP-88.",
        auditRationale: "Delivery and base pricing match contract terms. However, supplier added an unauthorized $350 logistics fee not permitted under Section 5.3 of Master Agreement.",
        supplierEmail: {
          to: "billing@sup-88.supplier-portal.com",
          recipientName: "SUP-88 Accounts Receivable",
          subject: "Notice of Non-Contractual Surcharge: Invoice INV-9003 [Claim: $350.00 USD]",
          claimAmount: "$350.00 USD",
          body: "Dear SUP-88 Accounts Receivable,\n\nWe have reviewed Invoice INV-9003 submitted against Purchase Order PO-1003.\n\nWhile goods receipt and base item unit prices are concordant, the invoice includes $350.00 USD in non-contracted ancillary fees. Our master procurement agreement does not permit unapproved surcharges.\n\nPlease provide a credit note for $350.00 USD or submit a corrected invoice.\n\nBest regards,\nAccounts Payable Audit Team"
        },
        modelUsed: "meta/llama-3.1-8b-instruct (NVIDIA NIM)",
        isLive: false
      },
      dataSourcesStatus: {
        purchaseOrders: { loaded: true, rowCount: 4, file: "purchase_orders.csv" },
        deliveries: { loaded: true, rowCount: 4, file: "deliveries.csv" },
        invoices: { loaded: true, rowCount: 5, file: "invoices.csv" },
        contractPrices: { loaded: true, rowCount: 4, file: "contract_prices.csv" }
      },
      reviewDecision: existingReview
    };
  }

  if (poId === "PO-1004") {
    return {
      poId: "PO-1004",
      supplierId: "SUP-99",
      item: "Cable-Z",
      summary: {
        poId: "PO-1004",
        supplierId: "SUP-99",
        item: "Cable-Z",
        totalFinancialImpact: 1000,
        currency: "USD",
        discrepancies: [
          {
            id: "DISC-DUP-PO-1004-01",
            type: "DUPLICATE_INVOICE",
            severity: "high",
            field: "invoice_id",
            sourceA: { label: "Primary Invoice INV-9004", file: "invoices.csv", row: 5, column: "invoice_id", value: "INV-9004" },
            sourceB: { label: "Duplicate Invoice INV-9004-DUP", file: "invoices.csv", row: 6, column: "invoice_id", value: "INV-9004-DUP" },
            delta: 1,
            financialImpact: 1000,
            currency: "USD",
            reason: "Duplicate invoice submission detected: Both INV-9004 and INV-9004-DUP bill for the exact same scope of 100 units of Cable-Z.",
            confidence: 0.99,
            remediationHint: "Immediately void duplicate invoice INV-9004-DUP and save $1,000.00 USD."
          }
        ],
        discrepancyCount: 1,
        status: "FLAGGED_FOR_REVIEW",
        confidenceScore: 0.99,
        auditTimestamp: new Date().toISOString()
      },
      discrepancies: [
        {
          id: "DISC-DUP-PO-1004-01",
          type: "DUPLICATE_INVOICE",
          severity: "high",
          field: "invoice_id",
          sourceA: { label: "Primary Invoice INV-9004", file: "invoices.csv", row: 5, column: "invoice_id", value: "INV-9004" },
          sourceB: { label: "Duplicate Invoice INV-9004-DUP", file: "invoices.csv", row: 6, column: "invoice_id", value: "INV-9004-DUP" },
          delta: 1,
          financialImpact: 1000,
          currency: "USD",
          reason: "Duplicate invoice submission detected: Both INV-9004 and INV-9004-DUP bill for the exact same scope of 100 units of Cable-Z.",
          confidence: 0.99,
          remediationHint: "Immediately void duplicate invoice INV-9004-DUP and save $1,000.00 USD."
        }
      ],
      unifiedRecord: {
        poId: "PO-1004",
        supplierId: "SUP-99",
        item: "Cable-Z",
        currency: "USD",
        orderedQty: 100,
        deliveredQty: 100,
        invoicedQty: 100,
        poUnitPrice: 10,
        invoiceUnitPrice: 10,
        contractUnitPrice: 10,
        fees: 0,
        orderDate: "2026-10-04",
        deliveryDate: "2026-10-12",
        invoiceDate: "2026-10-14",
        warehouse: "WH-01",
        invoiceId: "INV-9004",
        deliveryId: "DN-048",
        sqlQueryExecuted: "SELECT * FROM virtualized_reconciliation WHERE po_id = 'PO-1004';",
        sourceRefs: [
          { label: "Purchase Order", file: "purchase_orders.csv", row: 5, column: "ordered_qty", value: 100 },
          { label: "Delivery Note", file: "deliveries.csv", row: 5, column: "delivered_qty", value: 100 },
          { label: "Duplicate Invoice", file: "invoices.csv", row: 6, column: "invoice_id", value: "INV-9004-DUP" }
        ]
      },
      missionTrace: {
        missionId: "MSN-PO1004-DUP",
        objective: "Audit PO-1004 for duplicate invoice fraud/error.",
        poId: "PO-1004",
        totalDurationMs: 88,
        hMemKey: "mission:PO-1004",
        steps: [
          { step: 1, name: "scoutIntent", thought: "Analyzing PO-1004 invoice queue.", action: "Parsed multiple invoices.", observation: "Identified dual invoice records.", durationMs: 10, status: "completed" },
          { step: 2, name: "fetchUnifiedData", thought: "Querying Zetaris for cross-source join.", action: "Executed SQL.", observation: "Returned records with dual invoice submissions.", durationMs: 24, status: "completed" },
          { step: 3, name: "detectDiscrepancies", thought: "Checking duplicate invoice rules.", action: "Flagged double billing.", observation: "Confirmed $1,000 duplicate billing risk.", durationMs: 15, status: "completed" },
          { step: 4, name: "scoreConfidence", thought: "Scoring confidence.", action: "Evaluated corroboration.", observation: "99% confidence duplicate submission.", durationMs: 14, status: "completed" },
          { step: 5, name: "draftExplanation", thought: "Generating fraud/error prevention draft.", action: "Formulated response.", observation: "Completed.", durationMs: 25, status: "completed" }
        ]
      },
      explanation: {
        executiveSummary: "CRITICAL: Duplicate invoice billing detected. Both INV-9004 and INV-9004-DUP were submitted against PO-1004, creating a $1,000.00 USD double-payment exposure.",
        auditRationale: "Goods receipt DN-048 confirms a single delivery of 100 units. The supplier submitted two separate invoices for the same scope. Immediate cancellation of INV-9004-DUP is required.",
        supplierEmail: {
          to: "billing@sup-99.supplier-portal.com",
          recipientName: "SUP-99 Accounts Receivable",
          subject: "URGENT: Duplicate Invoice Notification: PO PO-1004 / Inv INV-9004-DUP",
          claimAmount: "$1,000.00 USD",
          body: "Dear SUP-99 Accounts Receivable,\n\nOur automated audit detected duplicate invoice submissions against Purchase Order PO-1004.\n\nInvoice INV-9004-DUP has been identified as a duplicate billing for the 100 units of Cable-Z already billed under INV-9004.\n\nINV-9004-DUP has been rejected and removed from our disbursement schedule. Please verify your accounting records.\n\nSincerely,\nFinance & Fraud Prevention Team"
        },
        modelUsed: "meta/llama-3.1-8b-instruct (NVIDIA NIM)",
        isLive: false
      },
      dataSourcesStatus: {
        purchaseOrders: { loaded: true, rowCount: 4, file: "purchase_orders.csv" },
        deliveries: { loaded: true, rowCount: 4, file: "deliveries.csv" },
        invoices: { loaded: true, rowCount: 5, file: "invoices.csv" },
        contractPrices: { loaded: true, rowCount: 4, file: "contract_prices.csv" }
      },
      reviewDecision: existingReview
    };
  }

  if (poId === "PO-1002") {
    return {
      poId: "PO-1002",
      supplierId: "SUP-17",
      item: "Gadget-B",
      summary: {
        poId: "PO-1002",
        supplierId: "SUP-17",
        item: "Gadget-B",
        totalFinancialImpact: 0,
        currency: "USD",
        discrepancies: [],
        discrepancyCount: 0,
        status: "CLEAN",
        confidenceScore: 1.0,
        auditTimestamp: new Date().toISOString()
      },
      discrepancies: [],
      unifiedRecord: {
        poId: "PO-1002",
        supplierId: "SUP-17",
        item: "Gadget-B",
        currency: "USD",
        orderedQty: 50,
        deliveredQty: 50,
        invoicedQty: 50,
        poUnitPrice: 20,
        invoiceUnitPrice: 20,
        contractUnitPrice: 20,
        fees: 0,
        orderDate: "2026-10-02",
        deliveryDate: "2026-10-09",
        invoiceDate: "2026-10-11",
        warehouse: "WH-01",
        invoiceId: "INV-9002",
        deliveryId: "DN-046",
        sqlQueryExecuted: "SELECT * FROM virtualized_reconciliation WHERE po_id = 'PO-1002';",
        sourceRefs: []
      },
      missionTrace: {
        missionId: "MSN-PO1002-CLEAN",
        objective: "Reconcile Purchase Order PO-1002 across 4 data sources.",
        poId: "PO-1002",
        totalDurationMs: 82,
        hMemKey: "mission:PO-1002",
        steps: [
          { step: 1, name: "scoutIntent", thought: "Analyzing Purchase Order PO-1002 for Gadget-B.", action: "Verified scope.", observation: "Ready for 4-way join.", durationMs: 14, status: "completed" },
          { step: 2, name: "fetchUnifiedData", thought: "Querying Zetaris cross-source virtualization mesh.", action: "Executed federated SQL.", observation: "Record received: 50 ordered, 50 delivered, 50 invoiced @ $20.", durationMs: 22, status: "completed" },
          { step: 3, name: "detectDiscrepancies", thought: "Comparing fields.", action: "Checked all 5 discrepancy rules.", observation: "Clean audit. Zero variances.", durationMs: 15, status: "completed" },
          { step: 4, name: "scoreConfidence", thought: "Assessing confidence.", action: "Evaluated source corroboration.", observation: "100% confidence.", durationMs: 12, status: "completed" },
          { step: 5, name: "draftExplanation", thought: "Drafting approval notice via NVIDIA NIM.", action: "Formatted rationale.", observation: "Generated clearance notice.", durationMs: 19, status: "completed" }
        ]
      },
      explanation: {
        executiveSummary: "Reconciliation for Purchase Order PO-1002 completed with 100% concordance across Purchase Order, Goods Receipt, Supplier Invoice, and Contract Price List. No overcharges or anomalies identified.",
        auditRationale: "All 4 verification checks succeeded: Invoiced quantity matches warehouse receipt (50 units), unit price matches agreed contract schedule ($20/unit), no unauthorized ancillary fees exist, and zero duplicate submissions detected.",
        supplierEmail: {
          to: "billing@sup-17.supplier-portal.com",
          recipientName: "SUP-17 Accounts Receivable Team",
          subject: "Invoice Reconciliation Approval: INV-9002 / PO PO-1002",
          claimAmount: "$0.00 USD",
          body: "Dear Accounts Receivable Team,\n\nWe have completed our automated four-way reconciliation for Purchase Order PO-1002 and Invoice INV-9002.\n\nAll quantities, rates, and goods receipt receipts have been verified against our agreed supplier contract. Your invoice has been approved for regular payment processing according to net terms.\n\nThank you for your partnership.\n\nBest regards,\nAccounts Payable & Audit Team\nTraceBack AI Automated Reconciliation"
        },
        modelUsed: "meta/llama-3.1-8b-instruct (NVIDIA NIM Engine)",
        isLive: false
      },
      dataSourcesStatus: {
        purchaseOrders: { loaded: true, rowCount: 4, file: "purchase_orders.csv" },
        deliveries: { loaded: true, rowCount: 4, file: "deliveries.csv" },
        invoices: { loaded: true, rowCount: 5, file: "invoices.csv" },
        contractPrices: { loaded: true, rowCount: 4, file: "contract_prices.csv" }
      },
      reviewDecision: existingReview
    };
  }

  // PO-1001 Overcharge Scenario ($1,200)
  return {
    poId: "PO-1001",
    supplierId: "SUP-42",
    item: "Widget-A",
    summary: {
      poId: "PO-1001",
      supplierId: "SUP-42",
      item: "Widget-A",
      totalFinancialImpact: 1200,
      currency: "USD",
      discrepancies: [
        {
          id: "DISC-QTY-PO-1001-01",
          type: "QTY_OVERBILL",
          severity: "high",
          field: "invoiced_qty vs delivered_qty",
          sourceA: {
            label: "Invoice INV-9001 Invoiced Qty",
            file: "invoices.csv",
            row: 2,
            column: "invoiced_qty",
            value: 120
          },
          sourceB: {
            label: "Delivery DN-045 Received Qty",
            file: "deliveries.csv",
            row: 2,
            column: "delivered_qty",
            value: 100
          },
          delta: 20,
          financialImpact: 1000,
          currency: "USD",
          reason: "Invoice bills for 120 units, but warehouse receiving note DN-045 confirms receipt of only 100 units. 20 unreceived units billed.",
          confidence: 0.98,
          remediationHint: "Issue debit note or request invoice amendment crediting 20 units at $50 (USD $1,000)."
        },
        {
          id: "DISC-PRICE-PO-1001-02",
          type: "PRICE_ABOVE_CONTRACT",
          severity: "high",
          field: "unit_price vs contract_unit_price",
          sourceA: {
            label: "Invoice INV-9001 Unit Price",
            file: "invoices.csv",
            row: 2,
            column: "unit_price",
            value: 50
          },
          sourceB: {
            label: "Contract Master Price for SUP-42",
            file: "contract_prices.csv",
            row: 2,
            column: "contract_unit_price",
            value: 48
          },
          delta: 2,
          financialImpact: 200,
          currency: "USD",
          reason: "Invoice charges $50/unit which exceeds master supplier contract agreed rate of $48/unit by $2 per unit on 100 delivered units.",
          confidence: 0.95,
          remediationHint: "Adjust line item unit rate from $50 down to contract baseline $48. Recover $200."
        }
      ],
      discrepancyCount: 2,
      status: "FLAGGED_FOR_REVIEW",
      confidenceScore: 0.965,
      auditTimestamp: new Date().toISOString()
    },
    discrepancies: [
      {
        id: "DISC-QTY-PO-1001-01",
        type: "QTY_OVERBILL",
        severity: "high",
        field: "invoiced_qty vs delivered_qty",
        sourceA: {
          label: "Invoice INV-9001 Invoiced Qty",
          file: "invoices.csv",
          row: 2,
          column: "invoiced_qty",
          value: 120
        },
        sourceB: {
          label: "Delivery DN-045 Received Qty",
          file: "deliveries.csv",
          row: 2,
          column: "delivered_qty",
          value: 100
        },
        delta: 20,
        financialImpact: 1000,
        currency: "USD",
        reason: "Invoice bills for 120 units, but warehouse receiving note DN-045 confirms receipt of only 100 units. 20 unreceived units billed.",
        confidence: 0.98,
        remediationHint: "Issue debit note or request invoice amendment crediting 20 units at $50 (USD $1,000)."
      },
      {
        id: "DISC-PRICE-PO-1001-02",
        type: "PRICE_ABOVE_CONTRACT",
        severity: "high",
        field: "unit_price vs contract_unit_price",
        sourceA: {
          label: "Invoice INV-9001 Unit Price",
          file: "invoices.csv",
          row: 2,
          column: "unit_price",
          value: 50
        },
        sourceB: {
          label: "Contract Master Price for SUP-42",
          file: "contract_prices.csv",
          row: 2,
          column: "contract_unit_price",
          value: 48
        },
        delta: 2,
        financialImpact: 200,
        currency: "USD",
        reason: "Invoice charges $50/unit which exceeds master supplier contract agreed rate of $48/unit by $2 per unit on 100 delivered units.",
        confidence: 0.95,
        remediationHint: "Adjust line item unit rate from $50 down to contract baseline $48. Recover $200."
      }
    ],
    unifiedRecord: {
      poId: "PO-1001",
      supplierId: "SUP-42",
      item: "Widget-A",
      currency: "USD",
      orderedQty: 120,
      deliveredQty: 100,
      invoicedQty: 120,
      poUnitPrice: 50,
      invoiceUnitPrice: 50,
      contractUnitPrice: 48,
      fees: 0,
      orderDate: "2026-10-01",
      deliveryDate: "2026-10-08",
      invoiceDate: "2026-10-10",
      warehouse: "WH-01",
      invoiceId: "INV-9001",
      deliveryId: "DN-045",
      sqlQueryExecuted: `SELECT po.*, del.*, inv.*, cp.* FROM purchase_orders po LEFT JOIN deliveries del ON po.po_id = del.po_id LEFT JOIN invoices inv ON po.po_id = inv.po_id LEFT JOIN contract_prices cp ON po.supplier_id = cp.supplier_id WHERE po.po_id = 'PO-1001';`,
      sourceRefs: [
        { label: "Purchase Order", file: "purchase_orders.csv", row: 2, column: "ordered_qty", value: 120 },
        { label: "Delivery Note", file: "deliveries.csv", row: 2, column: "delivered_qty", value: 100 },
        { label: "Supplier Invoice", file: "invoices.csv", row: 2, column: "invoiced_qty", value: 120 },
        { label: "Billed Unit Price", file: "invoices.csv", row: 2, column: "unit_price", value: 50 },
        { label: "Contract Unit Price", file: "contract_prices.csv", row: 2, column: "contract_unit_price", value: 48 }
      ]
    },
    missionTrace: {
      missionId: "MSN-MVLJ120G",
      objective: "Reconcile Purchase Order PO-1001 across 4 data sources.",
      poId: "PO-1001",
      totalDurationMs: 105,
      hMemKey: "mission:PO-1001:MSN-MVLJ120G",
      steps: [
        {
          step: 1,
          name: "scoutIntent",
          thought: "Targeting Purchase Order PO-1001 for cross-source reconciliation. Objective: Validate invoice integrity against warehouse goods receipt and contract price schedule.",
          action: "ScoutIntentAction: Resolved PO scope to 'PO-1001'. Setting verification thresholds: quantity delta > 0, price delta > $0.00, fee whitelist strict.",
          observation: "Scope verified. Target PO 'PO-1001' flagged for multi-source reconciliation. Initialized execution relay.",
          durationMs: 12,
          status: "completed"
        },
        {
          step: 2,
          name: "fetchUnifiedData",
          thought: "Need unified relational view merging purchase_orders, deliveries, invoices, and contract_prices. Querying Zetaris virtualization cluster.",
          action: "ZetarisVirtualizeAction: Executed SQL cross-source JOIN for po_id='PO-1001'. Merged 4 disparate sources into single virtualized record.",
          observation: "Unified record received: PO Ordered=120 units @ $50, Delivery Receipt=100 units (DN-045), Invoiced=120 units @ $50 (INV-9001), Contract Rate=$48. Extracted 5 citation references.",
          durationMs: 28,
          status: "completed"
        },
        {
          step: 3,
          name: "detectDiscrepancies",
          thought: "Comparing virtualized fields: invoicedQty (120) vs deliveredQty (100); invoiceUnitPrice ($50) vs contractUnitPrice ($48).",
          action: "AnalyzeDiscrepanciesAction: Executed 4-way comparison rules over virtual record. Checked QTY_OVERBILL, PRICE_ABOVE_CONTRACT, SHORT_DELIVERY, UNEXPECTED_FEE, DUPLICATE_INVOICE.",
          observation: "Detected 2 discrepancy finding(s): QTY_OVERBILL (delta: 20, impact: $1000), PRICE_ABOVE_CONTRACT (delta: 2, impact: $200).",
          durationMs: 16,
          status: "completed"
        },
        {
          step: 4,
          name: "scoreConfidence",
          thought: "Synthesizing risk confidence scores and aggregate financial exposure across all detected discrepancies.",
          action: "ScoreConfidenceAction: Evaluated source corroboration certainty. Overbill confidence: 0.98, Price variance confidence: 0.95.",
          observation: "Aggregate exposure computed: $1,200 USD. Audit Status: FLAGGED_FOR_REVIEW. Mean confidence score: 96.5%. Citing 4 verified evidence coordinates.",
          durationMs: 14,
          status: "completed"
        },
        {
          step: 5,
          name: "draftExplanation",
          thought: "Compiling human-readable audit narrative and supplier clarification letter citing specific evidence trail coordinates.",
          action: "NvidiaExplainerAction: Invoked LLM generator (meta/llama-3.1-8b-instruct) to draft dispute rationale and supplier communication.",
          observation: "Generated executive audit narrative and formal supplier dispute email for SUP-42 Accounts Receivable with claim amount of $1,200 USD.",
          durationMs: 35,
          status: "completed"
        }
      ]
    },
    explanation: {
      executiveSummary: "Automated four-way audit identified $1,200 USD in supplier overcharges across 2 discrepancy categories for Purchase Order PO-1001. Primary drivers: 20 unreceived units billed ($1,000) and contract price escalation ($200) on Delivery Note DN-045.",
      auditRationale: "TraceBack AI reconciled Purchase Order PO-1001, Delivery Slip DN-045, Invoice INV-9001, and Master Contract SUP-42. Cross-source join confirmed delivery of only 100 units of Widget-A against 120 invoiced units, and an invoiced unit price of $50 against a contracted ceiling of $48. Total recoverable financial leakage is exactly $1,200 USD.",
      supplierEmail: {
        to: "billing@sup-42.supplier-portal.com",
        recipientName: "SUP-42 Accounts Receivable",
        subject: "Discrepancy Notice & Credit Note Request: PO PO-1001 / Inv INV-9001 [Claim: $1,200 USD]",
        claimAmount: "$1,200.00 USD",
        body: `Dear SUP-42 Accounts Receivable Team,

We are writing regarding Invoice INV-9001 submitted against Purchase Order PO-1001 for item Widget-A.

Our automated cross-source reconciliation has identified a total overcharge variance of $1,200 USD. We kindly request an adjustment or formal credit note based on the verified evidence trail detailed below:

DISCREPANCY EVIDENCE TRAIL:
• Quantity Variance (20 unreceived units): Invoiced for 120 units, but warehouse receiving slip DN-045 documents only 100 units received. Overbill value: $1,000 (citing invoices.csv:L2 vs deliveries.csv:L2).

• Price Rate Variance ($2/unit): Billed at $50/unit vs master contracted rate of $48/unit under current agreement. Overbill value on 100 delivered units: $200 (citing invoices.csv:L2 vs contract_prices.csv:L2).

TOTAL RECOVERY CLAIM: $1,200 USD

REQUESTED ACTION:
1. Please issue a Credit Note in the amount of $1,200 USD referencing PO PO-1001 and Invoice INV-9001.
2. Alternatively, please provide a revised invoice reflecting the verified receipt count of 100 units at our contracted rate of $48/unit (totaling $4,800 USD).

Thank you for your prompt attention to this matter.

Sincerely,
Procurement & Accounts Payable Audit Team
TraceBack AI Automated Reconciliation Platform`
      },
      modelUsed: "meta/llama-3.1-8b-instruct (NVIDIA NIM Engine)",
      isLive: false
    },
    dataSourcesStatus: {
      purchaseOrders: { loaded: true, rowCount: 4, file: "purchase_orders.csv" },
      deliveries: { loaded: true, rowCount: 4, file: "deliveries.csv" },
      invoices: { loaded: true, rowCount: 5, file: "invoices.csv" },
      contractPrices: { loaded: true, rowCount: 4, file: "contract_prices.csv" }
    },
    reviewDecision: existingReview
  };
}

const STATIC_BATCH_RESULT: BatchAuditResult = {
  portfolioSummary: {
    totalPOsAudited: 4,
    totalSpendAudited: 11000,
    totalOverchargesRecovered: 2550,
    recoveryPercentage: 23.2,
    cleanCount: 1,
    flaggedCount: 3,
    categoryBreakdown: {
      QTY_OVERBILL: 1000,
      DUPLICATE_INVOICE: 1000,
      UNEXPECTED_FEE: 350,
      PRICE_ABOVE_CONTRACT: 200
    }
  },
  supplierScorecards: [
    {
      supplierId: "SUP-42",
      totalSpend: 6000,
      overcharge: 1200,
      poCount: 1,
      overchargeRate: 20.0,
      violations: ["QTY_OVERBILL", "PRICE_ABOVE_CONTRACT"],
      grade: "D",
      riskLevel: "HIGH"
    },
    {
      supplierId: "SUP-99",
      totalSpend: 1000,
      overcharge: 1000,
      poCount: 1,
      overchargeRate: 100.0,
      violations: ["DUPLICATE_INVOICE"],
      grade: "F",
      riskLevel: "CRITICAL"
    },
    {
      supplierId: "SUP-88",
      totalSpend: 3000,
      overcharge: 350,
      poCount: 1,
      overchargeRate: 11.7,
      violations: ["UNEXPECTED_FEE"],
      grade: "C",
      riskLevel: "MEDIUM"
    },
    {
      supplierId: "SUP-17",
      totalSpend: 1000,
      overcharge: 0,
      poCount: 1,
      overchargeRate: 0.0,
      violations: [],
      grade: "A+",
      riskLevel: "LOW"
    }
  ],
  results: [
    getStaticInvestigation("PO-1001"),
    getStaticInvestigation("PO-1002"),
    getStaticInvestigation("PO-1003"),
    getStaticInvestigation("PO-1004")
  ]
};

export async function fetchHealth(): Promise<SystemHealth> {
  try {
    const res = await fetch(`${BASE_URL}/health`);
    if (res.ok) return await res.json();
  } catch {
    // Fallback for static hosting on GitHub Pages
  }
  return STATIC_HEALTH;
}

export async function fetchPurchaseOrders(): Promise<PurchaseOrderItem[]> {
  try {
    const res = await fetch(`${BASE_URL}/pos`);
    if (res.ok) {
      const data = await res.json();
      return data.purchaseOrders;
    }
  } catch {
    // Fallback for static hosting on GitHub Pages
  }
  return STATIC_POS;
}

export async function investigatePo(poId: string): Promise<InvestigationResult> {
  try {
    const res = await fetch(`${BASE_URL}/investigate/${poId}`, {
      method: "POST"
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback for static hosting on GitHub Pages
  }
  return getStaticInvestigation(poId);
}

export async function fetchRawSource(fileName: string): Promise<CsvFileDump> {
  try {
    const res = await fetch(`${BASE_URL}/raw-source/${encodeURIComponent(fileName)}`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback for static hosting on GitHub Pages
  }
  if (STATIC_CSV_DUMPS[fileName]) {
    return STATIC_CSV_DUMPS[fileName];
  }
  throw new Error(`Source file ${fileName} not found`);
}

export async function submitReview(
  poId: string,
  action: "approve" | "reject" | "request_clarification",
  notes?: string
): Promise<{ success: boolean; decision: ReviewDecision }> {
  try {
    const res = await fetch(`${BASE_URL}/review/${poId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        reviewer: "Lead Auditor Zain",
        notes
      })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback for static hosting on GitHub Pages
  }

  const decision: ReviewDecision = {
    action,
    reviewer: "Lead Auditor Zain",
    timestamp: new Date().toISOString(),
    notes: notes || ""
  };
  staticReviewStorage[poId] = decision;

  return {
    success: true,
    decision
  };
}

export async function fetchBatchAudit(): Promise<BatchAuditResult> {
  try {
    const res = await fetch(`${BASE_URL}/batch-audit`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback for static hosting on GitHub Pages
  }
  return STATIC_BATCH_RESULT;
}

export async function sendChatMessage(
  message: string,
  poId: string
): Promise<{ reply: string; modelUsed: string; timestamp: string }> {
  try {
    const res = await fetch(`${BASE_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, poId })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback for static hosting on GitHub Pages
  }

  const lower = message.toLowerCase();
  let reply = "";
  if (lower.includes("price") || lower.includes("rate") || lower.includes("48") || lower.includes("50")) {
    reply = "Invoiced rate is $50.00/unit, which violates master contract schedule rate of $48.00/unit in contract_prices.csv:L2. This represents an uncontracted $2.00 markup on 100 received units ($200.00 USD).";
  } else if (lower.includes("quantity") || lower.includes("100") || lower.includes("120") || lower.includes("units")) {
    reply = "Warehouse receiving note DN-045 confirms only 100 units arrived at WH-01 on 2026-10-08. The supplier invoiced for 120 units, billing for 20 unreceived units ($1,000.00 USD).";
  } else if (lower.includes("clause") || lower.includes("contract") || lower.includes("legal")) {
    reply = "Section 4.2 of the Master Purchasing Contract fixes unit prices through 2026-12-31 without unilateral price adjustment. Section 7.1 binds billing to confirmed warehouse delivery slips.";
  } else if (lower.includes("recover") || lower.includes("claim") || lower.includes("action") || lower.includes("total")) {
    reply = "Recommended recovery action: Issue Debit Note #DN-RECOV-1001 for $1,200.00 USD and request an amended invoice from SUP-42 for $4,800.00 USD.";
  } else {
    reply = `Auditor Copilot (${poId}): Reconciled 4 sources via Zetaris data virtualization. All discrepancies are cited in the Evidence Trail with exact file and line references.`;
  }

  return {
    reply,
    modelUsed: "meta/llama-3.1-8b-instruct (NVIDIA NIM)",
    timestamp: new Date().toISOString()
  };
}

export async function runCustomAudit(params: CustomAuditParams): Promise<InvestigationResult> {
  try {
    const res = await fetch(`${BASE_URL}/custom-audit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback for static hosting on GitHub Pages
  }

  // Client-side simulation engine
  const orderedQty = params.orderedQty;
  const deliveredQty = params.deliveredQty;
  const invoicedQty = params.invoicedQty;
  const invoicePrice = params.invoiceUnitPrice;
  const contractPrice = params.contractUnitPrice;
  const fees = params.fees || 0;

  const discrepancies: any[] = [];
  if (invoicedQty > deliveredQty) {
    const delta = invoicedQty - deliveredQty;
    discrepancies.push({
      id: `DISC-QTY-${params.poId}-01`,
      type: "QTY_OVERBILL",
      severity: "high",
      field: "invoiced_qty vs delivered_qty",
      sourceA: { label: "Invoiced Qty", file: "invoices.csv", row: 2, column: "invoiced_qty", value: invoicedQty },
      sourceB: { label: "Delivered Qty", file: "deliveries.csv", row: 2, column: "delivered_qty", value: deliveredQty },
      delta,
      financialImpact: delta * invoicePrice,
      currency: "USD",
      reason: `Invoice bills for ${invoicedQty} units, but delivery receipt confirms ${deliveredQty} units. ${delta} unreceived units billed.`,
      confidence: 0.98,
      remediationHint: `Issue credit note for ${delta} units @ $${invoicePrice} ($${delta * invoicePrice}).`
    });
  }

  if (invoicePrice > contractPrice) {
    const delta = invoicePrice - contractPrice;
    discrepancies.push({
      id: `DISC-PRICE-${params.poId}-02`,
      type: "PRICE_ABOVE_CONTRACT",
      severity: "high",
      field: "unit_price vs contract_unit_price",
      sourceA: { label: "Billed Unit Price", file: "invoices.csv", row: 2, column: "unit_price", value: invoicePrice },
      sourceB: { label: "Contract Unit Price", file: "contract_prices.csv", row: 2, column: "contract_unit_price", value: contractPrice },
      delta,
      financialImpact: deliveredQty * delta,
      currency: "USD",
      reason: `Invoice unit price $${invoicePrice} exceeds agreed contract rate $${contractPrice} by $${delta}/unit on ${deliveredQty} delivered units.`,
      confidence: 0.95,
      remediationHint: `Adjust rate to $${contractPrice}/unit and recover $${deliveredQty * delta}.`
    });
  }

  if (fees > 0) {
    discrepancies.push({
      id: `DISC-FEE-${params.poId}-03`,
      type: "UNEXPECTED_FEE",
      severity: "medium",
      field: "fees",
      sourceA: { label: "Invoice Surcharge", file: "invoices.csv", row: 2, column: "fees", value: fees },
      sourceB: { label: "Contract Baseline", file: "contract_prices.csv", row: 2, column: "valid_to", value: "Excluded" },
      delta: fees,
      financialImpact: fees,
      currency: "USD",
      reason: `Unauthorized ancillary fee of $${fees} not in contract.`,
      confidence: 0.92,
      remediationHint: `Reject surcharge of $${fees}.`
    });
  }

  const totalFinancialImpact = discrepancies.reduce((sum, d) => sum + d.financialImpact, 0);

  return {
    poId: params.poId,
    supplierId: params.supplierId,
    item: params.item,
    summary: {
      poId: params.poId,
      supplierId: params.supplierId,
      item: params.item,
      totalFinancialImpact,
      currency: "USD",
      discrepancies,
      discrepancyCount: discrepancies.length,
      status: discrepancies.length > 0 ? "FLAGGED_FOR_REVIEW" : "CLEAN",
      confidenceScore: discrepancies.length > 0 ? 0.96 : 1.0,
      auditTimestamp: new Date().toISOString()
    },
    discrepancies,
    unifiedRecord: {
      poId: params.poId,
      supplierId: params.supplierId,
      item: params.item,
      currency: "USD",
      orderedQty,
      deliveredQty,
      invoicedQty,
      poUnitPrice: params.poUnitPrice,
      invoiceUnitPrice: invoicePrice,
      contractUnitPrice: contractPrice,
      fees,
      orderDate: "2026-10-01",
      deliveryDate: "2026-10-08",
      invoiceDate: "2026-10-10",
      warehouse: "WH-CUSTOM",
      invoiceId: "INV-SIM",
      deliveryId: "DN-SIM",
      sqlQueryExecuted: "SELECT * FROM custom_simulation_stream;",
      sourceRefs: []
    },
    missionTrace: {
      missionId: `MSN-CUSTOM-${Date.now().toString(36).toUpperCase()}`,
      objective: `Custom Simulation for ${params.poId}`,
      poId: params.poId,
      totalDurationMs: 65,
      steps: [
        { step: 1, name: "scoutIntent", thought: "Ingesting custom simulation parameters.", action: "Parsed custom scenario inputs.", observation: "Custom inputs validated.", durationMs: 12, status: "completed" },
        { step: 2, name: "fetchUnifiedData", thought: "Simulating cross-source data virtualization.", action: "Constructed virtual record.", observation: "Record assembled.", durationMs: 18, status: "completed" },
        { step: 3, name: "detectDiscrepancies", thought: "Evaluating custom rules.", action: "Calculated variances.", observation: `Found ${discrepancies.length} discrepancy items.`, durationMs: 14, status: "completed" },
        { step: 4, name: "scoreConfidence", thought: "Assessing risk exposure.", action: "Calculated exposure.", observation: `$${totalFinancialImpact} total exposure.`, durationMs: 10, status: "completed" },
        { step: 5, name: "draftExplanation", thought: "Drafting custom rationale via NVIDIA NIM.", action: "Generated audit narrative.", observation: "Complete.", durationMs: 11, status: "completed" }
      ]
    },
    explanation: {
      executiveSummary: `Simulation identified $${totalFinancialImpact.toLocaleString()} USD in recoverable overcharges across ${discrepancies.length} discrepancy categories.`,
      auditRationale: `Cross-source join verified variances between invoiced parameters and contracted/received baselines for ${params.poId}.`,
      supplierEmail: {
        to: `billing@${params.supplierId.toLowerCase()}.supplier-portal.com`,
        recipientName: `${params.supplierId} Accounts Receivable`,
        subject: `Discrepancy Notice: PO ${params.poId} [Claim: $${totalFinancialImpact.toLocaleString()} USD]`,
        claimAmount: `$${totalFinancialImpact.toLocaleString()} USD`,
        body: `Dear ${params.supplierId} Accounts Receivable,\n\nOur cross-source audit identified $${totalFinancialImpact.toLocaleString()} USD in variance on PO ${params.poId}.\n\nPlease review and issue a credit note.\n\nSincerely,\nAudit Team`
      },
      modelUsed: "meta/llama-3.1-8b-instruct (NVIDIA NIM)",
      isLive: false
    },
    dataSourcesStatus: {
      purchaseOrders: { loaded: true, rowCount: 1, file: "custom" },
      deliveries: { loaded: true, rowCount: 1, file: "custom" },
      invoices: { loaded: true, rowCount: 1, file: "custom" },
      contractPrices: { loaded: true, rowCount: 1, file: "custom" }
    },
    reviewDecision: { action: "pending", reviewer: "Unassigned", timestamp: new Date().toISOString() }
  };
}
