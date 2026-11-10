"use client";

import { useState, type MouseEvent } from "react";

export function PlantImageGallery({ images, title }: { images: string[]; title: string }) {
  const [selected, setSelected] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const source = images[selected];
  function move(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    setPosition({ x: Math.min(100, Math.max(0, ((event.clientX - rect.left) / rect.width) * 100)), y: Math.min(100, Math.max(0, ((event.clientY - rect.top) / rect.height) * 100)) });
  }
  return <section className="plant-gallery" aria-label={`Hình ảnh ${title}`}>
    <div className="plant-gallery-main" onMouseMove={move} onMouseEnter={() => setZoom(true)} onMouseLeave={() => setZoom(false)}>
      <img src={source} alt={title} decoding="async" fetchPriority="high" />
      <div className={zoom ? "plant-gallery-lens visible" : "plant-gallery-lens"} aria-hidden="true" style={{ backgroundImage: `url(${source})`, backgroundPosition: `${position.x}% ${position.y}%` }} />
      <button type="button" className="plant-gallery-zoom" onClick={() => setLightbox(true)} aria-label="Phóng to ảnh đang chọn">⌕ <span>Phóng to</span></button>
    </div>
    {images.length > 1 && <div className="plant-gallery-thumbnails" aria-label="Chọn ảnh khác">{images.map((image, index) => <button type="button" key={image} className={index === selected ? "active" : ""} onClick={() => { setSelected(index); setZoom(false); }} aria-label={`Xem ảnh ${index + 1}`} aria-pressed={index === selected}><img src={image} alt="" loading="lazy" decoding="async" /></button>)}</div>}
    {lightbox && <div className="plant-gallery-lightbox" role="dialog" aria-modal="true" aria-label={`Ảnh lớn ${title}`} onClick={() => setLightbox(false)}><img src={source} alt={title} onClick={(event) => event.stopPropagation()} /><button type="button" onClick={() => setLightbox(false)} aria-label="Đóng ảnh lớn">×</button></div>}
  </section>;
}
