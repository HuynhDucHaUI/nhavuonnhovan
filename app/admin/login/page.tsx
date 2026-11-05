import { chatGPTSignInPath } from "@/app/chatgpt-auth";
import { redirect } from "next/navigation";

export default function AdminLogin() {
  redirect(chatGPTSignInPath("/admin"));
}
