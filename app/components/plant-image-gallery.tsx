"use client";

import { useRef, useState, type PointerEvent } from "react";

const LENS_ZOOM = 5;

export function PlantImageGallery({ images, title }: { images: string[]; title: string }) {
  const [selected, setSelected] = useState(0);
  const [isInspecting, setIsInspecting] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);
  const isInspectingRef = useRef(false);
  const source = images[selected];

  function moveLens(target: HTMLDivElement, clientX: number, clientY: number) {
    const image = imageRef.current;
    const lens = lensRef.current;
    if (!image || !lens || !image.naturalWidth || !image.naturalHeight) return false;

    const frame = target.getBoundingClientRect();
    const sourceRatio = image.naturalWidth / image.naturalHeight;
    const frameRatio = frame.width / frame.height;
    const visibleWidth = sourceRatio > frameRatio ? frame.width : frame.height * sourceRatio;
    const visibleHeight = sourceRatio > frameRatio ? frame.width / sourceRatio : frame.height;
    const offsetX = (frame.width - visibleWidth) / 2;
    const offsetY = (frame.height - visibleHeight) / 2;
    const imageX = clientX - frame.left - offsetX;
    const imageY = clientY - frame.top - offsetY;

    if (imageX < 0 || imageX > visibleWidth || imageY < 0 || imageY > visibleHeight) return false;

    const lensRadius = lens.offsetWidth / 2;
    lens.style.left = `${clientX - frame.left}px`;
    lens.style.top = `${clientY - frame.top}px`;
    lens.style.backgroundSize = `${visibleWidth * LENS_ZOOM}px ${visibleHeight * LENS_ZOOM}px`;
    lens.style.backgroundPosition = `${lensRadius - imageX * LENS_ZOOM}px ${lensRadius - imageY * LENS_ZOOM}px`;
    return true;
  }

  function startInspecting(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || event.button !== 0 || (event.target instanceof Element && event.target.closest("button"))) return;
    if (!moveLens(event.currentTarget, event.clientX, event.clientY)) return;
    event.currentTarget.setPointerCapture(event.pointerId);
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

  function chooseImage(index: number) {
    isInspectingRef.current = false;
    setIsInspecting(false);
    setSelected(index);
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
      <img ref={imageRef} src={source} alt={title} decoding="async" fetchPriority="high" draggable="false" />
      <div ref={lensRef} className={isInspecting ? "plant-gallery-lens visible" : "plant-gallery-lens"} aria-hidden="true" style={{ backgroundImage: `url(${source})` }} />
      <button type="button" className="plant-gallery-zoom" onClick={(event) => { event.stopPropagation(); setLightbox(true); }} aria-label="Phóng to ảnh đang chọn">⌕ <span>Phóng to</span></button>
    </div>
    {images.length > 1 && <div className="plant-gallery-thumbnails" aria-label="Chọn ảnh khác">{images.map((image, index) => <button type="button" key={image} className={index === selected ? "active" : ""} onClick={() => chooseImage(index)} aria-label={`Xem ảnh ${index + 1}`} aria-pressed={index === selected}><img src={image} alt="" loading="lazy" decoding="async" /></button>)}</div>}
    {lightbox && <div className="plant-gallery-lightbox" role="dialog" aria-modal="true" aria-label={`Ảnh lớn ${title}`} onClick={() => setLightbox(false)}><img src={source} alt={title} onClick={(event) => event.stopPropagation()} /><button type="button" onClick={() => setLightbox(false)} aria-label="Đóng ảnh lớn">×</button></div>}
  </section>;
}
