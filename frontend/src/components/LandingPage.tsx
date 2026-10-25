import React from "react";
import {
  ShieldCheck,
  Search,
  FileSpreadsheet,
  UserCheck,
  ArrowRight,
  Play,
  Layers,
  FileCheck,
  AlertCircle,
  Database,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  Lock,
  GitBranch
} from "lucide-react";

interface LandingPageProps {
  onOpenWorkspace: () => void;
  onSelectPo?: (poId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenWorkspace, onSelectPo }) => {
  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#202720] flex flex-col selection:bg-[#246B52] selection:text-white">
      {/* 1. Header / Navigation */}
      <header className="sticky top-0 z-40 bg-[#FAF8F3]/90 backdrop-blur-md border-b border-[#E5E7E2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Mark */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#143D2F] flex items-center justify-center text-white shadow-sm">
              <svg className="w-6 h-6 text-[#DCEBE1]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <span className="font-serif text-2xl font-bold tracking-tight text-[#143D2F]">
                TraceBack AI
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-[#667066]">
            <a href="#home" className="text-[#143D2F] hover:text-[#246B52] transition">
              Home
            </a>
            <a href="#how-it-works" className="hover:text-[#246B52] transition">
              How It Works
            </a>
            <a href="#features" className="hover:text-[#246B52] transition">
              Features
            </a>
            <a href="#trust" className="hover:text-[#246B52] transition">
              Security & Trust
            </a>
            <a href="#about" className="hover:text-[#246B52] transition">
              About
            </a>
          </nav>

          {/* CTA Action */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onOpenWorkspace}
              className="inline-flex items-center space-x-2 bg-[#246B52] hover:bg-[#1D5642] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition shadow-sm hover:shadow active:scale-[0.99]"
            >
              <span>Open Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section id="home" className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Hero Copy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#EAF3ED] border border-[#DCEBE1] text-[#246B52] text-xs font-semibold tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-[#246B52]"></span>
              <span>Supplier Invoice Reconciliation & Audit Investigation</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#143D2F] leading-[1.12] tracking-tight">
              Find invoice discrepancies. <br className="hidden sm:inline" />
              Follow the evidence.
            </h1>

            <p className="text-base sm:text-lg text-[#667066] max-w-xl leading-relaxed">
              TraceBack AI connects purchase orders, invoices, delivery records, and contract prices, finds mismatches, and explains exactly why — with clear evidence and a human review process.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={onOpenWorkspace}
                className="inline-flex items-center space-x-2 bg-[#246B52] hover:bg-[#1D5642] text-white px-6 py-3.5 rounded-lg text-base font-medium transition shadow-md hover:shadow-lg active:scale-[0.99]"
              >
                <span>Open Workspace</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <a
                href="#how-it-works"
                className="inline-flex items-center space-x-2 bg-white hover:bg-[#FAF8F3] text-[#143D2F] border border-[#E5E7E2] px-6 py-3.5 rounded-lg text-base font-medium transition shadow-sm"
              >
                <Play className="w-4 h-4 text-[#246B52] fill-[#246B52]" />
                <span>Explore How It Works</span>
              </a>
            </div>

            <div className="pt-4 flex items-center space-x-6 text-xs text-[#8F9A8F]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#246B52]" /> Zero ETL or Data Duplication
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#246B52]" /> Deterministic Financial Math
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#246B52]" /> Human-in-the-Loop Oversight
              </span>
            </div>
          </div>

          {/* Hero Visual Preview: Multi-layer representative application card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Backcard: Overview dashboard preview */}
              <div className="bg-white rounded-2xl border border-[#E5E7E2] shadow-elevated p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[#E5E7E2] pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#246B52]"></div>
                    <span className="font-serif text-sm font-semibold text-[#143D2F]">Recent Investigations</span>
                  </div>
                  <span className="text-xs text-[#8F9A8F]">Canonical Demo</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-lg bg-[#FAF8F3] border border-[#E5E7E2]">
                    <div className="text-xs text-[#667066]">Total POs</div>
                    <div className="text-lg font-serif font-bold text-[#143D2F]">5</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#FDF1ED] border border-[#F3C5B5]">
                    <div className="text-xs text-[#C66A4A] font-medium">Review</div>
                    <div className="text-lg font-serif font-bold text-[#C66A4A]">4</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#FAF8F3] border border-[#E5E7E2]">
                    <div className="text-xs text-[#667066]">Resolved</div>
                    <div className="text-lg font-serif font-bold text-[#246B52]">1</div>
                  </div>
                </div>

                {/* Table Snippet */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-[#FAF8F3] border border-[#E5E7E2]">
                    <div>
                      <span className="font-semibold text-[#143D2F]">INV-7781</span>
                      <p className="text-[11px] text-[#667066]">Northstar Office Supplies</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-[#C66A4A]">Rs 10,000</span>
                      <span className="block text-[10px] text-[#C66A4A] font-medium uppercase">Requires Review</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#E5E7E2]">
                    <div>
                      <span className="font-semibold text-[#143D2F]">INV-9002</span>
                      <p className="text-[11px] text-[#667066]">SUP-17 (Gadget-B)</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-[#246B52]">Concordant</span>
                      <span className="block text-[10px] text-[#246B52] font-medium uppercase">Clean</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Highlight Card: Canonical PO-1042 Rs 10,000 finding */}
              <div className="absolute -bottom-6 -left-6 sm:-left-8 bg-white rounded-xl border border-[#F3C5B5] shadow-modal p-4 max-w-[280px] sm:max-w-xs animate-in fade-in duration-500">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FDF1ED] text-[#C66A4A] flex items-center justify-center shrink-0">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-[#C66A4A] uppercase tracking-wide">
                      Potential Discrepancy
                    </span>
                    <div className="text-2xl font-serif font-bold text-[#143D2F]">
                      Rs 10,000
                    </div>
                    <p className="text-xs text-[#667066]">
                      20 unreceived units billed on PO-1042.
                    </p>
                    <div className="pt-1 flex items-center space-x-1.5 text-[11px] font-medium text-[#246B52]">
                      <span>Source: invoices.csv:L7</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white border-y border-[#E5E7E2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#246B52]">Workflow Architecture</span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#143D2F]">
              From data to decision — in four simple steps.
            </h2>
            <p className="text-[#667066] text-base">
              TraceBack AI structures complex multi-source procurement investigations into an explainable, verifiable sequence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-[#FAF8F3] border border-[#E5E7E2] space-y-4 hover:border-[#246B52] transition shadow-card">
              <div className="w-12 h-12 rounded-xl bg-[#246B52] text-white flex items-center justify-center font-serif text-xl font-bold shadow-sm">
                1
              </div>
              <h3 className="font-serif text-lg font-bold text-[#143D2F]">Collect Records</h3>
              <p className="text-sm text-[#667066] leading-relaxed">
                Connect purchase orders, invoices, warehouse delivery receipts, and contracted price lists without manual data entry.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-[#FAF8F3] border border-[#E5E7E2] space-y-4 hover:border-[#246B52] transition shadow-card">
              <div className="w-12 h-12 rounded-xl bg-[#246B52] text-white flex items-center justify-center font-serif text-xl font-bold shadow-sm">
                2
              </div>
              <h3 className="font-serif text-lg font-bold text-[#143D2F]">Compare & Analyze</h3>
              <p className="text-sm text-[#667066] leading-relaxed">
                Execute deterministic 4-way matching rules to calculate exact exposure for quantities, prices, fees, and duplicate invoices.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-[#FAF8F3] border border-[#E5E7E2] space-y-4 hover:border-[#246B52] transition shadow-card">
              <div className="w-12 h-12 rounded-xl bg-[#246B52] text-white flex items-center justify-center font-serif text-xl font-bold shadow-sm">
                3
              </div>
              <h3 className="font-serif text-lg font-bold text-[#143D2F]">Show Evidence</h3>
              <p className="text-sm text-[#667066] leading-relaxed">
                Inspect the exact source records, row numbers, and values behind every finding with complete transparency and zero guesswork.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-2xl bg-[#FAF8F3] border border-[#E5E7E2] space-y-4 hover:border-[#246B52] transition shadow-card">
              <div className="w-12 h-12 rounded-xl bg-[#143D2F] text-white flex items-center justify-center font-serif text-xl font-bold shadow-sm">
                4
              </div>
              <h3 className="font-serif text-lg font-bold text-[#143D2F]">Human Review</h3>
              <p className="text-sm text-[#667066] leading-relaxed">
                Empower procurement officers to accept findings, request clarifications, or reject discrepancies with an immutable audit log.
              </p>
            </div>
          </div>

          {/* Evidence-First Callout Banner */}
          <div className="mt-14 p-6 sm:p-8 rounded-2xl bg-[#FAF8F3] border border-[#DCEBE1] grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-[#143D2F] font-serif font-bold text-base">
                <FileCheck className="w-5 h-5 text-[#246B52]" />
                <span>Traceable Sources</span>
              </div>
              <p className="text-xs text-[#667066] leading-relaxed">
                Every calculation links directly to specific procurement files, line numbers, and observed cell values.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-[#143D2F] font-serif font-bold text-base">
                <ShieldCheck className="w-5 h-5 text-[#246B52]" />
                <span>AI-Assisted Explanations</span>
              </div>
              <p className="text-xs text-[#667066] leading-relaxed">
                Concise, plain-language dispute letters and executive summaries grounded strictly in verified findings.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-[#143D2F] font-serif font-bold text-base">
                <UserCheck className="w-5 h-5 text-[#246B52]" />
                <span>Human Oversight</span>
              </div>
              <p className="text-xs text-[#667066] leading-relaxed">
                Automated payments or unilateral deduction notices are never sent automatically. Humans retain complete control.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#246B52]">Comprehensive Detection</span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#143D2F]">
            Built for Finance & Procurement Teams
          </h2>
          <p className="text-[#667066] text-base">
            Accurate. Transparent. Auditable. Everything you need to prevent supplier revenue leakage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-white rounded-xl border border-[#E5E7E2] shadow-card space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#EAF3ED] text-[#246B52] flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-base font-bold text-[#143D2F]">Four-Way Reconciliation</h3>
            <p className="text-xs text-[#667066] leading-relaxed">
              Cross-references Purchase Orders, Warehouse Goods Delivery slips, Invoices, and Master Contract catalogs in a single joined view.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl border border-[#E5E7E2] shadow-card space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#FDF1ED] text-[#C66A4A] flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-base font-bold text-[#143D2F]">Discrepancy Detection</h3>
            <p className="text-xs text-[#667066] leading-relaxed">
              Detects quantity overbilling, contract price escalation, unauthorized ancillary fees, and duplicate invoice submissions.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl border border-[#E5E7E2] shadow-card space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#FAF8F3] text-[#143D2F] border border-[#E5E7E2] flex items-center justify-center">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-base font-bold text-[#143D2F]">Missing Evidence Warnings</h3>
            <p className="text-xs text-[#667066] leading-relaxed">
              Spots incomplete records or unverified delivery notes without assuming delivered quantity is zero or guessing unknown rates.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl border border-[#E5E7E2] shadow-card space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#EAF3ED] text-[#246B52] flex items-center justify-center">
              <GitBranch className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-base font-bold text-[#143D2F]">Full Audit Trail</h3>
            <p className="text-xs text-[#667066] leading-relaxed">
              Maintains an immutable historical log of reviewer decisions, reasons, timestamps, and investigation outcomes for compliance.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Trust, Limitations & Integrity */}
      <section id="trust" className="py-16 bg-white border-y border-[#E5E7E2]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#246B52]">Honesty & Compliance</span>
            <h2 className="font-serif text-3xl text-[#143D2F]">Responsible Investigation Assistant</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-[#667066]">
            <div className="p-5 rounded-xl bg-[#FAF8F3] border border-[#E5E7E2] space-y-2">
              <div className="font-semibold text-[#143D2F] flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#246B52]" />
                <span>Potential Discrepancies, Not Fraud</span>
              </div>
              <p className="text-xs leading-relaxed">
                TraceBack AI calculates mathematical variances between records. Findings are clearly designated as <em>Potential Discrepancies Pending Review</em>, never automatic assertions of fraud or bad faith.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#FAF8F3] border border-[#E5E7E2] space-y-2">
              <div className="font-semibold text-[#143D2F] flex items-center gap-2">
                <Database className="w-4 h-4 text-[#246B52]" />
                <span>Transparent Source Modes</span>
              </div>
              <p className="text-xs leading-relaxed">
                The application explicitly displays whether records originated from live enterprise query connections or explicitly labelled demo fixtures (e.g. Northstar Office Supplies).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Final Call to Action */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center space-y-6">
        <h2 className="font-serif text-3xl sm:text-4xl text-[#143D2F]">
          Ready to explore your procurement investigations?
        </h2>
        <p className="text-base text-[#667066] max-w-lg mx-auto">
          Open the workspace to review the canonical Northstar Office Supplies case (PO-1042 / Rs 10,000 potential discrepancy) and examine the evidence trail.
        </p>

        <div className="pt-2">
          <button
            onClick={onOpenWorkspace}
            className="inline-flex items-center space-x-2 bg-[#246B52] hover:bg-[#1D5642] text-white px-8 py-3.5 rounded-lg text-base font-semibold transition shadow-md hover:shadow-lg active:scale-[0.99]"
          >
            <span>Open Workspace</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-xs text-[#8F9A8F] mt-3">
            No registration required. Interactive demo mode active.
          </p>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="mt-auto border-t border-[#E5E7E2] bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className="font-serif text-xl font-bold text-[#143D2F]">TraceBack AI</div>
            <p className="text-xs text-[#667066]">
              Transparent. Traceable. Trusted. — Built for Hackathon 2026.
            </p>
          </div>

          <div className="flex items-center space-x-6 text-xs text-[#667066]">
            <a href="#home" className="hover:text-[#246B52] transition">Home</a>
            <a href="#how-it-works" className="hover:text-[#246B52] transition">How It Works</a>
            <a href="#features" className="hover:text-[#246B52] transition">Features</a>
            <a href="#trust" className="hover:text-[#246B52] transition">Security</a>
            <button onClick={onOpenWorkspace} className="hover:text-[#246B52] transition font-medium">Workspace</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

