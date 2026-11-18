import { useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { gsap, useGSAP } from '../lib/gsap';
import { EASE } from '../lib/motion';
import { ARSENAL, type Category, type Kind, type Power } from '../content/arsenal';
import { Character } from '../character/Character';
import type { Mood } from '../character/poses';
import { ChapterEdge, ChapterSplash } from '../components/Chapter';
import { Bubble } from '../components/SpeechBubble';
import { useReducedMotion } from '../hooks/useReducedMotion';
import './Arsenal.css';

const MOOD_BY_CATEGORY: Record<string, Mood> = {
  languages: 'thinking',
  frontend: 'excited',
  backend: 'idle',
  data: 'thinking',
  ai: 'surprised',
  tools: 'happy',
};

type Pick = { cat: string; power: string } | null;

/** ink text on light gadgets, cream text on dark ones */
function textOn(hex: string) {
  const n = parseInt(hex.replace('#', ''), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? 'var(--ink)' : 'var(--cream)';
}

/** The inside of one gadget. Every kind is drawn differently. */
function GadgetBody({ kind, power }: { kind: Kind; power: Power }) {
  switch (kind) {
    case 'keycap':
      return (
        <span className="gz__cap">
          <span className="gz__glyph">{power.glyph}</span>
          <span className="gz__name">{power.name}</span>
        </span>
      );
    case 'sticker':
      return (
        <span className="gz__face">
          <span className="gz__glyph">{power.glyph}</span>
          <span className="gz__name">{power.name}</span>
        </span>
      );
    case 'cartridge':
      return (
        <span className="gz__shell">
          <span className="gz__grip" />
          <span className="gz__label">
            <span className="gz__glyph">{power.glyph}</span>
            <span className="gz__name">{power.name}</span>
          </span>
        </span>
      );
    case 'floppy':
      return (
        <span className="gz__shell">
          <span className="gz__shutter" />
          <span className="gz__label">
            <span className="gz__name">{power.name}</span>
          </span>
        </span>
      );
    case 'chip':
      return (
        <>
          <span className="gz__die">
            <span className="gz__glyph">{power.glyph}</span>
            <span className="gz__led" />
          </span>
          <span className="gz__name">{power.name}</span>
        </>
      );
    case 'label':
      return <span className="gz__tape">{power.name}</span>;
  }
}

/**
 * CHAPTER 05 — THE ARSENAL
 * Her field kit: one compact case, six compartments, a different gadget in
 * each. Hover a gadget to read its label; click it for where she's used it.
 */
export function Arsenal() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [hover, setHover] = useState<Pick>(null);
  const [picked, setPicked] = useState<Pick>(null);

  useGSAP(
    () => {
      if (reduced) return;
      const q = gsap.utils.selector(root);
      const kit = q('.kit')[0];
      gsap
        .timeline({ scrollTrigger: { trigger: kit, start: 'top 80%', once: true } })
        .from(kit, { y: 40, rotation: -1.5, opacity: 0, duration: 0.7, ease: EASE.settle })
        .from(q('.tray'), { y: 24, opacity: 0, duration: 0.45, stagger: 0.07, ease: EASE.settle, clearProps: 'transform,opacity' }, 0.25)
        .from(q('.kit__owner'), { scale: 0, rotation: -30, duration: 0.6, ease: EASE.pop }, 0.5);
    },
    { scope: root, dependencies: [reduced] },
  );

  const choose = (cat: Category, p: Power, el: HTMLElement) => {
    const same = picked?.power === p.id;
    setPicked(same ? null : { cat: cat.id, power: p.id });
    if (same) return;
    if (!reduced) {
      gsap.fromTo(el, { scale: 0.9 }, { scale: 1, duration: 0.4, ease: EASE.pop, clearProps: 'scale' });
    }
  };

  const leave = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') setHover(null);
  };

  const pickedCat = ARSENAL.find((c) => c.id === picked?.cat);
  const mood: Mood = pickedCat ? (MOOD_BY_CATEGORY[pickedCat.id] ?? 'idle') : 'idle';

  return (
    <section id="arsenal" ref={root} className="chapter chapter--arsenal" aria-labelledby="arsenal-title">
      <ChapterEdge variant="wave" />
      <ChapterSplash
        id="arsenal-title"
        issue="Chapter 05"
        words={['The', 'Arsenal']}
        accent={1}
        aside="(her field kit, no fake skill bars)"
        intro={
          <p>
            Every gadget here shows up in her actual work: her résumé, her GitHub profile or her repositories. The titles are
            for fun. They’re labels, not levels.
          </p>
        }
      />

      <div className="kit chapter__canvas">
        <header className="kit__lid">
          <div className="kit__owner" aria-hidden="true">
            <Character mood={mood} label="Krishyangi" sizes="240px" preload={['mischief', 'excited', 'confused']} />
          </div>
          <div className="kit__hello">
            <Bubble tail="left">Here’s the stuff I use to make things happen.</Bubble>
          </div>
          <p className="kit__stamp">
            Field kit <span>No. 05</span>
          </p>
        </header>

        <div className="kit__bay">
          {ARSENAL.map((cat) => {
            const shownId = hover?.cat === cat.id ? hover.power : picked?.cat === cat.id ? picked.power : null;
            const shown = cat.powers.find((p) => p.id === shownId) ?? null;
            const open = !!shown && picked?.power === shown.id;
            const readoutId = `tray-${cat.id}-readout`;
            return (
              <section key={cat.id} className={`tray tray--${cat.kind}`} aria-labelledby={`tray-${cat.id}`}>
                <h3 id={`tray-${cat.id}`} className="tray__title">
                  {cat.name}
                </h3>
                <ul className="tray__items">
                  {cat.powers.map((p, i) => (
                    <li key={p.id} className="tray__slot" style={{ '--i': i } as CSSProperties}>
                      <button
                        type="button"
                        className={`gz gz--${cat.kind} ${picked?.power === p.id ? 'is-picked' : ''}`}
                        style={{ '--c': p.color, '--fg': textOn(p.color) } as CSSProperties}
                        aria-pressed={picked?.power === p.id}
                        aria-describedby={readoutId}
                        onPointerEnter={() => setHover({ cat: cat.id, power: p.id })}
                        onPointerLeave={leave}
                        onFocus={() => setHover({ cat: cat.id, power: p.id })}
                        onBlur={() => setHover(null)}
                        onClick={(e) => choose(cat, p, e.currentTarget)}
                      >
                        <GadgetBody kind={cat.kind} power={p} />
                        {p.learning && <span className="gz__learning">learning</span>}
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="tray__readout" id={readoutId} aria-live="polite">
                  {shown ? (
                    <p className="tray__line">
                      <strong>{shown.name}</strong>
                      <span className="tray__title-text">{shown.title}</span>
                    </p>
                  ) : (
                    <p className="tray__line tray__line--note">{cat.note} ↑</p>
                  )}
                  <div className={`tray__more ${open ? 'is-open' : ''}`}>
                    <p>{open && shown ? shown.where : ''}</p>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </section>
  );
}
