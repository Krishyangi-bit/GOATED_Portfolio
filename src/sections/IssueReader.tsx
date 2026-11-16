import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { gsap } from '../lib/gsap';
import { EASE } from '../lib/motion';
import type { Project } from '../content/projects';
import { CoverArt } from '../components/CoverArt';
import { Bubble } from '../components/SpeechBubble';
import { ComicButton } from '../components/ComicButton';
import { IconGithub } from '../components/Doodles';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useSound } from '../sound/SoundController';
import './IssueReader.css';

type Props = {
  projects: Project[];
  index: number | null;
  onIndex: (i: number) => void;
  onClose: () => void;
  coverVars: (p: Project) => CSSProperties;
};

const IconLink = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
  </svg>
);

/**
 * The opened issue: a comic page with the full story of one project.
 * Opens like a cover swinging open; ← / → (or the buttons) flip to the
 * neighbouring issue with a page-turn. Native <dialog> gives focus + Esc.
 */
export function IssueReader({ projects, index, onIndex, onClose, coverVars }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const page = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { play } = useSound();
  const [shown, setShown] = useState<number | null>(index);
  const flipDir = useRef<0 | 1 | -1>(0);
  const busy = useRef(false);

  const [openKey, setOpenKey] = useState(0);

  // open the dialog (the page renders in the same pass, then animates in below)
  useEffect(() => {
    const d = dialog.current;
    if (!d || index === null || d.open) return;
    flipDir.current = 0;
    busy.current = false;
    setShown(index);
    setOpenKey((k) => k + 1);
    d.showModal();
    document.documentElement.style.overflow = 'hidden';
  }, [index]);

  // the cover swings open
  useLayoutEffect(() => {
    const el = page.current;
    if (!openKey || !el || reduced) return;
    el.scrollTop = 0;
    gsap.fromTo(
      el,
      { rotationY: -80, opacity: 0, transformPerspective: 1600, transformOrigin: 'left center' },
      { rotationY: 0, opacity: 1, duration: 0.65, ease: 'power3.out' },
    );
    gsap.from(el.querySelectorAll('[data-in]'), { y: 30, opacity: 0, stagger: 0.06, duration: 0.5, delay: 0.25, ease: EASE.settle });
  }, [openKey, reduced]);

  // page flip between issues: the old page has already turned away; bring the new one in
  useLayoutEffect(() => {
    const el = page.current;
    const dir = flipDir.current;
    if (!el || !dir || reduced) return;
    flipDir.current = 0;
    gsap.fromTo(
      el,
      { rotationY: dir > 0 ? 75 : -75, transformOrigin: dir > 0 ? 'right center' : 'left center', transformPerspective: 1600 },
      { rotationY: 0, duration: 0.45, ease: 'power2.out', onComplete: () => void (busy.current = false) },
    );
    el.scrollTop = 0;
    gsap.from(el.querySelectorAll('[data-in]'), { y: 20, opacity: 0, stagger: 0.04, duration: 0.4, delay: 0.15, ease: EASE.settle });
  }, [shown, reduced]);

  const close = () => {
    const d = dialog.current;
    if (!d || !d.open) return;
    const done = () => {
      d.close();
      document.documentElement.style.overflow = '';
      onClose();
    };
    if (reduced || !page.current) return done();
    gsap.to(page.current, { rotationY: -70, opacity: 0, duration: 0.35, ease: 'power2.in', transformOrigin: 'left center', onComplete: done });
  };

  const flip = (dir: 1 | -1) => {
    if (shown === null || busy.current) return;
    const next = (shown + dir + projects.length) % projects.length;
    play('ratchet');
    if (reduced || !page.current) {
      setShown(next);
      onIndex(next);
      return;
    }
    busy.current = true;
    gsap.to(page.current, {
      rotationY: dir > 0 ? -75 : 75,
      transformOrigin: dir > 0 ? 'left center' : 'right center',
      transformPerspective: 1600,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        flipDir.current = dir;
        setShown(next);
        onIndex(next);
      },
    });
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') flip(1);
    if (e.key === 'ArrowLeft') flip(-1);
  };

  const p = shown !== null ? projects[shown] : null;

  return (
    <dialog
      ref={dialog}
      className="reader"
      aria-labelledby="reader-title"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        if (e.target === dialog.current) close();
      }}
      onKeyDown={onKey}
    >
      {p && (
        <div ref={page} className="reader__page" style={coverVars(p)}>
          <header className="reader__bar">
            <span className="reader__issue">
              Issue {p.issue} <small>of #{String(projects.length).padStart(3, '0')}</small>
            </span>
            <span className="reader__status">{p.status}</span>
            <button type="button" className="reader__close" onClick={close} autoFocus>
              Close <span aria-hidden="true">✕</span>
            </button>
          </header>

          <div className="reader__grid">
            {/* splash panel: the dramatic reveal */}
            <section className="rp rp--splash" data-in>
              <p className="rp__opener caption">{p.opener}</p>
              <h2 id="reader-title" className="rp__title">
                {p.title}
              </h2>
              <p className="rp__subtitle">{p.subtitle}</p>
              <div className="rp__art">
                <CoverArt art={p.art} />
              </div>
              <span className="rp__sfx" aria-hidden="true">
                {p.sfx}
              </span>
              <span className="rp__badge">{p.team ? 'Team-up' : 'Solo'} · {p.when}</span>
            </section>

            <section className="rp rp--story" data-in>
              <h3 className="rp__label">The story so far</h3>
              <p className="rp__lead">{p.storyline}</p>
              <h3 className="rp__label">The problem</h3>
              <p>{p.problem}</p>
            </section>

            <section className="rp rp--plan" data-in>
              <h3 className="rp__label">The plan</h3>
              <p>{p.solution}</p>
              <div className="rp__aside">
                <img src="/character/mischief-sm.webp" alt="" width={416} height={589} loading="lazy" />
                <Bubble tail="left">{p.aside}</Bubble>
              </div>
            </section>

            <section className="rp rp--gear" data-in>
              <h3 className="rp__label">The gear</h3>
              <ul className="rp__chips">
                {p.tech.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </section>

            <section className="rp rp--part" data-in>
              <h3 className="rp__label">My part in it</h3>
              <ul className="rp__list">
                {p.contribution.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
              <p className="rp__source">Verified: {p.contributionSource}</p>
            </section>
          </div>

          <footer className="reader__foot" data-in>
            <div className="reader__links">
              {p.repo && (
                <ComicButton variant="ink" href={p.repo} external icon={<IconGithub />} sfx="CLICK!">
                  {p.team ? 'Team repo' : 'GitHub repo'}
                </ComicButton>
              )}
              {p.demo ? (
                <ComicButton variant="primary" href={p.demo} external icon={<IconLink />} sfx="ZAP!">
                  Live demo
                </ComicButton>
              ) : (
                <p className="reader__nodemo">{p.demoNote}</p>
              )}
            </div>
            <div className="reader__nav">
              <button type="button" className="reader__flip" onClick={() => flip(-1)} aria-label="Previous issue">
                ← Prev
              </button>
              <span className="reader__count" aria-live="polite">
                {(shown ?? 0) + 1} / {projects.length}
              </span>
              <button type="button" className="reader__flip" onClick={() => flip(1)} aria-label="Next issue">
                Next →
              </button>
            </div>
          </footer>
        </div>
      )}
    </dialog>
  );
}
