export const UNIFIED_VIEW_SQL = `
SELECT 
  po.po_id,
  po.supplier_id,
  po.item,
  po.currency,
  po.ordered_qty,
  del.delivered_qty,
  inv.invoiced_qty,
  po.unit_price AS po_unit_price,
  inv.unit_price AS invoice_unit_price,
  cp.contract_unit_price,
  inv.fees,
  po.order_date,
  del.delivery_date,
  inv.invoice_date,
  del.warehouse,
  inv.invoice_id,
  del.delivery_id
FROM purchase_orders po
LEFT JOIN deliveries del ON po.po_id = del.po_id AND po.item = del.item
LEFT JOIN invoices inv ON po.po_id = inv.po_id AND po.item = inv.item
LEFT JOIN contract_prices cp ON po.supplier_id = cp.supplier_id AND po.item = cp.item
WHERE po.po_id = ?;
`.trim();

export interface RawJoinedRow {
  po_id: string;
  supplier_id: string;
  item: string;
  currency: string;
  ordered_qty: number | string;
  delivered_qty: number | string;
  invoiced_qty: number | string;
  po_unit_price: number | string;
  invoice_unit_price: number | string;
  contract_unit_price: number | string;
  fees: number | string;
  order_date: string;
  delivery_date: string;
  invoice_date: string;
  warehouse: string;
  invoice_id: string;
  delivery_id: string;
}
