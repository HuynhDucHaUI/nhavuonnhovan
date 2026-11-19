"use client";

import type { ImgHTMLAttributes } from "react";

export function PublicImage({ alt, ...props }: ImgHTMLAttributes<HTMLImageElement> & { alt: string }) {
  return <img {...props} alt={alt} onError={(event) => {
    const image = event.currentTarget;
    if (image.dataset.fallback === "true") return;
    image.dataset.fallback = "true";
    image.src = "/icon.png";
    image.classList.add("image-fallback");
  }} />;
}
