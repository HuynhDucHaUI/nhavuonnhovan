import { notFound } from "next/navigation";
import { SiteFooter, SiteHeader } from "../../components/site-chrome";
import { publicData, publicLots } from "../../data";

export const dynamic = "force-dynamic";

export default async function WholesaleLotDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [lots, { config }] = await Promise.all([publicLots(), publicData()]);
  const lot = lots.find((item) => item.id === Number(id));
  if (!lot) notFound();
  return <><SiteHeader /><main className="listing-page"><article className="wrap detail">
    <a className="back-link" href="/lo-si">← Về danh sách lô bán sỉ</a>
    <p className="eyebrow green">LÔ {lot.code} · CÒN HÀNG</p>
    <h1>{lot.title}</h1>
    {lot.image && <img className="detail-img" src={lot.image} alt={lot.title} />}
    <div className="detail-grid">
      <div><span>Loại / dáng cây</span><b>{lot.plantType}</b></div>
      {lot.sizeOrAge && <div><span>Kích thước / độ tuổi</span><b>{lot.sizeOrAge}</b></div>}
      {lot.location && <div><span>Vị trí tham khảo</span><b>{lot.location}</b></div>}
      <div><span>Mức mua tối thiểu</span><b>{lot.minimumOrderQuantity} {lot.unit}</b></div>
      <div><span>Giá sỉ</span><b>{lot.wholesalePrice || "Liên hệ báo giá"}</b></div>
    </div>
    <p className="description">{lot.description || "Liên hệ nhà vườn để xem trực tiếp lô cây và nhận tư vấn số lượng phù hợp."}</p>
    <p className="listing-intro">Lô hiện còn hàng. Nhà vườn sẽ xác nhận số lượng thực tế, lịch lấy hàng và giá cho đơn của bạn khi liên hệ.</p>
    <div className="actions">{config.phone && <a className="button dark" href={`tel:${config.phone}`}>Gọi {config.phone}</a>}{config.phone2 && <a className="button dark" href={`tel:${config.phone2}`}>Gọi {config.phone2}</a>}{config.zalo && <a className="button dark" href={config.zalo} target="_blank" rel="noreferrer">Nhắn Zalo</a>}</div>
  </article></main><SiteFooter /></>;
}
