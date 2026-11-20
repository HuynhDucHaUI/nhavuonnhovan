"use client";

import { useState } from "react";

type InquiryProps = { title: string; path: string; kind: "cây" | "lô" | "bài viết"; zalo: string; label?: string; phone?: string; phone2?: string };

export function ContactInquiry({ title, path, kind, zalo, label = "Hỏi giá qua Zalo", phone, phone2 }: InquiryProps) {
  const [status, setStatus] = useState("");
  const [fallback, setFallback] = useState("");

  async function prepare() {
    const request = kind === "bài viết" ? "được tư vấn về" : "hỏi giá";
    const message = `Chào nhà vườn, tôi muốn ${request} ${kind} ${title}.\nXem tại: ${new URL(path, window.location.origin).href}`;
    try {
      await navigator.clipboard.writeText(message);
      setFallback("");
      setStatus("Đã sao chép thông tin. Dán vào Zalo để hỏi nhà vườn.");
    } catch {
      setFallback(message);
      setStatus("Hãy sao chép nội dung bên dưới rồi dán vào Zalo.");
    }
  }

  if (!zalo && !phone && !phone2) return null;
  return <div className="product-inquiry">
    <div className="inquiry-actions">
      {zalo && <a className="button dark inquiry-button" href={zalo} target="_blank" rel="noreferrer" onClick={prepare} aria-label={`${label}: ${title}`}>{label}</a>}
      {phone && <a className="button dark inquiry-phone" href={`tel:${phone}`} aria-label={`Gọi ${phone}`}><span className="phone-prefix">Gọi </span>{phone}</a>}
      {phone2 && <a className="button dark inquiry-phone" href={`tel:${phone2}`} aria-label={`Gọi ${phone2}`}><span className="phone-prefix">Gọi </span>{phone2}</a>}
    </div>
    {zalo && <small className="inquiry-hint">Tự sao chép thông tin · Dán vào Zalo để gửi</small>}
    {status && <p className="inquiry-status" role="status">{status}</p>}
    {fallback && <textarea aria-label={`Nội dung hỏi giá ${title}`} readOnly value={fallback} rows={4} onFocus={(event) => event.currentTarget.select()} />}
  </div>;
}

export function ContactItem({ title, path, kind, phone, phone2, zalo }: InquiryProps & { code: string; phone: string; phone2: string }) {
  return <div className="item-contact">
    <ContactInquiry title={title} path={path} kind={kind} zalo={zalo} phone={phone} phone2={phone2} label={kind === "bài viết" ? "Nhắn Zalo" : kind === "lô" ? "Hỏi giá sỉ qua Zalo" : "Hỏi mua qua Zalo"} />
  </div>;
}
