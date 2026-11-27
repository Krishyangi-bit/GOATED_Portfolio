import { useEffect, useRef, useState } from 'react';
import { ScrollTrigger } from '../lib/gsap';
import { CHAPTERS, SITE, type ChapterId } from '../content/site';
import { burstPoints } from '../lib/motion';
import { setMuted, useMuted } from '../lib/softSound';
import { IconSound } from './Doodles';
import { PdfViewer, type PdfDoc } from './PdfViewer';
import './ChapterNav.css';

const BADGE = burstPoints(10, 5, 0.74, 0.08);

const RESUME: PdfDoc = { title: `${SITE.fullName} · Résumé`, src: SITE.resume, fileName: SITE.resumeFileName };

const IconResume = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 3h8l4 4v14H6z" />
    <path d="M14 3v4h4M9 12h6M9 16h6" strokeLinecap="round" />
  </svg>
);

/**
 * Chapter navigation, styled as the masthead and bookmark tabs of the comic.
 * Driven entirely by CHAPTERS, so new chapters appear here when they ship.
 */
export function ChapterNav() {
  const [active, setActive] = useState<ChapterId>(CHAPTERS[0].id);
  const [solid, setSolid] = useState(false);
  const muted = useMuted();
  const [resume, setResume] = useState<PdfDoc | null>(null);
  const strip = useRef<HTMLOListElement>(null);

  // on small screens the chips scroll sideways: keep the current chapter in view
  useEffect(() => {
    const ol = strip.current;
    const tab = ol?.querySelector<HTMLElement>('[aria-current]');
    if (!ol || !tab || ol.scrollWidth <= ol.clientWidth) return;
    ol.scrollTo({ left: tab.offsetLeft - ol.clientWidth / 2 + tab.offsetWidth / 2, behavior: 'smooth' });
  }, [active]);

  useEffect(() => {
    const triggers = CHAPTERS.slice(1).map((c, i) =>
      ScrollTrigger.create({
        trigger: `#${c.id}`,
        start: 'top 55%',
        onEnter: () => setActive(c.id),
        onLeaveBack: () => setActive(CHAPTERS[i].id),
      }),
    );
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      triggers.forEach((t) => t.kill());
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // the chapter tabs live outside the header so they can pin to the page edge
  return (
    <>
    <header className={`nav ${solid ? 'is-solid' : ''}`}>
      <a className="nav__logo" href={`#${CHAPTERS[0].id}`} aria-label="Krishyangi, back to the cover">
        <span className="nav__badge" aria-hidden="true">
          <svg viewBox="-6 -6 112 112">
            <polygon points={BADGE} />
          </svg>
          <span>K!</span>
        </span>
        <span className="nav__masthead" aria-hidden="true">
          <b>The Living Comic Book</b>
        </span>
      </a>

      <button
        type="button"
        className="nav__recruit"
        onClick={() => setResume(RESUME)}
        aria-haspopup="dialog"
        title="Recruiter mode: open the résumé"
      >
        <IconResume />
        <span className="nav__recruit-label">Recruiter mode</span>
        <span className="sr-only">Recruiter mode: open the résumé</span>
      </button>

      <button
        type="button"
        className="nav__sound"
        aria-pressed={!muted}
        onClick={() => setMuted(!muted)}
        title={muted ? 'Sound off: click to unmute' : 'Sound on: click to mute'}
      >
        <IconSound on={!muted} />
        <span className="nav__sound-label">{muted ? 'Muted' : 'Sound'}</span>
        <span className="sr-only">{muted ? 'Unmute sound' : 'Mute sound'}</span>
      </button>
    </header>
      <nav className={`nav__chapters ${solid ? 'is-solid' : ''}`} aria-label="Chapters">
        <ol ref={strip}>
          {CHAPTERS.map((c) => (
            <li key={c.id}>
              <a
                href={`#${c.id}`}
                className="nav__tab"
                aria-current={active === c.id ? 'location' : undefined}
              >
                <span className="nav__num">{c.num}</span>
                <span className="nav__label">{c.label}</span>
                <span className="sr-only"> — {c.title}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
      <PdfViewer doc={resume} onClose={() => setResume(null)} />
    </>
  );
}
