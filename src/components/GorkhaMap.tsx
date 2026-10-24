"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { manifesto, projectKinds, projectStatuses, type ManifestoProject } from "@/data/content";
import type { GorkhaScene } from "./gorkha/scene";
import { snapPoints } from "./motion/snap";
import s from "./GorkhaMap.module.css";

gsap.registerPlugin(ScrollTrigger);

const DESKTOP = "(min-width: 1024px)";
const projects: ManifestoProject[] = manifesto.projects;

/**
 * The live Gorkha manifesto: a 3D map of the district with a diorama on each
 * project site, the project list beside it and a card that follows the
 * hovered or chosen site. The map builds itself (timed, not scrubbed) each
 * time the stage comes into view and takes itself down as it leaves, so it
 * never sits half-built under the reader's scroll. The 2D map is only shown
 * without JavaScript or WebGL.
 */
export default function GorkhaMap() {
  const stage = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const scene = useRef<GorkhaScene | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");
  const [active, setActive] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const [zoom, setZoom] = useState({ zoom: 1, zoomMin: 0.35, zoomMax: 1.5 });

  useEffect(() => {
    const stageEl = stage.current;
    const hostEl = host.current;
    const cardEl = card.current;
    if (!stageEl || !hostEl || !cardEl) return;

    let dead = false;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const desktop = window.matchMedia(DESKTOP);
    const proxy = { p: reduced ? 1 : 0 };
    let inView = false;
    let tween: gsap.core.Tween | undefined;

    // Build in on entry, take down on exit; either can interrupt the other.
    const play = (on: boolean) => {
      const sc = scene.current;
      if (!sc || reduced) return;
      tween?.kill();
      if (!on) sc.reset();
      tween = gsap.to(proxy, {
        p: on ? 1 : 0,
        // Out is quicker, and front-loaded so the sites leave at once.
        duration: on ? 2.2 * (1 - proxy.p) + 0.3 : 0.8 * proxy.p + 0.1,
        ease: "power2.out",
        onUpdate: () => {
          sc.setIntro(proxy.p);
          stageEl.toggleAttribute("data-built", proxy.p > 0.6);
        },
      });
    };

    // The map area itself (on phones it sits below the text).
    const trigger = ScrollTrigger.create({
      trigger: hostEl,
      start: "top 55%",
      end: "bottom 45%",
      onToggle: (self) => {
        inView = self.isActive;
        play(inView);
      },
    });

    // Desktop: settle with the stage filling the screen.
    const removeSnap = snapPoints.add(() =>
      desktop.matches ? [stageEl.getBoundingClientRect().top + window.scrollY] : [],
    );

    import("./gorkha/scene")
      .then(({ createGorkhaScene }) =>
        createGorkhaScene({
          host: hostEl,
          card: cardEl,
          projects,
          peaks: manifesto.peaks,
          mapUrl: "/svg/nepal-map.svg",
          reduced,
          shift: () => (desktop.matches ? 0.17 : 0),
          onActive: (id) => setActive(id),
          onFocus: (id) => setFocused(id),
          onView: (v) => setZoom(v),
        }),
      )
      .then((created) => {
        if (dead) return created.destroy();
        scene.current = created;
        created.setIntro(proxy.p);
        stageEl.toggleAttribute("data-built", proxy.p > 0.6);
        setState("ready");
        if (inView) play(true);
      })
      .catch(() => {
        if (!dead) setState("failed");
      });

    return () => {
      dead = true;
      tween?.kill();
      trigger.kill();
      removeSnap();
      scene.current?.destroy();
      scene.current = null;
    };
  }, []);

  const project = projects.find((p) => p.id === active);

  return (
    <div ref={stage} id="ministry" className={s.stage} data-manifesto data-state={state}>
      <div className={s.fallback} aria-hidden="true">
        <Image src="/svg/nepal-map.svg" alt="" width={1728} height={2529} unoptimized className={s.fallbackImg} />
      </div>
      <div ref={host} className={s.host} />
      <p className={s.loading} aria-hidden="true">
        <span />
        Loading map
      </p>
      <div className={s.veil} aria-hidden="true" />

      <div className={s.panel}>
        <div className={s.labels}>
          <p data-reveal="lines">
            {manifesto.labels[0][0]}
            <br />
            {manifesto.labels[0][1]}
          </p>
          <p data-reveal="lines" data-reveal-delay="0.1">
            {manifesto.labels[1][0]}
            <br />
            {manifesto.labels[1][1]}
          </p>
        </div>
        <h3 className={s.heading} data-reveal="words">
          {manifesto.heading[0]}
          <br />
          {manifesto.heading[1]}
        </h3>
        <p className={s.sub} data-reveal="fade">
          {manifesto.sub}
        </p>
        <ul className={s.projects}>
          {projects.map((p) => (
            <li key={p.id} data-project-item>
              <button
                type="button"
                className={s.project}
                data-status={p.status}
                data-active={active === p.id ? "" : undefined}
                aria-pressed={focused === p.id}
                onPointerEnter={(e) => e.pointerType === "mouse" && scene.current?.setListActive(p.id)}
                onPointerLeave={(e) => e.pointerType === "mouse" && scene.current?.setListActive(null)}
                onFocus={() => scene.current?.setListActive(p.id)}
                onBlur={() => scene.current?.setListActive(null)}
                onClick={() => scene.current?.focus(focused === p.id ? null : p.id)}
              >
                <span className={s.projectName}>{p.name}</span>
                <span className={s.projectKind}>{projectKinds[p.kind]}</span>
                <span className="sr-only">
                  , {projectStatuses[p.status]}
                  {p.progress !== undefined && `, ${p.progress}% complete`}. {p.place}. {p.note} {p.by}. Source:{" "}
                  {p.source.name}, {p.asOf}.
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p className={s.hint} aria-hidden="true">
          <span className={s.hintMouse}>{manifesto.hint.mouse}</span>
          <span className={s.hintTouch}>{manifesto.hint.touch}</span>
        </p>
      </div>

      <div className={s.controls} role="group" aria-label="Map view" hidden={state !== "ready"}>
        <button type="button" aria-label="Zoom in" disabled={zoom.zoom <= zoom.zoomMin} onClick={() => scene.current?.zoomBy(0.75)}>
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M8 3v10M3 8h10" />
          </svg>
        </button>
        <button type="button" aria-label="Zoom out" disabled={zoom.zoom >= zoom.zoomMax} onClick={() => scene.current?.zoomBy(1 / 0.75)}>
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M3 8h10" />
          </svg>
        </button>
        <button type="button" aria-label="Turn left" onClick={() => scene.current?.turnBy(-0.4)}>
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M5.5 3.5H3v-2.5M3.2 3.6A6 6 0 1 1 2 8" />
          </svg>
        </button>
        <button type="button" aria-label="Turn right" onClick={() => scene.current?.turnBy(0.4)}>
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M10.5 3.5H13v-2.5M12.8 3.6A6 6 0 1 0 14 8" />
          </svg>
        </button>
        <button type="button" className={s.reset} onClick={() => scene.current?.reset()}>
          Reset
        </button>
      </div>

      <div ref={card} className={s.card} data-open={project ? "" : undefined} aria-hidden="true">
        <div className={s.cardInner}>
          <div className={s.photo} hidden={!project?.image}>
            {projects.map(
              (p) =>
                p.image && (
                  <Image
                    key={p.id}
                    src={p.image}
                    alt=""
                    fill
                    sizes="320px"
                    className={s.photoImg}
                    data-on={p.id === active ? "" : undefined}
                  />
                ),
            )}
          </div>
          {project && (
            <div className={s.body}>
              <div className={s.top}>
                <p className={s.kind}>{projectKinds[project.kind]}</p>
                <span className={s.status} data-status={project.status}>
                  {projectStatuses[project.status]}
                </span>
              </div>
              <p className={s.name}>{project.name}</p>
              <p className={s.place}>{project.place}</p>
              {project.progress !== undefined && (
                <>
                  <div className={s.bar} data-status={project.status}>
                    <span style={{ transform: `scaleX(${project.progress / 100})` }} />
                  </div>
                  <p className={s.meta}>
                    <span>{project.progress}% complete</span>
                  </p>
                </>
              )}
              <p className={s.note}>{project.note}</p>
              <p className={s.credit}>
                <span>{project.by}</span>
                <span>
                  {project.source.name === project.by ? "Reported" : project.source.name} · {project.asOf}
                </span>
              </p>
              {focused === project.id && <p className={s.close}>ESC TO CLOSE</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
