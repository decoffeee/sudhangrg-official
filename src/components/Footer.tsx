import { footer, hero } from "@/data/content";
import s from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={s.footer}>
      <div className={s.top}>
        <p className={s.brand}>
          <span>Sudhan Gurung</span>
          <span aria-hidden="true">/</span>
          <span className={s.accent}>Official Portfolio</span>
        </p>
        <nav aria-label="Footer">
          <ul>
            {footer.links.map((l) => (
              <li key={l.href}>
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className={s.mid}>
        <p className={s.role} data-reveal="lines">
          {hero.roles[0]}
          <br />
          {hero.roles[1]}
          <br />
          {hero.roles[2]}
          <small>
            {hero.roleNote[0]} {hero.roleNote[1]} {hero.roleNote[2]}
          </small>
        </p>

        <div className={s.cols}>
          <div data-reveal="fade">
            <h3>Office</h3>
            <p>
              {footer.office[0]}
              <br />
              {footer.office[1]}
              <br />
              {footer.office[2]}
            </p>
          </div>
          <div data-reveal="fade" data-reveal-delay="0.1">
            <h3>Constituency</h3>
            <p>
              {footer.constituency[0]}
              <br />
              {footer.constituency[1]}
            </p>
            <p>
              <a href="#contact">Write to the office →</a>
            </p>
          </div>
          <div data-reveal="fade" data-reveal-delay="0.2">
            <h3>Follow</h3>
            <ul>
              {footer.social.map((l) => (
                <li key={l.label}>
                  <a href={l.href} rel="me noopener">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className={s.giant} aria-hidden="true">
        <span className={s.sudhan} data-reveal="chars">
          {hero.first}
        </span>
        <span className={s.gurung} data-reveal="fade" data-reveal-delay="0.6">
          {hero.last}
        </span>
      </div>

      <div className={s.bottom}>
        <p>{footer.copyright}</p>
        <a href="#home">Back to top ↑</a>
      </div>
    </footer>
  );
}
