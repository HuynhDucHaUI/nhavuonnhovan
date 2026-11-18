"use server";

import { redirect } from "next/navigation";
import { attemptLogin } from "../auth";
import { adminReturnPath } from "@/lib/admin-return-path";

export async function loginAction(formData: FormData) {
  const username = String(formData.get("username") || "");
  const password = String(formData.get("password") || "");
  const destination = adminReturnPath(formData.get("return_to"));
  let user = null;
  try {
    user = await attemptLogin(username, password);
  } catch (error) {
    // Keep all authentication failures indistinguishable to visitors.
    console.error("Admin login failed", error);
  }
  if (user) redirect(destination);
  redirect(`/admin/login?error=invalid&return_to=${encodeURIComponent(destination)}`);
}
