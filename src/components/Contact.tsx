import Brush from "./Brush";
import ContactForm from "./ContactForm";
import ParallaxPair from "./ParallaxPair";
import { contact } from "@/data/content";
import s from "./Contact.module.css";

export default function Contact() {
  return (
    <section id="contact" className={s.contact} aria-labelledby="contact-heading">
      <ParallaxPair
        className={s.pair}
        back="/images/send-back.webp"
        front="/images/send-front.webp"
        alt={contact.imageAlt}
        position="50% 0%"
        sizes="(max-width: 1023px) 100vw, 52vw"
        backDepth={4}
        frontDepth={-3}
      />

      <Brush variant="c" className={s.brush} rotate={76.2} from="end" />

      <div className={s.panel}>
        <h2 id="contact-heading" className={s.heading} data-reveal="words">
          {contact.heading}
        </h2>
        <ContactForm />
      </div>
    </section>
  );
}
