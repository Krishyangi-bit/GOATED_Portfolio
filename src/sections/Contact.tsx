import { useRef, useState, type FormEvent } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap';
import { EASE } from '../lib/motion';
import { CONTACT, SITE } from '../content/site';
import { Character } from '../character/Character';
import { useCharacterController } from '../character/useCharacterController';
import { SpeechBubble } from '../components/SpeechBubble';
import { ComicButton } from '../components/ComicButton';
import { Burst } from '../components/Burst';
import { ChapterEdge } from '../components/Chapter';
import { IconGithub, IconLinkedin } from '../components/Doodles';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useSound } from '../sound/SoundController';
import './Contact.css';

type Status = 'idle' | 'sending' | 'sent' | 'error';
type Fields = { name: string; email: string; message: string };
type Errors = Partial<Record<keyof Fields, string>>;

const EMPTY: Fields = { name: '', email: '', message: '' };

function validate(f: Fields): Errors {
  const e: Errors = {};
  if (!f.name.trim()) e.name = 'Every hero needs a name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = 'That email doesn’t look like a real frequency.';
  if (f.message.trim().length < 10) e.message = 'A little more, please — at least 10 characters.';
  return e;
}

const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3.5 6 8.5 7 8.5-7" />
  </svg>
);

/**
 * CHAPTER 07 — TO BE CONTINUED…?
 * The closing page. The form really sends (via FormSubmit to her inbox);
 * the BOOM only plays when the service confirms delivery.
 */
export function Contact() {
  const root = useRef<HTMLElement>(null);
  const boom = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { play } = useSound();
  const ctl = useCharacterController('idle', 'idle');
  const { say } = ctl;
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [failure, setFailure] = useState('');
  const honey = useRef<HTMLInputElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      ScrollTrigger.create({
        trigger: q('.finale')[0],
        start: 'top 60%',
        once: true,
        onEnter: () => say({ text: 'Got an idea? I’m all ears. (And headphones.)', mood: 'greeting', action: 'wave' }, { hold: 5000 }),
      });
      // the very last page: one closing line
      ScrollTrigger.create({
        trigger: q('.theend')[0],
        start: 'top 92%',
        once: true,
        onEnter: () => say({ text: 'That’s the last page… unless you write the sequel. ↑', mood: 'mischief' }, { hold: 6000 }),
      });
      if (reduced) return;
      gsap
        .timeline({ scrollTrigger: { trigger: q('.finale')[0], start: 'top 75%', once: true } })
        .from(q('.finale__word'), { yPercent: 120, rotation: 8, duration: 0.8, stagger: 0.08, ease: EASE.settle })
        .from(q('.finale__q'), { scale: 0, rotation: -60, duration: 0.6, ease: EASE.impact }, 0.55)
        .from(q('.finale__lede'), { y: 24, opacity: 0, duration: 0.5 }, 0.6)
        .from(q('.finale__panel'), { rotationY: -30, xPercent: 10, opacity: 0, transformPerspective: 1200, duration: 0.8, ease: EASE.settle }, 0.5)
        .from(q('.finale__hero .char'), { y: 80, opacity: 0, duration: 0.8, ease: 'back.out(1.4)' }, 0.4);
      // "The End?" is stamped onto the last page
      gsap
        .timeline({ scrollTrigger: { trigger: q('.theend')[0], start: 'top 92%', once: true } })
        .from(q('.theend__title'), { scale: 2.4, rotation: 10, opacity: 0, duration: 0.5, ease: EASE.impact })
        .from(q('.theend__text, .theend__fine'), { y: 18, opacity: 0, duration: 0.5, stagger: 0.12, ease: EASE.settle }, 0.3);
    },
    { scope: root, dependencies: [reduced] },
  );

  const update = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFields((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;
    const found = validate(fields);
    setErrors(found);
    if (Object.keys(found).length) {
      say({ text: 'Almost! A couple of fields need a second look.', mood: 'confused', action: 'shake' }, { hold: 3500 });
      const first = Object.keys(found)[0];
      root.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setStatus('sending');
    setFailure('');
    try {
      const res = await fetch(CONTACT.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: fields.name.trim(),
          email: fields.email.trim(),
          message: fields.message.trim(),
          _subject: CONTACT.subject,
          _replyto: fields.email.trim(),
          _template: 'table',
          _captcha: 'false',
          _honey: honey.current?.value ?? '',
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { success?: string | boolean; message?: string };
      if (!res.ok || String(data.success) !== 'true') throw new Error(data.message || `Status ${res.status}`);
      setStatus('sent');
      setFields(EMPTY);
      play('kapow');
      say({ text: 'BOOM! Got it. I’ll read it soon — probably with music on.', mood: 'excited', action: 'hop' }, { hold: 6000 });
      requestAnimationFrame(() => {
        if (!boom.current || reduced) return;
        gsap.fromTo(boom.current.querySelector('.burst'), { scale: 0, rotation: -40 }, { scale: 1, rotation: -8, duration: 0.6, ease: EASE.impact });
        gsap.from(boom.current.querySelectorAll('.boom__line'), { y: 24, opacity: 0, stagger: 0.1, delay: 0.25, duration: 0.45, ease: EASE.settle });
      });
    } catch (err) {
      setStatus('error');
      setFailure(err instanceof Error ? err.message : '');
      play('whoops');
      say({ text: 'Hmm. The transmission fizzled. Email works too!', mood: 'confused', action: 'shake' }, { hold: 5000 });
    }
  };

  const sending = status === 'sending';

  return (
    <section id="contact" ref={root} className="chapter chapter--contact" aria-labelledby="contact-title">
      <ChapterEdge variant="torn" seed={33} />

      <div className="finale chapter__canvas">
        <header className="finale__head">
          <p className="finale__issue caption caption--ink">Chapter 07 · The final transmission</p>
          <h2 id="contact-title" className="finale__title">
            {['To', 'be', 'continued…'].map((w) => (
              <span key={w} className="finale__mask">
                <span className="finale__word">{w}</span>
              </span>
            ))}
            <span className="finale__q">?</span>
          </h2>
          <p className="finale__lede">Got an interesting idea? A project? An opportunity? Or just want to talk?</p>
        </header>

        <div className="finale__hero">
          <div className="finale__bubble">
            <SpeechBubble speech={ctl.speech} tail="bottom-right" />
          </div>
          <svg className="finale__signal" viewBox="0 0 80 80" aria-hidden="true">
            <path d="M20 60a30 30 0 0 1 0-40M32 50a16 16 0 0 1 0-20M60 60a30 30 0 0 0 0-40M48 50a16 16 0 0 0 0-20" />
            <circle cx="40" cy="40" r="5" />
          </svg>
          <Character
            ref={ctl.charRef}
            mood={ctl.mood}
            preload={['wave', 'excited', 'confused', 'mischief']}
            label="Krishyangi, waiting for your message"
            sizes="(max-width: 899px) 50vw, 30vw"
          />
        </div>

        <div className="finale__panel">
          {status === 'sent' ? (
            <div className="boom" ref={boom} role="status">
              <Burst text="BOOM!" color="var(--yellow)" spikes={16} seed={5} />
              <p className="boom__line boom__title">Message delivered.</p>
              <p className="boom__line">It’s in her inbox. Expect a reply from the protagonist herself.</p>
              <div className="boom__line">
                <ComicButton variant="secondary" onClick={() => setStatus('idle')}>
                  Send another transmission
                </ComicButton>
              </div>
            </div>
          ) : (
            <form className="tx" onSubmit={submit} noValidate>
              <p className="tx__label">Transmission console</p>
              <div className={`tx__field ${errors.name ? 'has-error' : ''}`}>
                <label htmlFor="tx-name">Name</label>
                <input
                  id="tx-name"
                  name="name"
                  autoComplete="name"
                  value={fields.name}
                  onChange={update('name')}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'tx-name-err' : undefined}
                  disabled={sending}
                />
                {errors.name && (
                  <p id="tx-name-err" className="tx__error">
                    {errors.name}
                  </p>
                )}
              </div>
              <div className={`tx__field ${errors.email ? 'has-error' : ''}`}>
                <label htmlFor="tx-email">Email</label>
                <input
                  id="tx-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={fields.email}
                  onChange={update('email')}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'tx-email-err' : undefined}
                  disabled={sending}
                />
                {errors.email && (
                  <p id="tx-email-err" className="tx__error">
                    {errors.email}
                  </p>
                )}
              </div>
              <div className={`tx__field ${errors.message ? 'has-error' : ''}`}>
                <label htmlFor="tx-message">Message</label>
                <textarea
                  id="tx-message"
                  name="message"
                  rows={5}
                  value={fields.message}
                  onChange={update('message')}
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? 'tx-message-err' : undefined}
                  disabled={sending}
                />
                {errors.message && (
                  <p id="tx-message-err" className="tx__error">
                    {errors.message}
                  </p>
                )}
              </div>
              {/* spam trap: hidden from people, irresistible to bots */}
              <input ref={honey} className="tx__honey" type="text" name="_honey" tabIndex={-1} autoComplete="off" aria-hidden="true" />

              {status === 'error' && (
                <div className="tx__fail" role="alert">
                  <strong>Transmission fizzled.</strong> The message didn’t go through
                  {failure ? ` (${failure})` : ''}. Try again, or email{' '}
                  <a href={`mailto:${SITE.email}`}>{SITE.email}</a> directly.
                </div>
              )}

              <div className="tx__send">
                <ComicButton variant="primary" submit disabled={sending} sfx="ZZT!">
                  {sending ? 'Transmitting…' : 'Send transmission!'}
                </ComicButton>
              </div>
            </form>
          )}
        </div>

        <ul className="finale__links" aria-label="Other ways to reach her">
          <li>
            <a href={`mailto:${SITE.email}`}>
              <IconMail /> {SITE.email}
            </a>
          </li>
          <li>
            <a href={SITE.links.github} target="_blank" rel="noopener noreferrer">
              <IconGithub /> GitHub<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
          <li>
            <a href={SITE.links.linkedin} target="_blank" rel="noopener noreferrer">
              <IconLinkedin /> LinkedIn<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
        </ul>
      </div>

      <footer className="theend">
        <p className="theend__title">The End?</p>
        <p className="theend__text">
          Thanks for reading <em>The Living Comic Book</em>. The protagonist is still writing new chapters.
        </p>
        <p className="theend__fine">
          © {new Date().getFullYear()} {SITE.fullName} · {SITE.location} · Hand-inked with React, GSAP &amp; a lot of debugging ·{' '}
          <span className="theend__psst">psst: try typing “bam”</span>
        </p>
      </footer>
    </section>
  );
}
