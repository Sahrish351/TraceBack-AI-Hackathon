import React from "react";
import {
  LayoutDashboard,
  FileSearch,
  PlusCircle,
  History,
  Radio,
  Settings,
  CheckCircle2,
  RefreshCw,
  ArrowLeft,
  ChevronRight,
  Database,
  FileSpreadsheet,
  AlertCircle
} from "lucide-react";
import { PurchaseOrderItem, SystemHealth } from "../types";

export type WorkspaceView =
  | "dashboard"
  | "investigations"
  | "new-investigation"
  | "audit-log"
  | "integrations"
  | "settings";

interface SidebarProps {
  currentView: WorkspaceView;
  onSelectView: (view: WorkspaceView) => void;
  purchaseOrders: PurchaseOrderItem[];
  selectedPoId: string;
  onSelectPo: (poId: string) => void;
  systemHealth: SystemHealth | null;
  loading: boolean;
  onRefresh: () => void;
  dataSourcesStatus?: {
    purchaseOrders: { loaded: boolean; rowCount: number; file: string };
    deliveries: { loaded: boolean; rowCount: number; file: string };
    invoices: { loaded: boolean; rowCount: number; file: string };
    contractPrices: { loaded: boolean; rowCount: number; file: string };
  } | null;
  onViewSourceFile?: (fileName: string) => void;
  onOpenSimulation?: () => void;
  onOpenCertificate?: () => void;
  onOpenSponsorHub?: (tab: "nvidia" | "zetaris" | "meterless" | "cursor") => void;
  onBackToLanding: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  purchaseOrders,
  selectedPoId,
  onSelectPo,
  systemHealth,
  loading,
  onRefresh,
  onViewSourceFile,
  onOpenSimulation,
  onBackToLanding
}) => {
  const navItems = [
    { id: "dashboard" as WorkspaceView, label: "Dashboard", icon: LayoutDashboard },
    { id: "investigations" as WorkspaceView, label: "Investigations", icon: FileSearch },
    { id: "new-investigation" as WorkspaceView, label: "New Investigation", icon: PlusCircle },
    { id: "audit-log" as WorkspaceView, label: "Audit Log", icon: History },
    { id: "integrations" as WorkspaceView, label: "Integrations", icon: Radio },
    { id: "settings" as WorkspaceView, label: "Settings", icon: Settings }
  ];

  return (
    <aside className="w-64 bg-[#143D2F] flex flex-col h-screen shrink-0 text-[#E5E7E2] select-none border-r border-[#0D2A20]">
      {/* 1. Brand Header */}
      <div className="p-5 border-b border-[#1B4F3D] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-[#246B52] flex items-center justify-center text-white shadow-sm">
            <svg className="w-5 h-5 text-[#DCEBE1]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <span className="font-serif text-lg font-bold tracking-tight text-white block leading-tight">
              TraceBack AI
            </span>
            <span className="text-[11px] text-[#A3B8AD]">Audit Workspace</span>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          title="Re-run reconciliation"
          className="p-1.5 rounded-md hover:bg-[#1B4F3D] text-[#A3B8AD] hover:text-white transition disabled:opacity-40"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#DCEBE1]" : ""}`} />
        </button>
      </div>

      {/* 2. Main Navigation Menu */}
      <nav className="p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition text-left ${
                isActive
                  ? "bg-[#246B52] text-white shadow-sm font-semibold"
                  : "text-[#DCEBE1]/80 hover:bg-[#1B4F3D]/60 hover:text-white"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[#A3B8AD]"}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* 3. Quick Case Picker (Pinned Canonical Cases) */}
      <div className="px-4 py-3 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between text-[11px] font-semibold text-[#A3B8AD] uppercase tracking-wider mb-2">
          <span>Active Cases</span>
          <span className="text-[10px] bg-[#1B4F3D] px-1.5 py-0.5 rounded text-[#DCEBE1]">
            {purchaseOrders.length}
          </span>
        </div>

        <div className="space-y-1">
          {purchaseOrders.map((po) => {
            const isSelected = selectedPoId === po.poId;
            const isCanonical = po.poId === "PO-1042";

            return (
              <button
                key={po.poId}
                onClick={() => {
                  onSelectPo(po.poId);
                  if (currentView !== "investigations") {
                    onSelectView("investigations");
                  }
                }}
                className={`w-full text-left p-2.5 rounded-lg text-xs transition border ${
                  isSelected
                    ? "bg-[#1B4F3D] border-[#246B52] text-white font-medium"
                    : "bg-[#143D2F]/50 border-transparent text-[#DCEBE1]/70 hover:bg-[#1B4F3D]/40 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">{po.poId}</span>
                  {isCanonical && (
                    <span className="text-[9px] bg-[#C66A4A] text-white px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">
                      Demo Case
                    </span>
                  )}
                </div>
                <div className="text-[11px] truncate text-[#A3B8AD] mt-0.5">{po.supplierId}</div>
                <div className="text-[10px] mt-1 flex items-center justify-between">
                  <span className="text-[#DCEBE1] font-mono">{po.currency} {po.unitPrice * po.orderedQty}</span>
                  <span className={isCanonical ? "text-[#F3C5B5]" : po.poId === "PO-1002" ? "text-[#B8D4C3]" : "text-[#F3C5B5]"}>
                    {po.demoBadge}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Footer & System Status */}
      <div className="p-4 border-t border-[#1B4F3D] space-y-3">
        {/* Return to Public Landing Page */}
        <button
          onClick={onBackToLanding}
          className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg bg-[#1B4F3D]/50 hover:bg-[#1B4F3D] text-[#DCEBE1] text-xs font-medium transition border border-[#246B52]/40"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit to Public Website</span>
        </button>

        {/* Operational Status Indicator */}
        <div className="flex items-center space-x-2 text-[11px] text-[#A3B8AD] pt-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#246B52] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#246B52]"></span>
          </span>
          <span className="text-[#DCEBE1] font-medium">All Systems Operational</span>
        </div>
      </div>
    </aside>
  );
};
