import React, { useState } from "react";
import { X, Play, Sliders, Sparkles, RefreshCw } from "lucide-react";
import { CustomAuditParams, InvestigationResult } from "../types";
import { runCustomAudit } from "../api/client";

interface SimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulationComplete: (result: InvestigationResult) => void;
}

export const SimulationModal: React.FC<SimulationModalProps> = ({
  isOpen,
  onClose,
  onSimulationComplete
}) => {
  const [params, setParams] = useState<CustomAuditParams>({
    poId: "PO-SIM-800",
    supplierId: "SUP-CUSTOM",
    item: "Industrial Valves",
    orderedQty: 150,
    deliveredQty: 120,
    invoicedQty: 150,
    poUnitPrice: 75,
    invoiceUnitPrice: 75,
    contractUnitPrice: 68,
    fees: 250
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: "overbill" | "clean" | "gouging") => {
    if (preset === "overbill") {
      setParams({
        poId: "PO-SIM-OVERBILL",
        supplierId: "SUP-VALVE-CORP",
        item: "High-Pressure Valves",
        orderedQty: 100,
        deliveredQty: 75,
        invoicedQty: 100,
        poUnitPrice: 120,
        invoiceUnitPrice: 120,
        contractUnitPrice: 120,
        fees: 0
      });
    } else if (preset === "gouging") {
      setParams({
        poId: "PO-SIM-GOUGE",
        supplierId: "SUP-RAW-MATERIALS",
        item: "Grade-A Steel Sheets",
        orderedQty: 200,
        deliveredQty: 200,
        invoicedQty: 200,
        poUnitPrice: 80,
        invoiceUnitPrice: 95,
        contractUnitPrice: 80,
        fees: 400
      });
    } else {
      setParams({
        poId: "PO-SIM-CLEAN",
        supplierId: "SUP-HONEST-CORP",
        item: "Standard Gaskets",
        orderedQty: 500,
        deliveredQty: 500,
        invoicedQty: 500,
        poUnitPrice: 5,
        invoiceUnitPrice: 5,
        contractUnitPrice: 5,
        fees: 0
      });
    }
  };

  const handleRunSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await runCustomAudit(params);
      onSimulationComplete(result);
      onClose();
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-850 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Live Audit Simulation Engine
              </h2>
              <p className="text-xs text-slate-400">
                Test any custom purchase order & supplier invoice parameters
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="px-4 py-2.5 border-b border-slate-800 bg-slate-950/60 flex items-center space-x-2 text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Presets:
          </span>
          <button
            type="button"
            onClick={() => handleApplyPreset("overbill")}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs transition"
          >
            25 Unreceived Units
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset("gouging")}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs transition"
          >
            +$15 Rate Gouging + Fee
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset("clean")}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs transition"
          >
            100% Clean Order
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleRunSimulation} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-slate-400 block mb-1 font-medium">PO Reference ID</label>
              <input
                type="text"
                value={params.poId}
                onChange={(e) => setParams({ ...params, poId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1 font-medium">Supplier Code</label>
              <input
                type="text"
                value={params.supplierId}
                onChange={(e) => setParams({ ...params, supplierId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1 font-medium">Item Name</label>
              <input
                type="text"
                value={params.item}
                onChange={(e) => setParams({ ...params, item: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 bg-slate-850/50 p-3 rounded-xl border border-slate-800">
            <div>
              <label className="text-slate-400 block mb-1 font-medium">PO Ordered Qty</label>
              <input
                type="number"
                value={params.orderedQty}
                onChange={(e) => setParams({ ...params, orderedQty: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                required
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1 font-medium text-amber-300">
                Delivered Qty (WMS)
              </label>
              <input
                type="number"
                value={params.deliveredQty}
                onChange={(e) => setParams({ ...params, deliveredQty: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                required
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1 font-medium text-rose-300">
                Invoiced Qty (AP)
              </label>
              <input
                type="number"
                value={params.invoicedQty}
                onChange={(e) => setParams({ ...params, invoicedQty: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 bg-slate-850/50 p-3 rounded-xl border border-slate-800">
            <div>
              <label className="text-slate-400 block mb-1 font-medium text-emerald-300">
                Contract Rate ($/unit)
              </label>
              <input
                type="number"
                step="0.01"
                value={params.contractUnitPrice}
                onChange={(e) => setParams({ ...params, contractUnitPrice: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                required
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1 font-medium text-rose-300">
                Invoiced Rate ($/unit)
              </label>
              <input
                type="number"
                step="0.01"
                value={params.invoiceUnitPrice}
                onChange={(e) => setParams({ ...params, invoiceUnitPrice: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                required
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1 font-medium text-purple-300">
                Ancillary Fees ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={params.fees}
                onChange={(e) => setParams({ ...params, fees: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-800">
            <span className="text-[11px] text-slate-400">
              Evaluated via Meterless Mission + Zetaris Virtualizer
            </span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{loading ? "Reconciling..." : "Run Live Audit"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
