"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { adminUsers } from "@/db/schema";
import { makePassword, requireAdmin, requireOwner, revokeUserSessions, validatePassword, validateUsername, verifyPassword } from "../auth";

function value(formData: FormData, key: string, max = 128) { return String(formData.get(key) || "").trim().slice(0, max); }
function numeric(value: FormDataEntryValue | null) { const id = Number(value); if (!Number.isSafeInteger(id) || id <= 0) throw new Error("Tài khoản không hợp lệ."); return id; }
function role(value: string) { return value === "owner" ? "owner" : "staff"; }
function back(message: string) { redirect(`/admin/users?notice=${encodeURIComponent(message)}`); }
function failure(message: string) { redirect(`/admin/users?error=${encodeURIComponent(message)}`); }

async function ownerCount() {
  return (await getDb().select({ id: adminUsers.id }).from(adminUsers).where(and(eq(adminUsers.role, "owner"), eq(adminUsers.status, "active")))).length;
}

export async function createUserAction(formData: FormData) {
  await requireOwner();
  const username = value(formData, "username", 32).toLowerCase();
  const displayName = value(formData, "display_name", 80);
  const password = String(formData.get("password") || "");
  if (!validateUsername(username)) failure("Username dùng 3–32 ký tự: chữ thường, số, dấu chấm, gạch dưới hoặc gạch ngang.");
  if (!displayName) failure("Cần nhập tên hiển thị.");
  if (!validatePassword(password)) failure("Mật khẩu cần từ 10 đến 128 ký tự.");
  const credential = await makePassword(password);
  const time = new Date().toISOString();
  try {
    await getDb().insert(adminUsers).values({ username, displayName, role: role(value(formData, "role", 16)), status: "active", ...credential, createdAt: time, updatedAt: time });
  } catch { failure("Tên đăng nhập đã tồn tại hoặc dữ liệu không hợp lệ."); }
  revalidatePath("/admin/users");
  back("Đã tạo tài khoản thành công.");
}

export async function changeRoleAction(formData: FormData) {
  const actor = await requireOwner();
  const targetId = numeric(formData.get("user_id"));
  const nextRole = role(value(formData, "role", 16));
  const target = await getDb().select().from(adminUsers).where(eq(adminUsers.id, targetId)).limit(1).then((rows) => rows[0]);
  if (!target) failure("Tài khoản không còn tồn tại.");
  if (target.id === actor.id && nextRole !== "owner") failure("Không thể tự hạ quyền Chủ vườn.");
  if (target.role === "owner" && nextRole !== "owner" && await ownerCount() <= 1) failure("Cần giữ ít nhất một Chủ vườn đang hoạt động.");
  await getDb().update(adminUsers).set({ role: nextRole, updatedAt: new Date().toISOString() }).where(eq(adminUsers.id, targetId));
  revalidatePath("/admin/users");
  back("Đã cập nhật quyền tài khoản.");
}

export async function toggleUserStatusAction(formData: FormData) {
  const actor = await requireOwner();
  const targetId = numeric(formData.get("user_id"));
  const target = await getDb().select().from(adminUsers).where(eq(adminUsers.id, targetId)).limit(1).then((rows) => rows[0]);
  if (!target) failure("Tài khoản không còn tồn tại.");
  if (target.id === actor.id) failure("Không thể tự khóa tài khoản đang đăng nhập.");
  const nextStatus = target.status === "active" ? "locked" : "active";
  if (target.role === "owner" && nextStatus === "locked" && await ownerCount() <= 1) failure("Cần giữ ít nhất một Chủ vườn đang hoạt động.");
  await getDb().update(adminUsers).set({ status: nextStatus, failedLoginCount: 0, lockedUntil: null, updatedAt: new Date().toISOString() }).where(eq(adminUsers.id, targetId));
  if (nextStatus === "locked") await revokeUserSessions(targetId);
  revalidatePath("/admin/users");
  back(nextStatus === "locked" ? "Đã khóa tài khoản và thu hồi phiên đăng nhập." : "Đã mở khóa tài khoản.");
}

export async function resetPasswordAction(formData: FormData) {
  await requireOwner();
  const targetId = numeric(formData.get("user_id"));
  const password = String(formData.get("new_password") || "");
  if (!validatePassword(password)) failure("Mật khẩu mới cần từ 10 đến 128 ký tự.");
  const target = await getDb().select({ id: adminUsers.id }).from(adminUsers).where(eq(adminUsers.id, targetId)).limit(1).then((rows) => rows[0]);
  if (!target) failure("Tài khoản không còn tồn tại.");
  await getDb().update(adminUsers).set({ ...await makePassword(password), failedLoginCount: 0, lockedUntil: null, updatedAt: new Date().toISOString() }).where(eq(adminUsers.id, targetId));
  await revokeUserSessions(targetId);
  revalidatePath("/admin/users");
  back("Đã đặt lại mật khẩu và thu hồi các phiên đăng nhập cũ.");
}

export async function deleteUserAction(formData: FormData) {
  const actor = await requireOwner();
  const targetId = numeric(formData.get("user_id"));
  const target = await getDb().select().from(adminUsers).where(eq(adminUsers.id, targetId)).limit(1).then((rows) => rows[0]);
  if (!target) failure("Tài khoản không còn tồn tại.");
  if (target.id === actor.id) failure("Không thể tự xóa tài khoản đang đăng nhập.");
  if (target.role === "owner" && await ownerCount() <= 1) failure("Cần giữ ít nhất một Chủ vườn đang hoạt động.");
  await revokeUserSessions(targetId);
  await getDb().delete(adminUsers).where(eq(adminUsers.id, targetId));
  revalidatePath("/admin/users");
  back("Đã xóa tài khoản.");
}

export async function changeMyPasswordAction(formData: FormData) {
  const actor = await requireAdmin("/admin/users");
  const currentPassword = String(formData.get("current_password") || "");
  const newPassword = String(formData.get("new_password") || "");
  if (!validatePassword(newPassword)) failure("Mật khẩu mới cần từ 10 đến 128 ký tự.");
  if (!await verifyPassword(currentPassword, actor.passwordSalt, actor.passwordHash)) failure("Mật khẩu hiện tại không chính xác.");
  await getDb().update(adminUsers).set({ ...await makePassword(newPassword), updatedAt: new Date().toISOString() }).where(eq(adminUsers.id, actor.id));
  await revokeUserSessions(actor.id);
  revalidatePath("/admin/users");
  redirect("/admin/login?notice=password_changed");
}
