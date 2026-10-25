import React, { useState } from "react";
import {
  Mail,
  Copy,
  Check,
  Send,
  Sparkles,
  Cpu,
  FileCheck2,
  ExternalLink
} from "lucide-react";
import { ExplanationOutput } from "../types";

interface EmailPreviewProps {
  explanation: ExplanationOutput;
  poId: string;
}

export const EmailPreview: React.FC<EmailPreviewProps> = ({
  explanation,
  poId
}) => {
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);
  const [toAddress, setToAddress] = useState(explanation.supplierEmail.to);
  const [subject, setSubject] = useState(explanation.supplierEmail.subject);
  const [body, setBody] = useState(explanation.supplierEmail.body);

  const handleCopy = () => {
    const fullText = `To: ${toAddress}\nSubject: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSend = () => {
    setSent(true);
    setTimeout(() => setSent(false), 3500);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg shadow-slate-950/40 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Supplier Clarification & Dispute Email
            </h2>
            <p className="text-xs text-slate-400">
              Drafted by NVIDIA NIM: <span className="text-purple-300 font-mono text-[11px]">{explanation.modelUsed}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition flex items-center gap-1.5"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copy Email
              </>
            )}
          </button>
          <button
            onClick={handleSend}
            disabled={sent}
            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5 disabled:opacity-50"
          >
            {sent ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" /> Dispute Dispatched
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" /> Dispatch to Supplier
              </>
            )}
          </button>
        </div>
      </div>

      {/* Executive Summary Rationale Callout */}
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 space-y-1.5 text-xs">
        <span className="font-semibold text-purple-300 uppercase tracking-wider text-[10px] block">
          Auditor Executive Rationale
        </span>
        <p className="text-slate-300 leading-relaxed font-sans">
          {explanation.executiveSummary}
        </p>
      </div>

      {/* Email Container */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/80 overflow-hidden font-mono text-xs">
        {/* Email Meta Fields */}
        <div className="border-b border-slate-800 p-3 space-y-2 bg-slate-900/60 font-sans">
          <div className="flex items-center">
            <span className="w-16 text-slate-400 text-xs font-medium">To:</span>
            <input
              type="text"
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              className="flex-1 bg-transparent border-0 text-white text-xs focus:ring-0 focus:outline-none font-mono"
            />
          </div>
          <div className="flex items-center">
            <span className="w-16 text-slate-400 text-xs font-medium">Subject:</span>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="flex-1 bg-transparent border-0 text-white text-xs font-semibold focus:ring-0 focus:outline-none"
            />
          </div>
        </div>

        {/* Email Body */}
        <div className="p-3">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={12}
            className="w-full bg-transparent text-slate-200 border-0 focus:ring-0 focus:outline-none resize-none font-sans text-xs leading-relaxed"
          />
        </div>
      </div>

      {/* Dispatch Confirmation Toast */}
      {sent && (
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 flex items-center justify-between text-xs text-emerald-300 animate-in fade-in">
          <span className="flex items-center gap-1.5">
            <FileCheck2 className="w-4 h-4 text-emerald-400" /> Clarification email successfully dispatched to supplier portal queue.
          </span>
          <span className="font-mono text-[10px] text-emerald-400">
            Audit Ticket #DISP-{poId}
          </span>
        </div>
      )}
    </div>
  );
};
