import Image from "next/image";
import type { Card as CardData } from "@/data/content";
import s from "./Card.module.css";

type Props = {
  card: CardData;
  theme: "dark" | "light";
  /** Every other card sits lower, as in the design. */
  offset?: boolean;
};

function Arrow() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 12h15m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Card({ card, theme, offset }: Props) {
  const variant = card.variant ?? "image";
  const classes = [s.card, s[theme], s[variant], offset ? s.offset : ""].join(" ");
  const titleText = card.title.join(" ");

  return (
    <li className={classes} data-card>
      <article>
        <h3 className={s.title}>
          {card.title[0]}
          <br />
          {card.title[1]}
        </h3>
        <a href={card.href} className={s.media} aria-label={variant === "cta" ? `${card.cta}: ${titleText}` : titleText}>
          {variant === "image" && card.image && (
            <Image src={card.image} alt={card.alt ?? ""} fill sizes="(max-width: 1023px) 72vw, 23vw" />
          )}
          {variant === "quote" && <p className={s.quote}>{card.quote}</p>}
          {variant === "cta" && (
            <span className={s.cta}>
              {card.cta}
              <Arrow />
            </span>
          )}
        </a>
        <time className={s.date} dateTime={card.date.iso}>
          {card.date.label}
        </time>
        {card.description && <p className={s.desc}>{card.description}</p>}
      </article>
    </li>
  );
}
