import { useCallback, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap';
import { EASE } from '../lib/motion';
import { PROJECTS, type Project } from '../content/projects';
import { Character } from '../character/Character';
import { useCharacterController } from '../character/useCharacterController';
import { SpeechBubble } from '../components/SpeechBubble';
import { ChapterEdge, ChapterSplash } from '../components/Chapter';
import { CoverArt } from '../components/CoverArt';
import { IssueReader } from './IssueReader';
import { useReducedMotion, hasFinePointer } from '../hooks/useReducedMotion';
import './Projects.css';

const coverVars = (p: Project) =>
  ({
    '--cv-bg': p.palette.bg,
    '--cv-accent': p.palette.accent,
    '--cv-ink': p.palette.ink,
    '--cv-paper': p.palette.paper,
  }) as CSSProperties;

function CoverCard({
  project,
  index,
  onOpen,
  onLinger,
}: {
  project: Project;
  index: number;
  onOpen: (i: number, el: HTMLElement) => void;
  onLinger: (p: Project) => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const linger = useRef<number>();

  // tilt toward the cursor (CSS variables, no React re-render)
  const move = (e: PointerEvent<HTMLButtonElement>) => {
    const el = ref.current;
    if (!el || !hasFinePointer()) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--tx', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
    el.style.setProperty('--ty', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
  };
  const enter = () => {
    window.clearTimeout(linger.current);
    linger.current = window.setTimeout(() => onLinger(project), 650);
  };
  const leave = () => {
    window.clearTimeout(linger.current);
    ref.current?.style.setProperty('--tx', '0');
    ref.current?.style.setProperty('--ty', '0');
  };

  return (
    <button
      ref={ref}
      type="button"
      className={`cover cover--v${project.layout}`}
      style={coverVars(project)}
      onClick={() => ref.current && onOpen(index, ref.current)}
      onPointerMove={move}
      onPointerEnter={enter}
      onPointerLeave={leave}
      onFocus={enter}
      onBlur={leave}
      aria-haspopup="dialog"
      aria-label={`Issue ${project.issue}: ${project.title}. ${project.subtitle}. Open the issue.`}
    >
      <span className="cover__inner">
        <span className="cover__mast">
          <span className="cover__brand">The Living Comic Book presents</span>
          <span className="cover__issue">{project.issue}</span>
        </span>
        <span className="cover__title">{project.title}</span>
        <span className="cover__subtitle">{project.subtitle}</span>
        <span className="cover__art">
          <CoverArt art={project.art} />
        </span>
        <span className="cover__genre">{project.genre}</span>
        <span className="cover__badge">{project.team ? 'Team-up!' : 'Solo issue'}</span>
        <span className="cover__sfx" aria-hidden="true">
          {project.sfx}
        </span>
        <span className="cover__shine" aria-hidden="true" />
        <span className="cover__open" aria-hidden="true">
          Read issue →
        </span>
      </span>
    </button>
  );
}

/**
 * CHAPTER 03 — THE HALL OF EXPERIMENTS
 * A rack of comic issues, one per project. Hover tilts and wakes the cover,
 * lingering makes her comment, clicking opens the issue like a real comic.
 */
export function Projects() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const ctl = useCharacterController('idle', 'idle');
  const { say } = ctl;
  const [open, setOpen] = useState<number | null>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const commented = useRef(new Set<string>());
  const lastComment = useRef(0);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      // she greets the rack once
      ScrollTrigger.create({
        trigger: q('.shelf')[0],
        start: 'top 65%',
        once: true,
        onEnter: () => say({ text: 'Pick an issue. Any issue. (#001 is a good start.)', mood: 'mischief' }, { hold: 4200 }),
      });
      if (reduced) return;
      // covers land on the rack like they're being dealt
      const covers = q('.cover');
      gsap.set(covers, { opacity: 0, y: 80, rotation: (i: number) => (i % 2 ? 9 : -9), scale: 0.86 });
      ScrollTrigger.batch(covers, {
        start: 'top 88%',
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            rotation: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.12,
            ease: EASE.pop,
            clearProps: 'transform,opacity',
          }),
      });
      gsap.from(q('.shelf__narrator .char'), {
        xPercent: -40,
        opacity: 0,
        duration: 0.9,
        ease: EASE.settle,
        scrollTrigger: { trigger: q('.shelf')[0], start: 'top 75%', once: true },
      });
    },
    { scope: root, dependencies: [reduced] },
  );

  const onLinger = useCallback(
    (p: Project) => {
      const now = Date.now();
      // rare on purpose: once per issue, and never back-to-back
      if (commented.current.has(p.id) || now - lastComment.current < 3000) return;
      commented.current.add(p.id);
      lastComment.current = now;
      say({ text: p.aside, mood: p.team ? 'happy' : 'thinking' }, { hold: 3800 });
    },
    [say],
  );

  const onOpen = (i: number, el: HTMLElement) => {
    trigger.current = el;
    if (!reduced) {
      gsap.fromTo(el, { scale: 1 }, { scale: 1.06, rotationY: -18, duration: 0.22, ease: 'power2.in', yoyo: true, repeat: 1, clearProps: 'transform' });
    }
    setOpen(i);
  };

  const onClose = () => {
    setOpen(null);
    trigger.current?.focus();
  };

  return (
    <section id="projects" ref={root} className="chapter chapter--dark chapter--projects" aria-labelledby="projects-title">
      <ChapterEdge variant="zigzag" />
      <div className="projects__spot" aria-hidden="true" />
      <ChapterSplash
        id="projects-title"
        issue="Chapter 03"
        words={['The', 'Hall', 'of', 'Experiments']}
        accent={1}
        aside="(every project has a story)"
        intro={
          <p>
            Three issues from the protagonist’s universe, each one a team-up with a different crew. Every cover opens into
            the full story: the problem, the plan, the gear and exactly which part she wrote.
          </p>
        }
      />

      <div className="shelf chapter__canvas">
        <aside className="shelf__narrator" aria-label="Narrator">
          <div className="shelf__sticky">
            <div className="shelf__bubble">
              <SpeechBubble speech={ctl.speech} tail="bottom-left" />
            </div>
            <Character
              ref={ctl.charRef}
              mood={ctl.mood}
              preload={['mischief', 'excited']}
              label="Krishyangi, your guide to the issues"
              sizes="(max-width: 1023px) 30vw, 20vw"
            />
            <p className="shelf__hint hand">hover to peek · click to read</p>
          </div>
        </aside>

        <ul className="shelf__rack">
          {PROJECTS.map((p, i) => (
            <li key={p.id} className="shelf__slot">
              <CoverCard project={p} index={i} onOpen={onOpen} onLinger={onLinger} />
            </li>
          ))}
        </ul>
      </div>

      <IssueReader projects={PROJECTS} index={open} onIndex={setOpen} onClose={onClose} coverVars={coverVars} />
    </section>
  );
}
