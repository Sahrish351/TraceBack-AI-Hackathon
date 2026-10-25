import express from "express";
import cors from "cors";
import { config, logSystemModes } from "./config.js";
import { logger } from "./utils/logger.js";
import { router as investigateRouter } from "./routes/investigate.js";

const app = express();

app.use(cors());
app.use(express.json());

// Request logger middleware
app.use((req, _res, next) => {
  logger.debug(`${req.method} ${req.url}`);
  next();
});

// Mount API routes
app.use("/api", investigateRouter);

// Root informational endpoint
app.get("/", (_req, res) => {
  res.json({
    service: "TraceBack AI Backend API",
    status: "running",
    hackathonWindow: "Oct 22–27, 2026",
    endpoints: {
      health: "/api/health",
      pos: "/api/pos",
      investigate: "/api/investigate/:poId",
      rawSource: "/api/raw-source/:file",
      review: "/api/review/:poId",
      zetarisStatus: "/api/zetaris/status",
      hMemDump: "/api/memory"
    }
  });
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({ err }, "Unhandled server error");
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message || "An unexpected error occurred"
  });
});

app.listen(config.port, () => {
  logSystemModes();
  logger.info(`Server listening on http://localhost:${config.port}`);
});

export default app;
