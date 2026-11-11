import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap';
import { EASE } from '../lib/motion';
import { useReducedMotion } from '../hooks/useReducedMotion';
import './ComicPanel.css';

export type From = 'left' | 'right' | 'top' | 'bottom' | 'center';
type Pt = [number, number];

const RECT: Pt[] = [
  [0, 0],
  [100, 0],
  [100, 100],
  [0, 100],
];

const collapse = (pts: Pt[], from: From): Pt[] =>
  pts.map(([x, y]) => {
    switch (from) {
      case 'left':
        return [0, y];
      case 'right':
        return [100, y];
      case 'top':
        return [x, 0];
      case 'bottom':
        return [x, 100];
      default:
        return [50 + (x - 50) * 0.04, 50 + (y - 50) * 0.04];
    }
  });

const toClip = (pts: Pt[]) => `polygon(${pts.map(([x, y]) => `${x}% ${y}%`).join(', ')})`;

type Props = {
  /** panel outline as percentage points — slightly irregular shapes read as hand-ruled */
  shape?: Pt[];
  /** direction the panel wipes open from */
  from?: From;
  /** background tone class, e.g. "tone-orange" */
  tone?: string;
  /** small caption tab, e.g. "Panel 01 — The Beginning" */
  label?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  /** content allowed to break out of the frame (heads popping over the border) */
  breakout?: ReactNode;
  /** fired once the panel has opened on screen — use it to cue the character */
  onReveal?: () => void;
  headingId?: string;
};

/**
 * ComicPanel: an ink-ruled frame that draws its border, wipes its art open
 * from one side, then lands its contents in reading order:
 *   [data-reveal] slides up · [data-pop] springs in · [data-sfx] stamps down
 *   [data-depth="0.4"] parallaxes while the panel scrolls past
 */
export function ComicPanel({
  shape = RECT,
  from = 'left',
  tone = '',
  label,
  className = '',
  style,
  children,
  breakout,
  onReveal,
  headingId,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const reduced = useReducedMotion();
  const onRevealRef = useRef(onReveal);
  onRevealRef.current = onReveal;

  // the ink line is drawn in real pixels so the stroke stays even on any panel size
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize((s) => (Math.abs(s.w - width) < 0.5 && Math.abs(s.h - height) < 0.5 ? s : { w: width, h: height }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const q = gsap.utils.selector(root);
      const clip = q('.panel__clip');
      const line = q('.panel__line');
      const shadow = q('.panel__shadow');
      const reveals = q('[data-reveal]');
      const pops = q('[data-pop]');
      const sfx = q('[data-sfx]');

      if (reduced) {
        ScrollTrigger.create({ trigger: root, start: 'top 80%', once: true, onEnter: () => onRevealRef.current?.() });
        return;
      }

      gsap.set(clip, { clipPath: toClip(collapse(shape, from)) });
      gsap.set(line, { strokeDashoffset: 1 });
      gsap.set(shadow, { opacity: 0 });
      gsap.set(reveals, { opacity: 0, y: 28 });
      gsap.set(pops, { opacity: 0, scale: 0.4 });
      gsap.set(sfx, { opacity: 0, scale: 2.4 });

      const tl = gsap.timeline({ paused: true });
      tl.to(line, { strokeDashoffset: 0, duration: 0.75, ease: EASE.ink }, 0)
        .to(clip, { clipPath: toClip(shape), duration: 0.85, ease: EASE.ink }, 0.08)
        .to(shadow, { opacity: 1, duration: 0.35 }, 0.55)
        .to(reveals, { opacity: 1, y: 0, duration: 0.6, stagger: 0.09, ease: EASE.settle }, 0.45)
        .to(pops, { opacity: 1, scale: 1, duration: 0.55, stagger: 0.12, ease: EASE.pop }, 0.7)
        .to(sfx, { opacity: 1, scale: 1, duration: 0.45, stagger: 0.1, ease: EASE.impact }, 0.8)
        .call(() => onRevealRef.current?.(), [], 0.65);

      ScrollTrigger.create({ trigger: root, start: 'top 78%', once: true, onEnter: () => tl.play() });

      q('[data-depth]').forEach((el) => {
        const d = Number((el as HTMLElement).dataset.depth) || 0;
        gsap.fromTo(
          el,
          { y: d * 70 },
          { y: -d * 70, ease: 'none', scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: 0.6 } },
        );
      });
    },
    { scope: ref, dependencies: [reduced] },
  );

  const { w, h } = size;
  const px = shape.map(([x, y]) => `${((x / 100) * w).toFixed(1)},${((y / 100) * h).toFixed(1)}`).join(' ');

  return (
    <article
      ref={ref}
      className={`panel ${tone} ${className}`}
      style={style}
      aria-labelledby={headingId}
    >
      <svg className="panel__shadow" width={w || 1} height={h || 1} aria-hidden="true">
        {w > 0 && <polygon points={px} />}
      </svg>
      <div className="panel__clip" style={{ clipPath: toClip(shape) }}>
        {children}
      </div>
      <svg className="panel__border" width={w || 1} height={h || 1} aria-hidden="true">
        <polygon className="panel__line" points={w > 0 ? px : '0,0'} pathLength={1} />
      </svg>
      {breakout}
      {label && (
        <p className="panel__tab caption" data-pop>
          {label}
        </p>
      )}
    </article>
  );
}
