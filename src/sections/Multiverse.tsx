import { useRef, type CSSProperties, type ReactNode } from 'react';
import { gsap, useGSAP } from '../lib/gsap';
import { EASE } from '../lib/motion';
import { SITE } from '../content/site';
import { ChapterEdge, ChapterSplash } from '../components/Chapter';
import { IconGithub, IconLinkedin } from '../components/Doodles';
import { useReducedMotion } from '../hooks/useReducedMotion';
import './Multiverse.css';

const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3.5 6 8.5 7 8.5-7" />
  </svg>
);
const IconCode = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m8 7-5 5 5 5M16 7l5 5-5 5" />
  </svg>
);

type Portal = {
  id: string;
  name: string;
  dimension: string;
  href: string | null;
  handle: string;
  icon: ReactNode;
  colors: [string, string];
  external: boolean;
};

const PORTALS: Portal[] = [
  {
    id: 'github',
    name: 'GitHub',
    dimension: 'Dimension of code',
    href: SITE.links.github,
    handle: '@Krishyangi-bit',
    icon: <IconGithub />,
    colors: ['#3fb950', '#16131c'],
    external: true,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    dimension: 'Professional plane',
    href: SITE.links.linkedin,
    handle: 'Krishyangi Dixit',
    icon: <IconLinkedin />,
    colors: ['#2f7de1', '#0e1a4f'],
    external: true,
  },
  {
    id: 'email',
    name: 'Email',
    dimension: 'The inbox realm',
    href: `mailto:${SITE.email}`,
    handle: SITE.email,
    icon: <IconMail />,
    colors: ['#f07a2e', '#c4521a'],
    external: false,
  },
  {
    id: 'leetcode',
    name: 'LeetCode',
    dimension: 'Puzzle dimension',
    href: SITE.links.leetcode,
    handle: SITE.links.leetcode ? 'Problem solving' : 'Portal under construction',
    icon: <IconCode />,
    colors: ['#ffd23f', '#c4521a'],
    external: true,
  },
];

/**
 * CHAPTER 06 — THE MULTIVERSE
 * Every portal is a different dimension of her online life. Hover spins the
 * portal up; clicking flashes it open (and really opens the destination).
 */
export function Multiverse() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      const q = gsap.utils.selector(root);
      gsap.from(q('.portal'), {
        scale: 0.2,
        rotation: -180,
        opacity: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: EASE.pop,
        scrollTrigger: { trigger: q('.portals')[0], start: 'top 80%', once: true },
      });
    },
    { scope: root, dependencies: [reduced] },
  );

  const warp = (el: HTMLElement) => {
    if (reduced) return;
    gsap.fromTo(el.querySelector('.portal__flash'), { opacity: 0.95, scale: 0.3 }, { opacity: 0, scale: 2.2, duration: 0.6, ease: 'power2.out' });
    gsap.fromTo(el.querySelector('.portal__ring'), { rotation: 0 }, { rotation: 540, duration: 0.8, ease: 'power3.out' });
  };

  return (
    <section id="multiverse" ref={root} className="chapter chapter--dark chapter--multiverse" aria-labelledby="multiverse-title">
      <ChapterEdge variant="zigzag" />
      <div className="multiverse__stars" aria-hidden="true" />
      <ChapterSplash
        id="multiverse-title"
        issue="Chapter 06"
        words={['The', 'Multiverse']}
        accent={1}
        aside="(find me in other dimensions)"
        intro={<p>Same protagonist, different universes. Step through any portal — they all open in a new tab, so this comic stays right where you left it.</p>}
      />

      <ul className="portals chapter__canvas">
        {PORTALS.map((p) => {
          const style = { '--p1': p.colors[0], '--p2': p.colors[1] } as CSSProperties;
          const body = (
            <>
              <span className="portal__ring" aria-hidden="true" />
              <span className="portal__core">
                <span className="portal__icon">{p.icon}</span>
              </span>
              <span className="portal__flash" aria-hidden="true" />
              <span className="portal__text">
                <span className="portal__dimension">{p.dimension}</span>
                <strong className="portal__name">{p.name}</strong>
                <span className="portal__handle">{p.handle}</span>
              </span>
            </>
          );
          return (
            <li key={p.id} className="portals__slot">
              {p.href ? (
                <a
                  className={`portal portal--${p.id}`}
                  style={style}
                  href={p.href}
                  onClick={(e) => warp(e.currentTarget)}
                  {...(p.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  {body}
                  {p.external && <span className="sr-only"> (opens in a new tab)</span>}
                </a>
              ) : (
                <div className={`portal portal--${p.id} is-closed`} style={style} aria-disabled="true">
                  {body}
                  <span className="portal__tape" aria-hidden="true">
                    Under construction
                  </span>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
