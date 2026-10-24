"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import Snap from "lenis/snap";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { loaderState } from "./loader-state";
import { snapPoints } from "./snap";

gsap.registerPlugin(ScrollTrigger);

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/** Lenis smooth scrolling, driven by GSAP's ticker so ScrollTrigger stays in sync. */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      lerp: 0.11,
      smoothWheel: true,
      // In-page links glide for a fixed time instead of lerping across the whole page.
      anchors: { duration: 1.4, easing: (t: number) => 1 - Math.pow(1 - t, 3) },
    });
    window.__lenis = lenis;

    // Proximity snap: only settles onto a point (the works rail, the map
    // stage) once scrolling stops close to it, so it never fights the reader.
    const snap = new Snap(lenis, {
      type: "proximity",
      distanceThreshold: "28%",
      debounce: 140,
      duration: 0.75,
      easing: (t: number) => 1 - Math.pow(1 - t, 4),
    });
    const detachSnap = snapPoints.attach(snap);

    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // No scrolling under the intro curtain. (Children's effects run first, so
    // a mounted Loader has already flagged itself active.)
    let release = () => {};
    if (loaderState.active && !loaderState.done) {
      lenis.scrollTo(0, { immediate: true, force: true });
      lenis.stop();
      release = loaderState.onDone(() => lenis.start());
    }

    return () => {
      release();
      detachSnap();
      snap.destroy();
      gsap.ticker.remove(raf);
      lenis.destroy();
      window.__lenis = undefined;
    };
  }, []);

  return <>{children}</>;
}
