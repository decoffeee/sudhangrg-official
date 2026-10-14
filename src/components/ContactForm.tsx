"use client";

import { useState, type FormEvent } from "react";
import { contact } from "@/data/content";
import s from "./Contact.module.css";

export default function ContactForm() {
  const [sent, setSent] = useState(false);

  // TODO: post to a mail/CRM endpoint. For now the submission is acknowledged client-side.
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSent(true);
  }

  if (sent) {
    return (
      <p className={s.thanks} role="status">
        {contact.thanks}
      </p>
    );
  }

  const f = contact.fields;
  return (
    <form className={s.form} onSubmit={onSubmit} data-reveal="fade" data-reveal-delay="0.2">
      <label className="sr-only" htmlFor="c-name">
        {f.name}
      </label>
      <input id="c-name" name="name" className={s.field} placeholder={f.name} autoComplete="name" required />

      <label className="sr-only" htmlFor="c-email">
        {f.email}
      </label>
      <input id="c-email" name="email" type="email" className={s.field} placeholder={f.email} autoComplete="email" required />

      <label className="sr-only" htmlFor="c-subject">
        {f.subject}
      </label>
      <input id="c-subject" name="subject" className={s.field} placeholder={f.subject} />

      <label className="sr-only" htmlFor="c-message">
        {f.message}
      </label>
      <textarea id="c-message" name="message" className={`${s.field} ${s.area}`} placeholder={f.message} required />

      <button type="submit" className={s.submit}>
        {contact.submit}
        <svg width="0.9em" height="0.9em" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 12h15m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </form>
  );
}
