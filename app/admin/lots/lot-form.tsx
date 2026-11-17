"use client";

import { useRef, useState, type FormEvent } from "react";
import { PlantGalleryInput, type PlantGalleryItem } from "../plant-gallery-input";

type LotFormLot = {
  id: number; code: string; title: string; plantType: string; sizeOrAge: string; location: string;
  quantityRemaining: number; minimumOrderQuantity: number; unit: string; wholesalePrice: string;
  image: string; gallery: string; photoDate: string; description: string; published: number;
};

export function LotForm({ lot, action, submitLabel }: { lot?: LotFormLot; action: (formData: FormData) => Promise<void>; submitLabel: string }) {
  const [gallery, setGallery] = useState<PlantGalleryItem[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const submitting = useRef(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setPending(true); setError("");
    const data = new FormData(event.currentTarget);
    try {
      const urls: string[] = [];
      for (const photo of gallery) {
        if (!photo.file) { if (photo.url) urls.push(photo.url); continue; }
        const body = new FormData(); body.set("file", photo.file);
        const response = await fetch("/api/upload", { method: "POST", body, credentials: "same-origin" });
        const result = await response.json() as { url?: string; error?: string };
        if (!response.ok || !result.url) throw new Error(result.error || "Không thể tải ảnh lên.");
        urls.push(result.url);
      }
      data.set("gallery", JSON.stringify(urls));
      data.set("image", urls[0] || "");
      await action(data);
    } catch (cause) {
      // Redirects from server actions must propagate to the framework.
      if (cause instanceof Error && "digest" in cause && String(cause.digest).startsWith("NEXT_REDIRECT")) throw cause;
      setError(cause instanceof Error ? cause.message : "Không thể lưu lô cây.");
      setPending(false); submitting.current = false;
    }
  }
  return <form className="lot-form" onSubmit={submit}>
    {lot && <input type="hidden" name="lot_id" value={lot.id} />}
    <div className="lot-form-grid">
      <label>Mã lô<input name="code" required minLength={3} maxLength={40} defaultValue={lot?.code} placeholder="Ví dụ: LUONG-A01" /></label>
      <label>Tên lô<input name="title" required maxLength={150} defaultValue={lot?.title} placeholder="Ví dụ: Quất chum 1,2–1,5 m" /></label>
      <label>Loại / dáng cây<input name="plant_type" required maxLength={100} defaultValue={lot?.plantType} /></label>
      <label>Kích thước / độ tuổi<input name="size_or_age" maxLength={120} defaultValue={lot?.sizeOrAge} /></label>
      <label>Vị trí luống<input name="location" maxLength={120} defaultValue={lot?.location} /></label>
      {!lot ? <label>Số lượng ban đầu<input name="initial_quantity" type="number" min="1" required /></label> : <label>Thông tin tồn kho<input value={`${lot.quantityRemaining} ${lot.unit} (chỉ đổi qua giao dịch kho)`} readOnly /></label>}
      <label>Mức mua tối thiểu<input name="minimum_order_quantity" type="number" min="1" required defaultValue={lot?.minimumOrderQuantity || 1} /></label>
      <label>Đơn vị<input name="unit" maxLength={20} defaultValue={lot?.unit || "cây"} /></label>
      <label>Giá sỉ / thông tin giá<input name="wholesale_price" maxLength={100} defaultValue={lot?.wholesalePrice} /></label>
      <label>Ngày chụp ảnh<input name="photo_date" type="date" defaultValue={lot?.photoDate || ""} /></label>
      <PlantGalleryInput image={lot?.image || ""} gallery={lot?.gallery || "[]"} onChange={setGallery} />
      <label className="wide">Mô tả<textarea name="description" defaultValue={lot?.description} placeholder="Nêu đặc điểm cả lô, độ đồng đều và thời gian lấy hàng..." /></label>
      <label className="check-line wide"><input type="checkbox" name="published" defaultChecked={lot?.published === 1} />Công khai lô này trên website khi còn hàng</label>
    </div>
    {error && <p role="alert">{error}</p>}
    <div><button className="lots-primary" type="submit" disabled={pending}>{pending ? "Đang tải ảnh và lưu…" : submitLabel}</button></div>
  </form>;
}
