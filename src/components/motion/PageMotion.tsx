"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

const EASE = "power4.out";

/* ---------------------------------------------------------------- hero */
function hero() {
  const root = document.querySelector<HTMLElement>("[data-hero]");
  if (!root) return;
  const name = root.querySelector<HTMLElement>("[data-hero-name]");

  const tl = gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.1 });

  if (name) {
    const split = SplitText.create(name, { type: "words,chars", mask: "words" });
    tl.from(split.chars, { yPercent: 115, duration: 1.3, stagger: 0.055, ease: EASE }, 0.15);
  }

  tl.from("[data-hero-back]", { scale: 1.15, duration: 2.2, ease: "power2.out" }, 0)
    .from("[data-hero-front]", { y: () => window.innerHeight * 0.14, scale: 1.06, duration: 1.7 }, 0.2)
    .from("[data-hero-shade]", { autoAlpha: 0, duration: 1.4 }, 0.3)
    .from("[data-hero-sub]", { x: 24, autoAlpha: 0, duration: 0.9 }, 1)
    .from("[data-hero-title] > * > *", { yPercent: 120, duration: 1, stagger: 0.09, ease: EASE }, 0.9)
    .from("[data-hero-intro]", { y: -14, autoAlpha: 0, duration: 0.8, stagger: 0.05 }, 0.7);

  // Everything above has its "from" state applied; now the wrappers may show.
  gsap.set("[data-intro]", { visibility: "visible" });

  // Depth on scroll-out: the further back a layer sits, the more it lags.
  gsap
    .timeline({ scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: true } })
    .to("[data-hero-back]", { yPercent: 14, ease: "none" }, 0)
    .to("[data-hero-brush]", { yPercent: 6, ease: "none" }, 0)
    .to(name, { yPercent: 30, ease: "none" }, 0)
    .to("[data-hero-front]", { yPercent: -5, ease: "none" }, 0)
    .to("[data-hero-title]", { yPercent: -40, autoAlpha: 0, ease: "none" }, 0);
}

/* ------------------------------------------------------- text reveals */
function reveals() {
  document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
    const kind = el.dataset.reveal ?? "lines";
    const delay = parseFloat(el.dataset.revealDelay ?? "0");
    const trigger = { trigger: el, start: "top 88%", once: true } as const;

    if (kind === "fade") {
      gsap.from(el, { autoAlpha: 0, y: 28, duration: 1.1, delay, ease: "power3.out", scrollTrigger: trigger });
      return;
    }

    const mode = kind === "chars" ? "chars" : kind === "words" ? "words" : "lines";
    const type = mode === "lines" ? "lines" : mode === "words" ? "lines,words" : "lines,words,chars";

    SplitText.create(el, {
      type,
      mask: "lines",
      autoSplit: true,
      linesClass: "split-line",
      onSplit(self) {
        gsap.set(el, { visibility: "visible" });
        const targets = mode === "chars" ? self.chars : mode === "words" ? self.words : self.lines;
        // Re-splits after a resize should not replay the entrance.
        if (el.dataset.revealed) return gsap.set(targets, { yPercent: 0 });
        return gsap.from(targets, {
          yPercent: 110,
          duration: mode === "chars" ? 1 : 1.25,
          ease: EASE,
          delay,
          stagger: mode === "lines" ? 0.1 : mode === "words" ? 0.045 : 0.022,
          scrollTrigger: trigger,
          onComplete: () => {
            el.dataset.revealed = "1";
          },
        });
      },
    });
  });
}

/* ------------------------------------------------------------ parallax */
/**
 * `data-parallax="N"`: moves the element by ±N% of its height across the
 * scroll of its `[data-parallax-root]`. Positive lags behind the page (far
 * away), negative runs ahead of it (close to the viewer).
 */
function parallax() {
  document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
    const amount = parseFloat(el.dataset.parallax ?? "8");
    const root = el.closest<HTMLElement>("[data-parallax-root]") ?? el.parentElement ?? el;
    gsap.fromTo(
      el,
      { yPercent: -amount },
      {
        yPercent: amount,
        ease: "none",
        scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: true },
      },
    );
  });
}

/* ------------------------------------------------------------- brushes */
/** The brush fill is revealed through a stroked mask path that "paints" along its length. */
function brushes() {
  document.querySelectorAll<SVGSVGElement>("[data-brush]").forEach((svg) => {
    const path = svg.querySelector<SVGPathElement>("mask path");
    if (!path) return;
    const from = svg.dataset.brushFrom === "start" ? 1 : -1;
    const onLoad = svg.dataset.brushTrigger === "load";
    const root = svg.closest<HTMLElement>("[data-brush-root]") ?? svg;

    gsap.fromTo(
      path,
      { strokeDashoffset: from },
      {
        strokeDashoffset: 0,
        duration: onLoad ? 2 : 2.4,
        delay: onLoad ? 0.4 : 0,
        ease: "power2.inOut",
        scrollTrigger: onLoad ? undefined : { trigger: root, start: "top 70%", once: true },
      },
    );

    if (!onLoad) {
      gsap.fromTo(
        root,
        { yPercent: -2.5 },
        { yPercent: 2.5, ease: "none", scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: true } },
      );
    }
  });
}

/* --------------------------------------------------------- card tracks */
function tracks() {
  document.querySelectorAll<HTMLElement>("[data-track]").forEach((track) => {
    const cards = track.querySelectorAll("[data-card]");
    gsap.from(cards, {
      y: 90,
      autoAlpha: 0,
      duration: 1.2,
      stagger: 0.1,
      ease: "power3.out",
      scrollTrigger: { trigger: track, start: "top 82%", once: true },
    });

    const inner = track.querySelector("[data-track-inner]");
    if (inner) {
      gsap.to(inner, {
        x: () => -Math.min(180, window.innerWidth * 0.09),
        ease: "none",
        scrollTrigger: { trigger: track, start: "top bottom", end: "bottom top", scrub: true },
      });
    }
  });
}

/* ----------------------------------------------------------------- map */
function map() {
  const el = document.querySelector<HTMLElement>("[data-map]");
  if (!el) return;
  const section = el.closest("section") ?? el;

  gsap.fromTo(
    el,
    { yPercent: -4 },
    { yPercent: 4, ease: "none", scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: true } },
  );

  const tl = gsap.timeline({ scrollTrigger: { trigger: "[data-manifesto]", start: "top 80%", once: true } });
  const outline = document.querySelector<SVGPathElement>("[data-gorkha-outline]");
  if (outline) {
    tl.fromTo(outline, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2.6, ease: "power2.inOut" }, 0);
  }
  tl.from("[data-map-dot]", { scale: 0, autoAlpha: 0, stagger: 0.1, duration: 0.7, ease: "back.out(2.5)" }, 0.9);
  tl.from("[data-project-item]", { x: -14, autoAlpha: 0, stagger: 0.06, duration: 0.6, ease: "power3.out" }, 0.6);
}

/* ------------------------------------------------------------- mount */
export default function PageMotion() {
  useEffect(() => {
    const html = document.documentElement;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      html.classList.remove("js");
      return;
    }

    let ctx: gsap.Context | undefined;
    let done = false;
    // If something goes wrong before setup, never leave content hidden.
    const safety = window.setTimeout(() => {
      if (!done) html.classList.remove("js");
    }, 3500);

    const fontsReady = Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]);
    fontsReady.then(() => {
      if (done) return;
      done = true;
      ctx = gsap.context(() => {
        hero();
        reveals();
        parallax();
        brushes();
        tracks();
        map();
      });
      ScrollTrigger.refresh();
    });

    return () => {
      done = true;
      clearTimeout(safety);
      ctx?.revert();
    };
  }, []);

  return null;
}
