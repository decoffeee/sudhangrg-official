"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { hero } from "@/data/content";
import { loaderState } from "./loader-state";
import s from "./Loader.module.css";

/** How long the counter runs before the sound prompt (seconds). */
const DURATION = 1.75;
/** The overlay fades out over the hero, whose cut-out is already in place. */
const FADE = 0.6;
/** The prompt also waits for the hero's photos to decode, up to this long. */
const ASSET_WAIT = 8000;
const MUSIC = "/music/vadim_makes_sound-atlas-nepal-580454.mp3";
const MUSIC_VOLUME = 0.55;

/** One background track for the page's lifetime. */
let music: HTMLAudioElement | undefined;
function getMusic() {
  if (!music) {
    music = new Audio(MUSIC);
    music.loop = true;
    music.preload = "auto";
  }
  return music;
}
function startMusic() {
  const track = getMusic();
  track.volume = 0;
  track
    .play()
    .then(() => gsap.to(track, { volume: MUSIC_VOLUME, duration: 2.5, ease: "power1.in" }))
    .catch(() => {});
}

/** Resolves once the hero's images are decoded, or after ASSET_WAIT. */
function heroAssetsReady() {
  const imgs = Array.from(document.querySelectorAll<HTMLImageElement>("[data-hero] img"));
  const decoded = Promise.all(imgs.map((img) => img.decode().catch(() => undefined)));
  return Promise.race([decoded, new Promise((r) => setTimeout(r, ASSET_WAIT))]);
}

/**
 * Full-screen intro. The hero's cut-out sits where it will land in the hero,
 * as a black silhouette that resolves into the photo while a 0–100 counter
 * runs for 1.75 s. The counter holds at 99 if the hero's photos are still
 * decoding, so the hero never enters with a photo missing. Then a sound
 * prompt: either answer fades the overlay away while the hero entrance builds
 * around the cut-out (which does not move), and the click is the user gesture
 * that lets the track play. Server-rendered so it covers the page from the
 * first paint.
 */
export default function Loader() {
  const root = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const photo = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLParagraphElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const prompt = useRef<HTMLDivElement>(null);
  const first = useRef<HTMLButtonElement>(null);
  const choose = useRef<(sound: boolean) => void>(() => {});

  useEffect(() => {
    const el = root.current!;
    if (loaderState.done) {
      el.style.display = "none";
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.display = "none";
      loaderState.finish();
      return;
    }
    loaderState.active = true;

    // Always start the show from the top, even on a reload mid-page
    // (restoration is already off, see layout.tsx's head script).
    window.scrollTo(0, 0);

    // Buffer the track while the counter runs so it starts instantly on "yes".
    getMusic();

    let dead = false;
    let exit: gsap.core.Timeline | undefined;
    const counter = { n: 0 };
    const intro = gsap.timeline();
    intro
      .from(inner.current, { autoAlpha: 0, duration: 0.5 }, 0)
      // Silhouette → photo, in step with the counter.
      .fromTo(photo.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: DURATION, ease: "power2.inOut" }, 0)
      .to(
        counter,
        {
          n: 99,
          duration: DURATION,
          ease: "power1.inOut",
          snap: { n: 1 },
          onUpdate: () => {
            count.current!.textContent = String(counter.n);
          },
        },
        0,
      );
    const introDone = new Promise<void>((resolve) => intro.eventCallback("onComplete", resolve));

    let asked = false;
    let chosen = false;
    choose.current = (sound) => {
      if (dead || !asked || chosen) return;
      chosen = true;
      if (sound) startMusic();
      // The hero's cut-out must sit exactly under ours: pin the page to the
      // top before the overlay thins (still opaque here, so no visible jump).
      window.scrollTo(0, 0);
      window.__lenis?.scrollTo(0, { immediate: true, force: true });
      exit = gsap
        .timeline({
          onComplete: () => {
            el.style.display = "none";
          },
        })
        .to(prompt.current, { autoAlpha: 0, duration: 0.3 }, 0)
        // The hero's own cut-out sits exactly under ours, so the overlay can
        // simply dissolve while everything else enters around it.
        .call(() => loaderState.finish(), undefined, 0.2)
        .to(el, { autoAlpha: 0, duration: FADE, ease: "power2.inOut" }, 0.2);
    };

    Promise.all([introDone, heroAssetsReady()]).then(() => {
      if (dead) return;
      count.current!.textContent = "100";
      asked = true;
      prompt.current!.hidden = false;
      gsap
        .timeline()
        // The whole line lifts away and the two choices rise into its place.
        .to(line.current, { autoAlpha: 0, y: -10, duration: 0.35, ease: "power2.in" }, 0.25)
        .fromTo(
          prompt.current!.children,
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.12, clearProps: "all" },
          0.55,
        )
        .call(() => first.current?.focus({ preventScroll: true }));
    });

    return () => {
      dead = true;
      intro.kill();
      exit?.kill();
    };
  }, []);

  return (
    <div ref={root} className={s.loader} role="dialog" aria-label="Sound">
      <div ref={inner} className={s.inner}>
        {/* Same geometry as the hero's front layer: the hero's cut-out takes
            over in place when the overlay dissolves. */}
        <div className={s.figure} aria-hidden="true">
          <Image src={hero.front} alt="" fill priority sizes="110vw" className={`${s.img} ${s.silhouette}`} />
          <div ref={photo} className={s.photo}>
            <Image src={hero.front} alt={hero.imageAlt} fill priority sizes="110vw" className={s.img} />
          </div>
        </div>

        <div className={s.top}>
          {/* One line: name, then the count. At 100 the start card takes
              over the line in place. */}
          <p ref={line} className={s.line}>
            <span className={s.name}>Sudhan Gurung</span>
            <span className={s.dim} aria-hidden="true">
              /
            </span>
            <span className={s.dim}>Portfolio</span>
            <span className={s.dim} aria-hidden="true">
              /
            </span>
            <span ref={count} className={s.count} aria-hidden="true">
              0
            </span>
          </p>

          <div ref={prompt} className={s.prompt} hidden>
            <button ref={first} type="button" className={`${s.choice} ${s.primary}`} onClick={() => choose.current(true)}>
              <span className={s.bars} aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
              </span>
              Start with the full sound experience
              <ArrowRight className={s.arrow} size={14} weight="bold" aria-hidden="true" />
            </button>
            <button type="button" className={s.choice} onClick={() => choose.current(false)}>
              Continue without
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
