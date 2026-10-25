import React, { useState } from "react";
import { Search, ChevronRight, PlusCircle, Filter } from "lucide-react";
import { PurchaseOrderItem } from "../types";

interface InvestigationsListScreenProps {
  purchaseOrders: PurchaseOrderItem[];
  onSelectPo: (poId: string) => void;
  onNewInvestigation: () => void;
}

export const InvestigationsListScreen: React.FC<InvestigationsListScreenProps> = ({
  purchaseOrders,
  onSelectPo,
  onNewInvestigation
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "review" | "clean">("all");

  const filtered = purchaseOrders.filter((po) => {
    const matchesSearch =
      po.poId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.supplierId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.item.toLowerCase().includes(searchTerm.toLowerCase());

    const isClean = po.poId === "PO-1002";
    if (statusFilter === "clean") return matchesSearch && isClean;
    if (statusFilter === "review") return matchesSearch && !isClean;
    return matchesSearch;
  });

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#143D2F]">Investigations</h1>
          <p className="text-sm text-[#667066] mt-1">
            Search, filter, and inspect supplier invoice reconciliation cases.
          </p>
        </div>

        <button
          onClick={onNewInvestigation}
          className="inline-flex items-center space-x-2 bg-[#246B52] hover:bg-[#1D5642] text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Investigation</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E5E7E2] shadow-card flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#8F9A8F] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by PO, supplier, item..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#FAF8F3] border border-[#E5E7E2] rounded-lg text-xs text-[#202720] focus:outline-none focus:border-[#246B52]"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="flex items-center space-x-1.5 text-xs text-[#667066]">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-[#FAF8F3] border border-[#E5E7E2] rounded-lg text-xs py-1.5 px-2.5 text-[#202720] focus:outline-none focus:border-[#246B52]"
          >
            <option value="all">All Statuses</option>
            <option value="review">Requires Review</option>
            <option value="clean">Resolved / Clean</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E5E7E2] shadow-card overflow-hidden">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-[#FAF8F3] border-b border-[#E5E7E2] text-xs font-semibold text-[#667066] uppercase tracking-wider">
              <th className="py-3 px-5">Investigation ID</th>
              <th className="py-3 px-5">Supplier Name</th>
              <th className="py-3 px-5">Item Scope</th>
              <th className="py-3 px-5">Total Ordered</th>
              <th className="py-3 px-5">Audit Status</th>
              <th className="py-3 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7E2]">
            {filtered.map((po) => {
              const isCanonical = po.poId === "PO-1042";
              const isClean = po.poId === "PO-1002";

              return (
                <tr
                  key={po.poId}
                  onClick={() => onSelectPo(po.poId)}
                  className={`hover:bg-[#FAF8F3]/60 transition cursor-pointer ${
                    isCanonical ? "bg-[#FAF8F3]/40" : ""
                  }`}
                >
                  <td className="py-3.5 px-5 font-semibold text-[#143D2F]">
                    <div className="flex items-center space-x-1.5">
                      <span>{po.poId}</span>
                      {isCanonical && (
                        <span className="text-[9px] bg-[#C66A4A] text-white px-1.5 py-0.5 rounded font-bold uppercase">
                          Demo Case
                        </span>
                      )}
                      {po.poId === "PO-2005" && (
                        <span className="text-[9px] bg-[#246B52] text-white px-1.5 py-0.5 rounded font-bold uppercase">
                          Multi-Item
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-5 font-medium text-[#202720]">{po.supplierId}</td>
                  <td className="py-3.5 px-5 text-xs text-[#667066]">{po.item}</td>
                  <td className="py-3.5 px-5 font-mono text-xs text-[#202720]">
                    {po.currency} {(po.orderedQty * po.unitPrice).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-5">
                    {isClean ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#EAF3ED] text-[#246B52] border border-[#DCEBE1]">
                        Resolved
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#FDF1ED] text-[#C66A4A] border border-[#F3C5B5]">
                        Requires Review
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPo(po.poId);
                      }}
                      className="inline-flex items-center space-x-1 px-3 py-1 rounded bg-[#FAF8F3] hover:bg-[#DCEBE1] text-xs font-medium text-[#143D2F] border border-[#E5E7E2] transition"
                    >
                      <span>Open</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#246B52]" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

