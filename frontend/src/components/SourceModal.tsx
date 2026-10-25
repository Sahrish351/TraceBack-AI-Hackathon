import React, { useEffect, useState } from "react";
import { X, FileSpreadsheet, Eye, Info, Database } from "lucide-react";
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
        if (isMounted) setError(err.message);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-850/80">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Raw Virtualized Data Viewer
                <span className="text-xs font-mono font-normal text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  {activeFile}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Ground-truth audit proof from the underlying data source
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* File Tabs */}
        <div className="flex items-center space-x-2 px-4 py-2 border-b border-slate-800 bg-slate-900/60 overflow-x-auto">
          {availableFiles.map((f) => (
            <button
              key={f.name}
              onClick={() => setActiveFile(f.name)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 ${
                activeFile === f.name
                  ? "bg-indigo-600 text-white shadow"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-700/80"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Modal Body / Table View */}
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="py-16 text-center space-y-2">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Loading virtualized source data...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-rose-400 text-sm">
              Failed to load source file: {error}
            </div>
          ) : fileData ? (
            <div className="space-y-3">
              {/* Highlight Legend */}
              {highlightRow && (
                <div className="flex items-center justify-between text-xs bg-indigo-950/30 border border-indigo-500/20 px-3 py-2 rounded-xl text-indigo-300">
                  <div className="flex items-center space-x-2">
                    <Info className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>
                      Evidence Citation: Citing Line{" "}
                      <strong className="text-white font-mono">L{highlightRow}</strong>
                      {highlightColumn && (
                        <span>
                          , Column <strong className="text-white font-mono">[{highlightColumn}]</strong>
                        </span>
                      )}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded">
                    Highlighted Row
                  </span>
                </div>
              )}

              {/* Data Table */}
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/50">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-850/90 text-slate-400 font-mono">
                      <th className="py-2.5 px-3 border-r border-slate-800 w-16 text-center">
                        Row #
                      </th>
                      {fileData.headers.map((h) => (
                        <th
                          key={h}
                          className={`py-2.5 px-3 border-r border-slate-800 font-semibold ${
                            h === highlightColumn ? "text-indigo-400 bg-indigo-950/40" : "text-slate-300"
                          }`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {fileData.rows.map((row) => {
                      const isHighlightedRow = row.rowNumber === highlightRow;

                      return (
                        <tr
                          key={row.rowNumber}
                          className={`border-b border-slate-800/60 font-mono transition ${
                            isHighlightedRow
                              ? "bg-indigo-950/40 text-white font-medium ring-1 ring-inset ring-indigo-500/40"
                              : "hover:bg-slate-850/40 text-slate-300"
                          }`}
                        >
                          <td className="py-2.5 px-3 border-r border-slate-800 text-center text-slate-400 font-bold">
                            {row.rowNumber}
                          </td>
                          {fileData.headers.map((h) => {
                            const isHighlightedCell = isHighlightedRow && h === highlightColumn;

                            return (
                              <td
                                key={h}
                                className={`py-2.5 px-3 border-r border-slate-800/80 ${
                                  isHighlightedCell
                                    ? "bg-indigo-600/30 text-indigo-200 font-bold outline outline-1 outline-indigo-400"
                                    : ""
                                }`}
                              >
                                {row.values[h] ?? "-"}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-850/80 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 font-mono">
            <Database className="w-3.5 h-3.5 text-cyan-400" /> Virtualized via Zetaris Data Virtualization
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
