"use server";

import { redirect } from "next/navigation";
import { attemptLogin } from "../auth";

function returnPath(value: FormDataEntryValue | null) {
  const path = typeof value === "string" ? value : "/admin";
  return path.startsWith("/") && !path.startsWith("//") && !path.startsWith("/admin/login") ? path : "/admin";
}

export async function loginAction(formData: FormData) {
  const username = String(formData.get("username") || "");
  const password = String(formData.get("password") || "");
  const destination = returnPath(formData.get("return_to"));
  try {
    const user = await attemptLogin(username, password);
    if (user) redirect(destination);
  } catch {
    // Keep all authentication failures indistinguishable to visitors.
  }
  redirect(`/admin/login?error=invalid&return_to=${encodeURIComponent(destination)}`);
}
