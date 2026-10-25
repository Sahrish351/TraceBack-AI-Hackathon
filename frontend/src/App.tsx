import React, { useEffect, useState } from "react";
import {
  fetchHealth,
  fetchPurchaseOrders,
  investigatePo,
  submitReview
} from "./api/client";
import {
  InvestigationResult,
  PurchaseOrderItem,
  SystemHealth
} from "./types";
import { Sidebar } from "./components/Sidebar";
import { SummaryCards } from "./components/SummaryCards";
import { EvidenceTrail } from "./components/EvidenceTrail";
import { AgentTrace } from "./components/AgentTrace";
import { ApprovalBar } from "./components/ApprovalBar";
import { EmailPreview } from "./components/EmailPreview";
import { SourceModal } from "./components/SourceModal";
import { PortfolioAnalytics } from "./components/PortfolioAnalytics";
import { AuditorChat } from "./components/AuditorChat";
import { SimulationModal } from "./components/SimulationModal";
import { AuditCertificateModal } from "./components/AuditCertificateModal";
import { SponsorTechHubModal } from "./components/SponsorTechHubModal";
import { Footer } from "./components/Footer";
import {
  ShieldAlert,
  Cpu,
  Mail,
  FileSpreadsheet,
  RefreshCw,
  Sparkles,
  ExternalLink,
  TrendingUp,
  MessageSquare,
  Award,
  Sliders
} from "lucide-react";

export const App: React.FC = () => {
  const [selectedPoId, setSelectedPoId] = useState<string>("PO-1001");
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderItem[]>([]);
  const [investigation, setInvestigation] = useState<InvestigationResult | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"evidence" | "trace" | "email" | "analytics" | "chat">("evidence");

  // Modals state
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    file: string;
    row?: number;
    column?: string;
  }>({
    isOpen: false,
    file: "purchase_orders.csv"
  });

  const [isSimulationOpen, setIsSimulationOpen] = useState(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [isSponsorHubOpen, setIsSponsorHubOpen] = useState(false);
  const [sponsorHubTab, setSponsorHubTab] = useState<"nvidia" | "zetaris" | "meterless" | "cursor">("nvidia");

  const handleOpenSponsorHub = (tab: "nvidia" | "zetaris" | "meterless" | "cursor") => {
    setSponsorHubTab(tab);
    setIsSponsorHubOpen(true);
  };

  // Load system health & PO list on initial mount
  useEffect(() => {
    fetchHealth()
      .then(setSystemHealth)
      .catch((err) => console.error("Health check error:", err));

    fetchPurchaseOrders()
      .then((pos) => {
        setPurchaseOrders(pos);
      })
      .catch((err) => console.error("PO list error:", err));
  }, []);

  // Run investigation whenever selected PO changes
  const runInvestigation = (poId: string) => {
    setLoading(true);
    investigatePo(poId)
      .then((res) => {
        setInvestigation(res);
      })
      .catch((err) => {
        console.error("Investigation error:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (selectedPoId) {
      runInvestigation(selectedPoId);
    }
  }, [selectedPoId]);

  const handleSelectPo = (poId: string) => {
    setSelectedPoId(poId);
    setActiveTab("evidence");
  };

  const handleReviewDecision = async (
    action: "approve" | "reject" | "request_clarification"
  ) => {
    if (!investigation) return;
    try {
      const res = await submitReview(investigation.poId, action);
      if (res.success && res.decision) {
        setInvestigation({
          ...investigation,
          reviewDecision: res.decision
        });
      }
    } catch (err) {
      console.error("Review decision error:", err);
    }
  };

  const handleInspectSource = (fileName: string, rowNumber: number, columnName: string) => {
    setModalState({
      isOpen: true,
      file: fileName,
      row: rowNumber,
      column: columnName
    });
  };

  const handleOpenSourceFile = (fileName: string) => {
    setModalState({
      isOpen: true,
      file: fileName,
      row: undefined,
      column: undefined
    });
  };

  const handleSimulationComplete = (simResult: InvestigationResult) => {
    setInvestigation(simResult);
    setSelectedPoId(simResult.poId);
    setActiveTab("evidence");
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        purchaseOrders={purchaseOrders}
        selectedPoId={selectedPoId}
        onSelectPo={handleSelectPo}
        systemHealth={systemHealth}
        loading={loading}
        onRefresh={() => runInvestigation(selectedPoId)}
        dataSourcesStatus={investigation?.dataSourcesStatus || null}
        onViewSourceFile={handleOpenSourceFile}
        onOpenSimulation={() => setIsSimulationOpen(true)}
        onOpenCertificate={() => setIsCertificateOpen(true)}
        onOpenSponsorHub={handleOpenSponsorHub}
      />

      {/* Main Investigation Panel */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/80 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-base font-bold text-white">
                  {selectedPoId}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-xs text-slate-300">
                  {investigation?.supplierId || "Supplier"}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-xs font-medium text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  {investigation?.item || "Widget-A"}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-1 bg-slate-850 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab("evidence")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === "evidence"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" /> Evidence Trail
              {investigation && investigation.discrepancies.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-500 text-[10px] text-white flex items-center justify-center font-bold">
                  {investigation.discrepancies.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("trace")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === "trace"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" /> Agent Trace
            </button>
            <button
              onClick={() => setActiveTab("email")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === "email"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Mail className="w-3.5 h-3.5" /> Resolution Email
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === "analytics"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" /> Portfolio Risk
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === "chat"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" /> AI Copilot
            </button>
          </div>
        </header>

        {/* Dynamic Investigation View */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading && !investigation ? (
            <div className="py-24 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <h3 className="text-base font-bold text-white">
                Meterless Agent Running Cross-Source Reconciliation...
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Executing Zetaris federated SQL JOIN across PO, Deliveries, Invoices, and Contracts.
              </p>
            </div>
          ) : investigation ? (
            <>
              {/* Executive Summary Cards */}
              <SummaryCards
                summary={investigation.summary}
                reviewDecision={investigation.reviewDecision}
              />

              {/* Human-in-the-Loop Approval Action Bar */}
              <ApprovalBar
                poId={investigation.poId}
                totalFinancialImpact={investigation.summary.totalFinancialImpact}
                currency={investigation.summary.currency}
                reviewDecision={investigation.reviewDecision}
                onDecision={handleReviewDecision}
                onOpenEmail={() => setActiveTab("email")}
              />

              {/* Tab 1: Evidence Trail & Discrepancies */}
              {activeTab === "evidence" && (
                <div className="space-y-6">
                  <EvidenceTrail
                    discrepancies={investigation.discrepancies}
                    poId={investigation.poId}
                    onInspectSource={handleInspectSource}
                  />

                  {/* Inline quick access bar */}
                  <div className="border border-slate-800 rounded-2xl p-4 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-white block">
                        Verified by Meterless Autonomous Agent
                      </span>
                      <span className="text-xs text-slate-400">
                        Mission {investigation.missionTrace.missionId} finished in {investigation.missionTrace.totalDurationMs}ms with 5 reasoning steps.
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setIsCertificateOpen(true)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition flex items-center gap-1.5"
                      >
                        <Award className="w-3.5 h-3.5 text-indigo-400" /> View Compliance Certificate
                      </button>
                      <button
                        onClick={() => setActiveTab("trace")}
                        className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1 px-2"
                      >
                        Inspect Full Agent Trace <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Meterless Agent Mission Trace */}
              {activeTab === "trace" && (
                <div className="space-y-6">
                  <AgentTrace
                    missionTrace={investigation.missionTrace}
                    unifiedRecord={investigation.unifiedRecord}
                  />
                </div>
              )}

              {/* Tab 3: NVIDIA NIM Supplier Clarification Email */}
              {activeTab === "email" && (
                <div className="space-y-6">
                  <EmailPreview
                    explanation={investigation.explanation}
                    poId={investigation.poId}
                  />
                </div>
              )}

              {/* Tab 4: Portfolio Risk Scorecards & Leakage Analytics */}
              {activeTab === "analytics" && (
                <div className="space-y-6">
                  <PortfolioAnalytics onSelectPo={handleSelectPo} />
                </div>
              )}

              {/* Tab 5: Interactive AI Auditor Copilot */}
              {activeTab === "chat" && (
                <div className="space-y-6">
                  <AuditorChat poId={investigation.poId} />
                </div>
              )}
            </>
          ) : null}
        </main>

        {/* Sponsor Badges & Hackathon Footer */}
        <Footer systemHealth={systemHealth} onOpenSponsorHub={handleOpenSponsorHub} />
      </div>

      {/* Raw Data Source Inspection Modal */}
      <SourceModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        initialFile={modalState.file}
        highlightRow={modalState.row}
        highlightColumn={modalState.column}
      />

      {/* Live Simulation Modal */}
      <SimulationModal
        isOpen={isSimulationOpen}
        onClose={() => setIsSimulationOpen(false)}
        onSimulationComplete={handleSimulationComplete}
      />

      {/* Official Audit Certificate Modal */}
      {investigation && (
        <AuditCertificateModal
          isOpen={isCertificateOpen}
          onClose={() => setIsCertificateOpen(false)}
          investigation={investigation}
        />
      )}

      {/* Sponsor Tech Hub & Live Inspector Modal */}
      <SponsorTechHubModal
        isOpen={isSponsorHubOpen}
        onClose={() => setIsSponsorHubOpen(false)}
        initialTab={sponsorHubTab}
        systemHealth={systemHealth}
      />
    </div>
  );
};
