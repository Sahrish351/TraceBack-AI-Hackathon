import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { config } from "../config.js";
import { logger } from "./logger.js";

export interface ParsedCsvRow {
  rowNumber: number; // 1-based index (row 1 is header, row 2 is first data row)
  data: Record<string, string>;
}

export interface CsvFileDump {
  file: string;
  headers: string[];
  rows: Array<{
    rowNumber: number;
    values: Record<string, string>;
  }>;
}

export function readCsvSync(fileName: string): ParsedCsvRow[] {
  const filePath = path.resolve(config.dataPath, fileName);
  if (!fs.existsSync(filePath)) {
    logger.warn(`CSV file not found at ${filePath}, checking fallback location...`);
    // Fallback if running from dist or nested folder
    const fallback = path.resolve(process.cwd(), "data", fileName);
    if (fs.existsSync(fallback)) {
      return parseCsvFromFile(fallback);
    }
    const rootFallback = path.resolve(process.cwd(), "..", "data", fileName);
    if (fs.existsSync(rootFallback)) {
      return parseCsvFromFile(rootFallback);
    }
    throw new Error(`CSV file ${fileName} not found in ${config.dataPath}`);
  }
  return parseCsvFromFile(filePath);
}

function parseCsvFromFile(filePath: string): ParsedCsvRow[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  }) as Record<string, string>[];

  return records.map((record, index) => ({
    rowNumber: index + 2, // 1-based index (Header is row 1, first data row is 2)
    data: record
  }));
}

export function getCsvDump(fileName: string): CsvFileDump {
  const rows = readCsvSync(fileName);
  const headers = rows.length > 0 ? Object.keys(rows[0].data) : [];
  return {
    file: fileName,
    headers,
    rows: rows.map((r) => ({
      rowNumber: r.rowNumber,
      values: r.data
    }))
  };
}

export function findSourceRef(
  fileName: string,
  keyColumn: string,
  keyValue: string,
  targetColumn: string
): { row: number; value: string } {
  try {
    const rows = readCsvSync(fileName);
    const found = rows.find(
      (r) =>
        r.data[keyColumn]?.trim().toUpperCase() === keyValue.trim().toUpperCase()
    );
    if (found) {
      return {
        row: found.rowNumber,
        value: found.data[targetColumn] ?? ""
      };
    }
  } catch (err) {
    logger.error({ err, fileName }, "Failed to find source reference");
  }
  return { row: 2, value: "" };
}
