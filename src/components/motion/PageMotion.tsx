"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { loaderState } from "./loader-state";

gsap.registerPlugin(ScrollTrigger, SplitText);

const EASE = "power4.out";

/* ---------------------------------------------------------------- hero */
function hero() {
  const root = document.querySelector<HTMLElement>("[data-hero]");
  if (!root) return;
  const name = root.querySelector<HTMLElement>("[data-hero-name]");

  // Starts as the loader dissolves. The cut-out is already in place (the
  // loader showed it in exactly this spot), so it does not move; everything
  // else builds around it, with the back photo fading up from black.
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

  if (name) {
    const split = SplitText.create(name, { type: "words,chars", mask: "words" });
    tl.from(split.chars, { yPercent: 115, duration: 1.3, stagger: 0.055, ease: EASE }, 0.2);
  }

  // The back layer rests at 1.1× so its scroll lag never exposes an edge. It
  // only fades: the scene contains the same people as the cut-out, so any
  // scale or drift would read as the figure moving.
  gsap.set("[data-hero-back]", { scale: 1.1 });
  tl.fromTo("[data-hero-back]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 2, ease: "power2.inOut" }, 0.5)
    .from("[data-hero-brush]", { autoAlpha: 0, duration: 0.8 }, 0.7)
    .from("[data-hero-shade]", { autoAlpha: 0, duration: 1.4 }, 0.8)
    .from("[data-hero-sub]", { x: 24, autoAlpha: 0, duration: 0.9 }, 1.1)
    .from("[data-hero-title] > * > *", { yPercent: 120, duration: 1, stagger: 0.09, ease: EASE }, 1)
    .from("[data-hero-intro]", { y: -14, autoAlpha: 0, duration: 0.8, stagger: 0.05 }, 0.8);

  // Everything above has its "from" state applied; now the wrappers may show.
  gsap.set("[data-intro]", { visibility: "visible" });

  // Depth on scroll-out: the further back a layer sits, the more it lags.
  // The front cutout scrolls with the page so it stays planted on the hero's
  // bottom edge.
  gsap
    .timeline({ scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: true } })
    .to("[data-hero-back]", { yPercent: 14, ease: "none" }, 0)
    .to("[data-hero-brush]", { yPercent: 6, ease: "none" }, 0)
    .to(name, { yPercent: 30, ease: "none" }, 0)
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
 * `data-parallax-scale` enlarges the layer so the travel never shows an edge
 * (applied here, not in CSS, because GSAP folds the `scale` property into
 * its own transform).
 */
function parallax() {
  document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
    const amount = parseFloat(el.dataset.parallax ?? "8");
    const scale = parseFloat(el.dataset.parallaxScale ?? "1");
    const root = el.closest<HTMLElement>("[data-parallax-root]") ?? el.parentElement ?? el;
    gsap.fromTo(
      el,
      { yPercent: -amount, scale },
      {
        yPercent: amount,
        scale,
        ease: "none",
        scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: true },
      },
    );
  });
}

/* ------------------------------------------------------------- brushes */
/**
 * Paints a stroke in by sliding its soft-edged reveal box along the stroke
 * while the artwork inside slides back by the same distance (see Brush.tsx).
 * Both are percent translates of the elements' own widths, so the sweep is
 * compositor-only and independent of the viewport scale.
 */
function brushes(trigger: "load" | "scroll") {
  document.querySelectorAll<HTMLElement>(`[data-brush][data-brush-trigger="${trigger}"]`).forEach((brush) => {
    const onLoad = trigger === "load";
    const root = brush.closest<HTMLElement>("[data-brush-root]") ?? brush;
    const reveal = brush.querySelector<HTMLElement>("[data-brush-reveal]");
    const art = brush.querySelector<HTMLElement>("[data-brush-art]");
    if (!reveal || !art) return;

    gsap
      .timeline({
        delay: onLoad ? 0.4 : 0,
        defaults: { duration: onLoad ? 1.8 : 2.2, ease: "power2.inOut" },
        scrollTrigger: onLoad ? undefined : { trigger: root, start: "top 70%", once: true },
        onComplete: () => brush.classList.add("painted"),
      })
      .fromTo(reveal, { xPercent: parseFloat(reveal.dataset.brushReveal ?? "0") }, { xPercent: 0 }, 0)
      .fromTo(art, { xPercent: parseFloat(art.dataset.brushArt ?? "0") }, { xPercent: 0 }, 0);
    // The start position is applied above (fromTo renders immediately), so the
    // stroke can be shown without flashing its painted state.
    brush.classList.add("armed");

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
// The 2D map behind the works rail; the 3D Gorkha stage animates itself
// (GorkhaMap.tsx).
function map() {
  const el = document.querySelector<HTMLElement>("[data-map]");
  if (el) {
    const root = el.parentElement ?? el;
    gsap.fromTo(
      el,
      { yPercent: -4 },
      { yPercent: 4, ease: "none", scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: true } },
    );
  }

  gsap.from("[data-project-item]", {
    x: -14,
    autoAlpha: 0,
    stagger: 0.06,
    duration: 0.6,
    ease: "power3.out",
    scrollTrigger: { trigger: "[data-manifesto]", start: "top 60%", once: true },
  });
}

/* ------------------------------------------------------------- mount */
/** Resolves once the hero's images are decoded (or after a short grace period). */
function heroImagesReady() {
  const imgs = Array.from(document.querySelectorAll<HTMLImageElement>("[data-hero] img"));
  const decoded = Promise.all(imgs.map((img) => img.decode().catch(() => undefined)));
  return Promise.race([decoded, new Promise((r) => setTimeout(r, 2000))]);
}

export default function PageMotion() {
  useEffect(() => {
    const html = document.documentElement;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      html.classList.remove("js");
      return;
    }

    let ctx: gsap.Context | undefined;
    let dead = false;
    let heroStarted = false;
    // If something goes wrong before setup, never leave content hidden. The
    // clock starts once the loader is out of the way (it may wait on a click).
    let safety = 0;
    const armSafety = loaderState.onDone(() => {
      safety = window.setTimeout(() => {
        if (!heroStarted) html.classList.remove("js");
      }, 7000);
    });

    const fontsReady = Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]);
    fontsReady.then(() => {
      if (dead || ctx) return;
      ctx = gsap.context(() => {
        reveals();
        parallax();
        brushes("scroll");
        tracks();
        map();
      });
      ScrollTrigger.refresh();

      // The entrance waits for the intro curtain and for its photos, so a
      // decode never lands mid-tween.
      Promise.all([heroImagesReady(), loaderState.ready()]).then(() => {
        if (dead || !ctx) return;
        heroStarted = true;
        ctx.add(() => {
          hero();
          brushes("load");
        });
      });
    });

    return () => {
      dead = true;
      armSafety();
      clearTimeout(safety);
      ctx?.revert();
    };
  }, []);

  return null;
}
