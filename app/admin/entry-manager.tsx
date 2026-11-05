"use client";

import { useMemo, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, ChevronLeft, ChevronRight, CircleHelp, FilePenLine, Home, Image, LogOut, Menu, MoreVertical, Pencil, Plus, Search, Settings, Trash2, Trees, Upload, Users, X } from "lucide-react";
import { deleteEntry, saveEntry } from "./actions";
import type { entries } from "@/db/schema";

type Item = typeof entries.$inferSelect;
type Notice = { text: string; error: boolean } | null;
type Modal = "create" | "edit" | "detail" | "delete" | null;
const pageSize = 10;
const statusLabel = { available: "Còn tại vườn", sold: "Đã bán", contact: "Liên hệ" } as const;
const typeLabel = { plant: "Cây quất", article: "Bài viết" } as const;

export function EntryManager({ items, logoutPath }: { items: Item[]; logoutPath: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<Modal>(null);
  const [selected, setSelected] = useState<Item | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const filtered = useMemo(() => items.filter((item) => {
    const text = `${item.title} ${item.code} ${item.description}`.toLowerCase();
    return text.includes(query.toLowerCase()) && (kind === "all" || item.kind === kind) && (status === "all" || item.status === status);
  }), [items, query, kind, status]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pages);
  const rows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const rangeStart = filtered.length ? (safePage - 1) * pageSize + 1 : 0;
  const rangeEnd = Math.min(safePage * pageSize, filtered.length);
  function open(mode: Modal, item: Item | null = null) { setSelected(item); setModal(mode); }
  function close() { setModal(null); setSelected(null); }
  function filter(update: () => void) { update(); setPage(1); }

  return <div className="admin-shell">
    <aside className={sidebarOpen ? "admin-sidebar open" : "admin-sidebar"}>
      <div className="admin-brand"><span className="admin-brand-mark">✳</span><span>NHÀ VƯỜN<br/><b>NHO VĂN</b></span><button className="sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Đóng menu"><X size={20}/></button></div>
      <p className="sidebar-caption">HỆ THỐNG QUẢN TRỊ</p>
      <nav className="admin-nav">
        <a href="/admin"><Home size={18}/>Tổng quan</a>
        <a className="active" href="#quan-ly-noi-dung"><FilePenLine size={18}/>Quản lý nội dung</a>
        <a href="/#cay"><Trees size={18}/>Cây quất</a>
        <a href="/#baiviet"><BookOpen size={18}/>Bài viết</a>
        <a href="#lien-he"><Users size={18}/>Thông tin liên hệ</a>
        <a href="/"><Image size={18}/>Xem website</a>
        <a href="#ho-tro"><CircleHelp size={18}/>Hỗ trợ</a>
      </nav>
      <div className="sidebar-bottom"><a href={logoutPath}><LogOut size={18}/>Đăng xuất</a></div>
    </aside>
    <div className="admin-main">
      <header className="admin-topbar">
        <button className="menu-button" onClick={() => setSidebarOpen(true)} aria-label="Mở menu"><Menu size={21}/></button>
        <p>Trang chủ <span>›</span> <b>Quản lý nội dung</b></p>
        <div className="topbar-actions"><a href="/"><Home size={18}/><span>Website</span></a><a href={logoutPath} className="logout-link"><LogOut size={18}/><span>Đăng xuất</span></a></div>
      </header>
      <main className="admin-content" id="quan-ly-noi-dung">
        <div className="content-heading"><div><p>QUẢN LÝ NHÀ VƯỜN</p><h1>Cây quất & bài viết</h1></div><button className="primary-button" onClick={() => open("create")}><Plus size={18}/>Thêm nội dung</button></div>
        {notice && <p className={notice.error ? "toast error" : "toast success"} role={notice.error ? "alert" : "status"}>{notice.text}<button onClick={() => setNotice(null)} aria-label="Đóng thông báo"><X size={16}/></button></p>}
        <section className="manager-card">
          <div className="manager-toolbar">
            <label className="search-input"><Search size={18}/><input value={query} onChange={(e) => filter(() => setQuery(e.target.value))} placeholder="Tìm theo tên, mã cây, nội dung..." /></label>
            <select value={kind} onChange={(e) => filter(() => setKind(e.target.value))} aria-label="Lọc loại nội dung"><option value="all">Tất cả loại nội dung</option><option value="plant">Cây quất</option><option value="article">Bài viết</option></select>
            <select value={status} onChange={(e) => filter(() => setStatus(e.target.value))} aria-label="Lọc trạng thái"><option value="all">Tất cả trạng thái</option><option value="available">Còn tại vườn</option><option value="contact">Liên hệ</option><option value="sold">Đã bán</option></select>
            <button className="refresh-button" onClick={() => {setQuery("");setKind("all");setStatus("all");setPage(1)}} title="Làm mới bộ lọc"><Settings size={18}/></button>
          </div>
          <div className="table-wrap"><table>
            <thead><tr><th>STT</th><th>Nội dung</th><th>Loại</th><th>Trạng thái</th><th>Ngày tạo</th><th className="actions-column">Thao tác</th></tr></thead>
            <tbody>{rows.length ? rows.map((item, index) => <tr key={item.id}>
              <td>{(safePage - 1) * pageSize + index + 1}</td>
              <td><div className="content-cell">{item.image ? <img src={item.image} alt="" /> : <span className="content-avatar">{item.kind === "plant" ? "Q" : "B"}</span>}<div><b>{item.title}</b><small>{item.code || item.description.slice(0, 56) || "Chưa có mô tả"}</small></div></div></td>
              <td>{typeLabel[item.kind as keyof typeof typeLabel]}</td>
              <td><span className={item.published ? item.status === "sold" ? "status sold" : "status live" : "status draft"}><i/>{item.published ? statusLabel[item.status as keyof typeof statusLabel] : "Bản nháp"}</span></td>
              <td>{formatDate(item.createdAt)}</td>
              <td><div className="row-actions"><button title="Xem chi tiết" onClick={() => open("detail", item)}><MoreVertical size={18}/></button><button title="Sửa" onClick={() => open("edit", item)}><Pencil size={17}/></button><button className="remove" title="Xóa" onClick={() => open("delete", item)}><Trash2 size={17}/></button></div></td>
            </tr>) : <tr><td colSpan={6}><div className="empty-table">Không có nội dung phù hợp.</div></td></tr>}</tbody>
          </table></div>
          <div className="pagination"><span>{rangeStart} - {rangeEnd} của {filtered.length} nội dung</span><div><button onClick={() => setPage(Math.max(1, safePage - 1))} disabled={safePage === 1} aria-label="Trang trước"><ChevronLeft size={18}/></button><span className="page-current">{safePage}</span><span className="page-total">/ {pages}</span><button onClick={() => setPage(Math.min(pages, safePage + 1))} disabled={safePage === pages} aria-label="Trang sau"><ChevronRight size={18}/></button></div></div>
        </section>
      </main>
    </div>
    {modal === "create" && <ContentModal title="Thêm nội dung mới" onClose={close}><EntryForm onComplete={(n) => { setNotice(n); close(); router.refresh(); }}/></ContentModal>}
    {modal === "edit" && selected && <ContentModal title="Cập nhật nội dung" onClose={close}><EntryForm item={selected} onComplete={(n) => { setNotice(n); close(); router.refresh(); }}/></ContentModal>}
    {modal === "detail" && selected && <ContentModal title="Chi tiết nội dung" onClose={close}><Detail item={selected} onEdit={() => setModal("edit")}/></ContentModal>}
    {modal === "delete" && selected && <DeleteModal item={selected} onClose={close} onComplete={(n) => {setNotice(n);close();router.refresh();}}/>}
  </div>;
}

function ContentModal({ title, children, onClose }: { title:string; children:React.ReactNode; onClose:()=>void }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><section className="modal-card" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(e)=>e.stopPropagation()}><div className="modal-heading"><h2>{title}</h2><button onClick={onClose} aria-label="Đóng"><X size={21}/></button></div>{children}</section></div>;
}

function Detail({ item, onEdit }: { item:Item; onEdit:()=>void }) {
  return <div className="detail-panel">{item.image && <img src={item.image} alt={item.title}/>}<div className="detail-grid"><div><span>Loại nội dung</span><b>{typeLabel[item.kind as keyof typeof typeLabel]}</b></div><div><span>Trạng thái</span><b>{item.published ? statusLabel[item.status as keyof typeof statusLabel] : "Bản nháp"}</b></div><div><span>Mã cây</span><b>{item.code || "—"}</b></div><div><span>Giá</span><b>{item.price || "Liên hệ"}</b></div></div><h3>{item.title}</h3><p>{item.description || "Chưa có nội dung mô tả."}</p><div className="modal-footer"><button className="secondary-button" onClick={onEdit}><Pencil size={17}/>Chỉnh sửa</button></div></div>;
}

function DeleteModal({ item, onClose, onComplete }: {item:Item;onClose:()=>void;onComplete:(notice:NonNullable<Notice>)=>void}) {
  const [pending,startTransition]=useTransition(); const [error,setError]=useState("");
  function remove(){startTransition(async()=>{try{await deleteEntry(item.id);onComplete({text:"Đã xóa nội dung thành công.",error:false})}catch{setError("Không thể xóa nội dung. Vui lòng thử lại.")}})}
  return <ContentModal title="Xóa nội dung" onClose={onClose}><div className="delete-dialog"><Trash2 size={28}/><p>Bạn có chắc muốn xóa <b>“{item.title}”</b>?</p><small>Thao tác này không thể hoàn tác.</small>{error&&<p className="inline-error">{error}</p>}<div className="modal-footer"><button className="plain-button" onClick={onClose}>Hủy</button><button className="danger-button" onClick={remove} disabled={pending}>{pending?"Đang xóa…":"Xóa nội dung"}</button></div></div></ContentModal>;
}

function EntryForm({item,onComplete}:{item?:Item;onComplete:(notice:NonNullable<Notice>)=>void}) {
  const [pending,startTransition]=useTransition(); const [error,setError]=useState("");
  function submit(event:FormEvent<HTMLFormElement>) {event.preventDefault();const form=event.currentTarget;const data=new FormData(form);const file=data.get("photo");setError("");startTransition(async()=>{try{if(file instanceof File&&file.size){if(file.size>5*1024*1024)throw new Error("Ảnh phải nhỏ hơn hoặc bằng 5 MB.");const upload=new FormData();upload.set("file",file);const response=await fetch("/api/upload",{method:"POST",body:upload});const result=await response.json() as {url?:string;error?:string};if(!response.ok||!result.url)throw new Error(result.error||"Không thể tải ảnh lên.");data.set("image",result.url)}data.delete("photo");await saveEntry(data);onComplete({text:item?"Đã lưu thay đổi thành công.":"Đã tạo nội dung thành công.",error:false})}catch(cause){setError(cause instanceof Error?cause.message:"Không thể lưu nội dung. Vui lòng thử lại.")}})}
  return <form onSubmit={submit} className="content-form"><div className="form-grid"><label>Loại nội dung<select name="kind" defaultValue={item?.kind||"plant"}><option value="plant">Cây quất</option><option value="article">Bài viết</option></select></label><label>Trạng thái<select name="status" defaultValue={item?.status||"contact"}><option value="contact">Liên hệ</option><option value="available">Còn tại vườn</option><option value="sold">Đã bán</option></select></label><label className="wide">Tiêu đề<input name="title" required maxLength={150} defaultValue={item?.title} placeholder="Nhập tên cây hoặc tiêu đề bài viết"/></label><label>Mã cây<input name="code" defaultValue={item?.code} placeholder="Ví dụ: Q-2026-01"/></label><label>Giá hoặc thông tin giá<input name="price" defaultValue={item?.price} placeholder="Ví dụ: Liên hệ để biết giá"/></label><label className="wide upload-field">Tải ảnh lên<input type="file" name="photo" accept="image/jpeg,image/png,image/webp"/><span><Upload size={16}/> JPEG, PNG hoặc WebP, tối đa 5 MB</span></label><label className="wide">Hoặc dùng liên kết ảnh HTTPS<input type="text" name="image" defaultValue={item?.image} placeholder="https://..."/></label><label className="wide">Nội dung<textarea name="description" rows={6} defaultValue={item?.description} placeholder="Viết mô tả, đặc điểm hoặc câu chuyện về cây..."/></label><label className="toggle-field wide"><input type="checkbox" name="published" defaultChecked={item?.published===1}/><span>Xuất bản công khai</span></label></div>{error&&<p className="inline-error">{error}</p>}<div className="modal-footer"><button className="primary-button" type="submit" disabled={pending}>{pending?"Đang lưu…":"Lưu nội dung"}</button></div></form>;
}
function formatDate(value:string){const date=new Date(value);return Number.isNaN(date.valueOf())?"—":date.toLocaleDateString("vi-VN",{day:"2-digit",month:"2-digit",year:"numeric"})}
