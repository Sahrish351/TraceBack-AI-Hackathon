# TraceBack AI — Final Submission Checklist & Verification

**Document Version:** 1.0 (Phase 6 Final Release)  
**Hackathon Track:** *The Agent That Can Explain Why* (Hackathon 2026)  
**Repository:** `https://github.com/Sahrish351/TraceBack-AI-Hackathon.git`  
**Active Working Branch:** `feature/redesign-and-integration`

---

## 1. Technical & Engineering Checklist (Completed & Verified)

- [x] **Zero Exposed Secrets:** Automated scanner confirmed 0 API keys (`nvapi-`, `ghp_`, `sk-`), tokens, or passwords across all tracked files.
- [x] **Clean `.gitignore`:** `.env` and local environment files are ignored; only `.env.example` with empty keys is tracked.
- [x] **Automated Tests:** 45 / 45 tests passing across 5 suites (`compare.test.ts`, `zetaris.test.ts`, `meterless.test.ts`, `nvidia.test.ts`, `api_endpoints.test.ts`).
- [x] **Production Build:** `npm run build` succeeds cleanly with 0 TypeScript or Vite bundler errors.
- [x] **Canonical Case Verified:** PO-1042 produces exactly Rs 10,000 potential discrepancy (120 invoiced - 100 received @ Rs 500) labelled *"Potential Discrepancy — Requires Human Review"*.
- [x] **Multi-Item Invoice Support:** PO-2005 reconciles 5 line items with quantity mismatch ($2,400) and rate escalation ($750) totalling $3,150.
- [x] **Evidence-First Transparency:** Every finding links to exact file names, row numbers, and column identifiers with raw CSV modal preview.
- [x] **Security Hardening:** Whitelist validation on file inspection endpoints prevents path traversal.
- [x] **Honest Status Matrix:** Integration screen displays real operational states (`Local / demo mode` or `Not configured`) without faking live connections.

---

## 2. Participant Action Checklist (To Be Performed by User)

### Step 1: Confirm Submission Deadline
- [ ] Log in to the official hackathon platform dashboard (Devpost / LabLab / organizer portal).
- [ ] Record the exact submission closing date and time (confirm timezone).

### Step 2: Open Pull Request & Merge into `main`
- [ ] Open GitHub: `https://github.com/Sahrish351/TraceBack-AI-Hackathon.git`
- [ ] Compare `feature/redesign-and-integration` against `main`.
- [ ] Merge the feature branch into `main` to make the audited code the default repository branch.

### Step 3: Record Demo Video (1 to 4 minutes)
- [ ] Follow [`docs/DEMO_SCRIPT.md`](file:///docs/DEMO_SCRIPT.md) for step-by-step narration.
- [ ] Record screen showing:
  1. Landing page and navigation.
  2. Canonical Northstar case (PO-1042, Rs 10,000 variance).
  3. Multi-item invoice (PO-2005).
  4. Evidence trail & raw CSV source viewer.
  5. Human review decision and audit trail.
  6. Integration Health screen explaining local demo fallback architecture.
- [ ] Upload video to YouTube (Unlisted or Public) or Loom, and copy the link.

### Step 4: Finalize Pitch Deck
- [ ] Open `PRD/TraceBack_AI_Pitch_Deck_Starter.pptx`.
- [ ] Fill in team member names, roles, and insert 2–3 screenshots from the web application.
- [ ] Export as PDF and host on Google Drive or GitHub releases.

### Step 5: Submit on Hackathon Portal
- [ ] **Project Name:** TraceBack AI
- [ ] **Tagline:** Evidence-first supplier invoice reconciliation and audit agent.
- [ ] **Track Selected:** The Agent That Can Explain Why
- [ ] **GitHub Repo Link:** `https://github.com/Sahrish351/TraceBack-AI-Hackathon.git`
- [ ] **Demo Video Link:** [Paste your recorded video URL]
- [ ] **Pitch Deck Link:** [Paste your pitch deck PDF URL]
- [ ] **Sponsor Description:** Copy the sponsor integration descriptions directly from `docs/INTEGRATION_REALITY_CHECK.md`.
