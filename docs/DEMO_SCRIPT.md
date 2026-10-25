# TraceBack AI — 1–4 Minute Hackathon Demo Script

> **Target Audience**: Hackathon Judges (Business Impact, Technical Rigor, Sponsor Tech Integration)  
> **Total Duration**: 3 to 4 Minutes  
> **Key Metric to Emphasize**: **$1,200 USD recovered on a single purchase order**, 100% evidence-grounded.

---

## ⏱️ Minute 0:00 – 0:30 | The Hook & Business Problem

**Speaker**:
> "Good morning judges. In global enterprise supply chains, companies quietly lose between **1.5% and 4% of their total procurement spend** to uncaptured supplier overcharges.
> 
> The core reason? Data fragmentation. Your purchase orders sit in SAP, your warehouse delivery notes sit in your WMS, your invoices arrive as PDFs in Accounts Payable, and your contract pricing lives in legal agreements. No one has time to manually cross-reference all four.
> 
> Introducing **TraceBack AI** — an autonomous AI agent that reconciles all 4 sources, detects financial leakage, proves every penny with a verifiable evidence trail, and drafts a resolution letter in under 200 milliseconds."

---

## ⏱️ Minute 0:30 – 1:15 | The Live Investigation (PO-1001)

*(Action: Screen shows TraceBack AI Dashboard loaded on `PO-1001`)*

**Speaker**:
> "Let's look at a live audit for Purchase Order `PO-1001` with supplier SUP-42.
> 
> Instantly, TraceBack AI surfaces **$1,200 USD in recoverable financial overcharges** across two distinct violations, corroborated with a **96.5% confidence score**.
> 
> Notice the two evidence cards:
> 1. **Quantity Overbilling**: The supplier invoiced for **120 units**, but warehouse receiving note `DN-045` logged only **100 units** received. That's 20 unreceived units billed at $50 each — exactly **$1,000 USD** in direct overcharges.
> 2. **Contract Price Escalation**: The supplier billed at **$50/unit**, but our master procurement contract guarantees a rate of **$48/unit**. That's an unauthorized $2/unit markup on 100 units — adding **$200 USD** in rate leakage."

---

## ⏱️ Minute 1:15 – 2:00 | Sponsor Tech 1: Zetaris Data Virtualization & Evidence Trail

*(Action: Click on the chip `invoices.csv:L2`, opening the `SourceModal` viewer. Highlight the table row and column. Then toggle 'View Zetaris SQL'.)*

**Speaker**:
> "Now, how does TraceBack AI know this without brittle ETL pipelines?
> 
> Here is where **Zetaris** comes in as our Data Virtualization layer. TraceBack AI uses **Zetaris federated SQL queries** to join across Purchase Orders, Delivery Notes, Invoices, and Contract Prices in real time without copying or duplicating data.
> 
> Every single finding carries an immutable **Evidence Trail**: citing the exact `{file, row, column, value}`. If an auditor or supplier disputes a claim, clicking any chip pops up the raw ground-truth data row in our Source Viewer. Total transparency, zero hallucinations."

---

## ⏱️ Minute 2:00 – 2:45 | Sponsor Tech 2: Meterless Agent Mission & Step Reasoning

*(Action: Click on the 'Meterless Agent Trace' tab. Expand Step 1 through Step 5.)*

**Speaker**:
> "TraceBack AI is not a simple chatbot or a hardcoded script — it is an autonomous agent orchestrated using the **Meterless Agent Architecture**:
> 
> 1. **Scout Intent**: Determines target scope, thresholds, and sets verification tolerances.
> 2. **Fetch Unified Data**: Relays the federated virtualization request to Zetaris.
> 3. **Detect Discrepancies**: Applies pure 4-way comparison rules.
> 4. **Score Confidence**: Evaluates cross-source corroboration and risk exposure.
> 5. **Draft Explanation**: Synthesizes human-readable audit justification.
> 
> Every step captures the agent's internal **Thought, Action, and Observation**, and the entire session is committed to Meterless **H-MEM (Hierarchical Memory)** for audit compliance."

---

## ⏱️ Minute 2:45 – 3:15 | Sponsor Tech 3: Human-in-the-Loop & NVIDIA NIM

*(Action: Click 'Approve Claim ($1,200)'. Then navigate to the 'Supplier Resolution Email' tab.)*

**Speaker**:
> "Crucially, TraceBack AI keeps a **Human in the Loop**. No dispute is sent to a supplier without human authorization.
> 
> With one click, the lead auditor clicks **'Approve Claim ($1,200)'**.
> 
> TraceBack AI immediately invokes **NVIDIA NIM** running `meta/llama-3.1-8b-instruct` to draft a polite, highly specific clarification email for Supplier SUP-42. It breaks down the exact invoice number, delivery note, contract schedule, and requests an immediate $1,200 debit note. We can copy it or dispatch it straight to the supplier queue."

---

## ⏱️ Minute 3:15 – 3:45 | The Credibility Test (PO-1002 Clean Audit)

*(Action: Click on `PO-1002` in the left sidebar.)*

**Speaker**:
> "A major weakness of naive LLM audit tools is that they hallucinate errors where none exist.
> 
> Let's switch to `PO-1002`.
> 
> TraceBack AI immediately verifies 50 units ordered, 50 delivered, 50 invoiced at the contracted $20 rate. The system returns **$0.00 Overcharge** and **100% Concordance**, instantly clearing the invoice for payment without unnecessary supplier friction."

---

## ⏱️ Minute 3:45 – 4:00 | Summary & Developer Experience

**Speaker**:
> "To summarize:
> - **Financial Impact**: $1,200 recovered in seconds on a single order.
> - **Sponsor Tech**: Real **Zetaris** data virtualization, **Meterless** agent orchestration, **NVIDIA NIM** inference, and engineered with **Cursor Agent Mode**.
> - Fully runnable, tested, and ready to deploy.
> 
> Thank you, and we welcome your questions!"
