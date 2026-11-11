import { useEffect, useState } from 'react';
import { ScrollTrigger } from '../lib/gsap';
import { CHAPTERS, SITE, type ChapterId } from '../content/site';
import { useSound } from '../sound/SoundController';
import { IconSound } from './Doodles';
import { burstPoints } from '../lib/motion';
import './ChapterNav.css';

const BADGE = burstPoints(10, 5, 0.74, 0.08);

/**
 * Chapter navigation, styled as the masthead and bookmark tabs of the comic.
 * Driven entirely by CHAPTERS, so new chapters appear here when they ship.
 */
export function ChapterNav() {
  const [active, setActive] = useState<ChapterId>(CHAPTERS[0].id);
  const [solid, setSolid] = useState(false);
  const { enabled, toggle, play } = useSound();

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
      <a className="nav__logo" href={`#${CHAPTERS[0].id}`} onClick={() => play('page')} aria-label="Krishyangi, back to the cover">
        <span className="nav__badge" aria-hidden="true">
          <svg viewBox="-6 -6 112 112">
            <polygon points={BADGE} />
          </svg>
          <span>K!</span>
        </span>
        <span className="nav__masthead" aria-hidden="true">
          <b>The Living Comic Book</b>
          <small>
            Issue {SITE.issue} · {SITE.issueDate}
          </small>
        </span>
      </a>


      <button
        type="button"
        className="nav__sound"
        aria-pressed={enabled}
        onClick={toggle}
        title={enabled ? 'Sound effects on' : 'Sound effects off'}
      >
        <IconSound on={enabled} />
        <span className="nav__sound-label">SFX {enabled ? 'on' : 'off'}</span>
        <span className="sr-only">Toggle comic sound effects</span>
      </button>
    </header>
      <nav className={`nav__chapters ${solid ? 'is-solid' : ''}`} aria-label="Chapters">
        <ol>
          {CHAPTERS.map((c) => (
            <li key={c.id}>
              <a
                href={`#${c.id}`}
                className="nav__tab"
                aria-current={active === c.id ? 'location' : undefined}
                onClick={() => play('page')}
              >
                <span className="nav__num">{c.num}</span>
                <span className="nav__label">{c.label}</span>
                <span className="sr-only"> — {c.title}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
