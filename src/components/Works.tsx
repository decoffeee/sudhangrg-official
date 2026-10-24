import Image from "next/image";
import Card from "./Card";
import GorkhaMap from "./GorkhaMap";
import Track from "./Track";
import { works } from "@/data/content";
import s from "./Works.module.css";

export default function Works() {
  return (
    <section id="journey" className={s.works} aria-labelledby="works-heading">
      <div className={s.intro}>
        <div className={s.map} data-map aria-hidden="true">
          <Image src="/svg/nepal-map.svg" alt="" width={1728} height={2529} unoptimized className={s.mapImg} />
        </div>

        <p className={s.eyebrow} data-reveal="lines">
          {works.eyebrow[0]}
          <br />
          {works.eyebrow[1]}
        </p>
        <h2 id="works-heading" className={s.heading} data-reveal="words">
          {works.heading}
        </h2>

        <Track className={s.track} label="Ongoing works" snap>
          {works.cards.map((card, i) => (
            <Card key={card.id} card={card} theme="dark" offset={i % 2 === 1} />
          ))}
        </Track>
      </div>

      <GorkhaMap />
    </section>
  );
}
