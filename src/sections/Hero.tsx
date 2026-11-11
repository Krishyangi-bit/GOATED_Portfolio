import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap';
import { EASE } from '../lib/motion';
import { on } from '../lib/events';
import { SITE } from '../content/site';
import { DIALOGUE } from '../content/dialogue';
import { Character } from '../character/Character';
import { useCharacterController } from '../character/useCharacterController';
import { SpeechBubble } from '../components/SpeechBubble';
import { ComicButton } from '../components/ComicButton';
import { Burst } from '../components/Burst';
import { Doodle, IconArrowDown, IconLinkedin } from '../components/Doodles';
import { useSound } from '../sound/SoundController';
import { hasFinePointer, useReducedMotion } from '../hooks/useReducedMotion';
import './Hero.css';

type Props = {
  /** false while the comic cover is still closed */
  start: boolean;
  /** visitor has already seen the cover this session */
  returning: boolean;
};

const NAME_1 = 'KRISH'.split('');
const NAME_2 = 'YANGI!'.split('');

/**
 * ACT 01 — MEET THE PROTAGONIST
 *
 * Choreography (after the cover opens):
 *   0.0  ink rays + halftone bloom behind the page
 *   0.15 BAM! stamps down
 *   0.35 the jagged panel bursts open, she rises into it already waving
 *   0.8  KRISHYANGI! letters slam in one by one
 *   1.15 "Well, look who just arrived!"
 *   1.45 tagline caption wipes in, buttons spring up, doodles pop
 */
export function Hero({ start, returning }: Props) {
  const root = useRef<HTMLElement>(null);
  const tlRef = useRef<gsap.core.Timeline>();
  const reduced = useReducedMotion();
  const { play } = useSound();
  const ctl = useCharacterController('greeting', 'idle');
  const { say } = ctl;

  const clicks = useRef(0);
  const interacted = useRef(false);
  const once = useRef<Record<string, boolean>>({});
  const firstOnce = (key: string) => {
    if (once.current[key]) return false;
    once.current[key] = true;
    return true;
  };

  const greet = () => say(returning ? DIALOGUE.welcome : DIALOGUE.arrival, { hold: 3600 });

  // --- intro timeline (built paused, fired when the cover opens) -----------
  useGSAP(
    () => {
      if (reduced) return;
      const q = gsap.utils.selector(root);
      const tl = gsap.timeline({ paused: true, defaults: { ease: EASE.settle } });
      tl.from(q('.hero__rays'), { scale: 0.5, rotation: -50, opacity: 0, duration: 1.3 }, 0)
        .from(q('.hero__halftone, .hero__slab'), { opacity: 0, duration: 0.8 }, 0)
        .fromTo(
          q('.hero__bam'),
          { scale: 0, rotation: -50, opacity: 0 },
          { scale: 1.6, rotation: -8, opacity: 1, duration: 0.45, ease: EASE.impact },
          0.15,
        )
        .call(() => play('bam'), [], 0.18)
        .to(q('.hero__bam'), { scale: 1, rotation: -12, duration: 0.6, ease: EASE.spring }, 0.75)
        .from(
          q('.hero__frame'),
          { clipPath: 'polygon(50% 60%, 50% 60%, 50% 60%, 50% 60%, 50% 60%)', duration: 0.7, ease: EASE.ink },
          0.35,
        )
        .from(q('.hero__char'), { yPercent: 55, opacity: 0, duration: 0.95, ease: 'back.out(1.3)' }, 0.5)
        .call(greet, [], 1.15)
        .from(
          q('.hero__letter'),
          {
            yPercent: -130,
            scale: 2.2,
            rotation: (i: number) => (i % 2 ? 22 : -22),
            opacity: 0,
            duration: 0.5,
            stagger: 0.05,
            ease: EASE.impact,
            clearProps: 'transform,opacity',
          },
          0.8,
        )
        .from(q('.hero__kicker'), { x: -40, opacity: 0, duration: 0.5 }, 1.1)
        .from(q('.hero__tagline'), { clipPath: 'inset(0% 100% 0% 0%)', duration: 0.7, ease: EASE.ink }, 1.45)
        .from(q('.hero__ctas .cbtn'), { y: 30, scale: 0.6, opacity: 0, stagger: 0.12, duration: 0.55, ease: EASE.pop, clearProps: 'transform' }, 1.7)
        .from(q('.hero__doodle'), { scale: 0, opacity: 0, stagger: 0.06, duration: 0.45, ease: EASE.pop }, 1.6)
        .from(q('.hero__hint, .hero__corner'), { opacity: 0, y: 14, duration: 0.5 }, 2.1)
        .from(document.querySelector('.nav'), { y: -90, duration: 0.6, ease: EASE.settle, clearProps: 'transform' }, 1.6)
        .from(document.querySelector('.nav__chapters'), { autoAlpha: 0, y: -24, duration: 0.6, ease: EASE.pop, clearProps: 'transform' }, 1.8);
      tlRef.current = tl;
    },
    { scope: root, dependencies: [reduced] },
  );

  useEffect(() => {
    if (!start) return;
    if (reduced) {
      greet();
      return;
    }
    tlRef.current?.play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, reduced]);

  // --- idle nudge: a fourth-wall hint if nobody does anything -------------
  useEffect(() => {
    if (!start) return;
    const markActive = () => (interacted.current = true);
    window.addEventListener('scroll', markActive, { passive: true, once: true });
    const t = window.setTimeout(() => {
      if (!interacted.current && window.scrollY < 40 && firstOnce('nudge')) say(DIALOGUE.idleNudge);
    }, 11000);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('scroll', markActive);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start]);

  // --- page-turn into the origin story ------------------------------------
  useGSAP(
    () => {
      const stage = root.current?.querySelector('.hero__stage');
      const dim = root.current?.querySelector('.hero__dim');
      // look the next chapter up globally: selectors inside useGSAP are scoped to the hero
      const origin = document.getElementById('origin');
      if (!stage || !dim || !origin) return;

      // the cover page sinks back as the next page slides over it
      if (!reduced) {
        gsap
          .timeline({
            scrollTrigger: { trigger: origin, start: 'top bottom', end: 'top top', scrub: 0.5 },
          })
          .to(stage, { scale: 0.92, rotation: -1.5, yPercent: -3, transformOrigin: '50% 0%', ease: 'none' }, 0)
          .to(dim, { opacity: 0.6, ease: 'none' }, 0);
      }

      ScrollTrigger.create({
        trigger: origin,
        start: 'top 72%',
        onEnter: () => {
          if (firstOnce('origin')) say(DIALOGUE.toOrigin, { hold: 2800 });
        },
        onLeaveBack: () => {
          if (once.current.origin && firstOnce('back')) say(DIALOGUE.welcomeBack, { hold: 2600 });
        },
      });

      // fully covered: stop painting the hero
      ScrollTrigger.create({
        trigger: origin,
        start: 'top top',
        onEnter: () => root.current?.classList.add('is-covered'),
        onLeaveBack: () => root.current?.classList.remove('is-covered'),
      });
    },
    { scope: root, dependencies: [reduced] },
  );

  // --- background reacts to the cursor ------------------------------------
  useEffect(() => {
    const el = root.current;
    if (!el || reduced || !hasFinePointer()) return;
    const layers = Array.from(el.querySelectorAll<HTMLElement>('[data-depth]')).map((node) => ({
      d: Number(node.dataset.depth) || 0,
      x: gsap.quickTo(node, 'x', { duration: 1.2, ease: 'power3' }),
      y: gsap.quickTo(node, 'y', { duration: 1.2, ease: 'power3' }),
    }));
    const onMove = (e: PointerEvent) => {
      if (window.scrollY > window.innerHeight) return;
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      layers.forEach((l) => {
        l.x(nx * l.d * -60);
        l.y(ny * l.d * -40);
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [reduced]);

  // --- secret code reaction ------------------------------------------------
  useEffect(
    () =>
      on('secret', () => {
        if (window.scrollY < window.innerHeight * 0.6) say(DIALOGUE.secret);
      }),
    [say],
  );

  // --- interactions -------------------------------------------------------
  const onCharacter = () => {
    interacted.current = true;
    const line = DIALOGUE.clicks[clicks.current % DIALOGUE.clicks.length];
    clicks.current++;
    play('pop');
    say(line);
  };

  const onBam = () => {
    interacted.current = true;
    play('bam');
    const bam = root.current?.querySelector('.hero__bam');
    if (bam && !reduced) {
      gsap.fromTo(bam, { scale: 1.45, rotation: -2 }, { scale: 1, rotation: -12, duration: 0.7, ease: EASE.spring });
    }
    say(DIALOGUE.bamButton);
  };

  const onLongHover = () => {
    if (firstOnce('hover')) say(DIALOGUE.longHover);
  };

  const explore = () => {
    interacted.current = true;
    document.getElementById('origin')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  };

  return (
    <section id="cover" className="hero" ref={root} aria-labelledby="hero-title">
      <div className="hero__stage">
        <div className="hero__bg" aria-hidden="true">
          <div className="hero__rays" data-depth="0.25" />
          <div className="hero__halftone" />
          <div className="hero__slab" />
        </div>

        <div className="hero__doodles" aria-hidden="true">
          <span className="hero__doodle hero__doodle--sparkle" data-depth="0.8">
            <Doodle kind="sparkle" color="var(--teal)" />
          </span>
          <span className="hero__doodle hero__doodle--bolt" data-depth="1.1">
            <Doodle kind="bolt" />
          </span>
          <span className="hero__doodle hero__doodle--spiral" data-depth="0.5">
            <Doodle kind="spiral" color="var(--orange-deep)" />
          </span>
          <span className="hero__doodle hero__doodle--star" data-depth="0.9">
            <Doodle kind="star" />
          </span>
          <span className="hero__doodle hero__doodle--dots" data-depth="0.6">
            <Doodle kind="dots" color="var(--red)" />
          </span>
        </div>

        <div className="hero__copy">
          <p className="hero__kicker caption">
            Issue {SITE.issue} · Meet the protagonist
          </p>
          <h1 id="hero-title" className="hero__name">
            <span className="sr-only">{SITE.name}!</span>
            <span className="hero__line" aria-hidden="true">
              {NAME_1.map((l, i) => (
                <span key={i} className="hero__letter">
                  {l}
                </span>
              ))}
            </span>
            <span className="hero__line hero__line--2" aria-hidden="true">
              {NAME_2.map((l, i) => (
                <span key={i} className="hero__letter">
                  {l}
                </span>
              ))}
            </span>
          </h1>
          <p className="hero__tagline">
            <span>{SITE.tagline.lead}</span> <strong>{SITE.tagline.punch}</strong>
            <span className="hero__bug" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <ellipse cx="12" cy="13.5" rx="5.5" ry="7" fill="var(--red)" stroke="var(--ink)" strokeWidth="1.8" />
                <path d="M12 6.5v14M6.6 11 3 9.5M6.5 15H2.6M7 18.6 4 21M17.4 11 21 9.5M17.5 15h3.9M17 18.6l3 2.4M9.5 5.2 8 2.6M14.5 5.2 16 2.6" stroke="var(--ink)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                <circle cx="9.6" cy="11.5" r="1.2" fill="var(--ink)" />
                <circle cx="14.4" cy="15.5" r="1.2" fill="var(--ink)" />
              </svg>
            </span>
          </p>
        </div>

        <div className="hero__ctas">
          <ComicButton variant="primary" onClick={explore} sfx="WHOOSH!" onLongHover={onLongHover} icon={<IconArrowDown />}>
            Explore My World
          </ComicButton>
          <ComicButton
            variant="secondary"
            href={SITE.links.linkedin}
            external
            sfx="POP!"
            onLongHover={onLongHover}
            icon={<IconLinkedin />}
          >
            Let’s Connect
          </ComicButton>
        </div>

        <div className="hero__figure">
          <div className="hero__frame" aria-hidden="true">
            <div className="hero__frame-art" />
          </div>
          <button type="button" className="hero__bam" onClick={onBam} aria-label="BAM! Press for a sound effect">
            <Burst text="BAM!" color="var(--yellow)" spikes={13} seed={21} />
          </button>
          <Character
            ref={ctl.charRef}
            className="hero__char"
            mood={ctl.mood}
            label="Krishyangi, the protagonist. Click to chat with her."
            onActivate={onCharacter}
            preload={['idle', 'excited', 'mischief', 'confused']}
            sizes="(max-width: 1023px) 70vw, 40vw"
            tilt
            eager
          />
          <div className="hero__bubble">
            <SpeechBubble speech={ctl.speech} tail="bottom-right" />
          </div>
          <p className="hero__hint hand" aria-hidden="true">
            <span className="hero__hint-fine">psst… she’s clickable</span>
            <span className="hero__hint-touch">tap her!</span>
            <Doodle kind="arrow" className="hero__hint-arrow" />
          </p>
        </div>

        <a className="hero__corner" href="#origin" onClick={() => play('page')}>
          <span className="hero__corner-peel" aria-hidden="true" />
          <span className="hero__corner-label">Turn the page</span>
        </a>

        <div className="hero__dim" aria-hidden="true" />
      </div>
    </section>
  );
}
