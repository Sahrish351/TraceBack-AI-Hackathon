import React from "react";
import { X, User, ShieldCheck, CheckCircle2, LogOut, ArrowRight, KeyRound } from "lucide-react";
import { UserProfile } from "../types";

interface AuditorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  personas: UserProfile[];
  onSelectPersona: (personaId: string) => void;
  onLogout: () => void;
}

export const AuditorProfileModal: React.FC<AuditorProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  personas,
  onSelectPersona,
  onLogout
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white border border-[#E5E7E2] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#E5E7E2] bg-[#FAF8F3] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-[#EAF3ED] text-[#246B52] flex items-center justify-center font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#143D2F]">Auditor Identity & Session</h3>
              <p className="text-[11px] text-[#667066]">Role-based access control and active session persona</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#E5E7E2]/60 text-[#667066] hover:text-[#143D2F] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
          {/* Active User Card */}
          <div className="p-4 rounded-xl bg-[#FAF8F3] border border-[#DCEBE1] space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#246B52] bg-[#EAF3ED] px-2 py-0.5 rounded inline-block">
              Active Session
            </span>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-[#143D2F] text-white flex items-center justify-center font-bold text-base shadow-sm">
                {currentUser.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className="font-serif text-lg font-bold text-[#143D2F] truncate">{currentUser.name}</h4>
                  <span className="text-[10px] bg-[#EAF3ED] text-[#246B52] font-semibold px-2 py-0.5 rounded border border-[#DCEBE1]">
                    {currentUser.role}
                  </span>
                </div>
                <p className="text-xs text-[#667066] truncate">{currentUser.email}</p>
                <p className="text-[11px] text-[#8F9A8F] truncate mt-0.5">{currentUser.department}</p>
              </div>
            </div>

            {/* Permissions Badges */}
            <div className="pt-2 border-t border-[#E5E7E2]">
              <span className="text-[10px] font-semibold uppercase text-[#667066] block mb-1.5">
                Granted Permissions
              </span>
              <div className="flex flex-wrap gap-1.5">
                {currentUser.permissions.map((perm, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] bg-white px-2 py-0.5 rounded border border-[#E5E7E2] text-[#143D2F] font-mono"
                  >
                    ✓ {perm}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Persona Switcher for Hackathon Judges */}
          <div className="space-y-3">
            <div>
              <h4 className="font-serif text-sm font-bold text-[#143D2F]">Demo Persona Switcher</h4>
              <p className="text-xs text-[#667066]">
                Instantly switch auditor roles to verify permission boundaries and audit trail attribution.
              </p>
            </div>

            <div className="space-y-2">
              {personas.map((p) => {
                const isActive = p.id === currentUser.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectPersona(p.id);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between ${
                      isActive
                        ? "bg-[#EAF3ED] border-[#246B52] text-[#143D2F]"
                        : "bg-white border-[#E5E7E2] hover:bg-[#FAF8F3] text-[#202720]"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          isActive ? "bg-[#246B52] text-white" : "bg-[#FAF8F3] text-[#667066] border border-[#E5E7E2]"
                        }`}
                      >
                        {p.avatar}
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-semibold text-xs text-[#143D2F]">{p.name}</span>
                          <span className="text-[10px] text-[#8F9A8F]">({p.role})</span>
                        </div>
                        <span className="text-[11px] text-[#667066]">{p.email}</span>
                      </div>
                    </div>
                    {isActive ? (
                      <CheckCircle2 className="w-4 h-4 text-[#246B52]" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 text-[#8F9A8F]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E5E7E2] bg-[#FAF8F3] flex items-center justify-between">
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="inline-flex items-center space-x-1.5 text-xs text-[#C66A4A] font-semibold hover:underline"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Session</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#246B52] hover:bg-[#1D5642] text-white text-xs font-semibold shadow-sm transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
