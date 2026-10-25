import { Router, Request, Response, NextFunction } from "express";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { z } from "zod";
import { config } from "../config.js";
import { logger } from "../utils/logger.js";

export const authRouter = Router();

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: "Lead Auditor" | "AP Compliance Analyst" | "Read-Only Auditor";
  avatar: string;
  department: string;
  permissions: string[];
}

interface StoredUser extends UserProfile {
  passwordHash: string;
  salt: string;
}

// In-memory active sessions map (token -> user)
const activeSessions = new Map<string, { user: UserProfile; expiresAt: number }>();

const USERS_FILE = path.join(config.dataPath, ".users.json");

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

function getInitialUsers(): StoredUser[] {
  const salt1 = crypto.randomBytes(16).toString("hex");
  const salt2 = crypto.randomBytes(16).toString("hex");
  const salt3 = crypto.randomBytes(16).toString("hex");

  return [
    {
      id: "usr-001",
      email: "sahrish@traceback.ai",
      name: "Sahrish",
      role: "Lead Auditor",
      avatar: "SA",
      department: "Procurement Internal Audit",
      permissions: ["read", "review:approve", "review:reject", "review:request_info", "export", "configure"],
      salt: salt1,
      passwordHash: hashPassword("Audit2026!", salt1)
    },
    {
      id: "usr-002",
      email: "analyst@traceback.ai",
      name: "Alex Chen",
      role: "AP Compliance Analyst",
      avatar: "AC",
      department: "Accounts Payable Compliance",
      permissions: ["read", "review:request_info", "export"],
      salt: salt2,
      passwordHash: hashPassword("Audit2026!", salt2)
    },
    {
      id: "usr-003",
      email: "observer@traceback.ai",
      name: "Guest Observer",
      role: "Read-Only Auditor",
      avatar: "GO",
      department: "External Compliance Oversight",
      permissions: ["read", "export"],
      salt: salt3,
      passwordHash: hashPassword("Audit2026!", salt3)
    }
  ];
}

function loadUsers(): StoredUser[] {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    logger.warn({ err }, "Could not read users file, re-initializing default users");
  }
  const defaults = getInitialUsers();
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(defaults, null, 2), "utf-8");
  } catch {}
  return defaults;
}

// Ensure default session exists for zero-config demo experience
const defaultAuditor = loadUsers()[0];
const defaultSessionToken = "tb_session_default_lead_auditor";
activeSessions.set(defaultSessionToken, {
  user: {
    id: defaultAuditor.id,
    email: defaultAuditor.email,
    name: defaultAuditor.name,
    role: defaultAuditor.role,
    avatar: defaultAuditor.avatar,
    department: defaultAuditor.department,
    permissions: defaultAuditor.permissions
  },
  expiresAt: Date.now() + 86400000 * 30
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

/**
 * POST /api/auth/login
 */
authRouter.post("/login", (req: Request, res: Response) => {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: "Invalid credentials format" });
  }

  const { email, password } = parse.data;
  const users = loadUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const computedHash = hashPassword(password, user.salt);
  if (computedHash !== user.passwordHash) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = `tb_session_${crypto.randomBytes(24).toString("hex")}`;
  const profile: UserProfile = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatar: user.avatar,
    department: user.department,
    permissions: user.permissions
  };

  activeSessions.set(token, {
    user: profile,
    expiresAt: Date.now() + 86400000 * 7 // 7 days
  });

  logger.info(`User ${profile.name} logged in (${profile.role})`);
  res.json({ success: true, token, user: profile });
});

/**
 * POST /api/auth/logout
 */
authRouter.post("/logout", (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/, "") || (req.headers["x-session-token"] as string);
  if (token && token !== defaultSessionToken) {
    activeSessions.delete(token);
  }
  res.json({ success: true, message: "Logged out successfully" });
});

/**
 * GET /api/auth/me
 */
authRouter.get("/me", (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/, "") || (req.headers["x-session-token"] as string) || defaultSessionToken;
  const session = activeSessions.get(token);

  if (session && session.expiresAt > Date.now()) {
    return res.json({ authenticated: true, user: session.user, token });
  }

  // Fallback to default lead auditor for uninterrupted hackathon presentation
  const defaultUser = loadUsers()[0];
  res.json({
    authenticated: true,
    user: {
      id: defaultUser.id,
      email: defaultUser.email,
      name: defaultUser.name,
      role: defaultUser.role,
      avatar: defaultUser.avatar,
      department: defaultUser.department,
      permissions: defaultUser.permissions
    },
    token: defaultSessionToken
  });
});

/**
 * GET /api/auth/personas
 * Quick persona switcher for live hackathon demonstration
 */
authRouter.get("/personas", (_req: Request, res: Response) => {
  const users = loadUsers();
  res.json({
    personas: users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      avatar: u.avatar,
      department: u.department,
      permissions: u.permissions
    }))
  });
});

/**
 * POST /api/auth/switch-persona/:id
 */
authRouter.post("/switch-persona/:id", (req: Request, res: Response) => {
  const userId = req.params.id;
  const users = loadUsers();
  const user = users.find((u) => u.id === userId);

  if (!user) {
    return res.status(404).json({ error: "Persona not found" });
  }

  const token = `tb_session_${crypto.randomBytes(24).toString("hex")}`;
  const profile: UserProfile = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatar: user.avatar,
    department: user.department,
    permissions: user.permissions
  };

  activeSessions.set(token, {
    user: profile,
    expiresAt: Date.now() + 86400000 * 7
  });

  res.json({ success: true, token, user: profile });
});

/**
 * Middleware: authenticateAuditor
 */
export function authenticateAuditor(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/, "") || (req.headers["x-session-token"] as string) || defaultSessionToken;
  const session = activeSessions.get(token);

  if (session && session.expiresAt > Date.now()) {
    (req as any).user = session.user;
    return next();
  }

  // Allow default lead auditor for seamless test / demo runs
  (req as any).user = {
    id: defaultAuditor.id,
    email: defaultAuditor.email,
    name: defaultAuditor.name,
    role: defaultAuditor.role,
    avatar: defaultAuditor.avatar,
    permissions: defaultAuditor.permissions
  };
  next();
}
