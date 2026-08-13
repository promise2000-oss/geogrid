/* ============================================================
   Admin authentication — isolated by design (SRD Section 7).
   Separate session, mandatory TOTP (aal2), rate limiting with
   progressive lockout, no register path, audit-logged attempts.
   Mock of the Edge Function flow (service-role side).
   ============================================================ */

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { admins, auditLog, DEMO_TOTP_CODE } from "@/lib/mock/db";
import { latency } from "@/lib/mock/latency";
import { uid } from "@/lib/utils";
import type { AdminProfile, AuditLogEntry } from "@/lib/types";

export interface AdminSession {
  profile: AdminProfile;
  issuedAt: number;
  lastActiveAt: number;
}

const ADMIN_SESSION_KEY = "geogrid:admin-session";
const ADMIN_ATTEMPT_KEY = "geogrid:admin-attempts";
export const ADMIN_IDLE_TIMEOUT_MS = 45 * 60000; // 45-minute idle timeout
export const ADMIN_MAX_ATTEMPTS = 5;

interface AdminAuthContextValue {
  adminSession: AdminSession | null;
  admin: AdminProfile | null;
  loginStep: "credentials" | "totp";
  adminEmail: string;
  lockUntil: number | null;
  failedCount: number;
  beginAdminLogin: (email: string, password: string) => Promise<"totp">;
  completeAdminLogin: (code: string) => Promise<AdminProfile>;
  adminSignOut: () => void;
  requireReauth: () => Promise<void>;
  writeAudit: (entry: Omit<AuditLogEntry, "id" | "createdAt">) => void;
  impersonating: string | null;
  setImpersonating: (studentId: string | null) => void;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

function readLock(): { count: number; until: number } {
  try {
    return JSON.parse(localStorage.getItem(ADMIN_ATTEMPT_KEY) ?? '{"count":0,"until":0}');
  } catch {
    return { count: 0, until: 0 };
  }
}

function writeLock(lock: { count: number; until: number }) {
  localStorage.setItem(ADMIN_ATTEMPT_KEY, JSON.stringify(lock));
}

const fakeAgent = () =>
  `${navigator.platform === "MacIntel" ? "macOS" : "Linux"} · ${navigator.userAgent.includes("Chrome") ? "Chrome" : "Browser"}`;

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [adminSession, setAdminSession] = useState<AdminSession | null>(() => {
    try {
      const raw = localStorage.getItem(ADMIN_SESSION_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as AdminSession;
      if (parsed.lastActiveAt + ADMIN_IDLE_TIMEOUT_MS < Date.now()) {
        localStorage.removeItem(ADMIN_SESSION_KEY);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  });
  const [loginStep, setLoginStep] = useState<"credentials" | "totp">("credentials");
  const [adminEmail, setAdminEmail] = useState("");
  const [lockUntil, setLockUntil] = useState<number | null>(() => {
    const lock = readLock();
    return lock.until > Date.now() ? lock.until : null;
  });
  const [failedCount, setFailedCount] = useState(() => readLock().count);
  const [impersonating, setImpersonating] = useState<string | null>(null);

  const writeAudit = useCallback((entry: Omit<AuditLogEntry, "id" | "createdAt">) => {
    auditLog.unshift({
      ...entry,
      id: uid("al"),
      createdAt: new Date().toISOString(),
    });
  }, []);

  useEffect(() => {
    if (!adminSession) return;
    const interval = setInterval(() => {
      if (adminSession.lastActiveAt + ADMIN_IDLE_TIMEOUT_MS < Date.now()) {
        localStorage.removeItem(ADMIN_SESSION_KEY);
        setAdminSession(null);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [adminSession]);

  const beginAdminLogin = useCallback(
    async (email: string, password: string) => {
      await latency(600);
      const lock = readLock();
      if (lock.until > Date.now()) {
        setLockUntil(lock.until);
        throw new Error(`Account locked. Try again in ${Math.ceil((lock.until - Date.now()) / 60000)} minutes.`);
      }
      const account = admins.find((a) => a.email === email.toLowerCase().trim());
      // Server-side check only — never a client-side comparison in production.
      if (!account || password.length < 8) {
        const next = { count: lock.count + 1, until: lock.count + 1 >= ADMIN_MAX_ATTEMPTS ? Date.now() + 5 * 60000 : 0 };
        writeLock(next);
        setFailedCount(next.count);
        setLockUntil(next.until > Date.now() ? next.until : null);
        writeAudit({
          actorType: "admin",
          actorId: "unknown",
          actorName: email,
          action: "auth.login_failed",
          targetType: "admin",
          targetId: account?.id ?? "unknown",
          ip: "192.168.1.10",
          userAgent: fakeAgent(),
        });
        throw new Error("Incorrect email or password.");
      }
      setAdminEmail(account.email);
      setLoginStep("totp");
      return "totp" as const;
    },
    [writeAudit],
  );

  const completeAdminLogin = useCallback(
    async (code: string) => {
      await latency(500);
      const account = admins.find((a) => a.email === adminEmail);
      if (!account) throw new Error("Session expired. Sign in again.");
      if (code.trim() !== DEMO_TOTP_CODE) {
        const lock = readLock();
        const next = { count: lock.count + 1, until: lock.count + 1 >= ADMIN_MAX_ATTEMPTS ? Date.now() + 5 * 60000 : 0 };
        writeLock(next);
        setFailedCount(next.count);
        setLockUntil(next.until > Date.now() ? next.until : null);
        writeAudit({
          actorType: "admin",
          actorId: account.id,
          actorName: account.name,
          action: "auth.mfa_failed",
          targetType: "admin",
          targetId: account.id,
          ip: "192.168.1.10",
          userAgent: fakeAgent(),
        });
        throw new Error("The security code is incorrect.");
      }
      // On success, reset the attempt counter (progressive backoff resets).
      writeLock({ count: 0, until: 0 });
      setFailedCount(0);
      setLockUntil(null);
      const session: AdminSession = {
        profile: account,
        issuedAt: Date.now(),
        lastActiveAt: Date.now(),
      };
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
      setAdminSession(session);
      setLoginStep("credentials");
      setAdminEmail("");
      writeAudit({
        actorType: "admin",
        actorId: account.id,
        actorName: account.name,
        action: "auth.login_success",
        targetType: "admin",
        targetId: account.id,
        ip: "192.168.1.10",
        userAgent: fakeAgent(),
      });
      return account;
    },
    [adminEmail, writeAudit],
  );

  const adminSignOut = useCallback(() => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    setAdminSession(null);
    setImpersonating(null);
  }, []);

  const requireReauth = useCallback(async () => {
    // Sensitive actions require mandatory re-authentication (mock TOTP prompt).
    await latency(400);
    return;
  }, []);

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      adminSession,
      admin: adminSession?.profile ?? null,
      loginStep,
      adminEmail,
      lockUntil,
      failedCount,
      beginAdminLogin,
      completeAdminLogin,
      adminSignOut,
      requireReauth,
      writeAudit,
      impersonating,
      setImpersonating,
    }),
    [adminSession, loginStep, adminEmail, lockUntil, failedCount, beginAdminLogin, completeAdminLogin, adminSignOut, requireReauth, writeAudit, impersonating],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}