import { useRef } from 'react';
import { gsap, useGSAP } from '../lib/gsap';
import { EASE } from '../lib/motion';
import { SITE } from '../content/site';
import { useSound } from '../sound/SoundController';
import { writeFlag } from '../lib/storage';
import './ComicCover.css';

type Props = {
  /** cover has started to swing open: the hero can start performing */
  onOpen: () => void;
  /** cover is gone */
  onDone: () => void;
};

export const COVER_SEEN_KEY = 'lcb-cover-seen';

/**
 * SCENE 00: the visitor is handed the comic. The front cover swings open on
 * its spine to reveal the first page (the hero). Click / any key skips.
 */
export function ComicCover({ onOpen, onDone }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline>();
  const { play } = useSound();
  const opened = useRef(false);

  useGSAP(
    () => {
      const q = gsap.utils.selector(ref);
      const open = () => {
        if (opened.current) return;
        opened.current = true;
        writeFlag('session', COVER_SEEN_KEY, '1');
        play('page');
        onOpen();
      };

      const tl = gsap.timeline({ onComplete: onDone });
      tl.from(q('.cover__page'), { scale: 0.9, rotation: -2, opacity: 0, duration: 0.45, ease: EASE.settle })
        .from(q('.cover__masthead > *'), { y: -40, opacity: 0, stagger: 0.08, duration: 0.4, ease: EASE.pop }, 0.15)
        .from(q('.cover__hero'), { y: 80, opacity: 0, duration: 0.55, ease: EASE.settle }, 0.2)
        .from(q('.cover__rays'), { rotation: -30, scale: 0.6, opacity: 0, duration: 0.8, ease: EASE.settle }, 0.1)
        .from(q('.cover__blurb, .cover__price, .cover__strap'), { scale: 0.3, opacity: 0, stagger: 0.08, duration: 0.4, ease: EASE.pop }, 0.4)
        .from(q('.cover__skip'), { opacity: 0, duration: 0.3 }, 0.6)
        .addLabel('flip', '+=0.55')
        .call(open, [], 'flip')
        .to(q('.cover__page'), { rotationY: -104, duration: 1.0, ease: 'power3.in' }, 'flip')
        .to(q('.cover__shade'), { opacity: 0.75, duration: 1.0, ease: 'power2.in' }, 'flip')
        .to(q('.cover__backdrop'), { opacity: 0, duration: 0.5 }, 'flip')
        .to(ref.current, { autoAlpha: 0, duration: 0.2 }, '-=0.2');
      tlRef.current = tl;

      const skip = () => {
        if (tl.currentLabel() !== 'flip' && tl.time() < tl.labels.flip) tl.seek('flip');
        tl.timeScale(1.6);
      };
      window.addEventListener('keydown', skip, { once: true });
      window.addEventListener('wheel', skip, { once: true, passive: true });
      window.addEventListener('touchmove', skip, { once: true, passive: true });
      return () => {
        window.removeEventListener('keydown', skip);
        window.removeEventListener('wheel', skip);
        window.removeEventListener('touchmove', skip);
      };
    },
    { scope: ref },
  );

  const skipNow = () => {
    const tl = tlRef.current;
    if (!tl) return;
    if (tl.time() < tl.labels.flip) tl.seek('flip');
    tl.timeScale(1.6);
  };

  return (
    <div className="cover" ref={ref} onClick={skipNow}>
      <div className="cover__backdrop" />
      <div className="cover__book">
        <div className="cover__page">
          <div className="cover__rays" aria-hidden="true" />
          <div className="cover__halftone" aria-hidden="true" />
          <header className="cover__masthead">
            <span className="cover__title">The Living Comic Book</span>
            <span className="cover__issue">
              <small>Issue</small>
              {SITE.issue}
            </span>
          </header>
          <p className="cover__strap">
            {SITE.issueDate} · Starring {SITE.name} · Interactive edition
          </p>
          <img className="cover__hero" src="/character/idle.webp" alt="" width={743} height={1052} />
          <p className="cover__blurb">“Wait… is this thing alive?!”</p>
          <p className="cover__price">
            Free!
            <small>0¢</small>
          </p>
          <button type="button" className="cover__skip" onClick={skipNow}>
            Open the comic →
          </button>
          <div className="cover__shade" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
