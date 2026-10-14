import Brush from "./Brush";
import ParallaxPair from "./ParallaxPair";
import { about } from "@/data/content";
import s from "./About.module.css";

export default function About() {
  return (
    <section id="about" className={s.about} aria-labelledby="about-heading">
      <h2 id="about-heading" className={`${s.label} ${s.label1}`} data-reveal="lines">
        {about.personLabel[0]}
        <br />
        {about.personLabel[1]}
        <br />
        {about.personLabel[2]}
      </h2>

      <div className={`${s.copy} ${s.copy1}`}>
        {about.personCopy.map((text, i) => (
          <p key={i} data-reveal="lines" data-reveal-delay={i * 0.15}>
            {text}
          </p>
        ))}
      </div>

      <ParallaxPair
        className={s.person}
        back="/images/person-back.webp"
        front="/images/person-front.webp"
        alt={about.personAlt}
        backDepth={4}
        frontDepth={-4}
      />

      <Brush variant="a" className={s.brush} rotate={2.01} opacity={0.8} from="end" />

      <ParallaxPair
        className={s.vision}
        back="/images/vision-back.webp"
        front="/images/vision-front.webp"
        alt={about.visionAlt}
        backDepth={4}
        frontDepth={-4}
      />

      <div className={`${s.copy} ${s.copy2}`}>
        {about.visionCopy.map((text, i) => (
          <p key={i} data-reveal="lines" data-reveal-delay={i * 0.15}>
            {text}
          </p>
        ))}
      </div>

      <h3 className={`${s.label} ${s.label2}`} data-reveal="lines">
        {about.visionLabel[0]}
        <br />
        {about.visionLabel[1]}
      </h3>
    </section>
  );
}
