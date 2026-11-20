"use client";

import { useState } from "react";

type InquiryProps = { title: string; path: string; kind: "cây" | "lô"; zalo: string; label?: string };

export function ContactInquiry({ title, path, kind, zalo, label = "Hỏi giá qua Zalo" }: InquiryProps) {
  const [status, setStatus] = useState("");
  const [fallback, setFallback] = useState("");

  async function prepare() {
    const message = `Chào nhà vườn, tôi muốn hỏi giá ${kind} ${title}.\nXem tại: ${new URL(path, window.location.origin).href}`;
    try {
      await navigator.clipboard.writeText(message);
      setFallback("");
      setStatus("Đã sao chép thông tin. Dán vào Zalo để hỏi nhà vườn.");
    } catch {
      setFallback(message);
      setStatus("Hãy sao chép nội dung bên dưới rồi dán vào Zalo.");
    }
  }

  if (!zalo) return null;
  return <div className="product-inquiry">
    <a className="button dark inquiry-button" href={zalo} target="_blank" rel="noreferrer" onClick={prepare} aria-label={`${label}: ${title}`}>{label}</a>
    <small className="inquiry-hint">Tự sao chép thông tin · Dán vào Zalo để gửi</small>
    {status && <p className="inquiry-status" role="status">{status}</p>}
    {fallback && <textarea aria-label={`Nội dung hỏi giá ${title}`} readOnly value={fallback} rows={4} onFocus={(event) => event.currentTarget.select()} />}
  </div>;
}

export function ContactItem({ title, path, kind, phone, phone2, zalo }: InquiryProps & { code: string; phone: string; phone2?: string }) {
  return <div className="item-contact">
    <ContactInquiry title={title} path={path} kind={kind} zalo={zalo} label={kind === "lô" ? "Hỏi giá sỉ qua Zalo" : "Hỏi mua qua Zalo"} />
    <div className="actions">{phone && <a className="button dark" href={`tel:${phone}`}>Gọi {phone}</a>}{phone2 && <a className="button dark" href={`tel:${phone2}`}>Gọi {phone2}</a>}</div>
  </div>;
}
