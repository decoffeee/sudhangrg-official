import Image from "next/image";
import Brush from "./Brush";
import { hero } from "@/data/content";
import s from "./Hero.module.css";

export default function Hero() {
  return (
    <section id="home" className={s.hero} data-hero aria-label="Introduction">
      <div className={`${s.layer} ${s.back}`}>
        <div className={s.inner} data-hero-back>
          <Image src="/images/hero-back.png" alt="" fill priority sizes="110vw" className={s.backImg} />
        </div>
      </div>

      <Brush variant="a" id="hero" className={s.brush} rotate={50.49} opacity={0.3} from="start" trigger="load" data-hero-brush />

      <div className={s.shadeTop} aria-hidden="true" />

      <h1 className={s.name}>
        <span className={s.sudhan} data-hero-name data-intro>
          {hero.first}
        </span>
        <span className={s.gurung} data-hero-sub data-intro>
          {hero.last}
        </span>
      </h1>

      <div className={`${s.layer} ${s.front}`}>
        <div className={s.inner} data-hero-front>
          <Image src="/images/hero-front.png" alt={hero.imageAlt} fill priority sizes="110vw" className={s.frontImg} />
        </div>
      </div>

      <div className={s.shadeBottom} aria-hidden="true" data-hero-shade data-intro />

      <p className={s.role} data-hero-title data-intro>
        <span className={s.roleHome}>
          <span>{hero.roles[0]}</span>
        </span>
        <span className={s.roleMinister}>
          <span>{hero.roles[1]}</span>
        </span>
        <span className={s.roleNepal}>
          <span>{hero.roles[2]}</span>
        </span>
        <span className={s.roleSmall}>
          <span>
            {hero.roleNote[0]}
            <br />
            {hero.roleNote[1]}
            <br />
            {hero.roleNote[2]}
          </span>
        </span>
      </p>
    </section>
  );
}
