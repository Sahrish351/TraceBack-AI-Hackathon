import React, { useEffect, useState } from "react";
import { X, FileSpreadsheet, Eye, Info, Database, ExternalLink } from "lucide-react";
import { fetchRawSource } from "../api/client";
import { CsvFileDump } from "../types";

interface SourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFile: string;
  highlightRow?: number;
  highlightColumn?: string;
}

export const SourceModal: React.FC<SourceModalProps> = ({
  isOpen,
  onClose,
  initialFile,
  highlightRow,
  highlightColumn
}) => {
  const [activeFile, setActiveFile] = useState<string>(initialFile);
  const [fileData, setFileData] = useState<CsvFileDump | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const availableFiles = [
    { name: "purchase_orders.csv", label: "Purchase Orders" },
    { name: "deliveries.csv", label: "Deliveries (WMS)" },
    { name: "invoices.csv", label: "Supplier Invoices" },
    { name: "contract_prices.csv", label: "Contract Prices" }
  ];

  useEffect(() => {
    if (initialFile) {
      setActiveFile(initialFile);
    }
  }, [initialFile]);

  useEffect(() => {
    if (!isOpen || !activeFile) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchRawSource(activeFile)
      .then((data) => {
        if (isMounted) setFileData(data);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || "Failed to load CSV source file.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, activeFile]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#143D2F]/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl border border-[#E5E7E2] shadow-modal w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-[#E5E7E2] flex items-center justify-between bg-[#FAF8F3]/50">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-[#EAF3ED] text-[#246B52] flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-[#143D2F]">
                Source Record Inspector
              </h2>
              <p className="text-xs text-[#667066]">
                Inspect normalized ground-truth CSV lines federated by the virtualization layer.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8F9A8F] hover:text-[#143D2F] hover:bg-[#FAF8F3] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="px-6 py-2.5 bg-[#FAF8F3] border-b border-[#E5E7E2] flex items-center space-x-2 overflow-x-auto">
          {availableFiles.map((f) => (
            <button
              key={f.name}
              onClick={() => setActiveFile(f.name)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeFile === f.name
                  ? "bg-[#246B52] text-white shadow-sm font-semibold"
                  : "bg-white text-[#667066] border border-[#E5E7E2] hover:bg-[#EAF3ED] hover:text-[#143D2F]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-xs text-[#667066]">
              <span>Loading raw file data...</span>
            </div>
          ) : error ? (
            <div className="p-4 rounded-lg bg-[#FDF1ED] text-[#C66A4A] text-xs">
              {error}
            </div>
          ) : fileData ? (
            <div className="border border-[#E5E7E2] rounded-xl overflow-hidden shadow-card">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF8F3] border-b border-[#E5E7E2] font-semibold text-[#667066] uppercase">
                    <th className="py-2.5 px-4 w-14 text-center">Row</th>
                    {fileData.headers.map((h) => (
                      <th
                        key={h}
                        className={`py-2.5 px-4 font-mono ${
                          h === highlightColumn ? "text-[#C66A4A] bg-[#FDF1ED]" : ""
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7E2]">
                  {fileData.rows.map((row) => {
                    const isHighlightedRow = row.rowNumber === highlightRow;
                    return (
                      <tr
                        key={row.rowNumber}
                        className={`font-mono transition ${
                          isHighlightedRow ? "bg-[#FDF1ED] font-semibold" : "hover:bg-[#FAF8F3]/60"
                        }`}
                      >
                        <td className="py-2 px-4 text-center text-[#8F9A8F] bg-[#FAF8F3]">
                          {row.rowNumber}
                        </td>
                        {fileData.headers.map((h) => (
                          <td
                            key={h}
                            className={`py-2 px-4 ${
                              isHighlightedRow && h === highlightColumn
                                ? "text-[#C66A4A] font-bold underline"
                                : "text-[#202720]"
                            }`}
                          >
                            {row.values[h] ?? "-"}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E5E7E2] bg-[#FAF8F3]/50 flex items-center justify-between text-xs text-[#667066]">
          <span>Source path: <code className="text-[#143D2F]">data/{activeFile}</code></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#246B52] hover:bg-[#1D5642] text-white font-medium shadow-sm transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
