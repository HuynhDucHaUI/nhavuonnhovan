"use client";

import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";

export type PlantGalleryItem = {
  id: string;
  url?: string;
  file?: File;
  preview: string;
};

const maximumImages = 10;

function initialItems(image: string, gallery: string): PlantGalleryItem[] {
  let extra: string[] = [];
  try { extra = JSON.parse(gallery); } catch { extra = []; }
  const urls = [...new Set([image, ...extra].filter((item): item is string => typeof item === "string" && Boolean(item)))].slice(0, maximumImages);
  return urls.map((url, index) => ({ id: `saved-${index}-${url}`, url, preview: url }));
}

async function optimize(file: File) {
  if (file.size <= 900 * 1024 || !file.type.startsWith("image/")) return file;
  const source = await createImageBitmap(file);
  const scale = Math.min(1, 1920 / Math.max(source.width, source.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(source.width * scale));
  canvas.height = Math.max(1, Math.round(source.height * scale));
  canvas.getContext("2d")?.drawImage(source, 0, 0, canvas.width, canvas.height);
  source.close();
  const compressed = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.82));
  return compressed ? new File([compressed], `${file.name.replace(/\.[^.]+$/, "") || "quat"}.webp`, { type: "image/webp" }) : file;
}

export function PlantGalleryInput({ image, gallery, onChange }: { image: string; gallery: string; onChange: (items: PlantGalleryItem[]) => void }) {
  const [items, setItems] = useState<PlantGalleryItem[]>(() => initialItems(image, gallery));
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState("");
  const dragging = useRef<string | null>(null);

  useEffect(() => { onChange(items); }, [items, onChange]);
  function update(next: PlantGalleryItem[]) { setItems(next.slice(0, maximumImages)); }
  async function chooseFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = [...(event.target.files || [])];
    event.target.value = "";
    if (!files.length) return;
    if (items.length + files.length > maximumImages) { setMessage(`Mỗi cây được tối đa ${maximumImages} ảnh.`); return; }
    if (files.some((file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024)) {
      setMessage("Chỉ chọn ảnh JPEG, PNG hoặc WebP không quá 5 MB."); return;
    }
    setMessage("Đang tối ưu ảnh để tải nhanh hơn…");
    try {
      const optimized = await Promise.all(files.map(optimize));
      update([...items, ...optimized.map((file, index) => ({ id: `${file.name}-${file.lastModified}-${index}`, file, preview: URL.createObjectURL(file) }))]);
      setMessage("");
    } catch { setMessage("Không thể tối ưu một số ảnh. Hãy chọn lại ảnh."); }
  }
  function addUrl() {
    try {
      const normalized = new URL(url.trim());
      if (normalized.protocol !== "https:") throw new Error();
      if (items.length >= maximumImages) throw new Error("limit");
      update([...items, { id: `link-${normalized.href}`, url: normalized.href, preview: normalized.href }]);
      setUrl(""); setMessage("");
    } catch (error) { setMessage(error instanceof Error && error.message === "limit" ? `Mỗi cây được tối đa ${maximumImages} ảnh.` : "Liên kết ảnh phải bắt đầu bằng https://"); }
  }
  function dropOn(targetId: string) {
    if (!dragging.current || dragging.current === targetId) return;
    const from = items.findIndex((item) => item.id === dragging.current);
    const to = items.findIndex((item) => item.id === targetId);
    if (from < 0 || to < 0) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    update(next); dragging.current = null;
  }
  return <fieldset className="plant-gallery-field wide"><legend>Thư viện ảnh cây quất</legend><p>Chọn tối đa {maximumImages} ảnh. Ảnh đầu tiên là ảnh bìa hiển thị ngoài website; kéo thả để đổi thứ tự.</p>
    <input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={chooseFiles} aria-label="Tải nhiều ảnh cây quất" />
    <div className="gallery-url-row"><input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="Hoặc dán liên kết ảnh HTTPS" inputMode="url" /><button type="button" onClick={addUrl}>Thêm liên kết</button></div>
    {message && <small className="gallery-message">{message}</small>}
    {items.length > 0 && <div className="admin-gallery-sort" aria-label="Ảnh đã chọn">{items.map((item, index) => <div key={item.id} className="admin-gallery-item" draggable onDragStart={() => { dragging.current = item.id; }} onDragOver={(event: DragEvent<HTMLDivElement>) => event.preventDefault()} onDrop={() => dropOn(item.id)}>
      <img src={item.preview} alt={`Ảnh ${index + 1}`} /><span>{index === 0 ? "Ảnh bìa" : `Ảnh ${index + 1}`}</span><button type="button" onClick={() => update(items.filter((candidate) => candidate.id !== item.id))} aria-label={`Xóa ảnh ${index + 1}`}>×</button>
    </div>)}</div>}
  </fieldset>;
}
