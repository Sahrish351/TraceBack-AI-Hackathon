import { UnifiedRecord, Discrepancy, AnalysisSummary, SourceReference } from "./types.js";
import { findSourceRef } from "../utils/csv.js";

/**
 * Rounds monetary amounts to 2 decimal places to avoid floating-point errors.
 */
export function roundMoney(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

/**
 * Cleanly formats currency amounts with proper currency symbol or ISO code.
 */
export function formatCurrencyValue(amount: number, currency: string = "USD"): string {
  const formatted = Math.abs(amount).toLocaleString("en-US", {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2
  });
  if (currency === "USD") return `$${formatted}`;
  if (currency === "EUR") return `€${formatted}`;
  if (currency === "GBP") return `£${formatted}`;
  return `${currency} ${formatted}`;
}

/**
 * Pure deterministic function comparing cross-source virtualized procurement records.
 * Follows 4-way matching: Purchase Order vs Delivery Note vs Supplier Invoice vs Contract Price.
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

  // 1. Invalid or Conflicting Quantities Check (Data Integrity)
  if (record.invoicedQty < 0 || record.orderedQty < 0 || (record.deliveredQty !== undefined && record.deliveredQty < 0)) {
    discrepancies.push({
      id: `DISC-INVALID-QTY-${record.poId}-00`,
      type: "MISSING_EVIDENCE",
      severity: "high",
      field: "invoiced_qty / ordered_qty",
      sourceA: {
        label: `Invoice ${record.invoiceId || "INV"} Quantity`,
        file: "invoices.csv",
        row: invQtyRef.row,
        column: "invoiced_qty",
        value: record.invoicedQty
      },
      sourceB: {
        label: `Purchase Order ${record.poId} Quantity`,
        file: "purchase_orders.csv",
        row: poRef.row,
        column: "ordered_qty",
        value: record.orderedQty
      },
      delta: 0,
      financialImpact: 0,
      currency,
      reason: `Invalid negative quantity detected in procurement records for PO ${record.poId}. Physical counts and invoices cannot be negative.`,
      confidence: 1.0,
      remediationHint: `Audit source records for data entry or system parsing errors.`
    });
    return discrepancies;
  }

  // 2. Missing Delivery Evidence Check
  // PRD Rule: If delivery evidence is missing, report "insufficient evidence" rather than assuming delivered qty is zero.
  const hasDeliveryRecord = Boolean(record.deliveryId && record.deliveryId.trim() !== "");
  if (!hasDeliveryRecord) {
    discrepancies.push({
      id: `DISC-MISSING-DEL-${record.poId}-01`,
      type: "MISSING_EVIDENCE",
      severity: "high",
      field: "deliveries.delivery_id",
      sourceA: {
        label: `Invoice ${record.invoiceId || "INV"} Invoiced Qty`,
        file: "invoices.csv",
        row: invQtyRef.row,
        column: "invoiced_qty",
        value: record.invoicedQty
      },
      sourceB: {
        label: `Warehouse Goods Receipt Note`,
        file: "deliveries.csv",
        row: 0,
        column: "delivery_id",
        value: "MISSING_DELIVERY_RECORD"
      },
      delta: record.invoicedQty,
      financialImpact: 0, // Unquantified pending evidence; not assumed to be zero goods received
      currency,
      reason: `Missing delivery record: No warehouse receiving note or delivery slip found for Purchase Order ${record.poId}. Goods receipt must be verified before payment disbursement.`,
      confidence: 0.99,
      remediationHint: `Request proof of physical delivery receipt from warehouse receiving before approving payment.`
    });
  }

  // 3. Missing Contract Price Check
  const hasContractPrice = typeof record.contractUnitPrice === "number" && record.contractUnitPrice > 0;
  if (!hasContractPrice) {
    discrepancies.push({
      id: `DISC-MISSING-CONTRACT-${record.poId}-02`,
      type: "MISSING_EVIDENCE",
      severity: "medium",
      field: "contract_prices.contract_unit_price",
      sourceA: {
        label: `Invoice ${record.invoiceId || "INV"} Unit Price`,
        file: "invoices.csv",
        row: invPriceRef.row,
        column: "unit_price",
        value: record.invoiceUnitPrice
      },
      sourceB: {
        label: `Contract Price Catalog for ${record.supplierId}`,
        file: "contract_prices.csv",
        row: 0,
        column: "contract_unit_price",
        value: "NO_ACTIVE_CONTRACT_PRICE"
      },
      delta: 0,
      financialImpact: 0,
      currency,
      reason: `Contract price not found: No active agreed contract price schedule exists for supplier ${record.supplierId} and item ${record.item}.`,
      confidence: 0.95,
      remediationHint: `Confirm contracted pricing schedule with procurement category manager.`
    });
  }

  // 4. Quantity Overbill Check: Invoiced Qty > Delivered Qty (Goods Not Received)
  // Only evaluated if delivery record is confirmed
  if (hasDeliveryRecord && record.invoicedQty > record.deliveredQty) {
    const qtyOverbillDelta = record.invoicedQty - record.deliveredQty;
    const overbillCost = roundMoney(qtyOverbillDelta * record.invoiceUnitPrice);
    const unitPriceDisplay = currency === "USD" ? `$${record.invoiceUnitPrice}` : `${currency} ${record.invoiceUnitPrice}`;
    const overbillDisplay = currency === "USD" ? `(${currency} $${overbillCost.toLocaleString()})` : `(${currency} ${overbillCost.toLocaleString()})`;

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
      remediationHint: `Issue debit note or request invoice amendment crediting ${qtyOverbillDelta} units at ${unitPriceDisplay} ${overbillDisplay}.`
    });
  }

  // 5. Price Violation Check: Invoiced Unit Price > Contract Agreed Price
  // Overcharge applies strictly to verified delivered units to avoid double-counting unreceived units
  if (hasContractPrice && record.invoiceUnitPrice > record.contractUnitPrice) {
    const priceDelta = roundMoney(record.invoiceUnitPrice - record.contractUnitPrice);
    const unitsToCalculate = record.deliveredQty > 0 ? record.deliveredQty : record.invoicedQty;
    const priceImpact = roundMoney(unitsToCalculate * priceDelta);

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

  // 6. Short Delivery Check (Informational: goods received < ordered, but supplier did not overbill)
  if (
    hasDeliveryRecord &&
    record.orderedQty > record.deliveredQty &&
    record.invoicedQty <= record.deliveredQty
  ) {
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

  // 7. Unexpected Fees Check (Uncontracted surcharge)
  if (record.fees > 0) {
    const feeImpact = roundMoney(record.fees);
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
      delta: feeImpact,
      financialImpact: feeImpact,
      currency,
      reason: `Invoice contains unexpected non-contracted ancillary fees of $${record.fees}.`,
      confidence: 0.92,
      remediationHint: `Reject non-contractual surcharge line item.`
    });
  }

  // 8. Duplicate Invoice Check
  if (record.allInvoicesForPo && record.allInvoicesForPo.length > 1) {
    const duplicateInvoice = record.allInvoicesForPo[1];
    const dupImpact = roundMoney(duplicateInvoice.invoicedQty * duplicateInvoice.unitPrice);
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
  const totalFinancialImpact = roundMoney(
    discrepancies.reduce((sum, d) => sum + (d.financialImpact || 0), 0)
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
