"use client";

import { useRef, useState, type PointerEvent } from "react";

export function PlantImageGallery({ images, title }: { images: string[]; title: string }) {
  const [selected, setSelected] = useState(0);
  const [isInspecting, setIsInspecting] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const lensRef = useRef<HTMLDivElement>(null);
  const isInspectingRef = useRef(false);
  const source = images[selected];

  function moveLens(target: HTMLDivElement, clientX: number, clientY: number) {
    const rect = target.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100));
    const lens = lensRef.current;
    if (!lens) return;
    lens.style.left = `${x}%`;
    lens.style.top = `${y}%`;
    lens.style.backgroundPosition = `${x}% ${y}%`;
  }

  function startInspecting(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || event.button !== 0 || (event.target instanceof Element && event.target.closest("button"))) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    moveLens(event.currentTarget, event.clientX, event.clientY);
    isInspectingRef.current = true;
    setIsInspecting(true);
  }

  function continueInspecting(event: PointerEvent<HTMLDivElement>) {
    if (!isInspectingRef.current || event.pointerType !== "mouse") return;
    moveLens(event.currentTarget, event.clientX, event.clientY);
  }

  function stopInspecting(event?: PointerEvent<HTMLDivElement>) {
    if (event?.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    isInspectingRef.current = false;
    setIsInspecting(false);
  }

  return <section className="plant-gallery" aria-label={`Hình ảnh ${title}`}>
    <div
      className="plant-gallery-main"
      onPointerDown={startInspecting}
      onPointerMove={continueInspecting}
      onPointerUp={stopInspecting}
      onPointerCancel={stopInspecting}
      onClick={() => { if (window.matchMedia("(pointer: coarse)").matches) setLightbox(true); }}
    >
      <img src={source} alt={title} decoding="async" fetchPriority="high" draggable="false" />
      <div ref={lensRef} className={isInspecting ? "plant-gallery-lens visible" : "plant-gallery-lens"} aria-hidden="true" style={{ backgroundImage: `url(${source})` }} />
      <button type="button" className="plant-gallery-zoom" onClick={(event) => { event.stopPropagation(); setLightbox(true); }} aria-label="Phóng to ảnh đang chọn">⌕ <span>Phóng to</span></button>
    </div>
    {images.length > 1 && <div className="plant-gallery-thumbnails" aria-label="Chọn ảnh khác">{images.map((image, index) => <button type="button" key={image} className={index === selected ? "active" : ""} onClick={() => { setSelected(index); setIsInspecting(false); }} aria-label={`Xem ảnh ${index + 1}`} aria-pressed={index === selected}><img src={image} alt="" loading="lazy" decoding="async" /></button>)}</div>}
    {lightbox && <div className="plant-gallery-lightbox" role="dialog" aria-modal="true" aria-label={`Ảnh lớn ${title}`} onClick={() => setLightbox(false)}><img src={source} alt={title} onClick={(event) => event.stopPropagation()} /><button type="button" onClick={() => setLightbox(false)} aria-label="Đóng ảnh lớn">×</button></div>}
  </section>;
}
