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
  | "DUPLICATE_INVOICE";

export interface Discrepancy {
  id: string;
  type: DiscrepancyType;
  severity: "low" | "medium" | "high";
  field: string;
  sourceA: SourceReference;
  sourceB: SourceReference;
  delta: number;
  financialImpact: number;
  currency: string;
  reason: string;
  confidence: number;
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

export interface ReviewDecision {
  action: "approve" | "reject" | "pending" | "request_clarification";
  reviewer: string;
  timestamp: string;
  notes?: string;
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
  reviewDecision: ReviewDecision;
}

export interface PurchaseOrderItem {
  poId: string;
  supplierId: string;
  item: string;
  orderedQty: number;
  unitPrice: number;
  currency: string;
  orderDate: string;
  demoBadge: string;
}

export interface CsvFileDump {
  file: string;
  headers: string[];
  rows: Array<{
    rowNumber: number;
    values: Record<string, string>;
  }>;
}

export interface SupplierScorecard {
  supplierId: string;
  totalSpend: number;
  overcharge: number;
  poCount: number;
  overchargeRate: number;
  violations: string[];
  grade: string;
  riskLevel: string;
}

export interface PortfolioSummary {
  totalPOsAudited: number;
  totalSpendAudited: number;
  totalOverchargesRecovered: number;
  recoveryPercentage: number;
  cleanCount: number;
  flaggedCount: number;
  categoryBreakdown: Record<string, number>;
}

export interface BatchAuditResult {
  portfolioSummary: PortfolioSummary;
  supplierScorecards: SupplierScorecard[];
  results: InvestigationResult[];
}

export interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  text: string;
  timestamp: string;
  modelUsed?: string;
}

export interface CustomAuditParams {
  poId: string;
  supplierId: string;
  item: string;
  orderedQty: number;
  deliveredQty: number;
  invoicedQty: number;
  poUnitPrice: number;
  invoiceUnitPrice: number;
  contractUnitPrice: number;
  fees: number;
}

export interface SystemHealth {
  status: string;
  timestamp: string;
  service: string;
  version?: string;
  hackathonWindow?: string;
  sponsorIntegrations: {
    zetaris: {
      layer: string;
      mode: "live" | "mock";
      engine: string;
      latencyMs: number;
      isLive: boolean;
      endpoint?: string;
    };
    meterless: {
      layer: string;
      mode: string;
      isLive: boolean;
      architecture: string;
    };
    nvidia: {
      layer: string;
      model: string;
      isLive: boolean;
      mode: string;
    };
    cursor: {
      layer: string;
      promptsLogged: boolean;
      documentationPath: string;
    };
  };
}
