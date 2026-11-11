import { useMemo, useRef, useState } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap';
import { EASE, seeded } from '../lib/motion';
import { ORIGIN } from '../content/origin';
import { SITE } from '../content/site';
import { DIALOGUE } from '../content/dialogue';
import { Character, type CharacterHandle } from '../character/Character';
import { useCharacterController } from '../character/useCharacterController';
import type { Mood } from '../character/poses';
import { ComicPanel } from '../components/ComicPanel';
import { Bubble, SpeechBubble } from '../components/SpeechBubble';
import { ComicButton } from '../components/ComicButton';
import { Burst } from '../components/Burst';
import { RaspberryPi } from '../components/RaspberryPi';
import { SpeedPeek } from '../components/SpeedPeek';
import { Doodle, IconChip, IconCode, IconEye, IconGithub, IconLinkedin } from '../components/Doodles';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useSound } from '../sound/SoundController';
import './About.css';

const WORLD_ICONS = { software: <IconCode />, ai: <IconEye />, hardware: <IconChip /> } as const;

/** Torn top edge of the page that slides over the cover. */
function TornEdge() {
  const d = useMemo(() => {
    const rnd = seeded(42);
    let p = 'M0 30 L0 16';
    for (let x = 0; x <= 100; x += 1.25) p += ` L${x} ${(6 + rnd() * 10).toFixed(2)}`;
    return `${p} L100 30 Z`;
  }, []);
  return (
    <svg className="origin__edge" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

function Placeholder({ children }: { children: string }) {
  return <span className="placeholder">{children}</span>;
}

/**
 * ACT 02 — THE ORIGIN STORY
 * A page of six panels read top-left to bottom-right. Each panel draws itself,
 * then cues the character to react to what the panel is about.
 */
export function About() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { play } = useSound();

  // per-panel character moods: each starts neutral and reacts on reveal
  const [p2, setP2] = useState<Mood>('idle');
  const [p4, setP4] = useState<Mood>('idle');
  const [p5, setP5] = useState<Mood>('idle');
  const p4Ref = useRef<CharacterHandle>(null);
  const p5Ref = useRef<CharacterHandle>(null);
  const finale = useCharacterController('idle', 'wave');
  const finaleShown = useRef(false);
  const endSaid = useRef(false);

  const edu = ORIGIN.beginning.education;

  // --- splash heading + scroll-driven pieces -------------------------------
  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      if (!reduced) {
        gsap
          .timeline({ scrollTrigger: { trigger: q('.origin__splash')[0], start: 'top 82%', once: true } })
          .from(q('.origin__chapter'), { x: -50, opacity: 0, duration: 0.5, ease: EASE.settle })
          .from(q('.origin__word-inner'), { yPercent: 110, rotation: 6, duration: 0.8, stagger: 0.1, ease: EASE.settle }, 0.1)
          .from(q('.origin__aside'), { opacity: 0, x: 20, duration: 0.5 }, 0.6)
          .from(q('.origin__underline path'), { strokeDashoffset: 1, duration: 0.6, ease: EASE.ink }, 0.75)
          .from(q('.origin__intro'), { y: 30, opacity: 0, duration: 0.6, ease: EASE.settle }, 0.5);

        // the page itself tilts flat as it slides over the cover
        gsap.fromTo(
          root.current,
          { rotation: 1.6, transformOrigin: '0% 0%' },
          {
            rotation: 0,
            ease: 'none',
            scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'top 15%', scrub: 0.5 },
          },
        );
      }

      // the evolution track fills as you read it
      const evo = q('.evo')[0];
      const nodes = q('.evo__node');
      if (evo) {
        ScrollTrigger.create({
          trigger: evo,
          start: 'top 78%',
          end: 'bottom 60%',
          scrub: reduced ? false : 0.4,
          onUpdate: (self) => {
            const p = reduced ? 1 : self.progress;
            evo.style.setProperty('--evo-progress', String(p));
            nodes.forEach((n, i) => n.classList.toggle('is-on', p >= i / Math.max(1, nodes.length - 1) - 0.04));
          },
          onToggle: (self) => {
            if (reduced && self.isActive) {
              evo.style.setProperty('--evo-progress', '1');
              nodes.forEach((n) => n.classList.add('is-on'));
            }
          },
        });
      }

      // reaching the end of the issue
      ScrollTrigger.create({
        trigger: q('.origin__end')[0],
        start: 'top 92%',
        onEnter: () => {
          if (finaleShown.current && !endSaid.current) {
            endSaid.current = true;
            window.setTimeout(() => finale.say(DIALOGUE.theEnd, { hold: 5200 }), 900);
          }
        },
      });
    },
    { scope: root, dependencies: [reduced] },
  );

  // --- panel cues ------------------------------------------------------------
  const typeTerminal = () => {
    const lines = root.current?.querySelectorAll<HTMLElement>('.term__text');
    if (!lines?.length) return;
    if (reduced) {
      gsap.set(lines, { width: 'auto' });
      return;
    }
    const tl = gsap.timeline({ delay: 0.2 });
    lines.forEach((el) => {
      const n = Number(el.dataset.chars) || 10;
      tl.fromTo(el, { width: '0ch' }, { width: `${n}ch`, duration: Math.min(1.1, n * 0.035), ease: `steps(${n})` }, '+=0.12');
    });
  };

  const fzzt = () => {
    setP4('surprised');
    play('bam');
    window.setTimeout(() => p4Ref.current?.shake(), 120);
  };

  const levelUp = () => {
    setP5('excited');
    window.setTimeout(() => p5Ref.current?.hop(), 150);
  };

  const continued = () => {
    finaleShown.current = true;
    finale.say({ ...DIALOGUE.arrival, text: ORIGIN.continued.bubble, mood: 'greeting', action: 'wave' }, { hold: 9000, stay: true });
  };

  return (
    <section id="origin" className="origin" ref={root} aria-labelledby="origin-title">
      <TornEdge />

      <header className="origin__splash">
        <p className="origin__chapter caption caption--ink">Chapter 02</p>
        <h2 id="origin-title" className="origin__title">
          {['The', 'Origin', 'Story'].map((w) => (
            <span key={w} className="origin__word">
              <span className="origin__word-inner">{w}</span>
            </span>
          ))}
        </h2>
        <p className="origin__aside hand">
          (behind the character)
          <svg className="origin__underline" viewBox="0 0 200 16" aria-hidden="true">
            <path d="M3 10 C 50 3, 120 15, 197 6" pathLength={1} />
          </svg>
        </p>
        <p className="origin__intro">{ORIGIN.intro}</p>
      </header>

      <div className="origin__grid">
        {/* PANEL 01 — THE BEGINNING ---------------------------------------- */}
        <ComicPanel
          className="p1"
          tone="tone-orange"
          from="left"
          label="Panel 01 — The Beginning"
          headingId="p1-h"
          shape={[
            [0, 0],
            [100, 1.5],
            [98.8, 100],
            [0.6, 97.5],
          ]}
          breakout={
            <div className="p1__char" data-reveal>
              <Character mood="idle" label="Krishyangi" sizes="(max-width: 639px) 50vw, 26vw" />
            </div>
          }
        >
          <div className="p1__art" aria-hidden="true" data-depth="0.25" />
          <div className="p1__copy">
            <h3 id="p1-h" className="caption caption--ink p1__meet" data-reveal>
              {ORIGIN.beginning.lines[0]}
            </h3>
            <p className="caption p1__line" data-reveal>
              {ORIGIN.beginning.lines[1]}
            </p>
            <div className="p1__edu" data-reveal>
              <span className="p1__edu-label">Education</span>
              <span>
                {edu.degree ?? <Placeholder>degree</Placeholder>}
                {' · '}
                {edu.institution ?? <Placeholder>college / university</Placeholder>}
                {' · '}
                {edu.years ?? <Placeholder>years</Placeholder>}
              </span>
            </div>
          </div>
          <div className="p1__bubble" data-pop>
            <Bubble tail="top-right">{ORIGIN.beginning.motto}</Bubble>
          </div>
        </ComicPanel>

        {/* PANEL 02 — THE CURIOSITY ----------------------------------------- */}
        <ComicPanel
          className="p2"
          tone="tone-teal"
          from="right"
          label="Panel 02 — The Curiosity"
          headingId="p2-h"
          shape={[
            [1.5, 1],
            [100, 0],
            [99, 98.5],
            [0, 100],
          ]}
          onReveal={() => setP2('thinking')}
        >
          <div className="p2__halo" aria-hidden="true" data-depth="0.3" />
          <h3 id="p2-h" className="sr-only">
            {ORIGIN.curiosity.title}
          </h3>
          <div className="p2__thought" data-pop>
            <Bubble variant="thought">{ORIGIN.curiosity.thought}</Bubble>
          </div>
          <ul className="p2__worlds" aria-label="Three worlds she works across">
            {ORIGIN.curiosity.worlds.map((w) => (
              <li key={w.key} className={`p2__world p2__world--${w.key}`} data-pop>
                <span className="p2__world-icon">{WORLD_ICONS[w.key as keyof typeof WORLD_ICONS]}</span>
                {w.label}
              </li>
            ))}
          </ul>
          <div className="p2__char">
            <Character mood={p2} preload={['mischief']} label="Krishyangi" sizes="(max-width: 639px) 70vw, 30vw" />
          </div>
          <p className="p2__caption caption" data-reveal>
            {ORIGIN.curiosity.caption}
          </p>
        </ComicPanel>

        {/* PANEL 03 — THE FIRST LINE OF CODE ---------------------------------- */}
        <ComicPanel
          className="p3"
          tone="tone-ink"
          from="top"
          label="Panel 03 — The First Line of Code"
          headingId="p3-h"
          shape={[
            [0, 1.5],
            [100, 0],
            [98.5, 100],
            [1, 98],
          ]}
          onReveal={typeTerminal}
        >
          <div className="p3__grid" aria-hidden="true" />
          <h3 id="p3-h" className="caption p3__caption" data-reveal>
            {ORIGIN.firstCode.caption}
          </h3>
          <div className="term" data-reveal>
            <div className="term__bar" aria-hidden="true">
              <i />
              <i />
              <i />
              <span>~/origin-story</span>
            </div>
            <div className="term__body">
              {ORIGIN.firstCode.terminal.map((l, i) => (
                <div key={i} className={`term__line ${l.prompt ? 'is-cmd' : ''}`}>
                  <span className="term__prompt" aria-hidden="true">
                    {l.prompt ? '$' : '›'}
                  </span>
                  <span className="term__text" data-chars={l.text.length}>
                    {l.text}
                  </span>
                </div>
              ))}
              <span className="term__cursor" aria-hidden="true" />
            </div>
          </div>
          <p className="p3__note hand" data-reveal>
            ↑ {ORIGIN.firstCode.note}
          </p>
          <span className="p3__sfx" data-sfx aria-hidden="true">
            CLICK!
          </span>
        </ComicPanel>

        {/* PANEL 04 — THE FIRST BUG ------------------------------------------ */}
        <ComicPanel
          className="p4"
          tone="tone-red"
          from="right"
          label="Panel 04 — The First Bug"
          headingId="p4-h"
          shape={[
            [5, 0],
            [100, 3],
            [100, 100],
            [0, 96],
          ]}
          onReveal={fzzt}
        >
          <div className="p4__burst" aria-hidden="true" data-depth="0.35">
            <Burst text="" color="var(--yellow)" spikes={18} seed={9} />
          </div>
          <h3 id="p4-h" className="caption caption--cream p4__setup" data-reveal>
            {ORIGIN.firstBug.setup}
          </h3>
          <div className="p4__pi" data-pop>
            <RaspberryPi />
            <p className="p4__label hand" aria-hidden="true">
              
              ↑ the missing voltage divider
            </p>
          </div>
          <span className="p4__sfx" data-sfx aria-hidden="true">
            {ORIGIN.firstBug.sfx}
          </span>
          <div className="p4__char">
            <Character ref={p4Ref} mood={p4} preload={['confused']} label="Krishyangi" sizes="(max-width: 639px) 60vw, 26vw" />
          </div>
          <div className="p4__bubble" data-pop>
            <Bubble tail="bottom-right">{ORIGIN.firstBug.bubble}</Bubble>
          </div>
          <p className="p4__moral caption" data-reveal>
            {ORIGIN.firstBug.moral}
          </p>
        </ComicPanel>

        {/* PANEL 05 — THE EVOLUTION ------------------------------------------- */}
        <ComicPanel
          className="p5"
          tone="tone-cobalt"
          from="bottom"
          label="Panel 05 — The Evolution"
          headingId="p5-h"
          shape={[
            [0, 2],
            [100, 0],
            [99.3, 100],
            [0.5, 98.5],
          ]}
          onReveal={levelUp}
        >
          <div className="p5__speed" aria-hidden="true" data-depth="0.2" />
          <div className="p5__head">
            <h3 id="p5-h" className="p5__title" data-reveal>
              {ORIGIN.evolution.caption}
            </h3>
          </div>
          <ol className="evo">
            <li className="evo__track" aria-hidden="true">
              <span className="evo__fill" />
            </li>
            {ORIGIN.evolution.milestones.map((m, i) => (
              <li key={m.what} className="evo__node" style={{ ['--i' as string]: i }}>
                <span className="evo__dot" aria-hidden="true" />
                <span className="evo__when">{m.when}</span>
                <strong className="evo__what">{m.what}</strong>
                <span className="evo__detail">{m.detail}</span>
              </li>
            ))}
          </ol>
          <div className="p5__now" data-reveal>
            <span className="p5__now-label">{ORIGIN.evolution.now.label}</span>
            <ul>
              {ORIGIN.evolution.now.items.map((it) => (
                <li key={it}>{it}</li>
              ))}
            </ul>
          </div>
          <div className="p5__char">
            <Character ref={p5Ref} mood={p5} preload={['excited']} label="Krishyangi" sizes="(max-width: 639px) 40vw, 18vw" />
          </div>
          <span className="p5__sfx" data-sfx aria-hidden="true">
            LEVEL UP!
          </span>
        </ComicPanel>

        {/* CHARACTER FILE ---------------------------------------------------------- */}
        <ComicPanel
          className="pf"
          tone="tone-cream"
          from="left"
          label="Classified — Character File"
          headingId="pf-h"
          shape={[
            [0, 0],
            [100, 1],
            [98.6, 100],
            [1, 98.4],
          ]}
        >
          <div className="file">
            <div className="file__head" data-reveal>
              <img className="file__photo" src="/character/mischief-sm.webp" alt="Krishyangi, smirking" width={416} height={589} loading="lazy" />
              <div>
                <h3 id="pf-h" className="file__name">
                  {SITE.fullName}
                </h3>
                <p className="file__role">Protagonist · Issue {SITE.issue}</p>
              </div>
              <span className="file__stamp" data-sfx aria-hidden="true">
                Approved
              </span>
            </div>
            <dl className="file__rows">
              {ORIGIN.file.rows.map((r) => (
                <div key={r.k} className="file__row" data-reveal>
                  <dt>{r.k}</dt>
                  <dd>{r.v}</dd>
                </div>
              ))}
              <div className="file__row" data-reveal>
                <dt>Off-duty interests</dt>
                <dd>
                  {ORIGIN.file.interests?.join(' · ') ?? <Placeholder>add hobbies &amp; interests</Placeholder>}
                </dd>
              </div>
            </dl>
          </div>
        </ComicPanel>

        {/* PANEL 06 — TO BE CONTINUED ---------------------------------------- */}
        <ComicPanel
          className="p6"
          tone="tone-pink"
          from="right"
          label="Panel 06 — To Be Continued"
          headingId="p6-h"
          shape={[
            [2, 0],
            [100, 2],
            [100, 100],
            [0, 98],
          ]}
          onReveal={continued}
        >
          <div className="p6__rays" aria-hidden="true" data-depth="0.2" />
          <div className="p6__bubble">
            <SpeechBubble speech={finale.speech} tail="bottom-right" />
          </div>
          <div className="p6__char">
            <Character
              ref={finale.charRef}
              mood={finale.mood}
              preload={['wave', 'excited']}
              label="Krishyangi"
              sizes="(max-width: 639px) 60vw, 26vw"
            />
          </div>
          <h3 id="p6-h" className="p6__tbc" data-sfx>
            To be continued…
          </h3>
          <div className="p6__links" data-reveal>
            <ComicButton variant="ink" href={SITE.links.github} external icon={<IconGithub />} sfx="CLICK!">
              GitHub
            </ComicButton>
            <ComicButton variant="secondary" href={SITE.links.linkedin} external icon={<IconLinkedin />} sfx="POP!">
              LinkedIn
            </ComicButton>
          </div>
        </ComicPanel>
      </div>

      <footer className="origin__end">
        <Doodle kind="swoosh" className="origin__end-swoosh" />
        <p>
          <strong>End of Issue {SITE.issue}.</strong> More chapters are being inked.
        </p>
        <p className="origin__end-copy">
          © {new Date().getFullYear()} {SITE.fullName} · Hand-made with React, GSAP &amp; a lot of ink.
        </p>
      </footer>

      <SpeedPeek within="#origin" />
    </section>
  );
}
