# TraceBack AI — Video Demo Script (1 to 4 Minutes)

**Target Duration:** 2 to 3.5 minutes  
**Presenter:** Auditor / Participant  
**Demo URL:** `http://localhost:3000` (or GitHub Pages live link)  
**Tone:** Confident, professional, evidence-first, and honest.

---

## ⏱️ Video Timeline Breakdown

| Timestamp | Screen | Key Talking Points | Visual Action on Screen |
| :--- | :--- | :--- | :--- |
| **0:00 – 0:30** | **Landing Page** | Introduce TraceBack AI as an evidence-first supplier invoice reconciliation agent. | Scroll through landing page; highlight 4-step workflow: Collect → Compare → Show Evidence → Human Review. Click **Open Workspace**. |
| **0:30 – 1:15** | **Overview Dashboard & Canonical Case (PO-1042)** | Explain that organizations leak 2–4% of spend to uncaptured invoice errors. Point out the **Demo Fixture Banner**. Open `PO-1042` (Northstar Office Supplies). | Click on **PO-1042** in the table. Show the banner: *"Potential Discrepancy Detected — Requires Human Review"*. Highlight: 120 invoiced vs 100 delivered = **20 unreceived units billed @ Rs 500 = Rs 10,000 potential amount**. |
| **1:15 – 1:50** | **Evidence Trail & Calculation Transparency** | Explain that TraceBack AI never accuses suppliers of fraud; every finding cites exact file and row coordinates. | Click **Evidence Trail** tab. Show `invoices.csv:L7` vs `deliveries.csv:L6`. Click **Source Records** to preview the raw CSV view. Show the deterministic formula: `(120 - 100) × Rs 500 = Rs 10,000`. |
| **1:50 – 2:25** | **Multi-Item Invoice Scenario (PO-2005)** | Demonstrate support for complex multi-item consignments. | Return to investigations, select **PO-2005** (Braintec). Show itemized table reconciling 5 distinct line items (sofas, chairs, tables). Highlight how quantity overbill and contract price escalation are evaluated on separate lines without double counting ($3,150 total exposure). |
| **2:25 – 2:55** | **Human Review & Audit Trail** | Show human oversight. TraceBack AI drafts a supplier clarification email but never auto-sends it. | Click **Review Finding**. Enter reviewer notes: *"Confirmed receiving dock logged only 100 units"*. Click **Accept Finding**. Show how the decision is saved into persistent audit memory. |
| **2:55 – 3:30** | **Integration Health & Sponsor Architecture** | Review the **Integrations** screen. Explain honest 5-state reporting: Cursor verified; Zetaris, Meterless, and NVIDIA NIM running in tested Local/Demo mode with full failover resilience. | Navigate to **Integrations** tab. Show latency, status pills, engine descriptions, and configuration guide for live keys. Close with project vision. |

---

## 🎙️ Spoken Script (Word-for-Word Guide)

### Part 1: Introduction (0:00 – 0:30)
> *"Hello judges! Welcome to TraceBack AI. In procurement and accounts payable, companies leak millions every year because invoice checking is manual, fragmented across disparate spreadsheets and portals, and generic AI chatbots hallucinate numbers.*  
> *TraceBack AI is built for the hackathon track 'The Agent That Can Explain Why'. It provides an evidence-first investigation platform where every invoice warning comes with its receipts, calculations are 100% deterministic, and a human reviewer always makes the final call. Let's enter the workspace."*

### Part 2: Canonical Scenario — Northstar Office Supplies (0:30 – 1:15)
> *"Here on the dashboard, we immediately see an overview of our procurement investigations. Notice our transparent demo fixture banner—all benchmark cases are sample fixtures so judges can verify every calculation.*  
> *Let's inspect our canonical benchmark case: Purchase Order PO-1042 from Northstar Office Supplies.*  
> *TraceBack AI immediately flags a clear finding: Potential Discrepancy Detected — Requires Human Review. We ordered 120 ergonomic office chairs at Rs 500 each. The supplier submitted invoice INV-7781 billing us for all 120 units. But warehouse receiving note DN-1042 confirms our dock accepted only 100 units.*  
> *Using deterministic arithmetic, TraceBack AI calculates the exact potential discrepancy: 20 unreceived units times Rs 500 agreed rate equals exactly Rs 10,000."*

### Part 3: Evidence Trail & Multi-Item Support (1:15 – 2:25)
> *"Crucially, our agent doesn't guess. In the Evidence tab, judges can see the exact line-level audit trail: Invoice line 7 versus Delivery slip line 6. We can open the raw source file viewer to inspect the original records.*  
> *TraceBack AI also handles complex multi-item consignments. If we switch to PO-2005 from Braintec, our engine matches 5 distinct line items, identifying both an unreceived sofa quantity variance of $2,400 and a separate contract rate escalation of $750 on lounge chairs—totalling $3,150 without double-counting."*

### Part 4: Human Review & AI Explanation (2:25 – 2:55)
> *"Under the AI Explanation tab, our explainer generates an executive summary and drafts a polite supplier clarification letter citing the exact source documents. TraceBack AI never auto-sends emails or debits accounts. In the Human Review screen, an auditor reviews the evidence, types audit notes, and records an official decision—which is immutably stored in persistent memory."*

### Part 5: Sponsor Technology & Wrap-Up (2:55 – 3:30)
> *"Finally, let's look at our Integrations Health screen. In compliance with strict hackathon integrity, we never fake a live connection. Cursor is verified as our core development environment. Zetaris, Meterless, and NVIDIA NIM are fully implemented with resilient adapter contracts and currently operate in verified Local / Demo mode using in-memory virtualized SQLite schemas and deterministic fallback models.*  
> *TraceBack AI: Transparent. Traceable. Trusted. Thank you!"*
