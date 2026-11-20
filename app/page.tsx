import { ContactInquiry } from "./components/contact-item";
import { HeroSlideshow } from "./components/hero-slideshow";
import { SiteFooter, SiteHeader } from "./components/site-chrome";
import { PublicImage } from "./components/public-image";
import { latestPublicEntries, latestPublicLots, publicContact, publicHeroSlides } from "./data";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";
const homeLimit = 3;

export default async function Home() {
  const [config, plants, articles, lots, slides] = await Promise.all([
    publicContact(), latestPublicEntries("plant", homeLimit),
    latestPublicEntries("article", homeLimit), latestPublicLots(homeLimit), publicHeroSlides(),
  ]);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "WebSite", name: SITE_NAME,
        alternateName: "nhavuonnhovan", url: `${SITE_URL}/`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "LocalBusiness", name: SITE_NAME,
        url: SITE_URL, description: "Nhà vườn quất cảnh Nho Văn, nhận bán sỉ quất cảnh trên toàn quốc.",
        telephone: config.phone, address: { "@type": "PostalAddress", streetAddress: "Thôn CD Quán Trạch, Xã Văn Giang", addressRegion: "Hưng Yên", addressCountry: "VN" },
        areaServed: { "@type": "Country", name: "Việt Nam" }, sameAs: [config.zalo, config.facebook].filter(Boolean),
      }) }} />
      <SiteHeader />
      <main className="home-page">
        <section className="hero">
          <div className="hero-inner">
            <p className="eyebrow">VĂN GIANG · HƯNG YÊN</p>
            <h1>
              Mang sắc xuân
              <br />
              <em>về ngôi nhà bạn.</em>
            </h1>
            <p className="hero-copy">
              Với <strong>hơn 30 năm kinh nghiệm</strong> trồng và chăm sóc quất cảnh
              tại Văn Giang, Nhà vườn Nho Văn giúp bạn chọn cây ưng ý, nhận bán lẻ
              và bán sỉ theo lô.
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
          <HeroSlideshow slides={slides} />
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
                  <PlantCard item={item} zalo={config.zalo} key={item.id} />
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
                {lots.slice(0, homeLimit).map((lot) => <LotCard lot={lot} zalo={config.zalo} key={lot.id} />)}
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

      </main>
      <SiteFooter />
    </>
  );
}

type PublicItem = Awaited<ReturnType<typeof latestPublicEntries>>[number];
export type PublicLot = Awaited<ReturnType<typeof latestPublicLots>>[number];
export function PlantCard({ item, zalo }: { item: PublicItem; zalo: string }) {
  return (
    <article className="card product-card">
      <a href={"/bai/" + item.id} className="product-image-link">
      <div className="card-image">
        {item.image ? (
          <PublicImage src={item.image} alt={item.title} loading="lazy" decoding="async" sizes="(max-width: 700px) 100vw, 33vw" />
        ) : (
          <span>✳</span>
        )}
      </div>
      </a>
      <div className="card-body">
        {item.status === "sold" && <p className="product-status">Đã bán</p>}
        <h3><a href={`/bai/${item.id}`}>{item.title}</a></h3>
        <p className="product-summary">{catalogSummary(item.description, [item.plantShape, item.heightCm != null ? `Cao ${item.heightCm} cm` : ""])}</p>
        <p>{item.price || (item.priceVnd != null ? `Giá tham khảo: ${item.priceVnd.toLocaleString("vi-VN")} ₫` : "Liên hệ để biết giá")}</p>
        {item.status !== "sold" && <ContactInquiry title={item.title} path={`/bai/${item.id}`} kind="cây" zalo={zalo} label={item.price || item.priceVnd != null ? "Hỏi mua qua Zalo" : "Hỏi giá qua Zalo"} />}
      </div>
    </article>
  );
}
export function ArticleCard({ item }: { item: PublicItem }) {
  return (
    <a className="article" href={"/bai/" + item.id}>
      {item.image && (
        <PublicImage className="article-image" src={item.image} alt={item.title} loading="lazy" decoding="async" sizes="(max-width: 700px) 100vw, 33vw" />
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
export function LotCard({ lot, zalo }: { lot: PublicLot; zalo: string }) {
  return (
    <article className="lot-card product-card">
      <a href={`/lo/${lot.id}`} className="product-image-link">
      {lot.image ? <PublicImage src={lot.image} alt={lot.title} loading="lazy" decoding="async" sizes="(max-width: 700px) 100vw, 33vw" /> : <div className="lot-image">✳</div>}
      </a>
      <div className="lot-card-body">
        <h3><a href={`/lo/${lot.id}`}>{lot.title}</a></h3>
        <p className="product-summary">{catalogSummary(lot.description, [lot.plantType, lot.sizeOrAge])}</p>
        <p>{lot.wholesalePrice || "Liên hệ báo giá"}</p>
        <p className="lot-order">Mua tối thiểu: {lot.minimumOrderQuantity} {lot.unit}</p>
        <ContactInquiry title={lot.title} path={`/lo/${lot.id}`} kind="lô" zalo={zalo} label="Hỏi giá sỉ qua Zalo" />
      </div>
    </article>
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

function catalogSummary(description: string, features: string[]) {
  const text = description.replace(/\s+/g, " ").trim() || features.filter(Boolean).join(" · ");
  if (text.length <= 170) return text;
  const excerpt = text.slice(0, 171);
  const boundary = excerpt.lastIndexOf(" ");
  return `${excerpt.slice(0, boundary > 120 ? boundary : 170).trimEnd()}…`;
}
