"use client";

import { useState } from "react";

export function ContactItem({ title, code, path, kind, phone, phone2, zalo }: { title: string; code: string; path: string; kind: "cây" | "lô"; phone: string; phone2?: string; zalo: string }) {
  const [message, setMessage] = useState("");
  const [text, setText] = useState("");
  async function copy() {
    const value = `Chào nhà vườn, tôi muốn hỏi về ${kind} ${code ? `${code} — ` : ""}${title}.\nXem tại: ${new URL(path, window.location.origin).href}`;
    setText(value);
    try { await navigator.clipboard.writeText(value); setMessage("Đã sao chép. Bạn có thể dán nội dung vào Zalo."); }
    catch { setMessage("Hãy chọn và sao chép nội dung bên dưới."); }
  }
  return <div><div className="actions">{phone && <a className="button dark" href={`tel:${phone}`}>Gọi {phone}</a>}{phone2 && <a className="button dark" href={`tel:${phone2}`}>Gọi {phone2}</a>}{zalo && <a className="button dark" href={zalo} target="_blank" rel="noreferrer">Nhắn Zalo</a>}<button type="button" className="button dark" onClick={copy}>Sao chép thông tin {kind}</button></div>{message && <p role="status">{message}</p>}{text && <textarea aria-label="Thông tin để gửi nhà vườn" readOnly value={text} rows={3} onFocus={(event) => event.currentTarget.select()} />}</div>;
}
