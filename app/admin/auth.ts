import { env } from "cloudflare:workers";
import { getChatGPTUser } from "@/app/chatgpt-auth";

export async function isAdmin() {
  const user = await getChatGPTUser();
  const admin = (env as unknown as { ADMIN_EMAIL?: string }).ADMIN_EMAIL;
  return Boolean(user && admin && user.email.toLowerCase() === admin.toLowerCase());
}

export async function authorize() {
  if (!(await isAdmin())) throw new Error("Không có quyền quản trị.");
}
