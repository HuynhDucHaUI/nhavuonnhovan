import { SiteFooter, SiteHeader } from "./components/site-chrome";
import { latestPublicEntries, latestPublicLots, publicContact } from "./data";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";
const homeLimit = 3;

export default async function Home() {
  const [config, plants, articles, lots] = await Promise.all([
    publicContact(), latestPublicEntries("plant", homeLimit),
    latestPublicEntries("article", homeLimit), latestPublicLots(homeLimit),
  ]);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "LocalBusiness", name: SITE_NAME,
        url: SITE_URL, description: "Nhà vườn quất cảnh Nho Văn, nhận bán sỉ quất cảnh trên toàn quốc.",
        telephone: config.phone, address: { "@type": "PostalAddress", streetAddress: "Thôn CD Quán Trạch, Xã Văn Giang", addressRegion: "Hưng Yên", addressCountry: "VN" },
        areaServed: { "@type": "Country", name: "Việt Nam" }, sameAs: config.zalo ? [config.zalo] : [],
      }) }} />
      <SiteHeader />
      <main>
        <section className="hero">
          <div className="hero-inner">
            <p className="eyebrow">VĂN GIANG · HƯNG YÊN</p>
            <h1>
              Mang sắc xuân
              <br />
              <em>về ngôi nhà bạn.</em>
            </h1>
            <p className="hero-copy">
              Ghé Nhà vườn Nho Văn, chọn một cây quất cảnh thật ưng ý cho không
              gian của bạn.
            </p>
            <div className="actions">
              <a className="button light" href="/cay-quat">
                Khám phá cây quất ↗
              </a>
              <a className="text-link" href="#lienhe">
                Thông tin nhà vườn ↓
              </a>
            </div>
          </div>
          <div className="hero-bottom">
            <span>NHÀ VƯỜN NHO VĂN</span>
            <span>QUẤT CẢNH VĂN GIANG — VIỆT NAM</span>
          </div>
        </section>
        <section className="intro wrap" id="cauchuyen">
          <div>
            <p className="eyebrow green">MỘT CHÚT VỀ NHÀ VƯỜN</p>
            <h2>
              Vẻ đẹp từ vườn,
              <br />
              <em>niềm vui đến nhà.</em>
            </h2>
          </div>
          <div>
            <p>
              Nhà vườn Nho Văn là nơi bạn có thể tìm hiểu và lựa chọn những cây
              quất cảnh phù hợp cho gia đình, không gian làm việc hay dịp sum
              họp.
            </p>
            <p>
              Hãy ghé thăm vườn để tận mắt ngắm cây và trò chuyện cùng nhà vườn.
            </p>
            <a className="underline" href="#lienhe">
              Tìm đường đến vườn ↗
            </a>
          </div>
        </section>
        <section className="catalog" id="cay">
          <div className="wrap">
            <div className="section-head">
              <div>
                <p className="eyebrow green">CÂY QUẤT MỚI NHẤT</p>
                <h2>
                  Tìm cây <em>ưng ý.</em>
                </h2>
              </div>
              <div className="section-copy">
                <p>
                  Mỗi cây một dáng vẻ riêng.
                  <br />
                  Mời bạn khám phá và liên hệ nhà vườn.
                </p>
                <a href="/cay-quat">Xem tất cả cây quất ↗</a>
              </div>
            </div>
            {plants.length ? (
              <div className="grid">
                {plants.map((item) => (
                  <PlantCard item={item} key={item.id} />
                ))}
              </div>
            ) : (
              <Empty text="Nhà vườn đang cập nhật hình ảnh cây quất." />
            )}
          </div>
        </section>
        <section className="catalog wholesale-home" id="lo-si">
          <div className="wrap">
            <div className="section-head">
              <div>
                <p className="eyebrow green">BÁN SỈ THEO LÔ / LUỐNG</p>
                <h2>
                  Chọn lô <em>phù hợp.</em>
                </h2>
              </div>
              <div className="section-copy">
                <p>
                  Nhà vườn bán sỉ theo lô để khách dễ chọn số lượng và dáng cây phù hợp.
                </p>
                <a href="/lo-si">Xem tất cả lô đang chào bán →</a>
              </div>
            </div>
            {lots.length ? (
              <div className="grid">
                {lots.slice(0, homeLimit).map((lot) => <LotCard lot={lot} key={lot.id} />)}
              </div>
            ) : (
              <Empty text="Nhà vườn đang cập nhật các lô cây bán sỉ." />
            )}
          </div>
        </section>
        <section className="journal wrap" id="baiviet">
          <div className="section-head">
            <div>
              <p className="eyebrow green">CHUYỆN TỪ NHÀ VƯỜN</p>
              <h2>
                Góc nhỏ <em>chia sẻ.</em>
              </h2>
            </div>
            <div className="section-copy">
              <p>
                Thông tin và những câu chuyện
                <br />
                về quất cảnh từ nhà vườn.
              </p>
              <a href="/bai-viet">Xem tất cả bài viết ↗</a>
            </div>
          </div>
          {articles.length ? (
            <div className="grid">
              {articles.map((item) => (
                <ArticleCard item={item} key={item.id} />
              ))}
            </div>
          ) : (
            <p className="muted">Bài viết mới sẽ sớm được cập nhật tại đây.</p>
          )}
        </section>
        <section className="visit" id="lienhe">
          <div className="wrap visit-inner">
            <div>
              <p className="eyebrow">HẸN GẶP BẠN TẠI VƯỜN</p>
              <h2>
                Đến chơi vườn,
                <br />
                <em>chọn cây mang về.</em>
              </h2>
              <p>
                Thôn CD Quán Trạch, Xã Văn Giang,
                <br />
                Tỉnh Hưng Yên
              </p>
              <div className="actions">
                {config.map && (
                  <a
                    className="button light"
                    href={config.map}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Chỉ đường đến vườn ↗
                  </a>
                )}
                {config.phone && (
                  <a className="text-link" href={"tel:" + config.phone}>
                    Gọi {config.phone}
                  </a>
                )}
                {config.phone2 && (
                  <a className="text-link" href={"tel:" + config.phone2}>
                    Gọi {config.phone2}
                  </a>
                )}
                {config.zalo && (
                  <a
                    className="text-link"
                    href={config.zalo}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Nhắn Zalo ↗
                  </a>
                )}
              </div>
            </div>
            <div className="visit-mark">
              ✳
              <small>
                NHO VĂN
                <br />
                VĂN GIANG
              </small>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

type PublicItem = Awaited<ReturnType<typeof latestPublicEntries>>[number];
export type PublicLot = Awaited<ReturnType<typeof latestPublicLots>>[number];
export function PlantCard({ item }: { item: PublicItem }) {
  return (
    <a href={"/bai/" + item.id} className="card">
      <div className="card-image">
        {item.image ? (
          <img src={item.image} alt={item.title} loading="lazy" decoding="async" sizes="(max-width: 700px) 100vw, 33vw" />
        ) : (
          <span>✳</span>
        )}
      </div>
      <div className="card-body">
        <p className="eyebrow green">
          {item.code || "QUẤT CẢNH"} ·{" "}
          {item.status === "sold"
            ? "ĐÃ BÁN"
            : item.status === "available"
              ? "CÒN TẠI VƯỜN"
              : "LIÊN HỆ"}
        </p>
        <h3>{item.title}</h3>
        <p>{item.price || "Liên hệ để biết giá"}</p>
      </div>
    </a>
  );
}
export function ArticleCard({ item }: { item: PublicItem }) {
  return (
    <a className="article" href={"/bai/" + item.id}>
      {item.image && (
        <img className="article-image" src={item.image} alt={item.title} loading="lazy" decoding="async" sizes="(max-width: 700px) 100vw, 33vw" />
      )}
      <div className="article-body">
        <p className="eyebrow green">BÀI VIẾT</p>
        <h3>{item.title}</h3>
        <p>{item.description.slice(0, 140)}</p>
        <span>Đọc bài viết ↗</span>
      </div>
    </a>
  );
}
export function LotCard({ lot }: { lot: PublicLot }) {
  return (
    <a href={`/lo/${lot.id}`} className="lot-card">
      {lot.image ? <img src={lot.image} alt={lot.title} loading="lazy" decoding="async" sizes="(max-width: 700px) 100vw, 33vw" /> : <div className="lot-image">✳</div>}
      <div className="lot-card-body">
        <p className="eyebrow green">LÔ {lot.code} · CÒN HÀNG</p>
        <h3>{lot.title}</h3>
        <div className="lot-meta"><span>{lot.plantType}</span>{lot.sizeOrAge && <span>· {lot.sizeOrAge}</span>}</div>
        <p>{lot.wholesalePrice || "Liên hệ báo giá"}</p>
        <p className="lot-order">Mua tối thiểu: {lot.minimumOrderQuantity} {lot.unit}</p>
        <span className="lot-cta">Xem lô & liên hệ →</span>
      </div>
    </a>
  );
}
function Empty({ text }: { text: string }) {
  return (
    <div className="empty">
      <span>✳</span>
      <p>{text}</p>
      <a href="#lienhe">Xem thông tin liên hệ ↗</a>
    </div>
  );
}
