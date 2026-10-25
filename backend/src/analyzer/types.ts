export interface SourceReference {
  label: string;
  file: string;
  row: number;
  column: string;
  value: number | string;
}

export type DiscrepancyType =
  | "QTY_SHORT"
  | "QTY_OVERBILL"
  | "PRICE_ABOVE_CONTRACT"
  | "UNEXPECTED_FEE"
  | "DUPLICATE_INVOICE"
  | "MISSING_EVIDENCE";

export type SeverityLevel = "low" | "medium" | "high";

export interface Discrepancy {
  id: string;
  type: DiscrepancyType;
  severity: SeverityLevel;
  field: string;
  sourceA: SourceReference;
  sourceB: SourceReference;
  delta: number;
  financialImpact: number;
  currency: string;
  reason: string;
  confidence: number; // 0..1
  remediationHint: string;
}

export interface UnifiedRecord {
  poId: string;
  supplierId: string;
  item: string;
  currency: string;
  orderedQty: number;
  deliveredQty: number;
  invoicedQty: number;
  poUnitPrice: number;
  invoiceUnitPrice: number;
  contractUnitPrice: number;
  fees: number;
  orderDate: string;
  deliveryDate: string;
  invoiceDate: string;
  warehouse: string;
  invoiceId: string;
  deliveryId: string;
  allInvoicesForPo?: Array<{
    invoiceId: string;
    invoicedQty: number;
    unitPrice: number;
    fees: number;
  }>;
  sqlQueryExecuted: string;
  sourceRefs: SourceReference[];
}

export interface AnalysisSummary {
  poId: string;
  supplierId: string;
  item: string;
  totalFinancialImpact: number;
  currency: string;
  discrepancies: Discrepancy[];
  discrepancyCount: number;
  status: "CLEAN" | "FLAGGED_FOR_REVIEW" | "APPROVED" | "REJECTED";
  confidenceScore: number;
  auditTimestamp: string;
}

export interface MissionTraceStep {
  step: number;
  name: string;
  thought: string;
  action: string;
  observation: string;
  durationMs: number;
  status: "pending" | "running" | "completed" | "failed";
}

export interface MissionTrace {
  missionId: string;
  objective: string;
  poId: string;
  steps: MissionTraceStep[];
  totalDurationMs: number;
  hMemKey?: string;
}

export interface SupplierEmailDraft {
  to: string;
  subject: string;
  body: string;
  recipientName: string;
  claimAmount: string;
}

export interface ExplanationOutput {
  executiveSummary: string;
  auditRationale: string;
  supplierEmail: SupplierEmailDraft;
  modelUsed: string;
  isLive: boolean;
}

export interface InvestigationResult {
  poId: string;
  supplierId: string;
  item: string;
  summary: AnalysisSummary;
  discrepancies: Discrepancy[];
  unifiedRecord: UnifiedRecord;
  missionTrace: MissionTrace;
  explanation: ExplanationOutput;
  dataSourcesStatus: {
    purchaseOrders: { loaded: boolean; rowCount: number; file: string };
    deliveries: { loaded: boolean; rowCount: number; file: string };
    invoices: { loaded: boolean; rowCount: number; file: string };
    contractPrices: { loaded: boolean; rowCount: number; file: string };
  };
  reviewDecision?: {
    action: "approve" | "reject" | "pending";
    reviewer: string;
    timestamp: string;
    notes?: string;
  };
}
