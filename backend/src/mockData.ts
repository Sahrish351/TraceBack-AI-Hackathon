import { UnifiedRecord } from "./analyzer/types.js";

export const mockScenarios: Record<string, UnifiedRecord> = {
  "PO-1001": {
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
    allInvoicesForPo: [
      {
        invoiceId: "INV-9001",
        invoicedQty: 120,
        unitPrice: 50,
        fees: 0
      }
    ],
    sqlQueryExecuted: `
SELECT 
  po.po_id, po.supplier_id, po.item, po.currency, po.ordered_qty,
  del.delivered_qty, inv.invoiced_qty,
  po.unit_price AS po_unit_price,
  inv.unit_price AS invoice_unit_price,
  cp.contract_unit_price,
  inv.fees, po.order_date, del.delivery_date, inv.invoice_date,
  del.warehouse, inv.invoice_id, del.delivery_id
FROM purchase_orders po
LEFT JOIN deliveries del ON po.po_id = del.po_id AND po.item = del.item
LEFT JOIN invoices inv ON po.po_id = inv.po_id AND po.item = inv.item
LEFT JOIN contract_prices cp ON po.supplier_id = cp.supplier_id AND po.item = cp.item
WHERE po.po_id = 'PO-1001';
    `.trim(),
    sourceRefs: [
      {
        label: "Purchase Order",
        file: "purchase_orders.csv",
        row: 2,
        column: "ordered_qty",
        value: 120
      },
      {
        label: "Delivery Note",
        file: "deliveries.csv",
        row: 2,
        column: "delivered_qty",
        value: 100
      },
      {
        label: "Supplier Invoice",
        file: "invoices.csv",
        row: 2,
        column: "invoiced_qty",
        value: 120
      },
      {
        label: "Invoice Unit Price",
        file: "invoices.csv",
        row: 2,
        column: "unit_price",
        value: 50
      },
      {
        label: "Contract Unit Price",
        file: "contract_prices.csv",
        row: 2,
        column: "contract_unit_price",
        value: 48
      }
    ]
  },
  "PO-1002": {
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
    allInvoicesForPo: [
      {
        invoiceId: "INV-9002",
        invoicedQty: 50,
        unitPrice: 20,
        fees: 0
      }
    ],
    sqlQueryExecuted: `
SELECT 
  po.po_id, po.supplier_id, po.item, po.currency, po.ordered_qty,
  del.delivered_qty, inv.invoiced_qty,
  po.unit_price AS po_unit_price,
  inv.unit_price AS invoice_unit_price,
  cp.contract_unit_price,
  inv.fees, po.order_date, del.delivery_date, inv.invoice_date,
  del.warehouse, inv.invoice_id, del.delivery_id
FROM purchase_orders po
LEFT JOIN deliveries del ON po.po_id = del.po_id AND po.item = del.item
LEFT JOIN invoices inv ON po.po_id = inv.po_id AND po.item = inv.item
LEFT JOIN contract_prices cp ON po.supplier_id = cp.supplier_id AND po.item = cp.item
WHERE po.po_id = 'PO-1002';
    `.trim(),
    sourceRefs: [
      {
        label: "Purchase Order",
        file: "purchase_orders.csv",
        row: 3,
        column: "ordered_qty",
        value: 50
      },
      {
        label: "Delivery Note",
        file: "deliveries.csv",
        row: 3,
        column: "delivered_qty",
        value: 50
      },
      {
        label: "Supplier Invoice",
        file: "invoices.csv",
        row: 3,
        column: "invoiced_qty",
        value: 50
      },
      {
        label: "Invoice Unit Price",
        file: "invoices.csv",
        row: 3,
        column: "unit_price",
        value: 20
      },
      {
        label: "Contract Unit Price",
        file: "contract_prices.csv",
        row: 3,
        column: "contract_unit_price",
        value: 20
      }
    ]
  },
  "PO-1003": {
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
    allInvoicesForPo: [
      {
        invoiceId: "INV-9003",
        invoicedQty: 200,
        unitPrice: 15,
        fees: 350
      }
    ],
    sqlQueryExecuted: `
SELECT 
  po.po_id, po.supplier_id, po.item, po.currency, po.ordered_qty,
  del.delivered_qty, inv.invoiced_qty,
  po.unit_price AS po_unit_price,
  inv.unit_price AS invoice_unit_price,
  cp.contract_unit_price,
  inv.fees, po.order_date, del.delivery_date, inv.invoice_date,
  del.warehouse, inv.invoice_id, del.delivery_id
FROM purchase_orders po
LEFT JOIN deliveries del ON po.po_id = del.po_id AND po.item = del.item
LEFT JOIN invoices inv ON po.po_id = inv.po_id AND po.item = inv.item
LEFT JOIN contract_prices cp ON po.supplier_id = cp.supplier_id AND po.item = cp.item
WHERE po.po_id = 'PO-1003';
    `.trim(),
    sourceRefs: [
      {
        label: "Purchase Order",
        file: "purchase_orders.csv",
        row: 4,
        column: "ordered_qty",
        value: 200
      },
      {
        label: "Delivery Note",
        file: "deliveries.csv",
        row: 4,
        column: "delivered_qty",
        value: 200
      },
      {
        label: "Supplier Invoice",
        file: "invoices.csv",
        row: 4,
        column: "invoiced_qty",
        value: 200
      },
      {
        label: "Uncontracted Fees",
        file: "invoices.csv",
        row: 4,
        column: "fees",
        value: 350
      },
      {
        label: "Contract Unit Price",
        file: "contract_prices.csv",
        row: 4,
        column: "contract_unit_price",
        value: 15
      }
    ]
  },
  "PO-1004": {
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
    allInvoicesForPo: [
      {
        invoiceId: "INV-9004",
        invoicedQty: 100,
        unitPrice: 10,
        fees: 0
      },
      {
        invoiceId: "INV-9004-DUP",
        invoicedQty: 100,
        unitPrice: 10,
        fees: 0
      }
    ],
    sqlQueryExecuted: `
SELECT 
  po.po_id, po.supplier_id, po.item, po.currency, po.ordered_qty,
  del.delivered_qty, inv.invoiced_qty,
  po.unit_price AS po_unit_price,
  inv.unit_price AS invoice_unit_price,
  cp.contract_unit_price,
  inv.fees, po.order_date, del.delivery_date, inv.invoice_date,
  del.warehouse, inv.invoice_id, del.delivery_id
FROM purchase_orders po
LEFT JOIN deliveries del ON po.po_id = del.po_id AND po.item = del.item
LEFT JOIN invoices inv ON po.po_id = inv.po_id AND po.item = inv.item
LEFT JOIN contract_prices cp ON po.supplier_id = cp.supplier_id AND po.item = cp.item
WHERE po.po_id = 'PO-1004';
    `.trim(),
    sourceRefs: [
      {
        label: "Purchase Order",
        file: "purchase_orders.csv",
        row: 5,
        column: "ordered_qty",
        value: 100
      },
      {
        label: "Delivery Note",
        file: "deliveries.csv",
        row: 5,
        column: "delivered_qty",
        value: 100
      },
      {
        label: "Primary Invoice",
        file: "invoices.csv",
        row: 5,
        column: "invoice_id",
        value: "INV-9004"
      },
      {
        label: "Duplicate Invoice",
        file: "invoices.csv",
        row: 6,
        column: "invoice_id",
        value: "INV-9004-DUP"
      },
      {
        label: "Contract Unit Price",
        file: "contract_prices.csv",
        row: 5,
        column: "contract_unit_price",
        value: 10
      }
    ]
  },
  "PO-1042": {
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
    allInvoicesForPo: [
      {
        invoiceId: "INV-7781",
        invoicedQty: 120,
        unitPrice: 500,
        fees: 0
      }
    ],
    sqlQueryExecuted: `
SELECT 
  po.po_id, po.supplier_id, po.item, po.currency, po.ordered_qty,
  del.delivered_qty, inv.invoiced_qty,
  po.unit_price AS po_unit_price,
  inv.unit_price AS invoice_unit_price,
  cp.contract_unit_price,
  inv.fees, po.order_date, del.delivery_date, inv.invoice_date,
  del.warehouse, inv.invoice_id, del.delivery_id
FROM purchase_orders po
LEFT JOIN deliveries del ON po.po_id = del.po_id AND po.item = del.item
LEFT JOIN invoices inv ON po.po_id = inv.po_id AND po.item = inv.item
LEFT JOIN contract_prices cp ON po.supplier_id = cp.supplier_id AND po.item = cp.item
WHERE po.po_id = 'PO-1042';
    `.trim(),
    sourceRefs: [
      {
        label: "Purchase Order",
        file: "purchase_orders.csv",
        row: 6,
        column: "ordered_qty",
        value: 120
      },
      {
        label: "Delivery Note",
        file: "deliveries.csv",
        row: 6,
        column: "delivered_qty",
        value: 100
      },
      {
        label: "Supplier Invoice",
        file: "invoices.csv",
        row: 7,
        column: "invoiced_qty",
        value: 120
      },
      {
        label: "Invoice Unit Price",
        file: "invoices.csv",
        row: 7,
        column: "unit_price",
        value: 500
      },
      {
        label: "Contract Unit Price",
        file: "contract_prices.csv",
        row: 6,
        column: "contract_unit_price",
        value: 500
      }
    ]
  },
  "PO-2005": {
    poId: "PO-2005",
    supplierId: "Lita Co., Ltd. (Braintec)",
    item: "Executive Furnishings & Office Seating Consignment",
    currency: "USD",
    orderedQty: 19,
    deliveredQty: 17,
    invoicedQty: 19,
    poUnitPrice: 0,
    invoiceUnitPrice: 0,
    contractUnitPrice: 0,
    fees: 0,
    taxRate: 0.04526, // Approx 4.5% statutory VAT/Sales Tax
    taxAmount: 4120,
    totalAmount: 95140,
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
        status: "MATCHED"
      },
      {
        itemId: "FURN_8999A",
        description: "Three-seat Modular Lounge Sofa",
        orderedQty: 7,
        deliveredQty: 5,
        invoicedQty: 7, // 2 unreceived units @ $1,200 = $2,400 overbill
        poUnitPrice: 1200,
        invoiceUnitPrice: 1200,
        contractUnitPrice: 1200,
        currency: "USD",
        status: "QTY_OVERBILL"
      },
      {
        itemId: "FURN_8999S",
        description: "Three-seat Sofa with Recliner Section",
        orderedQty: 5,
        deliveredQty: 5,
        invoicedQty: 5,
        poUnitPrice: 1350,
        invoiceUnitPrice: 1500, // $150 above contract rate @ 5 units = $750 price violation
        contractUnitPrice: 1350,
        currency: "USD",
        status: "PRICE_MISMATCH"
      }
    ],
    sqlQueryExecuted: `
SELECT 
  po.po_id, po.supplier_id, 'Multi-Line Furnishings' AS item, po.currency,
  SUM(del.delivered_qty) AS delivered_qty, SUM(inv.invoiced_qty) AS invoiced_qty
FROM purchase_orders po
LEFT JOIN deliveries del ON po.po_id = del.po_id
LEFT JOIN invoices inv ON po.po_id = inv.po_id
WHERE po.po_id = 'PO-2005'
GROUP BY po.po_id;
    `.trim(),
    sourceRefs: [
      {
        label: "Purchase Order",
        file: "purchase_orders.csv",
        row: 8,
        column: "ordered_qty",
        value: 19
      },
      {
        label: "Delivery Receipt Note",
        file: "deliveries.csv",
        row: 8,
        column: "delivered_qty",
        value: 17
      },
      {
        label: "Supplier Invoice",
        file: "invoices.csv",
        row: 9,
        column: "invoiced_qty",
        value: 19
      }
    ]
  }
};
