import React, { useEffect, useState } from "react";
import {
  fetchHealth,
  fetchPurchaseOrders,
  investigatePo,
  submitReview,
  runCustomAudit,
  fetchAuditLogs,
  fetchCurrentUser,
  fetchPersonas,
  switchPersona,
  resetSessionState
} from "./api/client";
import {
  InvestigationResult,
  PurchaseOrderItem,
  SystemHealth,
  CustomAuditParams,
  AuditLogEntry,
  UserProfile
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
import { AuditCertificateModal } from "./components/AuditCertificateModal";
import { AuditorProfileModal } from "./components/AuditorProfileModal";
import {
  History,
  Settings,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  RotateCcw,
  User,
  Filter,
  Check
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

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [auditLogFilter, setAuditLogFilter] = useState<"all" | "investigation" | "review">("all");

  // User & Persona State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [personas, setPersonas] = useState<UserProfile[]>([]);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Modals
  const [isNewInvestigationOpen, setIsNewInvestigationOpen] = useState(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [sourceModal, setSourceModal] = useState<{
    isOpen: boolean;
    file: string;
    row?: number;
    column?: string;
  }>({
    isOpen: false,
    file: "purchase_orders.csv"
  });

  // Load initial health, purchase orders list, audit logs, & user profile
  useEffect(() => {
    fetchHealth()
      .then(setSystemHealth)
      .catch((err) => console.error("Health check error:", err));

    fetchPurchaseOrders()
      .then((pos) => {
        setPurchaseOrders(pos);
      })
      .catch((err) => console.error("PO list error:", err));

    fetchAuditLogs()
      .then(setAuditLogs)
      .catch((err) => console.error("Audit logs error:", err));

    fetchCurrentUser()
      .then(setCurrentUser)
      .catch((err) => console.error("Current user error:", err));

    fetchPersonas()
      .then(setPersonas)
      .catch((err) => console.error("Personas error:", err));
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
      const reviewerName = currentUser ? `${currentUser.name} (${currentUser.role})` : "Lead Auditor Sahrish";
      const res = await submitReview(investigation.poId, action, notes);
      if (res.success && res.decision) {
        setInvestigation({
          ...investigation,
          reviewDecision: res.decision
        });
      }
      // Refresh audit logs
      fetchAuditLogs().then(setAuditLogs);
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
      fetchAuditLogs().then(setAuditLogs);
    } catch (err) {
      console.error("Custom audit failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPersona = async (personaId: string) => {
    try {
      const user = await switchPersona(personaId);
      setCurrentUser(user);
    } catch (err) {
      console.error("Failed to switch persona:", err);
    }
  };

  const handleResetSession = async () => {
    setResetting(true);
    try {
      await resetSessionState();
      await runInvestigation(selectedPoId);
      const logs = await fetchAuditLogs();
      setAuditLogs(logs);
    } catch (err) {
      console.error("Reset failed:", err);
    } finally {
      setResetting(false);
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

  const filteredLogs = auditLogs.filter((log) => {
    if (auditLogFilter === "investigation") return log.type === "investigation";
    if (auditLogFilter === "review") return log.type === "review";
    return true;
  });

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
          currentUser={currentUser}
          onOpenProfile={() => setIsProfileModalOpen(true)}
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
                onOpenCertificate={() => setIsCertificateModalOpen(true)}
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
            <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="font-serif text-3xl font-bold text-[#143D2F]">Audit Log & History</h1>
                  <p className="text-xs text-[#667066] mt-1">
                    Immutable record of investigation runs, data virtualization queries, and human reviewer decisions.
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center space-x-1.5 bg-white p-1 rounded-lg border border-[#E5E7E2] text-xs">
                  {(["all", "investigation", "review"] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setAuditLogFilter(filter)}
                      className={`px-3 py-1 rounded-md font-medium transition capitalize ${
                        auditLogFilter === filter
                          ? "bg-[#246B52] text-white shadow-sm"
                          : "text-[#667066] hover:text-[#143D2F]"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Audit Events List */}
              <div className="bg-white rounded-xl border border-[#E5E7E2] shadow-card divide-y divide-[#E5E7E2] overflow-hidden">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((entry) => {
                    const isApproved = entry.status === "Approved" || entry.status === "Clean";
                    const isFlagged = entry.status === "Flagged for Review" || entry.status === "Rejected";

                    return (
                      <div key={entry.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-[#FAF8F3]/50 transition">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-[#143D2F] text-sm">{entry.title}</span>
                            <span className="text-[10px] text-[#8F9A8F] font-mono">
                              {entry.timestamp ? new Date(entry.timestamp).toLocaleTimeString() : ""}
                            </span>
                          </div>
                          <p className="text-[#667066] text-xs">{entry.description}</p>
                          <div className="flex items-center space-x-2 text-[11px] text-[#8F9A8F] pt-0.5">
                            <span>Actor: <strong className="text-[#143D2F]">{entry.actor}</strong></span>
                            {entry.poId && (
                              <>
                                <span>•</span>
                                <button
                                  onClick={() => handleSelectPo(entry.poId!)}
                                  className="text-[#246B52] hover:underline font-semibold"
                                >
                                  View {entry.poId}
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-lg border shrink-0 ${
                            isApproved
                              ? "bg-[#EAF3ED] text-[#246B52] border-[#DCEBE1]"
                              : isFlagged
                              ? "bg-[#FDF1ED] text-[#C66A4A] border-[#F3C5B5]"
                              : "bg-[#FAF8F3] text-[#143D2F] border-[#E5E7E2]"
                          }`}
                        >
                          {entry.status}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-xs text-[#667066]">
                    No audit records match the selected filter.
                  </div>
                )}
              </div>
            </div>
          ) : workspaceView === "settings" ? (
            <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6 w-full">
              <div>
                <h1 className="font-serif text-3xl font-bold text-[#143D2F]">Application Settings</h1>
                <p className="text-xs text-[#667066] mt-1">
                  Active auditor session, data persistence paths, and demo state controls.
                </p>
              </div>

              {/* Active Profile Card */}
              {currentUser && (
                <div className="bg-white p-6 rounded-xl border border-[#E5E7E2] shadow-card space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-[#E5E7E2] pb-3">
                    <span className="font-serif text-base font-bold text-[#143D2F]">Active Auditor Session</span>
                    <button
                      onClick={() => setIsProfileModalOpen(true)}
                      className="text-xs text-[#246B52] font-semibold hover:underline"
                    >
                      Switch Persona
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <span className="text-[#8F9A8F] block">Auditor Name</span>
                      <strong className="text-[#143D2F] text-sm">{currentUser.name}</strong>
                    </div>
                    <div>
                      <span className="text-[#8F9A8F] block">Designated Role</span>
                      <strong className="text-[#143D2F] text-sm">{currentUser.role}</strong>
                    </div>
                    <div>
                      <span className="text-[#8F9A8F] block">Department</span>
                      <strong className="text-[#143D2F] text-sm">{currentUser.department}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* System Infrastructure Details */}
              <div className="bg-white p-6 rounded-xl border border-[#E5E7E2] shadow-card space-y-4 text-xs">
                <span className="font-serif text-base font-bold text-[#143D2F] block border-b border-[#E5E7E2] pb-3">
                  System & Storage Architecture
                </span>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <span className="font-semibold text-[#143D2F]">Persistent H-MEM Store</span>
                    <p className="text-[#667066]">
                      Human reviews and audit traces saved to: <code>./data/.h_mem_store.json</code> (survives server restart).
                    </p>
                  </div>
                  <div className="space-y-1 border-t border-[#E5E7E2] pt-3">
                    <span className="font-semibold text-[#143D2F]">Normalized Procurement Datasets</span>
                    <p className="text-[#667066]">
                      Virtual schema federated from: <code>./data/purchase_orders.csv, deliveries.csv, invoices.csv</code>
                    </p>
                  </div>
                  <div className="space-y-1 border-t border-[#E5E7E2] pt-3">
                    <span className="font-semibold text-[#143D2F]">Backend API Service</span>
                    <p className="text-[#667066]">
                      Express microservice listening on <code>http://localhost:4000/api</code>
                    </p>
                  </div>
                </div>
              </div>

              {/* Reset Demo Session Control */}
              <div className="bg-white p-6 rounded-xl border border-[#F3C5B5] shadow-card space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-serif text-base font-bold text-[#C66A4A]">Reset Demo Session Data</h4>
                    <p className="text-xs text-[#667066] mt-0.5">
                      Clear transient reviewer approvals/rejections and re-initialize pristine hackathon benchmark cases.
                    </p>
                  </div>
                  <button
                    onClick={handleResetSession}
                    disabled={resetting}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-[#FAF8F3] hover:bg-[#FDF1ED] text-[#C66A4A] border border-[#F3C5B5] font-semibold transition shadow-sm disabled:opacity-50"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${resetting ? "animate-spin" : ""}`} />
                    <span>{resetting ? "Resetting..." : "Reset Session"}</span>
                  </button>
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

      {investigation && (
        <AuditCertificateModal
          isOpen={isCertificateModalOpen}
          onClose={() => setIsCertificateModalOpen(false)}
          investigation={investigation}
        />
      )}

      {currentUser && (
        <AuditorProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          currentUser={currentUser}
          personas={personas}
          onSelectPersona={handleSelectPersona}
          onLogout={() => {
            setCurrentUser(personas[2] || currentUser);
          }}
        />
      )}
    </div>
  );
};
