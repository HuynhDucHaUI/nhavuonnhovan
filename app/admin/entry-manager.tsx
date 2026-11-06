"use client";

import { useMemo, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, ChevronLeft, ChevronRight, CircleHelp, FilePenLine, Home, Image, LogOut, Menu, MoreVertical, Pencil, Plus, Search, Settings, Trash2, Trees, Upload, Users, X } from "lucide-react";
import { deleteEntry, logoutAction, saveEntry, saveSettings } from "./actions";
import type { entries } from "@/db/schema";

type Item = typeof entries.$inferSelect;
type Notice = { text: string; error: boolean } | null;
type Modal = "create" | "edit" | "detail" | "delete" | "contact" | "help" | null;
type Contact = { phone: string; phone2: string; zalo: string; facebook: string; map: string };
const pageSize = 10;
const statusLabel = { available: "Còn tại vườn", sold: "Đã bán", contact: "Liên hệ" } as const;
const typeLabel = { plant: "Cây quất", article: "Bài viết" } as const;
const dashboardStyles = `.admin-nav button{display:flex;align-items:center;gap:13px;width:100%;padding:12px;border:0;border-radius:8px;background:transparent;color:#eaf5ff;text-align:left;font:600 14px DM Sans,sans-serif;cursor:pointer}.admin-nav button:hover,.admin-nav button.active{background:#087dc3}.overview-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-bottom:24px}.overview-grid>div{padding:24px;background:#fff;border-radius:14px;box-shadow:0 5px 24px #174a6810}.overview-grid span,.overview-grid small{display:block;color:#708798;font-size:13px}.overview-grid b{display:block;margin:12px 0 8px;font-size:38px;color:#086aa9}.overview-card{background:linear-gradient(115deg,#07558e,#0d79b5);border-radius:14px;padding:30px;color:#fff;display:flex;justify-content:space-between;align-items:center;gap:24px}.overview-card h2{font-family:DM Sans,sans-serif;font-size:22px;font-weight:700}.overview-card p{max-width:520px;color:#e2f3ff;line-height:1.7}.overview-card>div:last-child{display:flex;gap:10px;flex-wrap:wrap}.overview-card .secondary-button{background:#fff;color:#086aa9}.overview-card .plain-button{background:#ffffff18;border-color:#ffffff55;color:#fff}.help-panel{padding:24px;line-height:1.8;color:#526e80}.help-panel h3{font-family:DM Sans,sans-serif;font-size:20px;color:#23445b}.help-panel a{display:inline-block;color:#0870b2;font-weight:700;margin-top:10px}@media(max-width:700px){.overview-grid{grid-template-columns:1fr}.overview-card{align-items:flex-start;flex-direction:column}}`;
const accountNavStyles = `.admin-nav a{display:flex;align-items:center;gap:13px;width:100%;padding:12px;border-radius:8px;color:#eaf5ff;text-decoration:none;font:600 14px DM Sans,sans-serif}.admin-nav a:hover{background:#087dc3}.sidebar-bottom form{margin:0}.sidebar-bottom form button{display:flex;align-items:center;gap:13px;width:100%;padding:12px;border:0;border-radius:8px;background:transparent;color:#eaf5ff;font:600 14px DM Sans,sans-serif;cursor:pointer}.sidebar-bottom form button:hover{background:#087dc3}.topbar-actions form{margin:0}.topbar-actions .logout-link{display:flex;align-items:center;gap:8px;border:0;background:transparent;font:600 13px DM Sans,sans-serif;padding:9px 11px;border-radius:6px;cursor:pointer}.topbar-actions .logout-link:hover{background:#fff0f0}`;

export function EntryManager({ items, contact, user }: { items: Item[]; contact: Contact; user: { displayName: string; role: "owner" | "staff" } }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<Modal>(null);
  const [selected, setSelected] = useState<Item | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [screen, setScreen] = useState<"overview" | "content">("content");
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
  function navigate(next: "overview" | "content", nextKind?: string) {
    setScreen(next);
    if (nextKind !== undefined) setKind(nextKind);
    setPage(1);
    setSidebarOpen(false);
  }

  return <><style>{dashboardStyles + accountNavStyles}</style><div className="admin-shell">
    <aside className={sidebarOpen ? "admin-sidebar open" : "admin-sidebar"}>
      <div className="admin-brand"><span className="admin-brand-mark">✳</span><span>NHÀ VƯỜN<br/><b>NHO VĂN</b></span><button className="sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Đóng menu"><X size={20}/></button></div>
      <p className="sidebar-caption">HỆ THỐNG QUẢN TRỊ</p>
      <nav className="admin-nav">
        <button className={screen === "overview" ? "active" : ""} onClick={() => navigate("overview")}><Home size={18}/>Tổng quan</button>
        <button className={screen === "content" && kind === "all" ? "active" : ""} onClick={() => navigate("content", "all")}><FilePenLine size={18}/>Quản lý nội dung</button>
        <button className={screen === "content" && kind === "plant" ? "active" : ""} onClick={() => navigate("content", "plant")}><Trees size={18}/>Cây quất</button>
        <button className={screen === "content" && kind === "article" ? "active" : ""} onClick={() => navigate("content", "article")}><BookOpen size={18}/>Bài viết</button>
        <a href="/admin/lots"><Trees size={18}/>Lô/luống & tồn kho</a>
        {user.role === "owner" && <a href="/admin/users"><Users size={18}/>Quản lý tài khoản</a>}
        <button onClick={() => {setModal("contact");setSidebarOpen(false)}}><Users size={18}/>Thông tin liên hệ</button>
        <a href="/"><Image size={18}/>Xem website</a>
        <button onClick={() => {setModal("help");setSidebarOpen(false)}}><CircleHelp size={18}/>Hỗ trợ</button>
      </nav>
      <div className="sidebar-bottom"><form action={logoutAction}><button type="submit"><LogOut size={18}/>Đăng xuất</button></form></div>
    </aside>
    <div className="admin-main">
      <header className="admin-topbar">
        <button className="menu-button" onClick={() => setSidebarOpen(true)} aria-label="Mở menu"><Menu size={21}/></button>
        <p>Trang chủ <span>›</span> <b>{screen === "overview" ? "Tổng quan" : "Quản lý nội dung"}</b></p>
        <div className="topbar-actions"><a href="/"><Home size={18}/><span>Website</span></a><form action={logoutAction}><button type="submit" className="logout-link"><LogOut size={18}/><span>Đăng xuất</span></button></form></div>
      </header>
      <main className="admin-content" id="quan-ly-noi-dung">
        {screen === "overview" ? <Overview items={items} onOpenContent={() => navigate("content", "all")} onCreate={() => open("create")} onContact={() => setModal("contact")}/> : <>
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
              <td><span className={item.published ? item.kind === "plant" && item.status === "sold" ? "status sold" : "status live" : "status draft"}><i/>{item.published ? item.kind === "article" ? "Đã đăng" : statusLabel[item.status as keyof typeof statusLabel] : "Bản nháp"}</span></td>
              <td>{formatDate(item.createdAt)}</td>
              <td><div className="row-actions"><button title="Xem chi tiết" onClick={() => open("detail", item)}><MoreVertical size={18}/></button><button title="Sửa" onClick={() => open("edit", item)}><Pencil size={17}/></button><button className="remove" title="Xóa" onClick={() => open("delete", item)}><Trash2 size={17}/></button></div></td>
            </tr>) : <tr><td colSpan={6}><div className="empty-table">Không có nội dung phù hợp.</div></td></tr>}</tbody>
          </table></div>
          <div className="pagination"><span>{rangeStart} - {rangeEnd} của {filtered.length} nội dung</span><div><button onClick={() => setPage(Math.max(1, safePage - 1))} disabled={safePage === 1} aria-label="Trang trước"><ChevronLeft size={18}/></button><span className="page-current">{safePage}</span><span className="page-total">/ {pages}</span><button onClick={() => setPage(Math.min(pages, safePage + 1))} disabled={safePage === pages} aria-label="Trang sau"><ChevronRight size={18}/></button></div></div>
        </section>
        </>}
      </main>
    </div>
    {modal === "create" && <ContentModal title="Thêm nội dung mới" onClose={close}><EntryForm onComplete={(n) => { setNotice(n); close(); router.refresh(); }}/></ContentModal>}
    {modal === "edit" && selected && <ContentModal title={`Chỉnh sửa: ${selected.title}`} onClose={close}><EntryForm item={selected} onComplete={(n) => { setNotice(n); close(); router.refresh(); }}/></ContentModal>}
    {modal === "detail" && selected && <ContentModal title="Chi tiết nội dung" onClose={close}><Detail item={selected} onEdit={() => setModal("edit")}/></ContentModal>}
    {modal === "delete" && selected && <DeleteModal item={selected} onClose={close} onComplete={(n) => {setNotice(n);close();router.refresh();}}/>}
    {modal === "contact" && <ContentModal title="Thông tin liên hệ" onClose={close}><ContactForm contact={contact} onComplete={(n) => {setNotice(n);close();router.refresh();}}/></ContentModal>}
    {modal === "help" && <ContentModal title="Hỗ trợ quản trị" onClose={close}><div className="help-panel"><h3>Hướng dẫn nhanh</h3><ol><li>Chọn <b>Thêm nội dung</b> để đăng cây quất hoặc bài viết.</li><li>Nhấn biểu tượng bút để sửa, ba chấm để xem chi tiết.</li><li>Ảnh hỗ trợ JPEG, PNG và WebP, tối đa 5 MB.</li><li>Chọn <b>Xuất bản công khai</b> để nội dung xuất hiện trên website.</li></ol><a href="tel:0389982886">Gọi nhà vườn: 0389982886</a></div></ContentModal>}
  </div></>;
}

function Overview({items,onOpenContent,onCreate,onContact}:{items:Item[];onOpenContent:()=>void;onCreate:()=>void;onContact:()=>void}) {
  const live=items.filter((item)=>item.published).length; const plants=items.filter((item)=>item.kind==="plant").length; const articles=items.filter((item)=>item.kind==="article").length;
  return <><div className="content-heading"><div><p>TỔNG QUAN NHÀ VƯỜN</p><h1>Xin chào, chúc bạn một ngày tốt lành</h1></div><button className="primary-button" onClick={onCreate}><Plus size={18}/>Thêm nội dung</button></div><section className="overview-grid"><div><span>Nội dung đã xuất bản</span><b>{live}</b><small>Đang hiển thị trên website</small></div><div><span>Cây quất</span><b>{plants}</b><small>Được quản lý trong hệ thống</small></div><div><span>Bài viết</span><b>{articles}</b><small>Thông tin và chia sẻ từ vườn</small></div></section><section className="overview-card"><div><h2>Quản lý nhà vườn</h2><p>Thêm cây mới, cập nhật bài viết và giữ thông tin liên hệ luôn chính xác.</p></div><div><button className="secondary-button" onClick={onOpenContent}>Quản lý nội dung</button><button className="plain-button" onClick={onContact}>Thông tin liên hệ</button></div></section></>;
}

function ContentModal({ title, children, onClose }: { title:string; children:React.ReactNode; onClose:()=>void }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><section className="modal-card" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(e)=>e.stopPropagation()}><div className="modal-heading"><h2>{title}</h2><button onClick={onClose} aria-label="Đóng"><X size={21}/></button></div>{children}</section></div>;
}

function Detail({ item, onEdit }: { item:Item; onEdit:()=>void }) {
  const publication = item.published ? item.kind === "article" ? "Đã đăng" : statusLabel[item.status as keyof typeof statusLabel] : "Bản nháp";
  return <div className="detail-panel">{item.image && <img src={item.image} alt={item.title}/>}<div className="detail-grid"><div><span>Loại nội dung</span><b>{typeLabel[item.kind as keyof typeof typeLabel]}</b></div><div><span>Trạng thái</span><b>{publication}</b></div>{item.kind === "plant" && <><div><span>Mã cây</span><b>{item.code || "—"}</b></div><div><span>Giá</span><b>{item.price || "Liên hệ"}</b></div></>}</div><h3>{item.title}</h3><p>{item.description || "Chưa có nội dung mô tả."}</p><div className="modal-footer"><button className="secondary-button" onClick={onEdit}><Pencil size={17}/>Chỉnh sửa</button></div></div>;
}

function DeleteModal({ item, onClose, onComplete }: {item:Item;onClose:()=>void;onComplete:(notice:NonNullable<Notice>)=>void}) {
  const [pending,startTransition]=useTransition(); const [error,setError]=useState("");
  function remove(){startTransition(async()=>{try{await deleteEntry(item.id);onComplete({text:"Đã xóa nội dung thành công.",error:false})}catch{setError("Không thể xóa nội dung. Vui lòng thử lại.")}})}
  return <ContentModal title="Xóa nội dung" onClose={onClose}><div className="delete-dialog"><Trash2 size={28}/><p>Bạn có chắc muốn xóa <b>“{item.title}”</b>?</p><small>Thao tác này không thể hoàn tác.</small>{error&&<p className="inline-error">{error}</p>}<div className="modal-footer"><button className="plain-button" onClick={onClose}>Hủy</button><button className="danger-button" onClick={remove} disabled={pending}>{pending?"Đang xóa…":"Xóa nội dung"}</button></div></div></ContentModal>;
}

function EntryForm({item,onComplete}:{item?:Item;onComplete:(notice:NonNullable<Notice>)=>void}) {
  const [pending,startTransition]=useTransition(); const [error,setError]=useState("");
  const [kind,setKind]=useState<"plant"|"article">(item?.kind === "article" ? "article" : "plant");
  function submit(event:FormEvent<HTMLFormElement>) {event.preventDefault();const form=event.currentTarget;const data=new FormData(form);if(item)data.set("id",String(item.id));if(kind === "article"){data.set("code","");data.set("price","");data.set("status","contact")}const file=data.get("photo");setError("");startTransition(async()=>{try{if(file instanceof File&&file.size){if(file.size>5*1024*1024)throw new Error("Ảnh phải nhỏ hơn hoặc bằng 5 MB.");const upload=new FormData();upload.set("file",file);const response=await fetch("/api/upload",{method:"POST",body:upload});const result=await response.json() as {url?:string;error?:string};if(!response.ok||!result.url)throw new Error(result.error||"Không thể tải ảnh lên.");data.set("image",result.url)}data.delete("photo");await saveEntry(data);onComplete({text:item?"Đã lưu thay đổi thành công.":"Đã tạo nội dung thành công.",error:false})}catch(cause){setError(cause instanceof Error?cause.message:"Không thể lưu nội dung. Vui lòng thử lại.")}})}
  const isPlant=kind === "plant";
  return <form onSubmit={submit} className="content-form"><input type="hidden" name="operation" value={item?"update":"create"}/><input type="hidden" name="id" value={item?.id ?? ""}/><div className="form-grid"><label>Loại nội dung<select name="kind" value={kind} onChange={(event)=>setKind(event.target.value === "article" ? "article" : "plant")}><option value="plant">Cây quất — nội dung bán cây</option><option value="article">Bài viết — giới thiệu, chia sẻ</option></select><small>{isPlant ? "Hiển thị tại mục Cây quất trên website." : "Hiển thị tại mục Chuyện từ nhà vườn trên website."}</small></label>{isPlant && <label>Trạng thái cây<select name="status" defaultValue={item?.status||"contact"}><option value="contact">Liên hệ</option><option value="available">Còn tại vườn</option><option value="sold">Đã bán</option></select></label>}<label className="wide">{isPlant ? "Tên cây" : "Tiêu đề bài viết"}<input name="title" required maxLength={150} defaultValue={item?.title} placeholder={isPlant ? "Ví dụ: Quất chum thế đẹp" : "Ví dụ: Cách chọn quất đẹp ngày Tết"}/></label>{isPlant && <><label>Mã cây<input name="code" defaultValue={item?.code} placeholder="Ví dụ: Q-2026-01"/></label><label>Giá hoặc thông tin giá<input name="price" defaultValue={item?.price} placeholder="Ví dụ: Liên hệ để biết giá"/></label></>}<label className="wide upload-field">Ảnh {isPlant ? "cây" : "bìa bài viết"}<input type="file" name="photo" accept="image/jpeg,image/png,image/webp"/><span><Upload size={16}/> JPEG, PNG hoặc WebP, tối đa 5 MB</span></label><label className="wide">Hoặc dùng liên kết ảnh HTTPS<input type="text" name="image" defaultValue={item?.image} placeholder="https://..."/></label><label className="wide">{isPlant ? "Mô tả cây" : "Nội dung bài viết"}<textarea name="description" rows={6} defaultValue={item?.description} placeholder={isPlant ? "Nêu dáng cây, chiều cao, đặc điểm nổi bật..." : "Viết nội dung chia sẻ, thông tin hoặc câu chuyện từ nhà vườn..."}/></label><label className="toggle-field wide"><input type="checkbox" name="published" defaultChecked={item?.published===1}/><span>{isPlant ? "Xuất bản công khai" : "Đăng bài viết công khai"}</span></label></div>{error&&<p className="inline-error">{error}</p>}<div className="modal-footer"><button className="primary-button" type="submit" disabled={pending}>{pending?"Đang lưu…":isPlant?"Lưu cây quất":"Đăng bài viết"}</button></div></form>;
}
function ContactForm({contact,onComplete}:{contact:Contact;onComplete:(notice:NonNullable<Notice>)=>void}) {
  const [pending,startTransition]=useTransition(); const [error,setError]=useState("");
  function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();const data=new FormData(event.currentTarget);setError("");startTransition(async()=>{try{await saveSettings(data);onComplete({text:"Đã lưu thông tin liên hệ thành công.",error:false})}catch{setError("Không thể lưu thông tin liên hệ. Vui lòng thử lại.")}})}
  return <form className="content-form" onSubmit={submit}><div className="form-grid"><label>Điện thoại<input name="phone" defaultValue={contact.phone}/></label><label>Điện thoại thứ hai<input name="phone2" defaultValue={contact.phone2}/></label><label className="wide">Liên kết Zalo<input name="zalo" type="url" defaultValue={contact.zalo} placeholder="https://zalo.me/..."/></label><label className="wide">Liên kết Facebook<input name="facebook" type="url" defaultValue={contact.facebook} placeholder="https://www.facebook.com/..."/></label><label className="wide">Liên kết Google Maps<input name="map" type="url" defaultValue={contact.map} placeholder="https://maps.app.goo.gl/..."/></label></div>{error&&<p className="inline-error">{error}</p>}<div className="modal-footer"><button className="primary-button" type="submit" disabled={pending}>{pending?"Đang lưu…":"Lưu thông tin"}</button></div></form>
}
function formatDate(value:string){const date=new Date(value);return Number.isNaN(date.valueOf())?"—":date.toLocaleDateString("vi-VN",{day:"2-digit",month:"2-digit",year:"numeric"})}
