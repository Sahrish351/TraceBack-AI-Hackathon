import {
  UnifiedRecord,
  Discrepancy,
  AnalysisSummary,
  SourceReference,
  InvoiceFinancialSummary,
  InvoiceLineItem
} from "./types.js";
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
 * Transparently computes invoice subtotal, tax breakdown, and total amounts.
 */
export function calculateInvoiceBreakdown(record: UnifiedRecord): InvoiceFinancialSummary {
  const currency = record.currency || "USD";

  if (record.lineItems && record.lineItems.length > 0) {
    const subtotal = roundMoney(
      record.lineItems.reduce((acc, it) => acc + roundMoney(it.invoicedQty * it.invoiceUnitPrice), 0)
    );
    const taxRate = record.taxRate ?? (record.financialSummary?.taxRate ?? 0);
    const calculatedTax = roundMoney(subtotal * taxRate);
    const billedTax = record.taxAmount ?? (record.financialSummary?.taxAmount ?? calculatedTax);
    const fees = record.fees || 0;
    const billedTotal = roundMoney(subtotal + billedTax + fees);
    const calculatedTotal = roundMoney(subtotal + calculatedTax + fees);
    const taxDiscrepancy = roundMoney(billedTax - calculatedTax);

    return {
      subtotal,
      taxRate,
      taxAmount: billedTax,
      totalAmount: billedTotal,
      currency,
      calculatedSubtotal: subtotal,
      calculatedTax,
      calculatedTotal,
      taxDiscrepancy,
      formula: `Subtotal (${formatCurrencyValue(subtotal, currency)}) + Tax (${formatCurrencyValue(billedTax, currency)}) + Fees (${formatCurrencyValue(fees, currency)}) = ${formatCurrencyValue(billedTotal, currency)}`
    };
  }

  // Single-item breakdown fallback
  const subtotal = roundMoney(record.invoicedQty * record.invoiceUnitPrice);
  const taxRate = record.taxRate ?? (record.financialSummary?.taxRate ?? 0);
  const calculatedTax = roundMoney(subtotal * taxRate);
  const billedTax = record.taxAmount ?? (record.financialSummary?.taxAmount ?? calculatedTax);
  const fees = record.fees || 0;
  const billedTotal = roundMoney(subtotal + billedTax + fees);
  const calculatedTotal = roundMoney(subtotal + calculatedTax + fees);

  return {
    subtotal,
    taxRate,
    taxAmount: billedTax,
    totalAmount: billedTotal,
    currency,
    calculatedSubtotal: subtotal,
    calculatedTax,
    calculatedTotal,
    taxDiscrepancy: roundMoney(billedTax - calculatedTax),
    formula: `Subtotal (${formatCurrencyValue(subtotal, currency)}) + Fees (${formatCurrencyValue(fees, currency)}) = ${formatCurrencyValue(billedTotal, currency)}`
  };
}

/**
 * Pure deterministic function comparing cross-source virtualized procurement records.
 * Follows 4-way matching: Purchase Order vs Delivery Note vs Supplier Invoice vs Contract Price.
 * Supports single-item records and multi-line item invoices with subtotal and tax calculation.
 */
export function compareRecords(record: UnifiedRecord): Discrepancy[] {
  const discrepancies: Discrepancy[] = [];
  const currency = record.currency || "USD";

  // Dynamic row location lookup from source CSV files (for single-item baseline records)
  const poRef = findSourceRef("purchase_orders.csv", "po_id", record.poId, "ordered_qty");
  const delRef = findSourceRef("deliveries.csv", "po_id", record.poId, "delivered_qty");
  const invQtyRef = findSourceRef("invoices.csv", "po_id", record.poId, "invoiced_qty");
  const invPriceRef = findSourceRef("invoices.csv", "po_id", record.poId, "unit_price");
  const contractPriceRef = findSourceRef("contract_prices.csv", "supplier_id", record.supplierId, "contract_unit_price");
  const invFeeRef = findSourceRef("invoices.csv", "po_id", record.poId, "fees");

  // =========================================================================
  // MULTI-LINE ITEM INVOICE RECONCILIATION
  // =========================================================================
  if (record.lineItems && record.lineItems.length > 0) {
    const hasDeliveryRecord = Boolean(record.deliveryId && record.deliveryId.trim() !== "");

    // 1. Check for Duplicate Line Items within the same invoice
    const seenItemIds = new Map<string, number>();
    for (const item of record.lineItems) {
      const count = (seenItemIds.get(item.itemId) || 0) + 1;
      seenItemIds.set(item.itemId, count);
      if (count === 2) {
        const itemCurrency = item.currency || currency;
        const dupImpact = roundMoney(item.invoicedQty * item.invoiceUnitPrice);
        discrepancies.push({
          id: `DISC-DUP-ITEM-${record.poId}-${item.itemId}`,
          type: "DUPLICATE_ITEM",
          severity: "high",
          field: `line_items.${item.itemId}`,
          itemIdentifier: item.itemId,
          sourceA: {
            label: `Invoice ${record.invoiceId || "INV"} Line Item`,
            file: "invoices.csv",
            row: invQtyRef.row,
            column: "item",
            value: item.itemId
          },
          sourceB: {
            label: `Duplicate Line in Invoice ${record.invoiceId || "INV"}`,
            file: "invoices.csv",
            row: invQtyRef.row + 1,
            column: "item",
            value: item.itemId
          },
          delta: item.invoicedQty,
          financialImpact: dupImpact,
          currency: itemCurrency,
          reason: `Duplicate line item detected: Item "${item.itemId}" (${item.description}) is listed multiple times on invoice ${record.invoiceId || "INV"}.`,
          confidence: 0.99,
          remediationHint: `Remove duplicate line entry for ${item.itemId} and credit ${formatCurrencyValue(dupImpact, itemCurrency)}.`,
          calculation: {
            formula: `${item.invoicedQty} units × ${formatCurrencyValue(item.invoiceUnitPrice, itemCurrency)} = ${formatCurrencyValue(dupImpact, itemCurrency)}`,
            itemIdentifier: item.itemId,
            actualQty: item.invoicedQty,
            actualUnitPrice: item.invoiceUnitPrice,
            deltaQty: item.invoicedQty,
            subtotalImpact: dupImpact,
            currency: itemCurrency
          }
        });
      }
    }

    // 2. Iterate each line item for reconciliation
    for (const item of record.lineItems) {
      const itemCurrency = item.currency || currency;

      // Currency check
      if (item.currency && item.currency !== currency) {
        discrepancies.push({
          id: `DISC-CURRENCY-${record.poId}-${item.itemId}`,
          type: "CURRENCY_MISMATCH",
          severity: "high",
          field: `currency.${item.itemId}`,
          itemIdentifier: item.itemId,
          sourceA: {
            label: `Line Item ${item.itemId} Currency`,
            file: "invoices.csv",
            row: invQtyRef.row,
            column: "currency",
            value: item.currency
          },
          sourceB: {
            label: `Purchase Order ${record.poId} Currency`,
            file: "purchase_orders.csv",
            row: poRef.row,
            column: "currency",
            value: currency
          },
          delta: 0,
          financialImpact: 0,
          currency: itemCurrency,
          reason: `Currency conflict detected: Line item "${item.itemId}" is denominated in ${item.currency}, differing from PO currency ${currency}. Discrepancy amounts cannot be safely computed across mismatched currencies without an agreed exchange rate.`,
          confidence: 1.0,
          remediationHint: `Reissue invoice in contracted PO currency (${currency}) or confirm foreign exchange rate schedule.`,
          calculation: {
            formula: `Currency conflict: Line item ${item.currency} ≠ PO ${currency} (FX calculation required)`,
            itemIdentifier: item.itemId,
            currency: itemCurrency
          }
        });
      }

      // Invalid quantities / data integrity
      if (
        item.orderedQty < 0 ||
        item.deliveredQty < 0 ||
        item.invoicedQty < 0 ||
        isNaN(item.invoicedQty) ||
        isNaN(item.orderedQty)
      ) {
        discrepancies.push({
          id: `DISC-INVALID-DATA-${record.poId}-${item.itemId}`,
          type: "MISSING_EVIDENCE",
          severity: "high",
          field: `line_items.${item.itemId}.qty`,
          itemIdentifier: item.itemId,
          sourceA: {
            label: `Invoice Item ${item.itemId} Quantity`,
            file: "invoices.csv",
            row: invQtyRef.row,
            column: "invoiced_qty",
            value: item.invoicedQty
          },
          sourceB: {
            label: `PO Item ${item.itemId} Quantity`,
            file: "purchase_orders.csv",
            row: poRef.row,
            column: "ordered_qty",
            value: item.orderedQty
          },
          delta: 0,
          financialImpact: 0,
          currency: itemCurrency,
          reason: `Invalid or unparsable quantity value on line item ${item.itemId} (${item.description}). Quantities cannot be negative or undefined.`,
          confidence: 1.0,
          remediationHint: `Audit source records for data entry or parsing errors before approving.`,
          calculation: {
            formula: `Invalid quantity input: invoiced=${item.invoicedQty}, ordered=${item.orderedQty}`,
            itemIdentifier: item.itemId,
            currency: itemCurrency
          }
        });
        continue;
      }

      // Missing contract price for this item
      const hasItemContractPrice = typeof item.contractUnitPrice === "number" && item.contractUnitPrice > 0;
      if (!hasItemContractPrice) {
        discrepancies.push({
          id: `DISC-NO-CONTRACT-${record.poId}-${item.itemId}`,
          type: "MISSING_EVIDENCE",
          severity: "medium",
          field: `contract_prices.${item.itemId}`,
          itemIdentifier: item.itemId,
          sourceA: {
            label: `Invoice Item ${item.itemId} Unit Price`,
            file: "invoices.csv",
            row: invPriceRef.row,
            column: "unit_price",
            value: item.invoiceUnitPrice
          },
          sourceB: {
            label: `Contract Master Price for ${item.itemId}`,
            file: "contract_prices.csv",
            row: contractPriceRef.row,
            column: "contract_unit_price",
            value: "MISSING"
          },
          delta: 0,
          financialImpact: 0,
          currency: itemCurrency,
          reason: `Contract price missing: No active agreed contract price schedule exists for supplier ${record.supplierId} on item ${item.itemId} (${item.description}).`,
          confidence: 0.95,
          remediationHint: `Confirm contracted pricing schedule with procurement category manager.`,
          calculation: {
            formula: `Contract price not found for item ${item.itemId}`,
            itemIdentifier: item.itemId,
            currency: itemCurrency
          }
        });
      }

      // Quantity Overbill: Invoiced Qty > Delivered Qty (Goods Not Received)
      if (hasDeliveryRecord && item.invoicedQty > item.deliveredQty) {
        const qtyOverbillDelta = item.invoicedQty - item.deliveredQty;
        const overbillCost = roundMoney(qtyOverbillDelta * item.invoiceUnitPrice);

        discrepancies.push({
          id: `DISC-QTY-${record.poId}-${item.itemId}`,
          type: "QTY_OVERBILL",
          severity: "high",
          field: `line_items.${item.itemId}.qty`,
          itemIdentifier: item.itemId,
          sourceA: {
            label: `Invoice Item ${item.itemId} Invoiced Qty`,
            file: "invoices.csv",
            row: invQtyRef.row,
            column: "invoiced_qty",
            value: item.invoicedQty
          },
          sourceB: {
            label: `Delivery Note Item ${item.itemId} Received Qty`,
            file: "deliveries.csv",
            row: delRef.row,
            column: "delivered_qty",
            value: item.deliveredQty
          },
          delta: qtyOverbillDelta,
          financialImpact: overbillCost,
          currency: itemCurrency,
          reason: `Item ${item.itemId} (${item.description}): Invoice bills for ${item.invoicedQty} units, but warehouse receiving confirms receipt of ${item.deliveredQty} units (${qtyOverbillDelta} unreceived units billed).`,
          confidence: 0.98,
          remediationHint: `Issue debit note or credit memo crediting ${qtyOverbillDelta} units at ${formatCurrencyValue(item.invoiceUnitPrice, itemCurrency)} (${formatCurrencyValue(overbillCost, itemCurrency)}).`,
          calculation: {
            formula: `(${item.invoicedQty} invoiced - ${item.deliveredQty} received) × ${formatCurrencyValue(item.invoiceUnitPrice, itemCurrency)} = ${formatCurrencyValue(overbillCost, itemCurrency)}`,
            itemIdentifier: item.itemId,
            expectedQty: item.deliveredQty,
            actualQty: item.invoicedQty,
            expectedUnitPrice: item.contractUnitPrice || item.invoiceUnitPrice,
            actualUnitPrice: item.invoiceUnitPrice,
            deltaQty: qtyOverbillDelta,
            subtotalImpact: overbillCost,
            currency: itemCurrency
          }
        });
      }

      // Partial Delivery Check: Received < Ordered, but Invoiced <= Delivered (Supplier billed honestly)
      if (
        hasDeliveryRecord &&
        item.orderedQty > item.deliveredQty &&
        item.invoicedQty <= item.deliveredQty
      ) {
        const shortQty = item.orderedQty - item.deliveredQty;
        discrepancies.push({
          id: `DISC-PARTIAL-${record.poId}-${item.itemId}`,
          type: "PARTIAL_DELIVERY",
          severity: "low",
          field: `line_items.${item.itemId}.partial_delivery`,
          itemIdentifier: item.itemId,
          sourceA: {
            label: `PO ${record.poId} Item ${item.itemId} Ordered Qty`,
            file: "purchase_orders.csv",
            row: poRef.row,
            column: "ordered_qty",
            value: item.orderedQty
          },
          sourceB: {
            label: `Delivery Note Item ${item.itemId} Received Qty`,
            file: "deliveries.csv",
            row: delRef.row,
            column: "delivered_qty",
            value: item.deliveredQty
          },
          delta: shortQty,
          financialImpact: 0,
          currency: itemCurrency,
          reason: `Partial shipment for item ${item.itemId} (${item.description}): Received ${item.deliveredQty} of ${item.orderedQty} ordered units. Supplier billed only ${item.invoicedQty} delivered units.`,
          confidence: 0.99,
          remediationHint: `Track open balance of ${shortQty} units for backorder fulfillment or close balance with waiver.`,
          calculation: {
            formula: `${item.orderedQty} ordered - ${item.deliveredQty} received = ${shortQty} units pending on backorder`,
            itemIdentifier: item.itemId,
            expectedQty: item.orderedQty,
            actualQty: item.deliveredQty,
            deltaQty: shortQty,
            currency: itemCurrency
          }
        });
      }

      // Price Violation Check: Invoiced Unit Price > Contract Agreed Price
      if (hasItemContractPrice && item.invoiceUnitPrice > item.contractUnitPrice) {
        const priceDelta = roundMoney(item.invoiceUnitPrice - item.contractUnitPrice);
        // Apply strictly to delivered units (non-double-counting)
        const unitsToCalculate = item.deliveredQty > 0 ? item.deliveredQty : item.invoicedQty;
        const priceImpact = roundMoney(unitsToCalculate * priceDelta);

        discrepancies.push({
          id: `DISC-PRICE-${record.poId}-${item.itemId}`,
          type: "PRICE_ABOVE_CONTRACT",
          severity: "high",
          field: `line_items.${item.itemId}.unit_price`,
          itemIdentifier: item.itemId,
          sourceA: {
            label: `Invoice Item ${item.itemId} Unit Price`,
            file: "invoices.csv",
            row: invPriceRef.row,
            column: "unit_price",
            value: item.invoiceUnitPrice
          },
          sourceB: {
            label: `Contract Master Price for ${item.itemId}`,
            file: "contract_prices.csv",
            row: contractPriceRef.row,
            column: "contract_unit_price",
            value: item.contractUnitPrice
          },
          delta: priceDelta,
          financialImpact: priceImpact,
          currency: itemCurrency,
          reason: `Item ${item.itemId} (${item.description}): Billed price of ${formatCurrencyValue(item.invoiceUnitPrice, itemCurrency)}/unit exceeds contract agreed rate of ${formatCurrencyValue(item.contractUnitPrice, itemCurrency)}/unit by ${formatCurrencyValue(priceDelta, itemCurrency)} across ${unitsToCalculate} units.`,
          confidence: 0.95,
          remediationHint: `Adjust line item unit rate down to contract baseline ${formatCurrencyValue(item.contractUnitPrice, itemCurrency)}. Credit ${formatCurrencyValue(priceImpact, itemCurrency)}.`,
          calculation: {
            formula: `${unitsToCalculate} units × (${formatCurrencyValue(item.invoiceUnitPrice, itemCurrency)} - ${formatCurrencyValue(item.contractUnitPrice, itemCurrency)}) = ${formatCurrencyValue(priceImpact, itemCurrency)}`,
            itemIdentifier: item.itemId,
            expectedUnitPrice: item.contractUnitPrice,
            actualUnitPrice: item.invoiceUnitPrice,
            deltaPrice: priceDelta,
            subtotalImpact: priceImpact,
            currency: itemCurrency
          }
        });
      }
    }

    // 3. Tax Calculation & Subtotal Matching
    const calculatedSubtotal = roundMoney(
      record.lineItems.reduce((acc, it) => acc + roundMoney(it.invoicedQty * it.invoiceUnitPrice), 0)
    );
    const taxRate = record.taxRate ?? (record.financialSummary?.taxRate ?? 0);

    if (taxRate > 0) {
      const expectedTax = roundMoney(calculatedSubtotal * taxRate);
      const billedTax = record.taxAmount ?? record.financialSummary?.taxAmount;

      if (billedTax !== undefined && Math.abs(billedTax - expectedTax) > 0.01) {
        const taxVariance = roundMoney(billedTax - expectedTax);
        const taxImpact = taxVariance > 0 ? taxVariance : 0;
        discrepancies.push({
          id: `DISC-TAX-${record.poId}-01`,
          type: "TAX_MISMATCH",
          severity: "medium",
          field: "tax_amount",
          sourceA: {
            label: `Billed Tax on Invoice`,
            file: "invoices.csv",
            row: invQtyRef.row,
            column: "tax_amount",
            value: billedTax
          },
          sourceB: {
            label: `Expected Tax (${taxRate * 100}%)`,
            file: "tax_schedule",
            row: 0,
            column: "calculated_tax",
            value: expectedTax
          },
          delta: taxVariance,
          financialImpact: taxImpact,
          currency,
          reason: `Tax calculation discrepancy: Invoice billed ${formatCurrencyValue(billedTax, currency)} in tax, but ${taxRate * 100}% on subtotal of ${formatCurrencyValue(calculatedSubtotal, currency)} is ${formatCurrencyValue(expectedTax, currency)} (difference of ${formatCurrencyValue(taxVariance, currency)}).`,
          confidence: 0.99,
          remediationHint: `Re-compute tax amount using verified rate of ${taxRate * 100}% on net subtotal.`,
          calculation: {
            formula: `Billed Tax ${formatCurrencyValue(billedTax, currency)} - Expected Tax (${taxRate * 100}% × ${formatCurrencyValue(calculatedSubtotal, currency)} = ${formatCurrencyValue(expectedTax, currency)}) = ${formatCurrencyValue(taxVariance, currency)}`,
            taxVariance,
            taxImpact,
            currency
          }
        });
      }
    }

    // 4. Unexpected Fees on multi-item invoice
    if (record.fees > 0) {
      const feeImpact = roundMoney(record.fees);
      discrepancies.push({
        id: `DISC-FEE-${record.poId}-04`,
        type: "UNEXPECTED_FEE",
        severity: "medium",
        field: "fees",
        sourceA: {
          label: `Invoice Ancillary Fees`,
          file: "invoices.csv",
          row: invFeeRef.row,
          column: "fees",
          value: record.fees
        },
        sourceB: {
          label: `Contract Terms`,
          file: "contract_prices.csv",
          row: contractPriceRef.row,
          column: "valid_to",
          value: "Excluded in contract"
        },
        delta: feeImpact,
        financialImpact: feeImpact,
        currency,
        reason: `Invoice contains unexpected non-contracted ancillary fees of ${formatCurrencyValue(record.fees, currency)}.`,
        confidence: 0.92,
        remediationHint: `Reject non-contractual surcharge line item.`,
        calculation: {
          formula: `Ancillary fees billed: ${formatCurrencyValue(record.fees, currency)}`,
          subtotalImpact: feeImpact,
          currency
        }
      });
    }

    return discrepancies;
  }

  // =========================================================================
  // SINGLE-ITEM RECONCILIATION (Baseline & Canonical PO-1042)
  // =========================================================================

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
      remediationHint: `Audit source records for data entry or system parsing errors.`,
      calculation: {
        formula: `Invalid quantity input: invoiced=${record.invoicedQty}, ordered=${record.orderedQty}`,
        currency
      }
    });
    return discrepancies;
  }

  // 2. Missing Delivery Evidence Check
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
      financialImpact: 0,
      currency,
      reason: `Missing delivery record: No warehouse receiving note or delivery slip found for Purchase Order ${record.poId}. Goods receipt must be verified before payment disbursement.`,
      confidence: 0.99,
      remediationHint: `Request proof of physical delivery receipt from warehouse receiving before approving payment.`,
      calculation: {
        formula: `Missing delivery receipt for PO ${record.poId}. Delivery status unverified.`,
        currency
      }
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
      remediationHint: `Confirm contracted pricing schedule with procurement category manager.`,
      calculation: {
        formula: `Contract price missing for supplier ${record.supplierId}`,
        currency
      }
    });
  }

  // 4. Quantity Overbill Check: Invoiced Qty > Delivered Qty (Goods Not Received)
  if (hasDeliveryRecord && record.invoicedQty > record.deliveredQty) {
    const qtyOverbillDelta = record.invoicedQty - record.deliveredQty;
    const overbillCost = roundMoney(qtyOverbillDelta * record.invoiceUnitPrice);
    const unitPriceDisplay = formatCurrencyValue(record.invoiceUnitPrice, currency);
    const overbillDisplay = `(${formatCurrencyValue(overbillCost, currency)})`;

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
      remediationHint: `Issue debit note or request invoice amendment crediting ${qtyOverbillDelta} units at ${unitPriceDisplay} ${overbillDisplay}.`,
      calculation: {
        formula: `(${record.invoicedQty} invoiced - ${record.deliveredQty} received) × ${unitPriceDisplay} = ${formatCurrencyValue(overbillCost, currency)}`,
        expectedQty: record.deliveredQty,
        actualQty: record.invoicedQty,
        expectedUnitPrice: record.contractUnitPrice || record.invoiceUnitPrice,
        actualUnitPrice: record.invoiceUnitPrice,
        deltaQty: qtyOverbillDelta,
        subtotalImpact: overbillCost,
        currency
      }
    });
  }

  // 5. Price Violation Check: Invoiced Unit Price > Contract Agreed Price
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
      reason: `Invoice charges ${formatCurrencyValue(record.invoiceUnitPrice, currency)}/unit which exceeds master supplier contract agreed rate of ${formatCurrencyValue(record.contractUnitPrice, currency)}/unit by ${formatCurrencyValue(priceDelta, currency)} per unit on ${unitsToCalculate} delivered units.`,
      confidence: 0.95,
      remediationHint: `Adjust line item unit rate from ${formatCurrencyValue(record.invoiceUnitPrice, currency)} down to contract baseline ${formatCurrencyValue(record.contractUnitPrice, currency)}. Recover ${formatCurrencyValue(priceImpact, currency)}.`,
      calculation: {
        formula: `${unitsToCalculate} units × (${formatCurrencyValue(record.invoiceUnitPrice, currency)} - ${formatCurrencyValue(record.contractUnitPrice, currency)}) = ${formatCurrencyValue(priceImpact, currency)}`,
        expectedUnitPrice: record.contractUnitPrice,
        actualUnitPrice: record.invoiceUnitPrice,
        deltaPrice: priceDelta,
        subtotalImpact: priceImpact,
        currency
      }
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
      financialImpact: 0,
      currency,
      reason: `Warehouse received ${record.deliveredQty} units against purchase order of ${record.orderedQty}. Supplier did not overbill, but shipment is short by ${shortQty} units.`,
      confidence: 0.99,
      remediationHint: `Log open balance of ${shortQty} units for backorder or close PO with partial delivery waiver.`,
      calculation: {
        formula: `${record.orderedQty} ordered - ${record.deliveredQty} received = ${shortQty} units pending on backorder`,
        expectedQty: record.orderedQty,
        actualQty: record.deliveredQty,
        deltaQty: shortQty,
        currency
      }
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
      reason: `Invoice contains unexpected non-contracted ancillary fees of ${formatCurrencyValue(record.fees, currency)}.`,
      confidence: 0.92,
      remediationHint: `Reject non-contractual surcharge line item.`,
      calculation: {
        formula: `Ancillary fees billed: ${formatCurrencyValue(record.fees, currency)}`,
        subtotalImpact: feeImpact,
        currency
      }
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
      remediationHint: `Immediately halt processing for duplicate invoice ${duplicateInvoice.invoiceId} and recover ${formatCurrencyValue(dupImpact, currency)}.`,
      calculation: {
        formula: `Duplicate Invoice ${duplicateInvoice.invoiceId}: ${duplicateInvoice.invoicedQty} units × ${formatCurrencyValue(duplicateInvoice.unitPrice, currency)} = ${formatCurrencyValue(dupImpact, currency)}`,
        deltaQty: duplicateInvoice.invoicedQty,
        subtotalImpact: dupImpact,
        currency
      }
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
  // Compute financial breakdown
  const financialSummary = calculateInvoiceBreakdown(record);
  record.financialSummary = financialSummary;

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
