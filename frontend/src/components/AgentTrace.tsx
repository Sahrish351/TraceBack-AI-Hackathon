import React, { useState } from "react";
import {
  Cpu,
  Clock,
  ChevronDown,
  ChevronRight,
  Brain,
  Zap,
  CheckCircle2,
  Code2,
  Database,
  MemoryStick
} from "lucide-react";
import { MissionTrace, UnifiedRecord } from "../types";

interface AgentTraceProps {
  missionTrace: MissionTrace;
  unifiedRecord: UnifiedRecord;
}

export const AgentTrace: React.FC<AgentTraceProps> = ({
  missionTrace,
  unifiedRecord
}) => {
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
    5: true
  });
  const [showSql, setShowSql] = useState<boolean>(false);

  const toggleStep = (stepNumber: number) => {
    setExpandedSteps((prev) => ({
      ...prev,
      [stepNumber]: !prev[stepNumber]
    }));
  };

  const stepIcons: Record<string, React.ReactNode> = {
    scoutIntent: <Brain className="w-4 h-4 text-purple-400" />,
    fetchUnifiedData: <Database className="w-4 h-4 text-cyan-400" />,
    detectDiscrepancies: <Zap className="w-4 h-4 text-amber-400" />,
    scoreConfidence: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    draftExplanation: <Cpu className="w-4 h-4 text-indigo-400" />
  };

  const stepDisplayTitles: Record<string, string> = {
    scoutIntent: "Step 1: Scout Intent (Scope & Reconciliation Targets)",
    fetchUnifiedData: "Step 2: Fetch Unified Data (Zetaris Virtualization)",
    detectDiscrepancies: "Step 3: Detect Discrepancies (4-Way Comparison Rules)",
    scoreConfidence: "Step 4: Score Confidence & Risk Assessment",
    draftExplanation: "Step 5: Draft Explanation & Supplier Dispute (NVIDIA NIM)"
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg shadow-slate-950/40 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            Meterless Agent Mission Trace
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Architecture: <span className="text-indigo-300 font-medium">Scout Intent → Relay Execution → H-MEM Memory</span>
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> {missionTrace.totalDurationMs}ms
          </span>
          <button
            onClick={() => setShowSql(!showSql)}
            className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1"
          >
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            {showSql ? "Hide Zetaris SQL" : "View Zetaris SQL"}
          </button>
        </div>
      </div>

      {/* SQL Query Modal / Drawer */}
      {showSql && (
        <div className="rounded-xl border border-cyan-500/30 bg-slate-950 p-4 space-y-2 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" /> Zetaris Virtualization SQL Query
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Cross-Source 4-Way Join
            </span>
          </div>
          <pre className="text-xs font-mono text-cyan-100/90 overflow-x-auto p-3 rounded-lg bg-slate-900 border border-slate-800">
            {unifiedRecord.sqlQueryExecuted}
          </pre>
        </div>
      )}

      {/* Step by step execution trace */}
      <div className="space-y-3">
        {missionTrace.steps.map((st) => {
          const isExpanded = expandedSteps[st.step] ?? true;

          return (
            <div
              key={st.step}
              className="rounded-xl border border-slate-800/80 bg-slate-850/50 overflow-hidden transition"
            >
              {/* Step Header */}
              <button
                onClick={() => toggleStep(st.step)}
                className="w-full flex items-center justify-between p-3.5 text-left hover:bg-slate-800/40 transition"
              >
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-mono font-bold text-white">
                    {st.step}
                  </span>
                  <div className="flex items-center space-x-2">
                    {stepIcons[st.name]}
                    <span className="text-xs font-bold text-slate-200">
                      {stepDisplayTitles[st.name] || st.name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5">
                  <span className="text-[11px] font-mono text-slate-400">
                    {st.durationMs}ms
                  </span>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {st.status}
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Step Content */}
              {isExpanded && (
                <div className="p-3.5 pt-0 border-t border-slate-800/60 space-y-2 text-xs">
                  {/* Thought */}
                  <div className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-2.5">
                    <span className="text-[10px] font-mono font-bold uppercase text-purple-400 block mb-1">
                      Thought (Agent Reasoning)
                    </span>
                    <p className="text-slate-300 leading-relaxed font-mono text-[11px]">
                      {st.thought}
                    </p>
                  </div>

                  {/* Action */}
                  <div className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-2.5">
                    <span className="text-[10px] font-mono font-bold uppercase text-cyan-400 block mb-1">
                      Action (Relay Execution)
                    </span>
                    <p className="text-slate-300 leading-relaxed font-mono text-[11px]">
                      {st.action}
                    </p>
                  </div>

                  {/* Observation */}
                  <div className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-2.5">
                    <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 block mb-1">
                      Observation (Verified Result)
                    </span>
                    <p className="text-slate-300 leading-relaxed font-mono text-[11px]">
                      {st.observation}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Memory Footer */}
      <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/60 font-mono">
        <span className="flex items-center gap-1.5">
          <MemoryStick className="w-3.5 h-3.5 text-indigo-400" />
          H-MEM Key: <code className="text-indigo-300">{missionTrace.hMemKey || `mission:${missionTrace.poId}`}</code>
        </span>
        <span className="text-[11px] text-slate-400">
          Meterless Session Memory Persisted
        </span>
      </div>
    </div>
  );
};
