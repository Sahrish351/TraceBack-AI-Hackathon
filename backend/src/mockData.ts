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
  }
};
