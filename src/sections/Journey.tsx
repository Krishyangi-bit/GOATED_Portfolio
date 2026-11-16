import { useRef } from 'react';
import { gsap, useGSAP } from '../lib/gsap';
import { EASE } from '../lib/motion';
import { JOURNEY, type Chapter } from '../content/journey';
import { Character } from '../character/Character';
import { useCharacterController } from '../character/useCharacterController';
import { Bubble, SpeechBubble } from '../components/SpeechBubble';
import { ChapterEdge, ChapterSplash, Todo } from '../components/Chapter';
import { SceneArt } from '../components/SceneArt';
import { useReducedMotion } from '../hooks/useReducedMotion';
import './Journey.css';

/** Fields that genuinely weren't supplied show as TODO chips — except on the open-ended "next" chapter. */
function Field({ label, items, chapter }: { label: string; items: string[] | null; chapter: Chapter }) {
  if (!items) {
    if (chapter.id === 'next') return null;
    return (
      <div className="ch__field">
        <h4>{label}</h4>
        <Todo>{`add ${label.toLowerCase()}`}</Todo>
      </div>
    );
  }
  return (
    <div className="ch__field">
      <h4>{label}</h4>
      <ul className={label === 'Skills acquired' ? 'ch__chips' : 'ch__list'}>
        {items.map((it) => (
          <li key={it}>{it}</li>
        ))}
      </ul>
    </div>
  );
}

function ChapterCard({ ch }: { ch: Chapter }) {
  return (
    <div className="ch" data-card>
      <p className="ch__num">Chapter {ch.num}</p>
      <h3 className="ch__title">{ch.title}</h3>
      <div className="ch__line">
        <Bubble tail="bottom-left">{ch.line}</Bubble>
      </div>
      <dl className="ch__meta">
        <div>
          <dt>Organisation</dt>
          <dd className="ch__org">{ch.organisation}</dd>
        </div>
        <div>
          <dt>Position</dt>
          <dd>{ch.position}</dd>
        </div>
        <div>
          <dt>Duration</dt>
          <dd>{ch.duration}</dd>
        </div>
        {ch.location && (
          <div>
            <dt>Location</dt>
            <dd>{ch.location}</dd>
          </div>
        )}
      </dl>
      <Field label="Responsibilities" items={ch.responsibilities} chapter={ch} />
      <Field label="Achievements & highlights" items={ch.achievements} chapter={ch} />
      <Field label="Skills acquired" items={ch.skills} chapter={ch} />
      {ch.id === 'next' && (
        <a className="ch__cta" href="#contact">
          Write this chapter with me →
        </a>
      )}
    </div>
  );
}

/**
 * CHAPTER 04 — CHARACTER DEVELOPMENT
 * Desktop: the page pins and the world scrolls sideways past her — she walks
 * from scene to scene and reacts as each chapter arrives.
 * Smaller screens / reduced motion: the same scenes as a vertical story.
 */
export function Journey() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const ctl = useCharacterController('idle', 'idle');
  const { say } = ctl;
  const active = useRef(-1);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const journey = q('.journey')[0] as HTMLElement | undefined;
      const track = q('.journey__track')[0] as HTMLElement | undefined;
      const walker = q('.journey__walker')[0] as HTMLElement | undefined;
      const fill = q('.journey__fill')[0] as HTMLElement | undefined;
      const steps = q('.journey__step');
      if (!journey || !track || !walker || !fill) return;

      const arrive = (i: number) => {
        if (i === active.current) return;
        active.current = i;
        steps.forEach((s, k) => s.classList.toggle('is-on', k <= i));
        const ch = JOURNEY[i];
        say({ text: ch.line, mood: ch.mood, action: ch.mood === 'greeting' ? 'wave' : 'hop' }, { hold: Infinity, stay: true });
      };

      const mm = gsap.matchMedia();

      // ---- desktop: pinned horizontal journey --------------------------------
      mm.add('(min-width: 1024px) and (min-height: 600px) and (prefers-reduced-motion: no-preference)', () => {
        journey.classList.add('is-pinned');
        const n = JOURNEY.length;
        const distance = () => track.scrollWidth - window.innerWidth;
        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: journey,
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const p = self.progress;
              fill.style.transform = `scaleX(${p})`;
              // she walks: a little bob per stride while the world slides by
              const stride = Math.sin(p * (n - 1) * Math.PI * 4);
              gsap.set(walker, { y: -Math.abs(stride) * 16, rotation: stride * 1.6 });
              arrive(Math.min(n - 1, Math.round(p * (n - 1))));
            },
            onEnter: () => arrive(0),
          },
        });
        // each scene's card swings in as it slides into view
        q('.scene').forEach((scene) => {
          const card = scene.querySelector('[data-card]');
          if (!card) return;
          gsap.from(card, {
            rotationY: -35,
            xPercent: 18,
            opacity: 0,
            transformPerspective: 1200,
            ease: 'power2.out',
            scrollTrigger: { trigger: scene, containerAnimation: tween, start: 'left 85%', end: 'left 45%', scrub: true },
          });
        });
        return () => {
          journey.classList.remove('is-pinned');
          gsap.set([track, walker], { clearProps: 'transform' });
          fill.style.transform = '';
        };
      });

      // ---- vertical story --------------------------------------------------------
      mm.add('(max-width: 1023px), (max-height: 599px), (prefers-reduced-motion: reduce)', () => {
        q('.scene').forEach((scene) => {
          if (!reduced) {
            // the scene wipes open like a panel, then its card drops onto it
            gsap
              .timeline({ scrollTrigger: { trigger: scene, start: 'top 80%', once: true } })
              .fromTo(
                scene.querySelector('.scene__art'),
                { clipPath: 'inset(0% 100% 0% 0%)' },
                { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: EASE.ink, clearProps: 'clipPath' },
              )
              .from(
                scene.querySelector('[data-card]'),
                { y: 60, opacity: 0, rotation: -2.5, duration: 0.7, ease: EASE.pop },
                0.35,
              );
          }
        });
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <section id="journey" ref={root} className="chapter chapter--dark chapter--journey" aria-labelledby="journey-title">
      <ChapterEdge variant="torn" seed={19} />
      <ChapterSplash
        id="journey-title"
        issue="Chapter 04"
        words={['Character', 'Development']}
        accent={1}
        aside="(every milestone changes the protagonist)"
        intro={<p>A university campus, a Google ambassador badge and a road that’s still being drawn. Scroll, and she’ll walk you through it.</p>}
      />

      <div className="journey">
        <div className="journey__viewport">
          <div className="journey__track">
            {JOURNEY.map((ch) => (
              <article key={ch.id} className={`scene scene--${ch.scene}`} aria-label={`Chapter ${ch.num}: ${ch.title}`}>
                <div className="scene__art">
                  <SceneArt scene={ch.scene} />
                </div>
                <ChapterCard ch={ch} />
              </article>
            ))}
          </div>

          <div className="journey__hud" aria-hidden="true">
            <div className="journey__road">
              <span className="journey__fill" />
            </div>
            <ol className="journey__steps">
              {JOURNEY.map((ch) => (
                <li key={ch.id} className="journey__step">
                  <span>{ch.num}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="journey__traveler">
            <div className="journey__bubble">
              <SpeechBubble speech={ctl.speech} tail="bottom-left" />
            </div>
            <div className="journey__walker">
              <Character
                ref={ctl.charRef}
                mood={ctl.mood}
                preload={['mischief', 'excited', 'wave']}
                label="Krishyangi, travelling through her story"
                sizes="22vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
