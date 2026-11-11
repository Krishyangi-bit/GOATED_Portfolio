import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { EASE } from '../lib/motion';
import { SITE } from '../content/site';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { Burst } from './Burst';
import { ComicButton } from './ComicButton';
import { IconGithub } from './Doodles';
import './SecretPanel.css';

/**
 * Hidden comic panel #00 — unlocked by typing "bam".
 * Uses a native <dialog>, so focus handling and Esc come for free.
 */
export function SecretPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      if (!reduced) {
        gsap.fromTo(d.querySelector('.secret__panel'), { scale: 0.3, rotation: -12, opacity: 0 }, { scale: 1, rotation: -1.5, opacity: 1, duration: 0.6, ease: EASE.impact });
        gsap.fromTo(d.querySelector('.secret__bam'), { scale: 0, rotation: 30 }, { scale: 1, rotation: -10, duration: 0.5, delay: 0.2, ease: EASE.impact });
      }
    }
    if (!open && d.open) d.close();
  }, [open, reduced]);

  return (
    <dialog
      ref={ref}
      className="secret"
      aria-labelledby="secret-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="secret__panel">
        <Burst className="secret__bam" text="BAM!" color="var(--red)" spikes={15} seed={3} />
        <p className="caption">Secret panel #00</p>
        <h2 id="secret-title" className="secret__title">
          You found it!
        </h2>
        <p className="secret__text">
          Real fact, unlocked: there’s an ASCII-art <strong>Shinchan</strong> living in my GitHub profile README. He types
          himself out. Go say hi.
        </p>
        <div className="secret__actions">
          <ComicButton variant="ink" href={SITE.links.github} external icon={<IconGithub />}>
            Visit the README
          </ComicButton>
          <button type="button" className="secret__close" onClick={onClose}>
            Close panel ✕
          </button>
        </div>
      </div>
    </dialog>
  );
}
