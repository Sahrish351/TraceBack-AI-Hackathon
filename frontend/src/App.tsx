import React, { useEffect, useState } from "react";
import {
  fetchHealth,
  fetchPurchaseOrders,
  investigatePo,
  submitReview,
  runCustomAudit
} from "./api/client";
import {
  InvestigationResult,
  PurchaseOrderItem,
  SystemHealth,
  CustomAuditParams
} from "./types";
import { LandingPage } from "./components/LandingPage";
import { Sidebar, WorkspaceView } from "./components/Sidebar";
import { TopNav } from "./components/TopNav";
import { OverviewDashboard } from "./components/OverviewDashboard";
import { InvestigationsListScreen } from "./components/InvestigationsListScreen";
import { InvestigationDetail } from "./components/InvestigationDetail";
import { HumanReviewScreen } from "./components/HumanReviewScreen";
import { IntegrationsScreen } from "./components/IntegrationsScreen";
import { SourceModal } from "./components/SourceModal";
import { NewInvestigationModal } from "./components/NewInvestigationModal";
import {
  History,
  Settings,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText
} from "lucide-react";

export const App: React.FC = () => {
  // Navigation State
  const [isPublicLanding, setIsPublicLanding] = useState<boolean>(false);
  const [workspaceView, setWorkspaceView] = useState<WorkspaceView>("dashboard");
  const [isReviewing, setIsReviewing] = useState<boolean>(false);

  // Data State
  const [selectedPoId, setSelectedPoId] = useState<string>("PO-1042");
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderItem[]>([]);
  const [investigation, setInvestigation] = useState<InvestigationResult | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals
  const [isNewInvestigationOpen, setIsNewInvestigationOpen] = useState(false);
  const [sourceModal, setSourceModal] = useState<{
    isOpen: boolean;
    file: string;
    row?: number;
    column?: string;
  }>({
    isOpen: false,
    file: "purchase_orders.csv"
  });

  // Load initial health & purchase orders list
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
    setIsReviewing(false);
    setWorkspaceView("investigations");
  };

  const handleReviewSubmit = async (
    action: "approve" | "reject" | "request_clarification",
    notes: string
  ) => {
    if (!investigation) return;
    try {
      const res = await submitReview(investigation.poId, action, notes);
      if (res.success && res.decision) {
        setInvestigation({
          ...investigation,
          reviewDecision: res.decision
        });
      }
    } catch (err) {
      console.error("Failed to submit review:", err);
    }
  };

  const handleCustomAuditSubmit = async (params: CustomAuditParams) => {
    setLoading(true);
    try {
      const res = await runCustomAudit(params);
      setInvestigation(res);
      setSelectedPoId(params.poId);
      setWorkspaceView("investigations");
      setIsReviewing(false);
    } catch (err) {
      console.error("Custom audit failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // If viewing the public landing page, render it cleanly
  if (isPublicLanding) {
    return (
      <LandingPage
        onOpenWorkspace={() => setIsPublicLanding(false)}
        onSelectPo={handleSelectPo}
      />
    );
  }

  return (
    <div className="flex h-screen bg-[#FAF8F3] text-[#202720] overflow-hidden selection:bg-[#246B52] selection:text-white font-sans">
      {/* 1. Deep Forest Navigation Sidebar */}
      <Sidebar
        currentView={workspaceView}
        onSelectView={(v) => {
          setWorkspaceView(v);
          setIsReviewing(false);
        }}
        purchaseOrders={purchaseOrders}
        selectedPoId={selectedPoId}
        onSelectPo={handleSelectPo}
        systemHealth={systemHealth}
        loading={loading}
        onRefresh={() => runInvestigation(selectedPoId)}
        onBackToLanding={() => setIsPublicLanding(true)}
        onViewSourceFile={(file) => setSourceModal({ isOpen: true, file })}
        onOpenSimulation={() => setIsNewInvestigationOpen(true)}
      />

      {/* 2. Main Application Canvas */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header Navigation */}
        <TopNav
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          systemHealth={systemHealth}
          onOpenIntegrations={() => setWorkspaceView("integrations")}
        />

        {/* Content View Router */}
        <main className="flex-1 overflow-y-auto">
          {loading && !investigation ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-3">
              <div className="w-8 h-8 border-2 border-[#246B52] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs text-[#667066]">Running 4-way cross-source reconciliation...</span>
            </div>
          ) : workspaceView === "dashboard" ? (
            <OverviewDashboard
              purchaseOrders={purchaseOrders}
              currentInvestigation={investigation}
              systemHealth={systemHealth}
              onSelectPo={handleSelectPo}
              onOpenIntegrations={() => setWorkspaceView("integrations")}
              onNewInvestigation={() => setIsNewInvestigationOpen(true)}
            />
          ) : workspaceView === "investigations" ? (
            isReviewing && investigation ? (
              <HumanReviewScreen
                investigation={investigation}
                onBack={() => setIsReviewing(false)}
                onSubmitReview={handleReviewSubmit}
                onViewSourceFile={(file) => setSourceModal({ isOpen: true, file })}
              />
            ) : investigation ? (
              <InvestigationDetail
                investigation={investigation}
                onBack={() => setWorkspaceView("dashboard")}
                onOpenReview={() => setIsReviewing(true)}
                onViewSourceFile={(file) => setSourceModal({ isOpen: true, file })}
              />
            ) : null
          ) : workspaceView === "new-investigation" ? (
            <InvestigationsListScreen
              purchaseOrders={purchaseOrders}
              onSelectPo={handleSelectPo}
              onNewInvestigation={() => setIsNewInvestigationOpen(true)}
            />
          ) : workspaceView === "integrations" ? (
            <IntegrationsScreen
              systemHealth={systemHealth}
              loading={loading}
              onRefresh={() => runInvestigation(selectedPoId)}
            />
          ) : workspaceView === "audit-log" ? (
            <div className="p-8 max-w-5xl mx-auto space-y-6">
              <div>
                <h1 className="font-serif text-3xl font-bold text-[#143D2F]">Audit Log & History</h1>
                <p className="text-xs text-[#667066] mt-1">
                  Immutable record of investigation runs, data virtualization queries, and human reviewer decisions.
                </p>
              </div>

              <div className="bg-white rounded-xl border border-[#E5E7E2] shadow-card divide-y divide-[#E5E7E2]">
                <div className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-[#143D2F]">PO-1042 / INV-7781 Investigation Run</span>
                    <p className="text-[11px] text-[#667066]">4-way reconciliation completed across ERP, WMS, and Billing</p>
                  </div>
                  <span className="text-[11px] text-[#246B52] font-semibold bg-[#EAF3ED] px-2 py-0.5 rounded">
                    Verified
                  </span>
                </div>

                <div className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-[#143D2F]">PO-1001 Audit Completed</span>
                    <p className="text-[11px] text-[#667066]">Detected $1,200 total variance across quantity overbill & price escalation</p>
                  </div>
                  <span className="text-[11px] text-[#C66A4A] font-semibold bg-[#FDF1ED] px-2 py-0.5 rounded">
                    Flagged for Review
                  </span>
                </div>

                <div className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-[#143D2F]">PO-1002 Clean Concordance</span>
                    <p className="text-[11px] text-[#667066]">Zero discrepancies observed. Approved for disbursement</p>
                  </div>
                  <span className="text-[11px] text-[#246B52] font-semibold bg-[#EAF3ED] px-2 py-0.5 rounded">
                    Clean
                  </span>
                </div>
              </div>
            </div>
          ) : workspaceView === "settings" ? (
            <div className="p-8 max-w-4xl mx-auto space-y-6">
              <div>
                <h1 className="font-serif text-3xl font-bold text-[#143D2F]">Application Settings</h1>
                <p className="text-xs text-[#667066] mt-1">
                  Configuration, data storage paths, and environment settings.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-[#E5E7E2] shadow-card space-y-4 text-xs">
                <div className="space-y-1">
                  <span className="font-semibold text-[#143D2F]">Data Source Location</span>
                  <p className="text-[#667066]">Normalized CSV tables loaded from: <code>./data/*.csv</code></p>
                </div>
                <div className="space-y-1 border-t border-[#E5E7E2] pt-3">
                  <span className="font-semibold text-[#143D2F]">Backend API Port</span>
                  <p className="text-[#667066]">Listening on: <code>http://localhost:4000/api</code></p>
                </div>
                <div className="space-y-1 border-t border-[#E5E7E2] pt-3">
                  <span className="font-semibold text-[#143D2F]">Active Track</span>
                  <p className="text-[#667066]">The Agent That Can Explain Why (Hackathon 2026)</p>
                </div>
              </div>
            </div>
          ) : null}
        </main>
      </div>

      {/* Modals */}
      <SourceModal
        isOpen={sourceModal.isOpen}
        initialFile={sourceModal.file}
        highlightRow={sourceModal.row}
        highlightColumn={sourceModal.column}
        onClose={() => setSourceModal({ ...sourceModal, isOpen: false })}
      />

      <NewInvestigationModal
        isOpen={isNewInvestigationOpen}
        onClose={() => setIsNewInvestigationOpen(false)}
        onSubmit={handleCustomAuditSubmit}
      />
    </div>
  );
};
