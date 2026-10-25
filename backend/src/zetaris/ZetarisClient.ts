import { createRequire } from "node:module";
const nodeRequire = createRequire(process.cwd() + "/");
const { DatabaseSync } = nodeRequire("node:sqlite") || {};
import { config, isZetarisLive } from "../config.js";
import { logger } from "../utils/logger.js";
import { readCsvSync, findSourceRef } from "../utils/csv.js";
import { UnifiedRecord, SourceReference } from "../analyzer/types.js";
import { UNIFIED_VIEW_SQL, RawJoinedRow } from "./unifiedView.js";
import { mockScenarios } from "../mockData.js";

/**
 * ZetarisClient
 * 
 * Provides unified cross-source data virtualization.
 * In live mode: Connects to the Zetaris Network Data Virtualization REST API.
 * In local/demo mode: Executes the exact same federated SQL join in an in-memory
 * SQLite virtual schema across 4 disparate CSV sources (PO, Deliveries, Invoices, Contract Prices).
 */
export class ZetarisClient {
  private db: any = null;
  private initialized = false;

  constructor() {
    this.initMockEngine();
  }

  /**
   * Initializes the in-memory SQLite virtual schema simulating the Zetaris query federator.
   */
  private initMockEngine() {
    try {
      this.db = new DatabaseSync(":memory:");

      // 1. Create Purchase Orders Virtual Table
      this.db.exec(`
        CREATE TABLE purchase_orders (
          po_id TEXT PRIMARY KEY,
          supplier_id TEXT,
          item TEXT,
          ordered_qty REAL,
          unit_price REAL,
          currency TEXT,
          order_date TEXT
        );
      `);

      // 2. Create Deliveries Virtual Table
      this.db.exec(`
        CREATE TABLE deliveries (
          delivery_id TEXT PRIMARY KEY,
          po_id TEXT,
          item TEXT,
          delivered_qty REAL,
          delivery_date TEXT,
          warehouse TEXT
        );
      `);

      // 3. Create Invoices Virtual Table
      this.db.exec(`
        CREATE TABLE invoices (
          invoice_id TEXT PRIMARY KEY,
          po_id TEXT,
          item TEXT,
          invoiced_qty REAL,
          unit_price REAL,
          currency TEXT,
          fees REAL,
          invoice_date TEXT
        );
      `);

      // 4. Create Contract Prices Virtual Table
      this.db.exec(`
        CREATE TABLE contract_prices (
          supplier_id TEXT,
          item TEXT,
          contract_unit_price REAL,
          valid_from TEXT,
          valid_to TEXT,
          PRIMARY KEY (supplier_id, item)
        );
      `);

      // Ingest CSV records into virtual schema
      this.syncCsvToVirtualTables();
      this.initialized = true;
      logger.info("[ZetarisClient] In-memory cross-source virtualization engine initialized.");
    } catch (err) {
      logger.error({ err }, "[ZetarisClient] Failed to initialize in-memory SQLite engine");
    }
  }

  /**
   * Reads from CSV files and seeds SQLite tables
   */
  private syncCsvToVirtualTables() {
    if (!this.db) return;

    // Load POs
    const poRows = readCsvSync("purchase_orders.csv");
    const insertPo = this.db.prepare(`
      INSERT INTO purchase_orders (po_id, supplier_id, item, ordered_qty, unit_price, currency, order_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const r of poRows) {
      insertPo.run(
        r.data.po_id,
        r.data.supplier_id,
        r.data.item,
        parseFloat(r.data.ordered_qty || "0"),
        parseFloat(r.data.unit_price || "0"),
        r.data.currency || "USD",
        r.data.order_date || ""
      );
    }

    // Load Deliveries
    const deliveryRows = readCsvSync("deliveries.csv");
    const insertDel = this.db.prepare(`
      INSERT INTO deliveries (delivery_id, po_id, item, delivered_qty, delivery_date, warehouse)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    for (const r of deliveryRows) {
      insertDel.run(
        r.data.delivery_id,
        r.data.po_id,
        r.data.item,
        parseFloat(r.data.delivered_qty || "0"),
        r.data.delivery_date || "",
        r.data.warehouse || ""
      );
    }

    // Load Invoices
    const invoiceRows = readCsvSync("invoices.csv");
    const insertInv = this.db.prepare(`
      INSERT INTO invoices (invoice_id, po_id, item, invoiced_qty, unit_price, currency, fees, invoice_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const r of invoiceRows) {
      insertInv.run(
        r.data.invoice_id,
        r.data.po_id,
        r.data.item,
        parseFloat(r.data.invoiced_qty || "0"),
        parseFloat(r.data.unit_price || "0"),
        r.data.currency || "USD",
        parseFloat(r.data.fees || "0"),
        r.data.invoice_date || ""
      );
    }

    // Load Contract Prices
    const contractRows = readCsvSync("contract_prices.csv");
    const insertCp = this.db.prepare(`
      INSERT INTO contract_prices (supplier_id, item, contract_unit_price, valid_from, valid_to)
      VALUES (?, ?, ?, ?, ?)
    `);
    for (const r of contractRows) {
      insertCp.run(
        r.data.supplier_id,
        r.data.item,
        parseFloat(r.data.contract_unit_price || "0"),
        r.data.valid_from || "",
        r.data.valid_to || ""
      );
    }
  }

  /**
   * Health Check: checks whether Zetaris cloud or local mock is ready
   */
  async healthCheck(customFetch?: typeof fetch): Promise<{
    mode: "live" | "mock";
    latencyMs: number;
    status: string;
    engine: string;
    endpoint?: string;
    configured: boolean;
    reason?: string;
  }> {
    const start = performance.now();
    const fetchImpl = customFetch || fetch;

    if (isZetarisLive) {
      try {
        const res = await fetchImpl(`${config.zetarisApiUrl}/health`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${config.zetarisApiKey}`,
            "Content-Type": "application/json"
          }
        });
        const duration = Math.round(performance.now() - start);
        if (res.ok) {
          return {
            mode: "live",
            latencyMs: duration,
            status: "Connected and verified",
            engine: "Zetaris Network Data Virtualization Hub",
            endpoint: config.zetarisApiUrl,
            configured: true
          };
        }
        return {
          mode: "mock",
          latencyMs: duration,
          status: "Blocked by credentials or account access",
          engine: "Zetaris In-Memory SQLite Cross-Source Virtualizer",
          endpoint: config.zetarisApiUrl,
          configured: true,
          reason: `Zetaris health endpoint responded with HTTP ${res.status}`
        };
      } catch (err: any) {
        logger.warn({ err }, "[ZetarisClient] Live health check failed, falling back to mock reporting.");
        const duration = Math.round(performance.now() - start);
        return {
          mode: "mock",
          latencyMs: duration,
          status: "Blocked by credentials or account access",
          engine: "Zetaris In-Memory SQLite Cross-Source Virtualizer",
          endpoint: config.zetarisApiUrl,
          configured: true,
          reason: err.message || "Network connection failure"
        };
      }
    }

    const duration = Math.round(performance.now() - start);
    return {
      mode: "mock",
      latencyMs: duration || 2,
      status: "Not configured (Local / demo mode)",
      engine: "Zetaris In-Memory SQLite Cross-Source Virtualizer",
      configured: false,
      reason: "ZETARIS_API_KEY environment variable is not configured"
    };
  }

  /**
   * Retrieves unified cross-source view of a purchase order
   */
  async unifiedOrderView(poId: string, customFetch?: typeof fetch): Promise<UnifiedRecord> {
    const formattedSql = UNIFIED_VIEW_SQL.replace("?", `'${poId}'`);
    const fetchImpl = customFetch || fetch;

    if (isZetarisLive) {
      try {
        logger.info(`[ZETARIS LIVE] Querying Zetaris virtualization cluster for ${poId}...`);
        const response = await fetchImpl(`${config.zetarisApiUrl}/query`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.zetarisApiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            sql: UNIFIED_VIEW_SQL,
            parameters: [poId]
          })
        });

        if (response.ok) {
          const json = (await response.json()) as any;
          const row: RawJoinedRow = json?.data?.[0] || json?.rows?.[0];
          if (row) {
            return this.buildUnifiedRecordFromRow(row, formattedSql);
          }
        }
        logger.warn("[ZETARIS LIVE] Query returned no records or failed, falling back to mock engine.");
      } catch (liveErr) {
        logger.error({ err: liveErr }, "[ZETARIS LIVE] Error connecting to Zetaris API, falling back to mock.");
      }
    }

    // ZETARIS MOCK / LOCAL FALLBACK
    logger.info(`[ZETARIS MOCK] Executing SQL cross-source join on local SQLite virtualizer for ${poId}...`);
    if (!this.db || !this.initialized) {
      this.initMockEngine();
    }

    try {
      if (this.db) {
        const stmt = this.db.prepare(UNIFIED_VIEW_SQL);
        const row = stmt.get(poId) as RawJoinedRow | undefined;

        if (row) {
          const invStmt = this.db.prepare("SELECT invoice_id, invoiced_qty, unit_price, fees FROM invoices WHERE po_id = ?");
          const invRows = invStmt.all(poId) as Array<{ invoice_id: string; invoiced_qty: number; unit_price: number; fees: number }>;
          const allInvoices = invRows.map(i => ({
            invoiceId: String(i.invoice_id),
            invoicedQty: Number(i.invoiced_qty),
            unitPrice: Number(i.unit_price),
            fees: Number(i.fees || 0)
          }));
          const unified = this.buildUnifiedRecordFromRow(row, formattedSql, allInvoices);
          // Preserve multi-line item breakdown from mock scenario if present
          if (mockScenarios[poId]?.lineItems) {
            unified.lineItems = mockScenarios[poId].lineItems;
            unified.financialSummary = mockScenarios[poId].financialSummary;
            unified.taxRate = mockScenarios[poId].taxRate;
            unified.taxAmount = mockScenarios[poId].taxAmount;
            unified.totalAmount = mockScenarios[poId].totalAmount;
          }
          return unified;
        }
      }
    } catch (sqlErr) {
      logger.error({ err: sqlErr }, "[ZETARIS MOCK] SQL Execution error on in-memory schema");
    }

    // Ultimate fallback if PO not found in dynamic SQL
    if (mockScenarios[poId]) {
      logger.info(`[ZETARIS MOCK] Using fallback static scenario for ${poId}`);
      return mockScenarios[poId];
    }

    throw new Error(`[ZetarisClient] Purchase Order ${poId} not found in any virtualized data sources.`);
  }

  private buildUnifiedRecordFromRow(
    row: RawJoinedRow,
    sqlExecuted: string,
    allInvoices?: Array<{ invoiceId: string; invoicedQty: number; unitPrice: number; fees: number }>
  ): UnifiedRecord {
    const poId = String(row.po_id);
    const supplierId = String(row.supplier_id);
    const item = String(row.item);
    const currency = String(row.currency || "USD");

    const orderedQty = Number(row.ordered_qty || 0);
    const deliveredQty = Number(row.delivered_qty || 0);
    const invoicedQty = Number(row.invoiced_qty || 0);

    const poUnitPrice = Number(row.po_unit_price || 0);
    const invoiceUnitPrice = Number(row.invoice_unit_price || 0);
    const contractUnitPrice = Number(row.contract_unit_price || 0);
    const fees = Number(row.fees || 0);

    // Build Evidence Trail sourceRefs citing {file, row, column, value}
    const poRef = findSourceRef("purchase_orders.csv", "po_id", poId, "ordered_qty");
    const delRef = findSourceRef("deliveries.csv", "po_id", poId, "delivered_qty");
    const invRef = findSourceRef("invoices.csv", "po_id", poId, "invoiced_qty");
    const invPriceRef = findSourceRef("invoices.csv", "po_id", poId, "unit_price");
    const contractPriceRef = findSourceRef("contract_prices.csv", "supplier_id", supplierId, "contract_unit_price");

    const sourceRefs: SourceReference[] = [
      {
        label: "Purchase Order Quantity",
        file: "purchase_orders.csv",
        row: poRef.row,
        column: "ordered_qty",
        value: orderedQty
      },
      {
        label: "Delivery Receipt Quantity",
        file: "deliveries.csv",
        row: delRef.row,
        column: "delivered_qty",
        value: deliveredQty
      },
      {
        label: "Supplier Invoiced Quantity",
        file: "invoices.csv",
        row: invRef.row,
        column: "invoiced_qty",
        value: invoicedQty
      },
      {
        label: "Billed Unit Price",
        file: "invoices.csv",
        row: invPriceRef.row,
        column: "unit_price",
        value: invoiceUnitPrice
      },
      {
        label: "Agreed Contract Price",
        file: "contract_prices.csv",
        row: contractPriceRef.row,
        column: "contract_unit_price",
        value: contractUnitPrice
      }
    ];

    const invoiceList =
      allInvoices && allInvoices.length > 0
        ? allInvoices
        : [
            {
              invoiceId: String(row.invoice_id || ""),
              invoicedQty,
              unitPrice: invoiceUnitPrice,
              fees
            }
          ];

    return {
      poId,
      supplierId,
      item,
      currency,
      orderedQty,
      deliveredQty,
      invoicedQty,
      poUnitPrice,
      invoiceUnitPrice,
      contractUnitPrice,
      fees,
      orderDate: String(row.order_date || ""),
      deliveryDate: String(row.delivery_date || ""),
      invoiceDate: String(row.invoice_date || ""),
      warehouse: String(row.warehouse || "WH-01"),
      invoiceId: String(row.invoice_id || ""),
      deliveryId: String(row.delivery_id || ""),
      allInvoicesForPo: invoiceList,
      sqlQueryExecuted: sqlExecuted,
      sourceRefs
    };
  }
}

export const zetarisClient = new ZetarisClient();
