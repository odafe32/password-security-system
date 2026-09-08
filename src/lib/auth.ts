import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma, withRetry } from "@/lib/prisma";

// ─── Cookie config ─────────────────────────────────────────────────

const SESSION_COOKIE = "session_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// ─── Session ID generation ─────────────────────────────────────────

export function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2)}_${Math.random().toString(36).slice(2)}`;
}

// ─── Cookie helpers ────────────────────────────────────────────────

export async function setSessionCookie(sessionId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

// ─── Get current user from cookie ──────────────────────────────────

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

  if (!sessionId) return null;

  const user = await withRetry(() =>
    prisma.user.findUnique({ where: { sessionId } })
  );

  return user;
}

// ─── Get or create guest session ───────────────────────────────────

export async function getOrCreateGuestUser() {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get(SESSION_COOKIE)?.value;

  // Check if session exists
  if (sessionId) {
    const existing = await withRetry(() =>
      prisma.user.findUnique({ where: { sessionId } })
    );
    if (existing) return existing;
  }

  // Create new guest session
  sessionId = generateSessionId();
  const user = await withRetry(() =>
    prisma.user.create({ data: { sessionId } })
  );

  await setSessionCookie(sessionId);
  return user;
}

// ─── Auth helpers ──────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function isAdmin(user: { role: string } | null): boolean {
  return user?.role === "admin";
}

// ─── Public user info (safe to send to client) ─────────────────────

export function publicUser(user: {
  id: number;
  email: string | null;
  name: string | null;
  role: string;
} | null) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}
