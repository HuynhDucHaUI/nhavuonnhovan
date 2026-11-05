import { env } from "cloudflare:workers";
import { getChatGPTUser } from "@/app/chatgpt-auth";

export async function isAdmin() {
  const user = await getChatGPTUser();
  const configuredEmails = (env as unknown as { ADMIN_EMAIL?: string }).ADMIN_EMAIL
    ?.split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean) ?? [];
  return Boolean(user && configuredEmails.includes(user.email.toLowerCase()));
}

export async function authorize() {
  if (!(await isAdmin())) throw new Error("Không có quyền quản trị.");
}
