"use client";
import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { deleteEntry, saveEntry } from "./actions";
import type { entries } from "@/db/schema";

type Item = typeof entries.$inferSelect;
type Notice = { text:string; error:boolean } | null;

export function EntryManager({items}:{items:Item[]}) {
  const [notice,setNotice]=useState<Notice>(null);
  return <>
    <section><h2>Thêm cây hoặc bài viết</h2>
      {notice && <p className={notice.error?"notice error":"notice success"} role={notice.error?"alert":"status"}>{notice.text}</p>}
      <EntryForm onNotice={setNotice}/>
    </section>
    <section><h2>Nội dung đã tạo</h2>
      {notice && <p className={notice.error?"notice error":"notice success"} role={notice.error?"alert":"status"}>{notice.text}</p>}
      {items.length===0&&<p>Chưa có nội dung.</p>}
      {items.map(item=><details key={item.id}><summary>{item.title} — {item.published?"Đã đăng":"Bản nháp"}</summary><EntryForm item={item} onNotice={setNotice}/></details>)}
    </section>
  </>;
}

function EntryForm({item,onNotice}:{item?:Item;onNotice:(notice:Notice)=>void}) {
  const router=useRouter();
  const [pending,startTransition]=useTransition();
  const [localNotice,setLocalNotice]=useState<Notice>(null);
  function show(n:Notice){setLocalNotice(n);onNotice(n)}
  function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form=event.currentTarget;
    const data=new FormData(form);
    const file=data.get("photo");
    show(null);
    startTransition(async()=>{
      try {
        if(file instanceof File && file.size) {
          if(file.size>5*1024*1024) throw new Error("Ảnh phải nhỏ hơn hoặc bằng 5 MB.");
          const upload=new FormData();upload.set("file",file);
          const response=await fetch("/api/upload",{method:"POST",body:upload});
          const result=await response.json() as {url?:string;error?:string};
          if(!response.ok||!result.url)throw new Error(result.error||"Không thể tải ảnh lên.");
          data.set("image",result.url);
        }
        data.delete("photo");
        await saveEntry(data);
        if(!item) form.reset();
        else {
          const photo=form.elements.namedItem("photo");
          const image=form.elements.namedItem("image");
          if(photo instanceof HTMLInputElement)photo.value="";
          if(image instanceof HTMLInputElement)image.value=String(data.get("image")||"");
        }
        show({text:item?"Đã lưu thay đổi thành công.":"Đã tạo nội dung thành công.",error:false});
        router.refresh();
      } catch(error) {show({text:error instanceof Error?error.message:"Không thể lưu nội dung. Vui lòng thử lại.",error:true});}
    });
  }
  function remove(){
    if(!item||!window.confirm('Bạn có chắc muốn xóa “'+item.title+'”? Thao tác này không thể hoàn tác.'))return;
    show(null);
    startTransition(async()=>{try{await deleteEntry(item.id);onNotice({text:"Đã xóa nội dung thành công.",error:false});router.refresh()}catch{show({text:"Không thể xóa nội dung. Vui lòng thử lại.",error:true})}});
  }
  return <form onSubmit={submit} className="form">
    <input type="hidden" name="id" value={item?.id||""}/>
    <label>Loại nội dung<select name="kind" defaultValue={item?.kind||"plant"}><option value="plant">Cây quất</option><option value="article">Bài viết</option></select></label>
    <label>Tiêu đề<input name="title" required maxLength={150} defaultValue={item?.title}/></label>
    <label>Mã cây<input name="code" defaultValue={item?.code}/></label>
    <label>Giá hoặc thông tin giá<input name="price" defaultValue={item?.price}/></label>
    <label>Trạng thái<select name="status" defaultValue={item?.status||"contact"}><option value="contact">Liên hệ</option><option value="available">Còn tại vườn</option><option value="sold">Đã bán</option></select></label>
    {item?.image&&<img className="admin-preview" src={item.image} alt={"Ảnh hiện tại của "+item.title}/>}
    <label>Tải ảnh lên<input type="file" name="photo" accept="image/jpeg,image/png,image/webp"/><small>JPEG, PNG hoặc WebP, tối đa 5 MB. Chọn ảnh mới để thay ảnh hiện tại.</small></label>
    <label>Hoặc dùng liên kết ảnh HTTPS<input type="text" name="image" defaultValue={item?.image} placeholder="https://..."/><small>Để trống nếu không dùng ảnh.</small></label>
    <label>Nội dung<textarea name="description" rows={7} defaultValue={item?.description}/></label>
    <label className="check"><input type="checkbox" name="published" defaultChecked={item?.published===1}/> Xuất bản công khai</label>
    <button type="submit" disabled={pending}>{pending?"Đang xử lý…":"Lưu nội dung"}</button>
    {item&&<button type="button" className="delete-button" onClick={remove} disabled={pending}>Xóa nội dung</button>}
    {localNotice&&<p className={localNotice.error?"notice error":"notice success"} role={localNotice.error?"alert":"status"}>{localNotice.text}</p>}
  </form>;
}
