"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type HeroSlide = { id: number; title: string; image: string };

export function HeroSlideshow({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState<number[]>([]);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const available = slides.filter((slide) => !failed.includes(slide.id));
  const count = available.length;
  const currentIndex = count ? index % count : 0;
  const current = available[currentIndex];
  const nextImage = count > 1 ? available[(currentIndex + 1) % count].image : undefined;
  useEffect(() => {
    if (nextImage) { const image = new window.Image(); image.src = nextImage; }
  }, [nextImage]);

  function move(direction: number) { if (count > 1) setIndex((currentIndex + direction + count) % count); }

  return <section className="hero-visual hero-slideshow" data-single={count < 2} aria-label="Câu chuyện từ nhà vườn" aria-roledescription="trình chiếu"
    onTouchStart={(event) => { const point = event.touches[0]; touch.current = { x: point.clientX, y: point.clientY }; }}
    onTouchEnd={(event) => { const start = touch.current; touch.current = null; if (!start) return; const end = event.changedTouches[0]; const dx = end.clientX - start.x; if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(end.clientY - start.y)) move(dx < 0 ? 1 : -1); }}>
    {current ? <>
      <img key={current.id} className="hero-photo slideshow-photo" src={current.image} alt={current.title} fetchPriority={currentIndex === 0 ? "high" : "auto"}
        onError={() => setFailed((items) => items.includes(current.id) ? items : [...items, current.id])} />
      <div className="slide-shade" aria-hidden="true" />
      <div className="slide-heading"><span className="slide-category"><i aria-hidden="true"/>Chuyện nhà vườn</span></div>
      <div className="slideshow-caption"><span>TỪ NHÀ VƯỜN ĐẾN BẠN</span><a href={`/bai/${current.id}`}><strong>{current.title}</strong><span className="slide-read">Đọc câu chuyện</span></a></div>
    </> : <><img className="hero-fallback" src="/icon.png" alt="Nhà vườn Nho Văn"/><div className="hero-visual-label"><span>VƯỜN QUẤT NHO VĂN</span><strong>Mang mùa xanh về nhà.</strong></div></>}
    {count > 1 && <>
      <div className="slide-controls">
        <div className="slide-navigation">
          <button className="slide-arrow slide-prev" type="button" aria-label="Ảnh trước" onClick={() => move(-1)}><ChevronLeft size={20}/></button>
          <button className="slide-arrow slide-next" type="button" aria-label="Ảnh tiếp theo" onClick={() => move(1)}><ChevronRight size={20}/></button>
        </div>
      </div>
    </>}
  </section>;
}
