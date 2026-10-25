import React from "react";
import { Search, ChevronDown } from "lucide-react";
import { SystemHealth, UserProfile } from "../types";

interface TopNavProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  systemHealth: SystemHealth | null;
  onOpenIntegrations: () => void;
  currentUser?: UserProfile | null;
  onOpenProfile?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  searchQuery,
  onSearchChange,
  systemHealth,
  onOpenIntegrations,
  currentUser,
  onOpenProfile
}) => {
  const userName = currentUser?.name || "Sahrish";
  const userRole = currentUser?.role || "Lead Auditor";
  const userAvatar = currentUser?.avatar || "SA";

  return (
    <header className="h-16 bg-white border-b border-[#E5E7E2] px-6 flex items-center justify-between shrink-0">
      {/* Search Input */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 text-[#8F9A8F] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search investigations, invoices, suppliers..."
            className="w-full pl-10 pr-4 py-2 bg-[#FAF8F3] border border-[#E5E7E2] rounded-lg text-sm text-[#202720] placeholder-[#8F9A8F] focus:outline-none focus:border-[#246B52] transition"
          />
        </div>
      </div>

      {/* Right Actions & User Profile */}
      <div className="flex items-center space-x-4">
        {/* Date Filter Indicator */}
        <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-[#E5E7E2] bg-[#FAF8F3] text-xs font-medium text-[#667066]">
          <span>Period:</span>
          <span className="text-[#143D2F] font-semibold">Last 7 days</span>
        </div>

        {/* Integration Status Quick Tag */}
        <button
          onClick={onOpenIntegrations}
          title="View Integration Health"
          className="hidden md:inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#EAF3ED] border border-[#DCEBE1] text-[#246B52] text-xs font-medium hover:bg-[#DCEBE1] transition"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#246B52]"></span>
          <span>Integrations Ready</span>
        </button>

        {/* User Badge Button */}
        <button
          onClick={onOpenProfile}
          title="Manage Auditor Profile & Switch Personas"
          className="flex items-center space-x-3 pl-3 border-l border-[#E5E7E2] hover:opacity-80 transition text-left cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-full bg-[#143D2F] text-white flex items-center justify-center font-bold text-xs shadow-sm group-hover:ring-2 group-hover:ring-[#246B52]/40 transition">
            {userAvatar}
          </div>
          <div className="hidden sm:block text-left">
            <span className="text-xs font-semibold text-[#143D2F] block leading-tight">
              {userName}
            </span>
            <span className="text-[10px] text-[#8F9A8F] block truncate max-w-[120px]">
              {userRole}
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-[#8F9A8F] hidden sm:block" />
        </button>
      </div>
    </header>
  );
};
