import React from "react";
import { CheckCircle2, ShieldAlert, Sparkles, FileText } from "lucide-react";
import { Discrepancy } from "../types";
import { EvidenceCard } from "./EvidenceCard";

interface EvidenceTrailProps {
  discrepancies: Discrepancy[];
  poId: string;
  onInspectSource: (fileName: string, rowNumber: number, columnName: string) => void;
}

export const EvidenceTrail: React.FC<EvidenceTrailProps> = ({
  discrepancies,
  poId,
  onInspectSource
}) => {
  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-400" />
            Reconciliation Evidence Trail
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Every discrepancy cites exact data coordinates: <code className="text-indigo-300 font-mono text-[11px]">&#123;file, row, column, value&#125;</code>
          </p>
        </div>
        <div className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
          Target PO: <span className="text-white font-bold">{poId}</span>
        </div>
      </div>

      {/* Discrepancies List or Clean State */}
      {discrepancies.length > 0 ? (
        <div className="space-y-4">
          {discrepancies.map((disc) => (
            <EvidenceCard
              key={disc.id}
              discrepancy={disc}
              onInspectSource={onInspectSource}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-8 text-center space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">
            100% Concordance — Clean Audit
          </h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            All 4-way cross-source checks verified: Invoiced quantity matches received goods note, unit rates align with master contract pricing, and zero unauthorized fees or duplicate records exist.
          </p>
          <div className="pt-2">
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Confidence Score: 100% • Standard Payment Terms Approved
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
