"use client";

import { useEffect, useState } from "react";

const SCROLL_THRESHOLD = 350;

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setIsVisible(window.scrollY > SCROLL_THRESHOLD);
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  if (!isVisible) return null;

  return <button className="scroll-to-top" type="button" aria-label="Quay lên đầu trang" title="Quay lên đầu trang" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M6.5 10.5 12 5l5.5 5.5" /></svg></button>;
}
