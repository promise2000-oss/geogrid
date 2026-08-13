/* ============================================================
   Mock authentication — student & tutor flows (SRD Section 6).
   Mirrors Supabase Auth semantics: email verification gate,
   remember-me refresh, generic login errors, rate limiting.
   ============================================================ */

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEMO_STUDENT_EMAIL, users, currentUserId } from "@/lib/mock/db";
import { latency } from "@/lib/mock/latency";
import { uid } from "@/lib/utils";
import type { UserProfile } from "@/lib/types";

export interface AuthSession {
  user: UserProfile;
  expiresAt: number;
  remember: boolean;
}

interface PendingUser {
  fullName: string;
  email: string;
  password: string;
  dob: string;
  verified: boolean;
  createdAt: string;
}

const SESSION_KEY = "geogrid:session";
const PENDING_KEY = "geogrid:pending";
const REGISTRY_KEY = "geogrid:accounts";
const ATTEMPT_KEY = "geogrid:login-attempts";

interface AuthContextValue {
  session: AuthSession | null;
  user: UserProfile | null;
  signIn: (email: string, password: string, remember: boolean) => Promise<UserProfile>;
  signOut: (everywhere?: boolean) => void;
  register: (input: { fullName: string; email: string; password: string; dob: string }) => Promise<{ email: string }>;
  resendVerification: () => Promise<{ code: string }>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  sendResetLink: (email: string) => Promise<void>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  isVerificationPending: (email: string) => boolean;
  updateProfile: (patch: Partial<UserProfile>) => void;
  changePassword: (current: string, next: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readRegistry(): PendingUser[] {
  try {
    return JSON.parse(localStorage.getItem(REGISTRY_KEY) ?? "[]") as PendingUser[];
  } catch {
    return [];
  }
}

function writeRegistry(registry: PendingUser[]) {
  localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry));
}

function readAttempts(): { count: number; until: number } {
  try {
    return JSON.parse(localStorage.getItem(ATTEMPT_KEY) ?? '{"count":0,"until":0}');
  } catch {
    return { count: 0, until: 0 };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as AuthSession;
      if (parsed.expiresAt < Date.now()) {
        localStorage.removeItem(SESSION_KEY);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (!session) return;
    const t = setTimeout(() => {
      localStorage.removeItem(SESSION_KEY);
      setSession(null);
    }, Math.max(0, session.expiresAt - Date.now()));
    return () => clearTimeout(t);
  }, [session]);

  const signIn = useCallback(async (email: string, password: string, remember: boolean) => {
    await latency(500);
    const attempts = readAttempts();
    if (attempts.until > Date.now()) {
      const mins = Math.ceil((attempts.until - Date.now()) / 60000);
      throw new Error(`Too many failed attempts. Try again in ${mins} minute${mins === 1 ? "" : "s"}.`);
    }
    const normalized = email.trim().toLowerCase();
    if (!normalized || !password) throw new Error("Incorrect email or password.");

    // Demo shortcut: any password works for the seeded account in this slice.
    if (normalized === DEMO_STUDENT_EMAIL || normalized === "daniel@geogrid.test") {
      const user = users.find((u) => u.email === normalized)!;
      const next: AuthSession = {
        user,
        expiresAt: Date.now() + (remember ? 30 * 86400000 : 12 * 3600000),
        remember,
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(next));
      setSession(next);
      return user;
    }

    // Registered-but-unverified users must verify before full access.
    const pending = readRegistry().find((p) => p.email === normalized);
    if (pending && !pending.verified) {
      throw new Error("Please verify your email address before signing in.");
    }
    if (pending && pending.password !== password) {
      const next = { count: attempts.count + 1, until: attempts.count + 1 >= 5 ? Date.now() + 60000 : 0 };
      localStorage.setItem(ATTEMPT_KEY, JSON.stringify(next));
      throw new Error("Incorrect email or password.");
    }

    const profile: UserProfile = {
      id: uid("u"),
      fullName: pending?.fullName ?? email.split("@")[0]!.replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      username: email.split("@")[0]!.toLowerCase(),
      email: normalized,
      role: "student",
      status: "active",
    };
    const next: AuthSession = {
      user: profile,
      expiresAt: Date.now() + (remember ? 30 * 86400000 : 12 * 3600000),
      remember,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    setSession(next);
    return profile;
  }, []);

  const signOut = useCallback((everywhere = false) => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
    void everywhere;
  }, []);

  const register = useCallback(async (input: { fullName: string; email: string; password: string; dob: string }) => {
    await latency(600);
    const normalized = input.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) throw new Error("Enter a valid email address.");
    if (input.password.length < 8) throw new Error("Password must be at least 8 characters.");
    const registry = readRegistry();
    if (registry.some((r) => r.email === normalized)) throw new Error("An account with this email already exists.");
    registry.push({ ...input, email: normalized, verified: false, createdAt: new Date().toISOString() });
    writeRegistry(registry);
    localStorage.setItem(PENDING_KEY, normalized);
    return { email: normalized };
  }, []);

  const resendVerification = useCallback(async () => {
    await latency(400);
    return { code: "123456" };
  }, []);

  const verifyEmail = useCallback(async (email: string, code: string) => {
    await latency(500);
    if (code.trim() !== "123456") throw new Error("That verification code isn't correct. Check the demo email for the code.");
    const registry = readRegistry();
    const user = registry.find((r) => r.email === email);
    if (!user) throw new Error("No pending verification for this account.");
    user.verified = true;
    writeRegistry(registry);
    localStorage.removeItem(PENDING_KEY);
  }, []);

  const isVerificationPending = useCallback((email: string) => {
    const pending = readRegistry().find((r) => r.email === email.toLowerCase().trim());
    return !!pending && !pending.verified;
  }, []);

  const sendResetLink = useCallback(async (email: string) => {
    await latency(450);
    const exists = readRegistry().some((r) => r.email === email.toLowerCase().trim()) || email.toLowerCase().trim() === DEMO_STUDENT_EMAIL;
    // Generic response regardless of existence — never confirm account presence.
    void exists;
  }, []);

  const resetPassword = useCallback(async (email: string, code: string, newPassword: string) => {
    await latency(450);
    if (code.trim() !== "123456") throw new Error("That reset code isn't correct.");
    if (newPassword.length < 8) throw new Error("Password must be at least 8 characters.");
    const registry = readRegistry();
    const user = registry.find((r) => r.email === email.toLowerCase().trim());
    if (user) user.password = newPassword;
    writeRegistry(registry);
  }, []);

  const updateProfile = useCallback((patch: Partial<UserProfile>) => {
    setSession((prev) => {
      if (!prev) return prev;
      const next = { ...prev, user: { ...prev.user, ...patch } };
      localStorage.setItem(SESSION_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const changePassword = useCallback(async (current: string, next: string) => {
    await latency(400);
    const registry = readRegistry();
    const profile = users.find((u) => u.id === currentUserId);
    if (profile && current !== "password") throw new Error("Current password is incorrect.");
    if (next.length < 8) throw new Error("New password must be at least 8 characters.");
    void registry;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      signIn,
      signOut,
      register,
      resendVerification,
      verifyEmail,
      sendResetLink,
      resetPassword,
      isVerificationPending,
      updateProfile,
      changePassword,
    }),
    [session, signIn, signOut, register, resendVerification, verifyEmail, sendResetLink, resetPassword, isVerificationPending, updateProfile, changePassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}