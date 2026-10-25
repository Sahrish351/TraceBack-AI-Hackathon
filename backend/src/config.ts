import dotenv from "dotenv";
import path from "path";
import { logger } from "./utils/logger.js";

import fs from "fs";

// Load environment variables from repo root or local directory
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config();

function resolveDataPath(): string {
  if (process.env.DATA_PATH && fs.existsSync(process.env.DATA_PATH)) {
    return path.resolve(process.env.DATA_PATH);
  }
  const rootData = path.resolve(process.cwd(), "data");
  if (fs.existsSync(rootData)) return rootData;
  const parentData = path.resolve(process.cwd(), "..", "data");
  if (fs.existsSync(parentData)) return parentData;
  return rootData;
}

export const config = {
  port: parseInt(process.env.PORT || "4000", 10),
  nodeEnv: process.env.NODE_ENV || "development",

  // Zetaris Data Virtualization
  zetarisApiUrl: process.env.ZETARIS_API_URL || "",
  zetarisApiKey: process.env.ZETARIS_API_KEY || "",

  // Meterless Agent Orchestration
  meterlessApiUrl: process.env.METERLESS_API_URL || "",
  meterlessApiKey: process.env.METERLESS_API_KEY || "",

  // NVIDIA NIM
  nvidiaApiKey: process.env.NVIDIA_API_KEY || "",
  nvidiaModel: "meta/llama-3.1-8b-instruct",
  nvidiaApiUrl: "https://integrate.api.nvidia.com/v1/chat/completions",

  // Data paths
  dataPath: resolveDataPath()
};

export const isZetarisLive = Boolean(config.zetarisApiKey && config.zetarisApiUrl);
export const isMeterlessLive = Boolean(config.meterlessApiKey);
export const isNvidiaLive = Boolean(config.nvidiaApiKey);

export function logSystemModes() {
  logger.info("=================================================");
  logger.info("   TRACEBACK AI — SUPPLIER INVOICE CHECKER");
  logger.info("   Build Window: Oct 22–27, 2026 | Hackathon Edition");
  logger.info("=================================================");
  logger.info(
    `[ZETARIS] Data Layer: ${
      isZetarisLive
        ? `LIVE (${config.zetarisApiUrl})`
        : "ZETARIS MOCK (Cross-Source In-Memory Virtualization)"
    }`
  );
  logger.info(
    `[METERLESS] Agent Layer: ${
      isMeterlessLive
        ? `LIVE (${config.meterlessApiUrl})`
        : "LOCAL ORCHESTRATOR (Scout Intent -> Relay Execution -> H-MEM)"
    }`
  );
  logger.info(
    `[NVIDIA] Inference Layer: ${
      isNvidiaLive
        ? `NVIDIA NIM LIVE (${config.nvidiaModel})`
        : "DETERMINISTIC FALLBACK ENGINE (Guaranteed 100% Demo Reliability)"
    }`
  );
  logger.info(`[SERVER] Port: ${config.port} | Data Path: ${config.dataPath}`);
  logger.info("=================================================");
}
