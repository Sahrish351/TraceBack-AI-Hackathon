import { UnifiedRecord, Discrepancy, AnalysisSummary } from "./types.js";
import { findSourceRef } from "../utils/csv.js";

/**
 * Pure function comparing cross-source virtualized records to identify financial discrepancies.
 * Follows 4-way matching: PO vs Delivery Note vs Supplier Invoice vs Contract Price.
 */
export function compareRecords(record: UnifiedRecord): Discrepancy[] {
  const discrepancies: Discrepancy[] = [];
  const currency = record.currency || "USD";

  // Dynamic row location lookup from source CSV files
  const poRef = findSourceRef("purchase_orders.csv", "po_id", record.poId, "ordered_qty");
  const delRef = findSourceRef("deliveries.csv", "po_id", record.poId, "delivered_qty");
  const invQtyRef = findSourceRef("invoices.csv", "po_id", record.poId, "invoiced_qty");
  const invPriceRef = findSourceRef("invoices.csv", "po_id", record.poId, "unit_price");
  const contractPriceRef = findSourceRef("contract_prices.csv", "supplier_id", record.supplierId, "contract_unit_price");
  const invFeeRef = findSourceRef("invoices.csv", "po_id", record.poId, "fees");

  // 1. Quantity Overbill Check: Invoiced Qty > Delivered Qty (Goods Not Received)
  if (record.invoicedQty > record.deliveredQty) {
    const qtyOverbillDelta = record.invoicedQty - record.deliveredQty;
    const overbillCost = qtyOverbillDelta * record.invoiceUnitPrice;

    discrepancies.push({
      id: `DISC-QTY-${record.poId}-01`,
      type: "QTY_OVERBILL",
      severity: "high",
      field: "invoiced_qty vs delivered_qty",
      sourceA: {
        label: `Invoice ${record.invoiceId || "INV"} Invoiced Qty`,
        file: "invoices.csv",
        row: invQtyRef.row,
        column: "invoiced_qty",
        value: record.invoicedQty
      },
      sourceB: {
        label: `Delivery ${record.deliveryId || "DN"} Received Qty`,
        file: "deliveries.csv",
        row: delRef.row,
        column: "delivered_qty",
        value: record.deliveredQty
      },
      delta: qtyOverbillDelta,
      financialImpact: overbillCost,
      currency,
      reason: `Invoice bills for ${record.invoicedQty} units, but warehouse receiving note ${record.deliveryId} confirms receipt of only ${record.deliveredQty} units. ${qtyOverbillDelta} unreceived units billed.`,
      confidence: 0.98,
      remediationHint: `Issue debit note or request invoice amendment crediting ${qtyOverbillDelta} units at $${record.invoiceUnitPrice} (${currency} $${overbillCost.toLocaleString()}).`
    });
  }

  // 2. Price Violation Check: Invoiced Unit Price > Contract Agreed Price
  if (record.invoiceUnitPrice > record.contractUnitPrice && record.contractUnitPrice > 0) {
    const priceDelta = Number((record.invoiceUnitPrice - record.contractUnitPrice).toFixed(2));
    // Overcharge applies to verified delivered units
    const unitsToCalculate = record.deliveredQty > 0 ? record.deliveredQty : record.invoicedQty;
    const priceImpact = Number((unitsToCalculate * priceDelta).toFixed(2));

    discrepancies.push({
      id: `DISC-PRICE-${record.poId}-02`,
      type: "PRICE_ABOVE_CONTRACT",
      severity: "high",
      field: "unit_price vs contract_unit_price",
      sourceA: {
        label: `Invoice ${record.invoiceId || "INV"} Unit Price`,
        file: "invoices.csv",
        row: invPriceRef.row,
        column: "unit_price",
        value: record.invoiceUnitPrice
      },
      sourceB: {
        label: `Contract Master Price for ${record.supplierId}`,
        file: "contract_prices.csv",
        row: contractPriceRef.row,
        column: "contract_unit_price",
        value: record.contractUnitPrice
      },
      delta: priceDelta,
      financialImpact: priceImpact,
      currency,
      reason: `Invoice charges $${record.invoiceUnitPrice}/unit which exceeds master supplier contract agreed rate of $${record.contractUnitPrice}/unit by $${priceDelta} per unit on ${unitsToCalculate} delivered units.`,
      confidence: 0.95,
      remediationHint: `Adjust line item unit rate from $${record.invoiceUnitPrice} down to contract baseline $${record.contractUnitPrice}. Recover $${priceImpact.toLocaleString()}.`
    });
  }

  // 3. Short Delivery Check (informational if not already flagged as overbill)
  if (record.orderedQty > record.deliveredQty && record.invoicedQty <= record.deliveredQty) {
    const shortQty = record.orderedQty - record.deliveredQty;
    discrepancies.push({
      id: `DISC-SHORT-${record.poId}-03`,
      type: "QTY_SHORT",
      severity: "medium",
      field: "ordered_qty vs delivered_qty",
      sourceA: {
        label: `Purchase Order ${record.poId} Ordered Qty`,
        file: "purchase_orders.csv",
        row: poRef.row,
        column: "ordered_qty",
        value: record.orderedQty
      },
      sourceB: {
        label: `Delivery ${record.deliveryId} Delivered Qty`,
        file: "deliveries.csv",
        row: delRef.row,
        column: "delivered_qty",
        value: record.deliveredQty
      },
      delta: shortQty,
      financialImpact: 0, // No overbilling occurred, but shipment incomplete
      currency,
      reason: `Warehouse received ${record.deliveredQty} units against purchase order of ${record.orderedQty}. Supplier did not overbill, but shipment is short by ${shortQty} units.`,
      confidence: 0.99,
      remediationHint: `Log open balance of ${shortQty} units for backorder or close PO with partial delivery waiver.`
    });
  }

  // 4. Unexpected Fees Check (Uncontracted surcharge)
  if (record.fees > 0) {
    discrepancies.push({
      id: `DISC-FEE-${record.poId}-04`,
      type: "UNEXPECTED_FEE",
      severity: "medium",
      field: "fees",
      sourceA: {
        label: `Invoice Additional Surcharges/Fees`,
        file: "invoices.csv",
        row: invFeeRef.row,
        column: "fees",
        value: record.fees
      },
      sourceB: {
        label: `Contract Terms (No Surcharges Allowed)`,
        file: "contract_prices.csv",
        row: contractPriceRef.row,
        column: "valid_to",
        value: "Excluded in contract"
      },
      delta: record.fees,
      financialImpact: record.fees,
      currency,
      reason: `Invoice contains unexpected non-contracted ancillary fees of $${record.fees}.`,
      confidence: 0.92,
      remediationHint: `Reject non-contractual surcharge line item.`
    });
  }

  // 5. Duplicate Invoice Check
  if (record.allInvoicesForPo && record.allInvoicesForPo.length > 1) {
    const duplicateInvoice = record.allInvoicesForPo[1];
    const dupImpact = duplicateInvoice.invoicedQty * duplicateInvoice.unitPrice;
    discrepancies.push({
      id: `DISC-DUP-${record.poId}-05`,
      type: "DUPLICATE_INVOICE",
      severity: "high",
      field: "invoice_id",
      sourceA: {
        label: `Primary Invoice ${record.allInvoicesForPo[0].invoiceId}`,
        file: "invoices.csv",
        row: invQtyRef.row,
        column: "invoice_id",
        value: record.allInvoicesForPo[0].invoiceId
      },
      sourceB: {
        label: `Duplicate Invoice ${duplicateInvoice.invoiceId}`,
        file: "invoices.csv",
        row: invQtyRef.row + 1,
        column: "invoice_id",
        value: duplicateInvoice.invoiceId
      },
      delta: 1,
      financialImpact: dupImpact,
      currency,
      reason: `Duplicate invoice submission detected: Both ${record.allInvoicesForPo[0].invoiceId} and ${duplicateInvoice.invoiceId} bill for the identical PO scope of ${duplicateInvoice.invoicedQty} units.`,
      confidence: 0.99,
      remediationHint: `Immediately halt processing for duplicate invoice ${duplicateInvoice.invoiceId} and recover $${dupImpact.toLocaleString()}.`
    });
  }

  return discrepancies;
}

/**
 * Builds overall analysis summary and computes aggregate metrics
 */
export function buildAnalysisSummary(
  record: UnifiedRecord,
  discrepancies: Discrepancy[]
): AnalysisSummary {
  const totalFinancialImpact = discrepancies.reduce(
    (sum, d) => sum + (d.financialImpact || 0),
    0
  );

  const confidenceScore =
    discrepancies.length > 0
      ? Number(
          (
            discrepancies.reduce((acc, d) => acc + d.confidence, 0) /
            discrepancies.length
          ).toFixed(2)
        )
      : 1.0;

  return {
    poId: record.poId,
    supplierId: record.supplierId,
    item: record.item,
    totalFinancialImpact,
    currency: record.currency || "USD",
    discrepancies,
    discrepancyCount: discrepancies.length,
    status: discrepancies.length > 0 ? "FLAGGED_FOR_REVIEW" : "CLEAN",
    confidenceScore,
    auditTimestamp: new Date().toISOString()
  };
}
