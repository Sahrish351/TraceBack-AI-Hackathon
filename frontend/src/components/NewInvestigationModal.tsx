import React, { useState } from "react";
import { X, Play, RefreshCw, Sparkles, CheckCircle2 } from "lucide-react";
import { CustomAuditParams } from "../types";

interface NewInvestigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (params: CustomAuditParams) => void;
}

export const NewInvestigationModal: React.FC<NewInvestigationModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  if (!isOpen) return null;

  const [poId, setPoId] = useState("PO-CUSTOM");
  const [supplierId, setSupplierId] = useState("Alpha Logistics Ltd");
  const [item, setItem] = useState("Industrial Valve Assemblies");
  const [currency, setCurrency] = useState("USD");
  const [orderedQty, setOrderedQty] = useState(150);
  const [deliveredQty, setDeliveredQty] = useState(120);
  const [invoicedQty, setInvoicedQty] = useState(150);
  const [poUnitPrice, setPoUnitPrice] = useState(80);
  const [invoiceUnitPrice, setInvoiceUnitPrice] = useState(85);
  const [contractUnitPrice, setContractUnitPrice] = useState(80);
  const [fees, setFees] = useState(0);

  const handlePopulateCanonical = () => {
    setPoId("PO-1042");
    setSupplierId("Northstar Office Supplies");
    setItem("Ergonomic Office Chairs");
    setCurrency("Rs");
    setOrderedQty(120);
    setDeliveredQty(100);
    setInvoicedQty(120);
    setPoUnitPrice(500);
    setInvoiceUnitPrice(500);
    setContractUnitPrice(500);
    setFees(0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      poId,
      supplierId,
      item,
      orderedQty,
      deliveredQty,
      invoicedQty,
      poUnitPrice,
      invoiceUnitPrice,
      contractUnitPrice,
      fees
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#143D2F]/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl border border-[#E5E7E2] shadow-modal w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-[#E5E7E2] flex items-center justify-between bg-[#FAF8F3]/50">
          <div>
            <h2 className="font-serif text-lg font-bold text-[#143D2F]">
              Start New Investigation
            </h2>
            <p className="text-xs text-[#667066]">
              Configure custom reconciliation parameters or load the canonical demo case.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#8F9A8F] hover:text-[#143D2F] hover:bg-[#FAF8F3] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick presets */}
        <div className="px-6 pt-4 flex items-center justify-between">
          <span className="text-xs font-semibold text-[#667066] uppercase tracking-wide">
            Quick Template
          </span>
          <button
            type="button"
            onClick={handlePopulateCanonical}
            className="text-xs text-[#246B52] hover:underline font-semibold flex items-center gap-1"
          >
            <span>Load Northstar Case (PO-1042 / Rs 10,000)</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-medium text-[#202720] block mb-1">Purchase Order ID</label>
              <input
                type="text"
                value={poId}
                onChange={(e) => setPoId(e.target.value)}
                required
                className="w-full p-2 bg-[#FAF8F3] border border-[#E5E7E2] rounded-lg text-xs font-mono text-[#143D2F] focus:outline-none focus:border-[#246B52]"
              />
            </div>
            <div>
              <label className="font-medium text-[#202720] block mb-1">Supplier Name</label>
              <input
                type="text"
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                required
                className="w-full p-2 bg-[#FAF8F3] border border-[#E5E7E2] rounded-lg text-xs text-[#143D2F] focus:outline-none focus:border-[#246B52]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-medium text-[#202720] block mb-1">Item Description</label>
              <input
                type="text"
                value={item}
                onChange={(e) => setItem(e.target.value)}
                required
                className="w-full p-2 bg-[#FAF8F3] border border-[#E5E7E2] rounded-lg text-xs text-[#143D2F] focus:outline-none focus:border-[#246B52]"
              />
            </div>
            <div>
              <label className="font-medium text-[#202720] block mb-1">Currency</label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                required
                className="w-full p-2 bg-[#FAF8F3] border border-[#E5E7E2] rounded-lg text-xs font-mono text-[#143D2F] focus:outline-none focus:border-[#246B52]"
              />
            </div>
          </div>

          {/* Quantities */}
          <div className="grid grid-cols-3 gap-3 text-xs pt-2 border-t border-[#E5E7E2]">
            <div>
              <label className="font-medium text-[#667066] block mb-1">Ordered Qty</label>
              <input
                type="number"
                min="1"
                value={orderedQty}
                onChange={(e) => setOrderedQty(Number(e.target.value))}
                required
                className="w-full p-2 bg-[#FAF8F3] border border-[#E5E7E2] rounded-lg text-xs font-mono focus:outline-none focus:border-[#246B52]"
              />
            </div>
            <div>
              <label className="font-medium text-[#667066] block mb-1">Delivered Qty</label>
              <input
                type="number"
                min="0"
                value={deliveredQty}
                onChange={(e) => setDeliveredQty(Number(e.target.value))}
                required
                className="w-full p-2 bg-[#FAF8F3] border border-[#E5E7E2] rounded-lg text-xs font-mono focus:outline-none focus:border-[#246B52]"
              />
            </div>
            <div>
              <label className="font-medium text-[#C66A4A] block mb-1 font-semibold">Invoiced Qty</label>
              <input
                type="number"
                min="1"
                value={invoicedQty}
                onChange={(e) => setInvoicedQty(Number(e.target.value))}
                required
                className="w-full p-2 bg-[#FDF1ED] border border-[#F3C5B5] rounded-lg text-xs font-mono font-bold text-[#C66A4A] focus:outline-none focus:border-[#C66A4A]"
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <label className="font-medium text-[#667066] block mb-1">PO Rate</label>
              <input
                type="number"
                step="0.01"
                value={poUnitPrice}
                onChange={(e) => setPoUnitPrice(Number(e.target.value))}
                className="w-full p-2 bg-[#FAF8F3] border border-[#E5E7E2] rounded-lg text-xs font-mono focus:outline-none focus:border-[#246B52]"
              />
            </div>
            <div>
              <label className="font-medium text-[#667066] block mb-1">Contract Rate</label>
              <input
                type="number"
                step="0.01"
                value={contractUnitPrice}
                onChange={(e) => setContractUnitPrice(Number(e.target.value))}
                className="w-full p-2 bg-[#FAF8F3] border border-[#E5E7E2] rounded-lg text-xs font-mono focus:outline-none focus:border-[#246B52]"
              />
            </div>
            <div>
              <label className="font-medium text-[#667066] block mb-1">Invoiced Rate</label>
              <input
                type="number"
                step="0.01"
                value={invoiceUnitPrice}
                onChange={(e) => setInvoiceUnitPrice(Number(e.target.value))}
                className="w-full p-2 bg-[#FAF8F3] border border-[#E5E7E2] rounded-lg text-xs font-mono focus:outline-none focus:border-[#246B52]"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#E5E7E2] flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#667066] hover:text-[#143D2F] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center space-x-2 bg-[#246B52] hover:bg-[#1D5642] text-white px-5 py-2 rounded-lg text-xs font-semibold transition shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Run Reconciliation</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
