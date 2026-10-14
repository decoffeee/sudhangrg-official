import { martyrs } from "@/data/content";
import s from "./Martyrs.module.css";

export default function Martyrs() {
  return (
    <section className={s.martyrs} aria-labelledby="martyrs-heading">
      <h2 id="martyrs-heading" className={s.title} data-reveal="words">
        {martyrs.lines[0]}
        <br />
        {martyrs.lines[1]}
      </h2>
      <p className={s.date} data-reveal="fade" data-reveal-delay="0.5">
        {martyrs.date}
      </p>
    </section>
  );
}
