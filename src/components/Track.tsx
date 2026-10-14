"use client";

import { useEffect, useRef } from "react";
import s from "./Track.module.css";

type Props = {
  children: React.ReactNode;
  className?: string;
  /** Initial scroll offset in design units (desktop only), to echo the design's mid-carousel state. */
  initialOffset?: number;
  label: string;
};

/** Horizontal card rail: native scrolling plus drag-to-scroll with the pointer. */
export default function Track({ children, className, initialOffset = 0, label }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (initialOffset && window.innerWidth >= 1024) {
      el.scrollLeft = initialOffset * (window.innerWidth / 1728);
    }

    let startX = 0;
    let startLeft = 0;
    let dragging = false;
    let moved = false;

    const down = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      dragging = true;
      moved = false;
      startX = e.clientX;
      startLeft = el.scrollLeft;
      el.setPointerCapture(e.pointerId);
      el.classList.add(s.dragging);
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      el.scrollLeft = startLeft - dx;
    };
    const up = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      el.releasePointerCapture(e.pointerId);
      el.classList.remove(s.dragging);
    };
    // Swallow the click that ends a drag so cards don't navigate.
    const click = (e: MouseEvent) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    };

    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("click", click, true);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("click", click, true);
    };
  }, [initialOffset]);

  return (
    <div ref={ref} className={`${s.track} ${className ?? ""}`} data-track role="region" aria-label={label} tabIndex={0}>
      <ul className={s.inner} data-track-inner>
        {children}
      </ul>
    </div>
  );
}
