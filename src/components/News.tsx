import Card from "./Card";
import Track from "./Track";
import { news } from "@/data/content";
import s from "./News.module.css";

export default function News() {
  return (
    <section id="news" className={s.news} aria-labelledby="news-heading">
      <p className={s.eyebrow} data-reveal="lines">
        {news.eyebrow[0]}
        <br />
        {news.eyebrow[1]}
      </p>
      <h2 id="news-heading" className={s.heading} data-reveal="words">
        {news.heading[0]}
        <br />
        {news.heading[1]}
      </h2>

      {/* Starts mid-rail so the red archive card peeks in from the left, as designed. */}
      <Track className={s.track} label="News and updates" initialOffset={359}>
        {news.cards.map((card, i) => (
          <Card key={card.id} card={card} theme="light" offset={i % 2 === 0} />
        ))}
      </Track>
    </section>
  );
}
