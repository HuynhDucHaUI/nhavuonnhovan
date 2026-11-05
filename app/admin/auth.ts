import { env } from "cloudflare:workers";
import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { adminSessions, adminUsers } from "@/db/schema";

export type AdminRole = "owner" | "staff";
export type AdminUser = typeof adminUsers.$inferSelect;

const SESSION_COOKIE = "nhovan_admin_session";
const SESSION_SECONDS = 8 * 60 * 60;
const MAX_LOGIN_FAILURES = 5;
const LOCK_MINUTES = 15;

function now() { return new Date(); }
function timestamp(date = now()) { return date.toISOString(); }
function later(seconds: number) { return new Date(Date.now() + seconds * 1000).toISOString(); }

function authConfig() {
  const config = env as unknown as { AUTH_SESSION_SECRET?: string; INITIAL_ADMIN_PASSWORD?: string };
  if (!config.AUTH_SESSION_SECRET || config.AUTH_SESSION_SECRET.length < 32) {
    throw new Error("Thiếu cấu hình bảo mật cho khu vực quản trị.");
  }
  return config;
}

function bytesToBase64(bytes: Uint8Array) {
  let value = "";
  for (const byte of bytes) value += String.fromCharCode(byte);
  return btoa(value);
}

function base64ToBytes(value: string) {
  const decoded = atob(value);
  return Uint8Array.from(decoded, (character) => character.charCodeAt(0));
}

async function digest(value: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(authConfig().AUTH_SESSION_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return bytesToBase64(new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value))));
}

async function passwordHash(password: string, salt: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: base64ToBytes(salt), iterations: 210000, hash: "SHA-256" }, key, 256);
  return bytesToBase64(new Uint8Array(bits));
}

function safeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return difference === 0;
}

export function validateUsername(value: string) { return /^[a-z0-9][a-z0-9._-]{2,31}$/.test(value); }
export function validatePassword(value: string) { return value.length >= 10 && value.length <= 128; }

export async function makePassword(password: string) {
  if (!validatePassword(password)) throw new Error("Mật khẩu cần từ 10 đến 128 ký tự.");
  const passwordSalt = bytesToBase64(crypto.getRandomValues(new Uint8Array(16)));
  return { passwordSalt, passwordHash: await passwordHash(password, passwordSalt) };
}

export async function verifyPassword(password: string, salt: string, expectedHash: string) {
  return safeEqual(await passwordHash(password, salt), expectedHash);
}

export async function ensureInitialOwner() {
  const db = getDb();
  const existing = await db.select({ id: adminUsers.id }).from(adminUsers).limit(1);
  if (existing.length) return;
  const initialPassword = authConfig().INITIAL_ADMIN_PASSWORD;
  if (!initialPassword || !validatePassword(initialPassword)) throw new Error("Tài khoản quản trị đầu tiên chưa được cấu hình.");
  const credential = await makePassword(initialPassword);
  const createdAt = timestamp();
  await db.insert(adminUsers).values({ username: "admin", displayName: "Chủ vườn", role: "owner", status: "active", ...credential, createdAt, updatedAt: createdAt });
}

export async function createSession(userId: number) {
  authConfig();
  const token = bytesToBase64(crypto.getRandomValues(new Uint8Array(32)));
  const tokenHash = await digest(token);
  const createdAt = timestamp();
  await getDb().insert(adminSessions).values({ userId, tokenHash, createdAt, lastSeenAt: createdAt, expiresAt: later(SESSION_SECONDS) });
  (await cookies()).set(SESSION_COOKIE, token, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: SESSION_SECONDS });
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await getDb().delete(adminSessions).where(eq(adminSessions.tokenHash, await digest(token)));
  store.set(SESSION_COOKIE, "", { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 0 });
}

export async function revokeUserSessions(userId: number) { await getDb().delete(adminSessions).where(eq(adminSessions.userId, userId)); }

export async function currentAdmin(): Promise<AdminUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const db = getDb();
  const rows = await db.select({ session: adminSessions, user: adminUsers }).from(adminSessions)
    .innerJoin(adminUsers, eq(adminSessions.userId, adminUsers.id))
    .where(and(eq(adminSessions.tokenHash, await digest(token)), gt(adminSessions.expiresAt, timestamp()), eq(adminUsers.status, "active"))).limit(1);
  const found = rows[0];
  if (!found) return null;
  await db.update(adminSessions).set({ lastSeenAt: timestamp(), expiresAt: later(SESSION_SECONDS) }).where(eq(adminSessions.id, found.session.id));
  return found.user;
}

export async function isAdmin() { return Boolean(await currentAdmin()); }

export async function requireAdmin(returnTo = "/admin") {
  const user = await currentAdmin();
  if (!user) redirect(`/admin/login?return_to=${encodeURIComponent(returnTo)}`);
  return user;
}

export async function requireOwner(returnTo = "/admin/users") {
  const user = await requireAdmin(returnTo);
  if (user.role !== "owner") redirect("/admin?error=forbidden");
  return user;
}

export async function authorize() { await requireAdmin(); }

export async function attemptLogin(username: string, password: string) {
  await ensureInitialOwner();
  const normalizedUsername = username.trim().toLowerCase();
  const db = getDb();
  const user = await db.select().from(adminUsers).where(eq(adminUsers.username, normalizedUsername)).limit(1).then((rows) => rows[0]);
  const time = now();
  if (!user || user.status !== "active" || (user.lockedUntil && new Date(user.lockedUntil) > time)) return null;
  const valid = await verifyPassword(password, user.passwordSalt, user.passwordHash);
  if (!valid) {
    const failures = user.failedLoginCount + 1;
    const lockedUntil = failures >= MAX_LOGIN_FAILURES ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000).toISOString() : null;
    await db.update(adminUsers).set({ failedLoginCount: lockedUntil ? 0 : failures, lockedUntil, updatedAt: timestamp() }).where(eq(adminUsers.id, user.id));
    return null;
  }
  const updatedAt = timestamp();
  await db.update(adminUsers).set({ failedLoginCount: 0, lockedUntil: null, lastLoginAt: updatedAt, updatedAt }).where(eq(adminUsers.id, user.id));
  await createSession(user.id);
  return user;
}
