# TraceBack AI — Hackathon Requirements Audit & Checklist

**Document Version:** 1.0 (Phase 6 Milestone 2)  
**Track:** *The Agent That Can Explain Why* (Hackathon 2026)  
**Repository:** `https://github.com/Sahrish351/TraceBack-AI-Hackathon.git`  
**Working Branch:** `feature/redesign-and-integration`  
**Audit Standard:** Strict, honest verification (no unverified claims or simulated live integrations).

---

## 1. Hackathon Requirements Matrix

| Category | Requirement Item | Status | Verified Reality & Findings |
| :--- | :--- | :--- | :--- |
| **Track & Scope** | Primary Track: *The Agent That Can Explain Why* | **Verified** | Product architecture is strictly built on evidence-first investigation, 4-way deterministic matching, line-level coordinate citations, and human approval. |
| **Sponsor Tech** | **Zetaris** (Data Virtualization) | **Partially implemented / Blocked — requires access or clarification** | Server-side adapter (`ZetarisClient.ts`) queries live REST SQL endpoints when `ZETARIS_API_URL` and `ZETARIS_API_KEY` are provided. Currently runs in genuine local virtualized SQLite schema because live tenant credentials are not provisioned. UI and API honestly report *Local / demo mode*. |
| **Sponsor Tech** | **Meterless** (Agent Orchestration & H-MEM) | **Partially implemented / Blocked — requires access or clarification** | 5-step mission runner (`MeterlessMission.ts`) with persistent H-MEM memory store and remote webhook dispatcher. Runs in local sequential mode with step-by-step trace logging and fallback. UI and API honestly report *Local / demo mode*. |
| **Sponsor Tech** | **NVIDIA NIM** (Nemotron / LLaMA Explainer) | **Partially implemented / Blocked — requires access or clarification** | Server-side explainer client (`NvidiaExplainer.ts`) with timeout handling and immutable arithmetic guardrails. When `NVIDIA_API_KEY` is absent, falls back deterministically. UI and API honestly report *Local / demo mode*. |
| **Development** | **Cursor** (AI Pair Programming) | **Verified** | Cursor was used throughout the development lifecycle for code architecture, refactoring, and test authoring. Documented in `PRD/TraceBack_AI_Cursor_Prompt_Pack.md`. |
| **Rules & Timing** | Official Submission Deadline | **Blocked — requires access or clarification** | Project PRD documents a conflict between the build window (October 22–27, 2026) and platform countdowns. Participant must confirm the exact submission closing time on the official hackathon dashboard. |
| **Rules & Timing** | Pre-existing Code & Open Source Policy | **Verified** | Repository maintains clean, chronological commit history across all development phases with zero proprietary license conflicts. |
| **Deliverables** | Public GitHub Repository | **Verified** | Active, cleanly structured Git repository with zero exposed secrets, automated CI/CD-ready test scripts, and complete documentation. |
| **Deliverables** | Working Web Demo / Prototype | **Verified** | High-fidelity frontend built with Vite + React + Tailwind; full-stack backend runnable with zero external database dependencies; static demo mode supported for GitHub Pages. |
| **Deliverables** | Canonical Demo Case (PO-1042) | **Verified** | Northstar Office Supplies: 120 ordered, 100 delivered, 120 invoiced @ Rs 500 = **Rs 10,000 potential discrepancy**. Strictly labelled *"Potential Discrepancy — Requires Human Review"*. |
| **Deliverables** | Multi-Item Invoices & Complex Reconciliations | **Verified** | Reconciles multi-item invoices (e.g. PO-2005 Consignment with 5 line items), partial shipments, contract rate escalations, and sales tax variances. |
| **Deliverables** | Human-in-the-Loop Review System | **Verified** | Review actions (`approve`, `reject`, `request_clarification`) with audit logging, reviewer notes, and non-destructive persistence in H-MEM. |
| **Deliverables** | Slide Deck | **Partially implemented** | Starter template available in `PRD/TraceBack_AI_Pitch_Deck_Starter.pptx`; requires final customization with team members and live screenshots. |
| **Deliverables** | Demo Video (1–4 minutes) | **Not implemented** | Requires recording and hosting (YouTube/Loom) by the participant. |
| **Proof & Audit** | Observable Sponsor Usage Evidence | **Verified** | 44 automated Vitest unit and integration tests across 5 suites; dynamic Integration Health screen displaying real operational metadata; runtime step logs. |

---

## 2. Status Definitions

- **Verified:** Fully implemented, tested with automated suites, builds cleanly, and exhibits observable proof in the codebase and running application.
- **Partially implemented:** The software architecture, clients, test suites, and graceful fallbacks are complete, but external production credentials have not been configured.
- **Not implemented:** Deliverables that require human action outside the codebase (e.g., recording a 1–4 minute video presentation).
- **Blocked — requires access or clarification:** Specific access credentials (Zetaris API tenant, Meterless API key, NVIDIA NIM key) or official platform dates that only the human participant can access from the hackathon organizers.

---

## 3. Mandatory Human Next Steps Before Submission

1. **Verify Exact Submission Deadline:** Check the official hackathon platform dashboard (Devpost, LabLab, or organizer portal) to record the precise cutoff time.
2. **Review Sponsor API Keys:**
   - If organizers provisioned a Zetaris tenant URL/key, add it to `.env`.
   - If organizers provided a Meterless webhook token, add it to `.env`.
   - If an NVIDIA NIM key (`nvapi-...`) is available, add it to `.env`.
   - *Note:* If keys are not provisioned, TraceBack AI continues to run seamlessly in verified **Local / Demo Mode** with complete transparency.
3. **Record 1–4 Minute Video Demo:** Walk through the landing page, PO-1042 canonical case (Rs 10,000), multi-item case, evidence trail, human review decision, and the Integration Health screen.
4. **Finalize Pitch Deck:** Complete `PRD/TraceBack_AI_Pitch_Deck_Starter.pptx` with team information and project links.
