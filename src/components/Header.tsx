"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { nav } from "@/data/content";
import s from "./Header.module.css";

gsap.registerPlugin(ScrollTrigger);

export default function Header() {
  const ref = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("#home");

  // Compact dark bar once past the hero; hide on scroll down, reveal on scroll up.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate(self) {
        const y = self.scroll();
        el.classList.toggle(s.scrolled, y > 80);
        el.classList.toggle(s.hidden, y > 480 && self.direction === 1 && !open);
      },
    });
    const sections = nav.map((item) =>
      ScrollTrigger.create({
        trigger: item.href,
        start: "top 50%",
        end: "bottom 50%",
        onToggle: (self) => self.isActive && setActive(item.href),
      }),
    );
    return () => {
      st.kill();
      sections.forEach((t) => t.kill());
    };
  }, [open]);

  useEffect(() => {
    document.documentElement.classList.toggle("menu-open", open);
    if (open) window.__lenis?.stop();
    else window.__lenis?.start();
  }, [open]);

  const links = nav.map((item) => (
    <li key={item.href}>
      <a href={item.href} aria-current={active === item.href ? "true" : undefined} onClick={() => setOpen(false)}>
        {item.label}
      </a>
    </li>
  ));

  return (
    <header ref={ref} className={`${s.header} ${open ? s.open : ""}`}>
      <div className={s.inner}>
        <a href="#home" className={s.brand} data-hero-intro data-intro aria-label="Sudhan Gurung — official portfolio, back to top">
          <span>Sudhan Gurung</span>
          <span className={s.slash} aria-hidden="true">
            /
          </span>
          <span className={s.accent}>Official Portfolio</span>
        </a>
        <span className={s.center} aria-hidden="true" data-hero-intro data-intro>
          Portfolio
        </span>
        <nav className={s.nav} aria-label="Primary">
          <ul>
            {nav.map((item) => (
              <li key={item.href} data-hero-intro data-intro>
                <a href={item.href} aria-current={active === item.href ? "true" : undefined}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <button
          type="button"
          className={s.burger}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
          data-hero-intro
          data-intro
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        </button>
      </div>
      <div id="mobile-menu" className={`${s.menu} ${open ? s.menuOpen : ""}`} aria-hidden={!open}>
        <nav aria-label="Mobile">
          <ul>{links}</ul>
        </nav>
        <p className={s.menuFoot}>
          Home Minister · Nepal
          <br />
          Member of Parliament · Gorkha
        </p>
      </div>
    </header>
  );
}
