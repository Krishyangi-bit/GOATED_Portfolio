import { forwardRef, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { gsap } from '../lib/gsap';
import { EASE } from '../lib/motion';
import { useReducedMotion } from '../hooks/useReducedMotion';
import type { Speech } from '../character/useCharacterController';
import './SpeechBubble.css';

export type Tail = 'bottom-left' | 'bottom-right' | 'left' | 'right' | 'top-left' | 'top-right';

type BubbleProps = {
  tail?: Tail;
  variant?: 'speech' | 'thought' | 'shout';
  className?: string;
  children: ReactNode;
};

/** Static comic bubble. Animated by whatever contains it (panels, SpeechBubble). */
export const Bubble = forwardRef<HTMLDivElement, BubbleProps>(function Bubble(
  { tail = 'bottom-left', variant = 'speech', className = '', children },
  ref,
) {
  return (
    <div ref={ref} className={`bubble bubble--${variant} ${className}`} data-tail={tail}>
      <div className="bubble__body">{children}</div>
      {variant === 'thought' ? (
        <span className="bubble__dots" aria-hidden="true">
          <i />
          <i />
        </span>
      ) : (
        <svg className="bubble__tail" viewBox="0 0 40 36" aria-hidden="true">
          <path className="bubble__tail-fill" d="M1 0 C 12 12, 9 25, 1 35 C 19 29, 30 17, 39 0 Z" />
          <path className="bubble__tail-line" d="M1 0 C 12 12, 9 25, 1 35 C 19 29, 30 17, 39 0" />
        </svg>
      )}
    </div>
  );
});

const ORIGINS: Record<Tail, string> = {
  'bottom-left': '18% 115%',
  'bottom-right': '82% 115%',
  'top-left': '18% -15%',
  'top-right': '82% -15%',
  left: '-8% 60%',
  right: '108% 60%',
};

type SpeechBubbleProps = {
  speech: Speech;
  tail?: Tail;
  className?: string;
};

/**
 * Dialogue bubble driven by the CharacterController.
 * Pops out of its tail, reveals word by word, and announces the full line
 * to screen readers through a polite live region.
 */
export function SpeechBubble({ speech, tail = 'bottom-left', className = '' }: SpeechBubbleProps) {
  const [shown, setShown] = useState<Speech>(speech);
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  // closing: animate out, then unmount
  useLayoutEffect(() => {
    if (speech) {
      setShown(speech);
      return;
    }
    const el = ref.current;
    if (!el) {
      setShown(null);
      return;
    }
    gsap.killTweensOf(el);
    gsap.to(el, {
      scale: 0.6,
      opacity: 0,
      duration: reduced ? 0.01 : 0.18,
      ease: 'power2.in',
      onComplete: () => setShown(null),
    });
  }, [speech, reduced]);

  // opening / changing line
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !shown) return;
    gsap.killTweensOf(el);
    const words = el.querySelectorAll('.bubble__word');
    if (reduced) {
      gsap.set(el, { opacity: 1, scale: 1, rotation: 0 });
      gsap.set(words, { opacity: 1, y: 0 });
      return;
    }
    gsap.fromTo(
      el,
      { scale: 0.3, opacity: 0, rotation: -7, transformOrigin: ORIGINS[tail] },
      { scale: 1, opacity: 1, rotation: 0, duration: 0.55, ease: EASE.pop },
    );
    gsap.fromTo(
      words,
      { opacity: 0, y: 6 },
      { opacity: 1, y: 0, duration: 0.25, stagger: 0.035, delay: 0.12, ease: 'power2.out' },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown?.id, reduced]);

  return (
    <>
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {speech?.text ?? ''}
      </div>
      {shown && (
        <Bubble ref={ref} tail={tail} className={`bubble--live ${className}`}>
          <span aria-hidden="true">
            {shown.text.split(' ').map((w, i) => (
              <span key={`${shown.id}-${i}`} className="bubble__word">
                {w}{' '}
              </span>
            ))}
          </span>
        </Bubble>
      )}
    </>
  );
}
