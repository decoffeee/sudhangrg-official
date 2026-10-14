import Image from "next/image";
import Card from "./Card";
import Gorkha from "./Gorkha";
import Track from "./Track";
import { manifesto, works } from "@/data/content";
import { u } from "@/lib/u";
import s from "./Works.module.css";

export default function Works() {
  return (
    <section id="journey" className={s.works} aria-labelledby="works-heading">
      <div className={s.map} data-map aria-hidden="true">
        <Image src="/svg/nepal-map.svg" alt="" width={1728} height={2529} unoptimized className={s.mapImg} />
        <Gorkha className={s.gorkha} />
        {manifesto.markers.map((m) => (
          <span key={m.label} className={s.marker} style={{ left: u(m.x), top: u(m.y) }} title={m.label} data-map-dot />
        ))}
      </div>

      <p className={s.eyebrow} data-reveal="lines">
        {works.eyebrow[0]}
        <br />
        {works.eyebrow[1]}
      </p>
      <h2 id="works-heading" className={s.heading} data-reveal="words">
        {works.heading}
      </h2>

      <Track className={s.track} label="Ongoing works">
        {works.cards.map((card, i) => (
          <Card key={card.id} card={card} theme="dark" offset={i % 2 === 1} />
        ))}
      </Track>

      <div id="ministry" className={s.manifesto} data-manifesto>
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
        <h3 className={s.mHeading} data-reveal="words">
          {manifesto.heading[0]}
          <br />
          {manifesto.heading[1]}
        </h3>
        <p className={s.sub} data-reveal="fade">
          {manifesto.sub}
        </p>
        <ul className={s.projects}>
          {manifesto.projects.map((p) => (
            <li key={p} data-project-item>
              {p}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
