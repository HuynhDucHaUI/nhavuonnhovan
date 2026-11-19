"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

export type HeroSlide = { id: number; title: string; image: string };

export function HeroSlideshow({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState<number[]>([]);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const available = slides.filter((slide) => !failed.includes(slide.id));
  const count = available.length;
  const currentIndex = count ? index % count : 0;
  const current = available[currentIndex];
  const nextImage = count > 1 ? available[(currentIndex + 1) % count].image : undefined;
  const stopped = paused || hovered || focused || hidden || reducedMotion;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(media.matches);
    const updateVisibility = () => setHidden(document.hidden);
    updateMotion(); updateVisibility();
    media.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => { media.removeEventListener("change", updateMotion); document.removeEventListener("visibilitychange", updateVisibility); };
  }, []);

  useEffect(() => {
    if (count < 2 || stopped) return;
    const timer = window.setTimeout(() => setIndex((value) => (value + 1) % count), 5000);
    return () => window.clearTimeout(timer);
  }, [index, count, stopped]);

  useEffect(() => {
    if (nextImage) { const image = new window.Image(); image.src = nextImage; }
  }, [nextImage]);

  function move(direction: number) { if (count > 1) setIndex((currentIndex + direction + count) % count); }

  return <section className="hero-visual hero-slideshow" data-single={count < 2} aria-label="Câu chuyện từ nhà vườn" aria-roledescription="trình chiếu"
    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
    onTouchStart={(event) => { const point = event.touches[0]; touch.current = { x: point.clientX, y: point.clientY }; }}
    onTouchEnd={(event) => { const start = touch.current; touch.current = null; if (!start) return; const end = event.changedTouches[0]; const dx = end.clientX - start.x; if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(end.clientY - start.y)) move(dx < 0 ? 1 : -1); }}>
    {current ? <>
      <img key={current.id} className="hero-photo slideshow-photo" src={current.image} alt={current.title} fetchPriority={currentIndex === 0 ? "high" : "auto"}
        onError={() => setFailed((items) => items.includes(current.id) ? items : [...items, current.id])} />
      <div className="slide-shade" aria-hidden="true" />
      <div className="slide-heading"><span className="slide-category"><i aria-hidden="true"/>Chuyện nhà vườn</span><span className="slide-counter" aria-label={`Ảnh ${currentIndex + 1} trên ${count}`}><b>{String(currentIndex + 1).padStart(2, "0")}</b><span> / {String(count).padStart(2, "0")}</span></span></div>
      <div className="slideshow-caption"><span>TỪ NHÀ VƯỜN ĐẾN BẠN</span><a href={`/bai/${current.id}`}><strong>{current.title}</strong><span className="slide-read">Đọc câu chuyện</span></a></div>
    </> : <><img className="hero-fallback" src="/icon.png" alt="Nhà vườn Nho Văn"/><div className="hero-visual-label"><span>VƯỜN QUẤT NHO VĂN</span><strong>Mang mùa xanh về nhà.</strong></div></>}
    {count > 1 && <>
      <div className="slide-controls">
        <div className="slide-dots" aria-label="Chọn ảnh">{available.map((slide, number) => <button key={slide.id} type="button" aria-label={`Xem ảnh ${number + 1}: ${slide.title}`} aria-current={number === currentIndex ? "true" : undefined} onClick={() => setIndex(number)}><span/></button>)}</div>
        <div className="slide-navigation">
          {!reducedMotion && <button type="button" className="slide-play" aria-label={paused ? "Chạy trình chiếu" : "Tạm dừng trình chiếu"} onClick={() => setPaused((value) => !value)}>{paused ? <Play size={16}/> : <Pause size={16}/>}</button>}
          <button className="slide-arrow slide-prev" type="button" aria-label="Ảnh trước" onClick={() => move(-1)}><ChevronLeft size={20}/></button>
          <button className="slide-arrow slide-next" type="button" aria-label="Ảnh tiếp theo" onClick={() => move(1)}><ChevronRight size={20}/></button>
        </div>
      </div>
    </>}
  </section>;
}
