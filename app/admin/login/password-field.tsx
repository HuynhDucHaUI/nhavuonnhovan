"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function PasswordField() {
  const [visible, setVisible] = useState(false);
  return <div className="login-password-field">
    <label htmlFor="login-password">Mật khẩu</label>
    <div className="login-password-input">
      <input id="login-password" name="password" type={visible ? "text" : "password"} autoComplete="current-password" required minLength={10} maxLength={128} />
      <button type="button" className="password-toggle" aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"} aria-pressed={visible} onClick={() => setVisible((value) => !value)}>
        {visible ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
      </button>
    </div>
  </div>;
}
