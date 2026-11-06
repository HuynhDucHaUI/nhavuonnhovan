"use client";

import { useRef, useState } from "react";

type LotFormLot = {
  id: number; code: string; title: string; plantType: string; sizeOrAge: string; location: string;
  quantityRemaining: number; minimumOrderQuantity: number; unit: string; wholesalePrice: string;
  image: string; description: string; published: number;
};

type UploadState = "idle" | "preparing" | "uploading" | "ready" | "error";

async function prepareImage(file: File) {
  if (file.size <= 900 * 1024 || !file.type.startsWith("image/")) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const compressed = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.82));
    if (!compressed || compressed.size >= file.size) return file;
    return new File([compressed], `${file.name.replace(/\.[^.]+$/, "") || "lot"}.webp`, { type: "image/webp" });
  } catch {
    return file;
  }
}

export function LotForm({ lot, action, submitLabel }: { lot?: LotFormLot; action: (formData: FormData) => Promise<void>; submitLabel: string }) {
  const [image, setImage] = useState(lot?.image || "");
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [uploadMessage, setUploadMessage] = useState("");
  const selectedPhoto = useRef(false);

  async function uploadPhoto(file: File) {
    selectedPhoto.current = true;
    setUploadState("preparing");
    setUploadMessage("Đang tối ưu ảnh trước khi tải lên…");
    try {
      const prepared = await prepareImage(file);
      setUploadState("uploading");
      setUploadMessage("Đang tải ảnh nền lên… bạn vẫn có thể tiếp tục nhập thông tin.");
      const payload = new FormData();
      payload.set("file", prepared);
      const response = await fetch("/api/upload", { method: "POST", body: payload, credentials: "same-origin" });
      const result = await response.json() as { url?: string; error?: string };
      if (!response.ok || !result.url) throw new Error(result.error || "Không thể tải ảnh lên.");
      setImage(result.url);
      setUploadState("ready");
      setUploadMessage("Ảnh đã sẵn sàng. Bạn có thể tạo lô ngay.");
    } catch (cause) {
      setUploadState("error");
      setUploadMessage(cause instanceof Error ? cause.message : "Không thể tải ảnh lên. Vui lòng thử lại.");
    }
  }

  return <form action={action} className="lot-form" onSubmit={(event) => {
    if (uploadState === "preparing" || uploadState === "uploading") {
      event.preventDefault();
      setUploadMessage("Vui lòng đợi ảnh tải xong trước khi tạo lô.");
    } else if (selectedPhoto.current && !image) {
      event.preventDefault();
      setUploadMessage("Ảnh chưa tải được. Hãy chọn lại ảnh hoặc dùng liên kết ảnh HTTPS.");
    }
  }}>
    {lot && <input type="hidden" name="lot_id" value={lot.id} />}
    <div className="lot-form-grid">
      <label>Mã lô<input name="code" required minLength={3} maxLength={40} defaultValue={lot?.code} placeholder="Ví dụ: LUONG-A01" /></label>
      <label>Tên lô<input name="title" required maxLength={150} defaultValue={lot?.title} placeholder="Ví dụ: Quất chum 1,2–1,5 m" /></label>
      <label>Loại / dáng cây<input name="plant_type" required maxLength={100} defaultValue={lot?.plantType} placeholder="Ví dụ: Quất chum" /></label>
      <label>Kích thước / độ tuổi<input name="size_or_age" maxLength={120} defaultValue={lot?.sizeOrAge} placeholder="Ví dụ: 1,2–1,5 m" /></label>
      <label>Vị trí luống<input name="location" maxLength={120} defaultValue={lot?.location} placeholder="Ví dụ: Khu A, luống 01" /></label>
      {!lot ? <label>Số lượng ban đầu<input name="initial_quantity" type="number" min="1" required placeholder="Ví dụ: 180" /></label> : <label>Thông tin tồn kho<input value={`${lot.quantityRemaining} ${lot.unit} (chỉ đổi qua giao dịch kho)`} readOnly /></label>}
      <label>Mức mua tối thiểu<input name="minimum_order_quantity" type="number" min="1" required defaultValue={lot?.minimumOrderQuantity || 1} /></label>
      <label>Đơn vị<input name="unit" maxLength={20} defaultValue={lot?.unit || "cây"} placeholder="cây" /></label>
      <label>Giá sỉ / thông tin giá<input name="wholesale_price" maxLength={100} defaultValue={lot?.wholesalePrice} placeholder="Ví dụ: Từ 350.000đ/cây" /></label>
      <label>Tải ảnh lên<input name="photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => {
        const file = event.currentTarget.files?.[0];
        if (file) void uploadPhoto(file);
      }} /><small>JPEG, PNG hoặc WebP, tối đa 5 MB. Ảnh được tải nền ngay khi chọn.</small></label>
      <label>Liên kết ảnh HTTPS hoặc ảnh đã tải lên<input name="image" type="text" inputMode="url" maxLength={2048} value={image} onChange={(event) => {
        selectedPhoto.current = false;
        setImage(event.target.value);
      }} placeholder="https://... hoặc /api/images/..." /><small>Chấp nhận URL HTTPS hoặc đường dẫn ảnh do hệ thống tải lên.</small></label>
      <label className="wide">Mô tả<textarea name="description" defaultValue={lot?.description} placeholder="Nêu đặc điểm của cả lô, thời gian lấy hàng, lưu ý..." /></label>
      <label className="check-line wide"><input type="checkbox" name="published" defaultChecked={lot?.published === 1} />Công khai lô này trên website khi còn hàng</label>
    </div>
    {uploadState !== "idle" && <p className={`upload-status ${uploadState}`} role={uploadState === "error" ? "alert" : "status"}>{uploadMessage}</p>}
    <div><button className="lots-primary" type="submit" disabled={uploadState === "preparing" || uploadState === "uploading"}>{uploadState === "preparing" || uploadState === "uploading" ? "Đang chuẩn bị ảnh…" : submitLabel}</button></div>
  </form>;
}
