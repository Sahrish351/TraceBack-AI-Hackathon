import React, { useState } from "react";
import { Send, Bot, User, Sparkles, HelpCircle, MessageSquare } from "lucide-react";
import { ChatMessage } from "../types";
import { sendChatMessage } from "../api/client";

interface AuditorChatProps {
  poId: string;
}

export const AuditorChat: React.FC<AuditorChatProps> = ({ poId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m-1",
      sender: "agent",
      text: `Hello! I am your TraceBack AI Auditor Copilot powered by NVIDIA NIM (meta/llama-3.1-8b-instruct). I have full cross-source visibility across purchase_orders.csv, deliveries.csv, invoices.csv, and contract_prices.csv for ${poId}. Ask me any question about this order's reconciliation findings or contract terms.`,
      timestamp: new Date().toLocaleTimeString(),
      modelUsed: "meta/llama-3.1-8b-instruct (NVIDIA NIM)"
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);

  const suggestedQuestions = [
    "Why was $50 rate rejected?",
    "Where did goods arrive?",
    "Show contract terms",
    "Recommended recovery action",
    "Supplier risk assessment"
  ];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      const response = await sendChatMessage(userMsg.text, poId);
      const agentMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        sender: "agent",
        text: response.reply,
        timestamp: new Date().toLocaleTimeString(),
        modelUsed: response.modelUsed
      };
      setMessages((prev) => [...prev, agentMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: `e-${Date.now()}`,
        sender: "agent",
        text: "I was unable to retrieve an AI auditor response at this moment. Please verify backend connection.",
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl shadow-slate-950/40 flex flex-col h-[580px] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-850/80 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              AI Auditor Copilot
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                NVIDIA NIM • Llama 3.1
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Grounded in 4-way virtualized datasets for <strong className="text-slate-200">{poId}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Questions */}
      <div className="px-4 py-2 border-b border-slate-800/80 bg-slate-950/40 flex items-center space-x-2 overflow-x-auto text-xs">
        <span className="text-[11px] font-semibold text-slate-400 shrink-0 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Prompts:
        </span>
        {suggestedQuestions.map((q) => (
          <button
            key={q}
            onClick={() => handleSend(q)}
            disabled={loading}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition shrink-0 text-xs border border-slate-700/60"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-3 ${
              msg.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                msg.sender === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-purple-600/20 text-purple-300 border border-purple-500/30"
              }`}
            >
              {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[78%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                msg.sender === "user"
                  ? "bg-indigo-600 text-white rounded-tr-none"
                  : "bg-slate-850 border border-slate-800 text-slate-200 rounded-tl-none shadow-md"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
              <div
                className={`mt-1.5 flex items-center justify-between text-[10px] ${
                  msg.sender === "user" ? "text-indigo-200" : "text-slate-400"
                }`}
              >
                <span>{msg.timestamp}</span>
                {msg.modelUsed && (
                  <span className="font-mono text-purple-300">{msg.modelUsed}</span>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-3 text-xs text-slate-400">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 flex items-center justify-center text-purple-300 border border-purple-500/30">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="bg-slate-850 border border-slate-800 rounded-2xl p-3 text-slate-400 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
              <span>NVIDIA NIM reasoning over virtualized tables...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-slate-800 bg-slate-850/90 flex items-center space-x-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={`Ask anything about ${poId} or dispute clauses...`}
          className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !inputText.trim()}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5 disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Ask</span>
        </button>
      </div>
    </div>
  );
};
