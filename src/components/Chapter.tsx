import { useMemo, useRef, type ReactNode } from 'react';
import { gsap, useGSAP } from '../lib/gsap';
import { EASE, seeded } from '../lib/motion';
import { useReducedMotion } from '../hooks/useReducedMotion';
import './Chapter.css';

/** The top edge of a new page sliding over the previous one. */
export function ChapterEdge({ variant = 'torn', seed = 7 }: { variant?: 'torn' | 'zigzag' | 'wave'; seed?: number }) {
  const d = useMemo(() => {
    const rnd = seeded(seed);
    let p = 'M0 30 L0 18';
    if (variant === 'zigzag') {
      for (let x = 0, i = 0; x <= 100; x += 2.5, i++) p += ` L${x} ${i % 2 ? 6 : 18}`;
    } else if (variant === 'wave') {
      for (let x = 0; x <= 100; x += 1) p += ` L${x} ${(12 + Math.sin(x / 3.2) * 6).toFixed(2)}`;
    } else {
      for (let x = 0; x <= 100; x += 1.25) p += ` L${x} ${(6 + rnd() * 10).toFixed(2)}`;
    }
    return `${p} L100 30 Z`;
  }, [variant, seed]);
  return (
    <svg className="chapter__edge" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

type SplashProps = {
  id: string;
  /** e.g. "Issue #02" */
  issue: string;
  words: string[];
  /** index of the word set in the accent colour */
  accent?: number;
  aside?: string;
  intro?: ReactNode;
  className?: string;
};

/** Chapter title card: kicker, slammed-in headline, handwritten aside, intro. */
export function ChapterSplash({ id, issue, words, accent = 1, aside, intro, className = '' }: SplashProps) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      const q = gsap.utils.selector(ref);
      gsap
        .timeline({ scrollTrigger: { trigger: ref.current, start: 'top 82%', once: true } })
        .from(q('.splash__issue'), { x: -50, opacity: 0, duration: 0.5, ease: EASE.settle })
        .from(q('.splash__word-inner'), { yPercent: 115, rotation: 7, duration: 0.8, stagger: 0.09, ease: EASE.settle }, 0.1)
        .from(q('.splash__aside'), { opacity: 0, x: 24, duration: 0.5 }, 0.55)
        .from(q('.splash__underline path'), { strokeDashoffset: 1, duration: 0.6, ease: EASE.ink }, 0.7)
        .from(q('.splash__intro'), { y: 28, opacity: 0, duration: 0.6, ease: EASE.settle }, 0.45);
    },
    { scope: ref, dependencies: [reduced] },
  );

  return (
    <header ref={ref} className={`splash ${className}`}>
      <p className="splash__issue caption caption--ink">{issue}</p>
      <h2 id={id} className="splash__title">
        {words.map((w, i) => (
          <span key={`${w}-${i}`} className={`splash__word ${i === accent ? 'is-accent' : ''}`}>
            <span className="splash__word-inner">{w}</span>
          </span>
        ))}
      </h2>
      {aside && (
        <p className="splash__aside hand">
          {aside}
          <svg className="splash__underline" viewBox="0 0 200 16" aria-hidden="true">
            <path d="M3 10 C 50 3, 120 15, 197 6" pathLength={1} />
          </svg>
        </p>
      )}
      {intro && <div className="splash__intro">{intro}</div>}
    </header>
  );
}

/** Placeholder chip for genuinely missing information. */
export function Todo({ children }: { children: string }) {
  return <span className="placeholder">{children}</span>;
}
