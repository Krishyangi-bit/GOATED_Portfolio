import { useRef, useState } from 'react';
import { gsap, useGSAP } from '../lib/gsap';
import { EASE } from '../lib/motion';
import { SITE } from '../content/site';
import { JOURNEY } from '../content/journey';
import { HACKATHONS } from '../content/achievements';
import { ChapterEdge, ChapterSplash, Todo } from '../components/Chapter';
import { ComicButton } from '../components/ComicButton';
import { PdfViewer, type PdfDoc } from '../components/PdfViewer';
import { useReducedMotion } from '../hooks/useReducedMotion';
import './Recruiter.css';

const IconDownload = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19.5h14" />
  </svg>
);
const IconDoc = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 3h8l4 4v14H6z" />
    <path d="M14 3v4h4M9 12h6M9 16h6" strokeLinecap="round" />
  </svg>
);

const uni = JOURNEY.find((c) => c.id === 'krmu');
const ambassador = JOURNEY.find((c) => c.id === 'gemini');

/** The TL;DR, built from the same content files as the rest of the comic. */
const FACTS: { k: string; v: string }[] = [
  { k: 'Studying', v: uni ? `${uni.position.replace(' student', '')} · ${uni.organisation} (${uni.duration})` : '' },
  { k: 'Academics', v: uni?.achievements?.[0] ?? '' },
  { k: 'Role', v: ambassador ? `${ambassador.organisation} ${ambassador.position} (${ambassador.duration})` : '' },
  { k: 'Hackathons', v: HACKATHONS.map((h) => `${h.event.split(' · ')[0]}: round ${h.round}`).join(' · ') },
  { k: 'Focus', v: 'AI meets hardware: robotics, drones, embedded systems & system design' },
  { k: 'Based in', v: SITE.location },
].filter((f) => f.v);

/**
 * CHAPTER 07 — THE RECRUITER'S DESK
 * The no-scroll version for busy people: a one-glance case file and the résumé,
 * which opens straight away in a reader with a Download button.
 */
export function Recruiter() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [doc, setDoc] = useState<PdfDoc | null>(null);

  const resume: PdfDoc | null = SITE.resume
    ? { title: `${SITE.fullName} · Résumé`, src: SITE.resume, fileName: SITE.resumeFileName }
    : null;
  const open = () => resume && setDoc(resume);

  useGSAP(
    () => {
      if (reduced) return;
      const q = gsap.utils.selector(root);
      gsap
        .timeline({ scrollTrigger: { trigger: q('.desk')[0], start: 'top 78%', once: true } })
        .from(q('.casefile'), { x: -60, rotation: -4, opacity: 0, duration: 0.7, ease: EASE.settle })
        .from(q('.casefile__row'), { y: 14, opacity: 0, duration: 0.35, stagger: 0.06, ease: EASE.settle }, 0.3)
        .from(q('.dossier'), { y: 80, rotation: 6, opacity: 0, duration: 0.75, ease: EASE.settle }, 0.15)
        .from(q('.dossier__stamp'), { scale: 2.6, rotation: 20, opacity: 0, duration: 0.45, ease: EASE.impact }, 0.75);
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <section id="recruiter" ref={root} className="chapter chapter--recruiter" aria-labelledby="recruiter-title">
      <ChapterEdge variant="torn" seed={52} />
      <ChapterSplash
        id="recruiter-title"
        issue="Chapter 07"
        words={['Recruiter’s', 'Desk']}
        accent={1}
        aside="(the 30-second version)"
        intro={<p>Short on time? Here’s the case file, and the résumé is one click away.</p>}
      />

      <div className="desk chapter__canvas">
        <div className="casefile">
          <p className="casefile__tab">Case file · {SITE.fullName}</p>
          <dl className="casefile__facts">
            {FACTS.map((f) => (
              <div key={f.k} className="casefile__row">
                <dt>{f.k}</dt>
                <dd>{f.v}</dd>
              </div>
            ))}
            <div className="casefile__row casefile__row--status">
              <dt>Status</dt>
              <dd>
                <span className="casefile__dot" aria-hidden="true" /> Open to internships & opportunities
              </dd>
            </div>
          </dl>
        </div>

        <div className="dossier">
          {resume ? (
            <button type="button" className="dossier__file" onClick={open} aria-label="Open résumé (PDF)">
              <span className="dossier__paper" aria-hidden="true">
                <IconDoc />
                <b>{SITE.fullName}</b>
                <i />
                <i />
                <i />
                <i />
              </span>
              <span className="dossier__hint">Click to read</span>
            </button>
          ) : (
            <div className="dossier__file dossier__file--empty">
              <Todo>add résumé PDF in public/docs and set SITE.resume</Todo>
            </div>
          )}
          <p className="dossier__stamp" aria-hidden="true">
            Résumé
          </p>

          <div className="dossier__actions">
            {resume && (
              <>
                <ComicButton variant="primary" onClick={open} icon={<IconDoc />} sfx="FLIP!">
                  Open résumé
                </ComicButton>
                <ComicButton variant="ink" href={resume.src} download={resume.fileName} icon={<IconDownload />}>
                  Download PDF
                </ComicButton>
              </>
            )}
            <a className="dossier__mail" href={`mailto:${SITE.email}`}>
              or email {SITE.email}
            </a>
          </div>
        </div>
      </div>

      <PdfViewer doc={doc} onClose={() => setDoc(null)} />
    </section>
  );
}
