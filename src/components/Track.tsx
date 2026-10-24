"use client";

import { useEffect, useRef } from "react";
import { centreOf, snapPoints } from "./motion/snap";
import s from "./Track.module.css";

type Props = {
  children: React.ReactNode;
  className?: string;
  /** Initial scroll offset in design units (desktop only), to echo the design's mid-carousel state. */
  initialOffset?: number;
  label: string;
  /** Snap the page so the rail sits mid-screen when scrolling stops near it. */
  snap?: boolean;
};

/** Horizontal card rail: native scrolling plus drag-to-scroll with the pointer. */
export default function Track({ children, className, initialOffset = 0, label, snap }: Props) {
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
    // A mouse press must not focus the card link: Chrome would then draw the
    // keyboard focus ring on it as soon as any key is pressed. Keyboard focus
    // (Tab) still shows it.
    const press = (e: MouseEvent) => {
      if (e.button === 0) e.preventDefault();
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
    el.addEventListener("mousedown", press);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("click", click, true);
    const removeSnap = snap ? snapPoints.add(() => (window.innerWidth >= 1024 ? [centreOf(el)] : [])) : () => {};
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("mousedown", press);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("click", click, true);
      removeSnap();
    };
  }, [initialOffset, snap]);

  return (
    <div ref={ref} className={`${s.track} ${className ?? ""}`} data-track role="region" aria-label={label} tabIndex={0}>
      <ul className={s.inner} data-track-inner>
        {children}
      </ul>
    </div>
  );
}
