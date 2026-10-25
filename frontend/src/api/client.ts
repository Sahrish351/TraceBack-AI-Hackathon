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
      },
      {
        rowNumber: 6,
        values: {
          po_id: "PO-1042",
          supplier_id: "Northstar Office Supplies",
          item: "Ergonomic Office Chairs",
          ordered_qty: "120",
          unit_price: "500",
          currency: "Rs",
          order_date: "2026-10-24"
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
      },
      {
        rowNumber: 6,
        values: {
          delivery_id: "DN-1042",
          po_id: "PO-1042",
          item: "Ergonomic Office Chairs",
          delivered_qty: "100",
          delivery_date: "2026-10-24",
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
      },
      {
        rowNumber: 7,
        values: {
          invoice_id: "INV-7781",
          po_id: "PO-1042",
          item: "Ergonomic Office Chairs",
          invoiced_qty: "120",
          unit_price: "500",
          currency: "Rs",
          fees: "0",
          invoice_date: "2026-10-24"
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
      },
      {
        rowNumber: 6,
        values: {
          supplier_id: "Northstar Office Supplies",
          item: "Ergonomic Office Chairs",
          contract_unit_price: "500",
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
  service: "TraceBack AI (GitHub Pages Preview)",
  version: "1.0.0",
  hackathonWindow: "Oct 22–27, 2026",
  sponsorIntegrations: {
    zetaris: {
      layer: "Data Virtualization & Cross-Source Integration",
      status: "Local / demo mode",
      mode: "mock",
      engine: "Zetaris Cross-Source In-Memory Virtualizer",
      latencyMs: 2,
      isLive: false,
      endpoint: "in-memory-sqlite-virtualizer",
      reason: "Live Zetaris credentials unconfigured in client preview"
    },
    meterless: {
      layer: "Agent Mission Orchestration & H-MEM",
      status: "Local / demo mode",
      mode: "local-orchestrator",
      isLive: false,
      architecture: "Scout Intent -> Relay Execution -> H-MEM Session Memory",
      reason: "Local 5-step agent mission runner active"
    },
    nvidia: {
      layer: "Inference & Natural Language Generation",
      status: "Local / demo mode",
      model: "meta/llama-3.1-8b-instruct",
      isLive: false,
      mode: "deterministic-fallback",
      reason: "Deterministic fallback engine running with verified arithmetic guardrails"
    },
    cursor: {
      layer: "Developer Velocity & AI Agent Pair Programming",
      status: "Local / demo mode (Audit Logged)",
      promptsLogged: true,
      documentationPath: "docs/CURSOR_USAGE.md",
      note: "Cursor used for pair programming; prompt transcripts logged in docs/CURSOR_USAGE.md"
    }
  }
};

const STATIC_POS: PurchaseOrderItem[] = [
  {
    poId: "PO-1042",
    supplierId: "Northstar Office Supplies",
    item: "Ergonomic Office Chairs",
    orderedQty: 120,
    unitPrice: 500,
    currency: "Rs",
    orderDate: "2026-10-24",
    demoBadge: "Potential Discrepancy (Rs 10,000)"
  },
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
  },
  {
    poId: "PO-2005",
    supplierId: "Lita Co., Ltd. (Braintec)",
    item: "Executive Furnishings & Seating (5 Items)",
    orderedQty: 19,
    unitPrice: 0,
    currency: "USD",
    orderDate: "2026-10-18",
    demoBadge: "Multi-Item Discrepancy ($3,150)"
  }
];

function getStaticInvestigation(poId: string): InvestigationResult {
  const existingReview = staticReviewStorage[poId] || {
    action: "pending",
    reviewer: "Unassigned",
    timestamp: new Date().toISOString()
  };

  if (poId === "PO-1042") {
    return {
      poId: "PO-1042",
      supplierId: "Northstar Office Supplies",
      item: "Ergonomic Office Chairs",
      summary: {
        poId: "PO-1042",
        supplierId: "Northstar Office Supplies",
        item: "Ergonomic Office Chairs",
        totalFinancialImpact: 10000,
        currency: "Rs",
        discrepancies: [
          {
            id: "DISC-QTY-PO-1042-01",
            type: "QTY_OVERBILL",
            severity: "high",
            field: "invoiced_qty vs delivered_qty",
            sourceA: {
              label: "Invoice INV-7781 Invoiced Qty",
              file: "invoices.csv",
              row: 7,
              column: "invoiced_qty",
              value: 120
            },
            sourceB: {
              label: "Delivery DN-1042 Received Qty",
              file: "deliveries.csv",
              row: 6,
              column: "delivered_qty",
              value: 100
            },
            delta: 20,
            financialImpact: 10000,
            currency: "Rs",
            reason: "Invoice bills for 120 units, but warehouse receiving note DN-1042 confirms receipt of only 100 units. 20 unreceived units billed.",
            confidence: 0.98,
            remediationHint: "Request proof of delivery or invoice amendment crediting 20 units at Rs 500 (Rs 10,000)."
          }
        ],
        discrepancyCount: 1,
        status: "FLAGGED_FOR_REVIEW",
        confidenceScore: 0.98,
        auditTimestamp: new Date().toISOString()
      },
      discrepancies: [
        {
          id: "DISC-QTY-PO-1042-01",
          type: "QTY_OVERBILL",
          severity: "high",
          field: "invoiced_qty vs delivered_qty",
          sourceA: {
            label: "Invoice INV-7781 Invoiced Qty",
            file: "invoices.csv",
            row: 7,
            column: "invoiced_qty",
            value: 120
          },
          sourceB: {
            label: "Delivery DN-1042 Received Qty",
            file: "deliveries.csv",
            row: 6,
            column: "delivered_qty",
            value: 100
          },
          delta: 20,
          financialImpact: 10000,
          currency: "Rs",
          reason: "Invoice bills for 120 units, but warehouse receiving note DN-1042 confirms receipt of only 100 units. 20 unreceived units billed.",
          confidence: 0.98,
          remediationHint: "Request proof of delivery or invoice amendment crediting 20 units at Rs 500 (Rs 10,000)."
        }
      ],
      unifiedRecord: {
        poId: "PO-1042",
        supplierId: "Northstar Office Supplies",
        item: "Ergonomic Office Chairs",
        currency: "Rs",
        orderedQty: 120,
        deliveredQty: 100,
        invoicedQty: 120,
        poUnitPrice: 500,
        invoiceUnitPrice: 500,
        contractUnitPrice: 500,
        fees: 0,
        orderDate: "2026-10-24",
        deliveryDate: "2026-10-24",
        invoiceDate: "2026-10-24",
        warehouse: "WH-01",
        invoiceId: "INV-7781",
        deliveryId: "DN-1042",
        sqlQueryExecuted: "SELECT * FROM virtualized_reconciliation WHERE po_id = 'PO-1042';",
        sourceRefs: [
          { label: "Purchase Order Quantity", file: "purchase_orders.csv", row: 6, column: "ordered_qty", value: 120 },
          { label: "Delivery Receipt Quantity", file: "deliveries.csv", row: 6, column: "delivered_qty", value: 100 },
          { label: "Supplier Invoiced Quantity", file: "invoices.csv", row: 7, column: "invoiced_qty", value: 120 },
          { label: "Billed Unit Price", file: "invoices.csv", row: 7, column: "unit_price", value: 500 },
          { label: "Agreed Contract Price", file: "contract_prices.csv", row: 6, column: "contract_unit_price", value: 500 }
        ]
      },
      missionTrace: {
        missionId: "MSN-PO1042-CANONICAL",
        objective: "Reconcile PO-1042 for Northstar Office Supplies across ERP, WMS, and Billing portals.",
        poId: "PO-1042",
        totalDurationMs: 88,
        hMemKey: "mission:PO-1042",
        steps: [
          { step: 1, name: "scoutIntent", thought: "Scouting PO-1042 scope: Northstar Office Supplies. Target: 120 ordered vs goods receipt.", action: "Resolved PO scope to PO-1042.", observation: "Scope validated. Initialized 4-way matching relay.", durationMs: 12, status: "completed" },
          { step: 2, name: "fetchUnifiedData", thought: "Querying virtualized multi-source tables via Zetaris in-memory federator.", action: "Executed federated SQL query.", observation: "Fetched 4 linked records: PO, DN-1042, INV-7781, Contract Catalog.", durationMs: 24, status: "completed" },
          { step: 3, name: "detectDiscrepancies", thought: "Evaluating 4-way reconciliation rules: QTY_OVERBILL, PRICE_ABOVE_CONTRACT, SHORT_DELIVERY, UNEXPECTED_FEE, DUPLICATE_INVOICE.", action: "Computed deterministic variance.", observation: "Observed 1 discrepancy: Invoiced 120 units vs Delivered 100 units. Delta: 20 units.", durationMs: 15, status: "completed" },
          { step: 4, name: "scoreConfidence", thought: "Synthesizing financial exposure: 20 unreceived units * Rs 500 agreed rate = Rs 10,000 potential amount.", action: "Calculated exposure.", observation: "Potential amount: Rs 10,000. Status: Potential Discrepancy — Requires Human Review.", durationMs: 14, status: "completed" },
          { step: 5, name: "draftExplanation", thought: "Drafting evidence-grounded audit narrative and supplier clarification letter.", action: "Prepared audit summary and supplier draft.", observation: "Grounded draft generated citing invoices.csv:L7 vs deliveries.csv:L6.", durationMs: 23, status: "completed" }
        ]
      },
      explanation: {
        executiveSummary: "Reconciliation analysis identified Rs 10,000 in potential discrepancies for Purchase Order PO-1042 (Northstar Office Supplies). Primary finding: Invoice bills for 120 units, but warehouse receiving note DN-1042 confirms receipt of only 100 units (20 unreceived units billed). Status: Potential Discrepancy — Requires Human Review.",
        auditRationale: "TraceBack AI reconciled Purchase Order PO-1042, Delivery Slip DN-1042, Invoice INV-7781, and Master Contract for Northstar Office Supplies. Cross-source join confirmed delivery of only 100 units of Ergonomic Office Chairs against 120 invoiced units at an agreed unit price of Rs 500. Total potential exposure is exactly Rs 10,000.",
        supplierEmail: {
          to: "billing@northstar.supplier-portal.com",
          recipientName: "Northstar Office Supplies Accounts Receivable",
          subject: "Inquiry Regarding Invoice INV-7781 / PO PO-1042 [Potential Discrepancy: Rs 10,000]",
          claimAmount: "Rs 10,000",
          body: "Dear Northstar Office Supplies Accounts Receivable Team,\n\nWe are writing regarding Invoice INV-7781 submitted against Purchase Order PO-1042 for item Ergonomic Office Chairs.\n\nOur cross-source reconciliation has identified a potential discrepancy variance of Rs 10,000 based on the verified evidence trail detailed below:\n\nDISCREPANCY EVIDENCE TRAIL:\n• Quantity Variance (20 unreceived units): Invoiced for 120 units, but warehouse receiving slip DN-1042 documents only 100 units received. Potential overbill value: Rs 10,000 (citing invoices.csv:L7 vs deliveries.csv:L6).\n\nTOTAL POTENTIAL DISCREPANCY: Rs 10,000\n\nREQUESTED ACTION:\n1. Please review the delivery and contract documentation referenced above.\n2. If confirmed, please issue a credit note or submit a corrected invoice for 100 units at Rs 500/unit (Rs 50,000).\n\nThank you for your prompt attention to this matter.\n\nSincerely,\nProcurement & Accounts Payable Audit Team\nTraceBack AI Automated Reconciliation Platform"
        },
        modelUsed: "meta/llama-3.1-8b-instruct (NVIDIA NIM Fallback Engine)",
        isLive: false
      },
      dataSourcesStatus: {
        purchaseOrders: { loaded: true, rowCount: 5, file: "purchase_orders.csv" },
        deliveries: { loaded: true, rowCount: 5, file: "deliveries.csv" },
        invoices: { loaded: true, rowCount: 6, file: "invoices.csv" },
        contractPrices: { loaded: true, rowCount: 5, file: "contract_prices.csv" }
      },
      reviewDecision: existingReview
    };
  }

  if (poId === "PO-2005") {
    return {
      poId: "PO-2005",
      supplierId: "Lita Co., Ltd. (Braintec)",
      item: "Executive Furnishings & Seating Consignment",
      summary: {
        poId: "PO-2005",
        supplierId: "Lita Co., Ltd. (Braintec)",
        item: "Executive Furnishings & Seating Consignment",
        totalFinancialImpact: 3150,
        currency: "USD",
        discrepancies: [
          {
            id: "DISC-QTY-PO-2005-FURN_8999A",
            type: "QTY_OVERBILL",
            severity: "high",
            field: "line_items.FURN_8999A.qty",
            itemIdentifier: "FURN_8999A",
            sourceA: {
              label: "Invoice INV/2025/10/0003 Line 4 Invoiced Qty",
              file: "invoices.csv",
              row: 9,
              column: "invoiced_qty",
              value: 7
            },
            sourceB: {
              label: "Delivery DN-2025-089 Received Qty",
              file: "deliveries.csv",
              row: 8,
              column: "delivered_qty",
              value: 5
            },
            delta: 2,
            financialImpact: 2400,
            currency: "USD",
            reason: "Item FURN_8999A (Three-seat Modular Lounge Sofa): Invoice bills for 7 units, but delivery receipt confirms receipt of only 5 units (2 unreceived units billed).",
            confidence: 0.98,
            remediationHint: "Request credit memo for 2 unreceived units of FURN_8999A at $1,200 ($2,400).",
            calculation: {
              formula: "(7 invoiced - 5 received) × $1,200 = $2,400",
              itemIdentifier: "FURN_8999A",
              expectedQty: 5,
              actualQty: 7,
              expectedUnitPrice: 1200,
              actualUnitPrice: 1200,
              deltaQty: 2,
              subtotalImpact: 2400,
              currency: "USD"
            }
          },
          {
            id: "DISC-PRICE-PO-2005-FURN_8999S",
            type: "PRICE_ABOVE_CONTRACT",
            severity: "high",
            field: "line_items.FURN_8999S.unit_price",
            itemIdentifier: "FURN_8999S",
            sourceA: {
              label: "Invoice INV/2025/10/0003 Unit Price",
              file: "invoices.csv",
              row: 9,
              column: "unit_price",
              value: 1500
            },
            sourceB: {
              label: "Contract Master Price for FURN_8999S",
              file: "contract_prices.csv",
              row: 8,
              column: "contract_unit_price",
              value: 1350
            },
            delta: 150,
            financialImpact: 750,
            currency: "USD",
            reason: "Item FURN_8999S: Billed price of $1,500/unit exceeds contract agreed rate of $1,350/unit by $150 across 5 delivered units.",
            confidence: 0.95,
            remediationHint: "Adjust line item unit rate from $1,500 down to contracted baseline $1,350. Credit $750.",
            calculation: {
              formula: "5 units × ($1,500 - $1,350) = $750",
              itemIdentifier: "FURN_8999S",
              expectedUnitPrice: 1350,
              actualUnitPrice: 1500,
              deltaPrice: 150,
              subtotalImpact: 750,
              currency: "USD"
            }
          }
        ],
        discrepancyCount: 2,
        status: "FLAGGED_FOR_REVIEW",
        confidenceScore: 0.96,
        auditTimestamp: new Date().toISOString()
      },
      discrepancies: [
        {
          id: "DISC-QTY-PO-2005-FURN_8999A",
          type: "QTY_OVERBILL",
          severity: "high",
          field: "line_items.FURN_8999A.qty",
          itemIdentifier: "FURN_8999A",
          sourceA: {
            label: "Invoice INV/2025/10/0003 Line 4 Invoiced Qty",
            file: "invoices.csv",
            row: 9,
            column: "invoiced_qty",
            value: 7
          },
          sourceB: {
            label: "Delivery DN-2025-089 Received Qty",
            file: "deliveries.csv",
            row: 8,
            column: "delivered_qty",
            value: 5
          },
          delta: 2,
          financialImpact: 2400,
          currency: "USD",
          reason: "Item FURN_8999A: Invoice bills for 7 units, but delivery receipt confirms receipt of only 5 units (2 unreceived units billed).",
          confidence: 0.98,
          remediationHint: "Request credit memo for 2 unreceived units of FURN_8999A at $1,200 ($2,400).",
          calculation: {
            formula: "(7 invoiced - 5 received) × $1,200 = $2,400",
            itemIdentifier: "FURN_8999A",
            expectedQty: 5,
            actualQty: 7,
            expectedUnitPrice: 1200,
            actualUnitPrice: 1200,
            deltaQty: 2,
            subtotalImpact: 2400,
            currency: "USD"
          }
        },
        {
          id: "DISC-PRICE-PO-2005-FURN_8999S",
          type: "PRICE_ABOVE_CONTRACT",
          severity: "high",
          field: "line_items.FURN_8999S.unit_price",
          itemIdentifier: "FURN_8999S",
          sourceA: {
            label: "Invoice INV/2025/10/0003 Unit Price",
            file: "invoices.csv",
            row: 9,
            column: "unit_price",
            value: 1500
          },
          sourceB: {
            label: "Contract Master Price for FURN_8999S",
            file: "contract_prices.csv",
            row: 8,
            column: "contract_unit_price",
            value: 1350
          },
          delta: 150,
          financialImpact: 750,
          currency: "USD",
          reason: "Item FURN_8999S: Billed price of $1,500/unit exceeds contract agreed rate of $1,350/unit by $150 across 5 delivered units.",
          confidence: 0.95,
          remediationHint: "Adjust line item unit rate from $1,500 down to contracted baseline $1,350. Credit $750.",
          calculation: {
            formula: "5 units × ($1,500 - $1,350) = $750",
            itemIdentifier: "FURN_8999S",
            expectedUnitPrice: 1350,
            actualUnitPrice: 1500,
            deltaPrice: 150,
            subtotalImpact: 750,
            currency: "USD"
          }
        }
      ],
      unifiedRecord: {
        poId: "PO-2005",
        supplierId: "Lita Co., Ltd. (Braintec)",
        item: "Executive Furnishings & Seating Consignment",
        currency: "USD",
        orderedQty: 19,
        deliveredQty: 17,
        invoicedQty: 19,
        poUnitPrice: 0,
        invoiceUnitPrice: 0,
        contractUnitPrice: 0,
        fees: 0,
        orderDate: "2026-10-18",
        deliveryDate: "2026-10-23",
        invoiceDate: "2026-10-28",
        warehouse: "WH-PACIFIC-01",
        invoiceId: "INV/2025/10/0003",
        deliveryId: "DN-2025-089",
        financialSummary: {
          subtotal: 91020,
          taxRate: 0.04526,
          taxAmount: 4120,
          totalAmount: 95140,
          currency: "USD",
          calculatedSubtotal: 91020,
          calculatedTax: 4120,
          calculatedTotal: 95140,
          taxDiscrepancy: 0,
          formula: "Subtotal ($91,020.00) + Tax ($4,120.00) = $95,140.00"
        },
        lineItems: [
          {
            itemId: "FURN_8999",
            description: "Three-seat Sofa (Steel Grey)",
            orderedQty: 1,
            deliveredQty: 1,
            invoicedQty: 1,
            poUnitPrice: 970,
            invoiceUnitPrice: 970,
            contractUnitPrice: 970,
            currency: "USD",
            subtotal: 970,
            status: "MATCHED"
          },
          {
            itemId: "FURN_8998",
            description: "Three-seat Sofa (Steel Grey Colour)",
            orderedQty: 3,
            deliveredQty: 3,
            invoicedQty: 3,
            poUnitPrice: 1270,
            invoiceUnitPrice: 1270,
            contractUnitPrice: 1270,
            currency: "USD",
            subtotal: 3810,
            status: "MATCHED"
          },
          {
            itemId: "FURN_89945",
            description: "Three-seat Sofa (Steel Grey Colour)",
            orderedQty: 3,
            deliveredQty: 3,
            invoicedQty: 3,
            poUnitPrice: 1450,
            invoiceUnitPrice: 1450,
            contractUnitPrice: 1450,
            currency: "USD",
            subtotal: 4350,
            status: "MATCHED"
          },
          {
            itemId: "FURN_8999A",
            description: "Three-seat Modular Lounge Sofa",
            orderedQty: 7,
            deliveredQty: 5,
            invoicedQty: 7,
            poUnitPrice: 1200,
            invoiceUnitPrice: 1200,
            contractUnitPrice: 1200,
            currency: "USD",
            subtotal: 8400,
            status: "QTY_OVERBILL"
          },
          {
            itemId: "FURN_8999S",
            description: "Three-seat Sofa with Recliner Section",
            orderedQty: 5,
            deliveredQty: 5,
            invoicedQty: 5,
            poUnitPrice: 1350,
            invoiceUnitPrice: 1500,
            contractUnitPrice: 1350,
            currency: "USD",
            subtotal: 7500,
            status: "PRICE_MISMATCH"
          }
        ],
        sqlQueryExecuted: "SELECT * FROM cross_source_virtual_invoices WHERE po_id = 'PO-2005';",
        sourceRefs: [
          { label: "Purchase Order", file: "purchase_orders.csv", row: 8, column: "ordered_qty", value: 19 },
          { label: "Delivery Receipt Note", file: "deliveries.csv", row: 8, column: "delivered_qty", value: 17 },
          { label: "Supplier Invoice", file: "invoices.csv", row: 9, column: "invoiced_qty", value: 19 }
        ]
      },
      missionTrace: {
        missionId: "MSN-MULTI-2005",
        objective: "Multi-item reconciliation for PO-2005 / INV/2025/10/0003 across 5 distinct line items.",
        poId: "PO-2005",
        totalDurationMs: 142,
        hMemKey: "mission:PO-2005:MSN-MULTI-2005",
        steps: [
          { step: 1, name: "scoutIntent", thought: "Ingesting multi-item invoice INV/2025/10/0003. Identifying 5 distinct line items.", action: "Parsed 5 line items.", observation: "Line item scope identified: FURN_8999, FURN_8998, FURN_89945, FURN_8999A, FURN_8999S.", durationMs: 16, status: "completed" },
          { step: 2, name: "fetchUnifiedData", thought: "Virtualizing cross-source records across line items, warehouse delivery notes, and contract catalogs.", action: "Executed 4-way federated join.", observation: "5 items matched across PO, delivery receipt DN-2025-089, and catalog.", durationMs: 44, status: "completed" },
          { step: 3, name: "detectDiscrepancies", thought: "Running item-level reconciliation and calculation breakdowns.", action: "Computed line item variances.", observation: "Detected 2 variances: FURN_8999A overbill (2 units * $1,200 = $2,400) and FURN_8999S price variance ($150 * 5 = $750). Total: $3,150.", durationMs: 25, status: "completed" },
          { step: 4, name: "verifyTaxAndSubtotal", thought: "Checking mathematical integrity of subtotal ($91,020) and statutory tax ($4,120). Total: $95,140.", action: "Verified financial totals.", observation: "Subtotal and tax calculations confirmed mathematically valid.", durationMs: 18, status: "completed" },
          { step: 5, name: "draftExplanation", thought: "Generating transparent audit summary and evidence trail.", action: "Drafted explanation.", observation: "Explanation ready for human reviewer oversight.", durationMs: 39, status: "completed" }
        ]
      },
      explanation: {
        executiveSummary: "Multi-item reconciliation identified $3,150 in potential discrepancies for Invoice INV/2025/10/0003 (Lita Co., Ltd. / Braintec). Findings: (1) FURN_8999A billed for 7 units but warehouse confirmed 5 (2 unreceived units = $2,400 potential overbill); (2) FURN_8999S billed at $1,500/unit exceeding $1,350 contract rate ($750 variance). Status: Potential Discrepancy — Requires Human Review.",
        auditRationale: "TraceBack AI verified 5 line items totaling $95,140.00. While 3 lines matched perfectly, line item FURN_8999A exhibits quantity overbilling and line item FURN_8999S exhibits an unauthorized unit price increase.",
        supplierEmail: {
          to: "ap-audit@litaco.global",
          recipientName: "Lita Co., Ltd. Accounts Receivable",
          subject: "Line Item Reconciliation Notice: Invoice INV/2025/10/0003 [Potential Discrepancy: $3,150.00]",
          claimAmount: "$3,150.00",
          body: "Dear Lita Co., Ltd. Accounts Receivable Team,\n\nWe have completed our automated line-item reconciliation for Invoice INV/2025/10/0003 (PO-2005) covering executive furnishings.\n\nOur cross-source audit identified two potential discrepancies totaling $3,150.00:\n\n1. ITEM FURN_8999A: Invoiced for 7 units @ $1,200.00, but delivery receipt DN-2025-089 confirms receipt of 5 units (2 unreceived units billed = $2,400.00).\n2. ITEM FURN_8999S: Invoiced at $1,500.00/unit against agreed contract rate of $1,350.00/unit across 5 delivered units ($750.00).\n\nPlease provide proof of physical delivery for the remaining 2 units of FURN_8999A or issue a revised invoice/credit note for $3,150.00.\n\nSincerely,\nProcurement Audit Team\nTraceBack AI"
        },
        modelUsed: "meta/llama-3.1-8b-instruct (NVIDIA NIM Fallback Engine)",
        isLive: false
      },
      dataSourcesStatus: {
        purchaseOrders: { loaded: true, rowCount: 6, file: "purchase_orders.csv" },
        deliveries: { loaded: true, rowCount: 6, file: "deliveries.csv" },
        invoices: { loaded: true, rowCount: 7, file: "invoices.csv" },
        contractPrices: { loaded: true, rowCount: 6, file: "contract_prices.csv" }
      },
      reviewDecision: existingReview
    };
  }

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
