import type Snap from "lenis/snap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Scroll snap points, collected from any component. SmoothScroll attaches the
 * Lenis snap instance; sources may register before or after it exists. Each
 * source returns page scroll positions, re-read on every ScrollTrigger
 * refresh so pin spacers and resizes are accounted for.
 */
type Source = () => number[];
const sources = new Set<Source>();
let snap: Snap | null = null;
let removers: (() => void)[] = [];

function rebuild() {
  removers.forEach((r) => r());
  removers = [];
  if (!snap) return;
  for (const source of sources) for (const v of source()) if (Number.isFinite(v)) removers.push(snap.add(Math.round(v)));
}

export const snapPoints = {
  attach(instance: Snap) {
    snap = instance;
    ScrollTrigger.addEventListener("refresh", rebuild);
    rebuild();
    return () => {
      ScrollTrigger.removeEventListener("refresh", rebuild);
      removers.forEach((r) => r());
      removers = [];
      snap = null;
    };
  },
  add(source: Source) {
    sources.add(source);
    rebuild();
    return () => {
      sources.delete(source);
      rebuild();
    };
  },
};

/** Scroll position at which `el` is centred in the viewport. */
export function centreOf(el: Element) {
  const r = el.getBoundingClientRect();
  return r.top + window.scrollY + r.height / 2 - window.innerHeight / 2;
}
