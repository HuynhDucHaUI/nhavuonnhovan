import { redirect } from "next/navigation";
import { currentAdmin } from "../auth";
import { loginAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ error?: string; notice?: string; return_to?: string }> }) {
  if (await currentAdmin()) redirect("/admin");
  const { error, notice, return_to } = await searchParams;
  const returnTo = return_to?.startsWith("/") && !return_to.startsWith("//") ? return_to : "/admin";
  return <main className="local-login"><style>{styles}</style><section className="login-card">
    <p className="login-kicker">NHÀ VƯỜN NHO VĂN</p>
    <h1>Đăng nhập quản trị</h1>
    <p>Đăng nhập bằng tài khoản do Chủ vườn cấp.</p>
    {notice === "signed_out" && <p className="login-notice" role="status">Bạn đã đăng xuất thành công.</p>}
    {error && <p className="login-error" role="alert">Tên đăng nhập hoặc mật khẩu không chính xác, hoặc tài khoản đang bị khóa tạm thời.</p>}
    <form action={loginAction}>
      <input type="hidden" name="return_to" value={returnTo}/>
      <label>Tên đăng nhập<input name="username" autoComplete="username" required minLength={3} maxLength={32} autoFocus/></label>
      <label>Mật khẩu<input name="password" type="password" autoComplete="current-password" required minLength={10} maxLength={128}/></label>
      <button type="submit">Đăng nhập</button>
    </form>
    <a href="/">← Về website nhà vườn</a>
  </section></main>;
}

const styles = `.local-login{min-height:100vh;display:grid;place-items:center;background:linear-gradient(135deg,#edf7f7,#e1ecf6);padding:24px;color:#163c4b}.login-card{width:min(100%,420px);background:#fff;padding:42px;border-radius:18px;box-shadow:0 20px 50px #16415222}.login-kicker{color:#0878ba;letter-spacing:.13em;font-size:12px;font-weight:800}.login-card h1{font:700 28px DM Sans,Arial,sans-serif;margin:9px 0}.login-card>p:not(.login-kicker):not(.login-error):not(.login-notice){color:#688094;line-height:1.6}.login-card form{display:grid;gap:16px;margin:26px 0 18px}.login-card label{display:grid;gap:7px;font-weight:700;font-size:14px}.login-card input{padding:12px;border:1px solid #cbd9e3;border-radius:8px;font:16px DM Sans,Arial,sans-serif}.login-card button{border:0;border-radius:8px;padding:13px;background:#0878ba;color:#fff;font:700 15px DM Sans,Arial,sans-serif;cursor:pointer}.login-card a{color:#0878ba;font-weight:700;text-decoration:none}.login-error,.login-notice{border-radius:8px;padding:11px;line-height:1.5;font-size:14px}.login-error{background:#fff0f0;color:#b02020}.login-notice{background:#e3f8ef;color:#087152}`;
