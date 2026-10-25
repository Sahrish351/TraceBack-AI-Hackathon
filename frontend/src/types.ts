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
  | "MISSING_EVIDENCE"
  | "MISSING_ITEM"
  | "DUPLICATE_ITEM"
  | "TAX_MISMATCH"
  | "CURRENCY_MISMATCH"
  | "PARTIAL_DELIVERY";

export interface DiscrepancyCalculation {
  formula: string; // e.g. "(120 invoiced - 100 received) × Rs 500 = Rs 10,000"
  itemIdentifier?: string;
  expectedQty?: number;
  actualQty?: number;
  expectedUnitPrice?: number;
  actualUnitPrice?: number;
  deltaQty?: number;
  deltaPrice?: number;
  subtotalImpact?: number;
  taxImpact?: number;
  taxVariance?: number;
  currency: string;
}

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
  itemIdentifier?: string;
  calculation?: DiscrepancyCalculation;
}

export interface InvoiceLineItem {
  itemId: string;
  description: string;
  orderedQty: number;
  deliveredQty: number;
  invoicedQty: number;
  poUnitPrice: number;
  invoiceUnitPrice: number;
  contractUnitPrice: number;
  taxRate?: number;
  taxAmount?: number;
  subtotal?: number;
  currency?: string;
  status?: "MATCHED" | "QTY_OVERBILL" | "QTY_SHORT" | "PRICE_MISMATCH" | "MISSING_ITEM" | "DUPLICATE_ITEM" | "INVALID_DATA";
  sourceRefs?: SourceReference[];
}

export interface InvoiceFinancialSummary {
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  calculatedSubtotal: number;
  calculatedTax: number;
  calculatedTotal: number;
  taxDiscrepancy?: number;
  formula?: string;
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
  lineItems?: InvoiceLineItem[];
  financialSummary?: InvoiceFinancialSummary;
  taxRate?: number;
  taxAmount?: number;
  totalAmount?: number;
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

export type IntegrationHealthStatus =
  | "Connected and verified"
  | "Configured but not verified"
  | "Not configured"
  | "Blocked by credentials or account access"
  | "Local / demo mode";

export interface SystemHealth {
  status: string;
  timestamp: string;
  service: string;
  version?: string;
  hackathonWindow?: string;
  sponsorIntegrations: {
    zetaris: {
      layer: string;
      status: string;
      mode: "live" | "mock";
      engine: string;
      latencyMs: number;
      isLive: boolean;
      endpoint?: string;
      reason?: string;
    };
    meterless: {
      layer: string;
      status: string;
      mode: string;
      isLive: boolean;
      architecture: string;
      endpoint?: string;
      reason?: string;
    };
    nvidia: {
      layer: string;
      status: string;
      model: string;
      isLive: boolean;
      mode: string;
      endpoint?: string;
      reason?: string;
    };
    cursor: {
      layer: string;
      status: string;
      promptsLogged: boolean;
      documentationPath: string;
      note?: string;
    };
  };
}
