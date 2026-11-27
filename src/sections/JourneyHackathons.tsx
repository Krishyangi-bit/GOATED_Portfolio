import { useRef, useState } from 'react';
import { gsap, useGSAP } from '../lib/gsap';
import { EASE } from '../lib/motion';
import { HACKATHONS, HACKATHON_VENUE, type Hackathon } from '../content/achievements';
import { Burst } from '../components/Burst';
import { PdfViewer, type PdfDoc } from '../components/PdfViewer';
import { useReducedMotion } from '../hooks/useReducedMotion';
import './JourneyHackathons.css';

const ORDINAL = ['', '1st', '2nd', '3rd', '4th', '5th'];

function Bout({ h, i, onCertificate }: { h: Hackathon; i: number; onCertificate: (h: Hackathon) => void }) {
  return (
    <article className={`bout bout--${i % 2 ? 'b' : 'a'}`} aria-labelledby={`bout-${h.id}`}>
      <Burst
        className="bout__stamp"
        text={`Round ${h.round}!`}
        color={i % 2 ? 'var(--teal-light)' : 'var(--yellow)'}
        spikes={13}
        seed={7 + i * 4}
        label={`Reached the ${ORDINAL[h.round] ?? h.round} round`}
      />
      <header className="bout__head">
        <p className="bout__event">{h.event}</p>
        <p className="bout__meta">
          {h.date} · {h.format}
        </p>
      </header>

      <div className="bout__body">
        <p className="bout__kicker">Our build</p>
        <h3 id={`bout-${h.id}`} className="bout__project">
          {h.project}
        </h3>
        <p className="bout__pitch">{h.pitch}</p>
        <p className="bout__summary">{h.summary}</p>

        <h4 className="bout__label">What it does</h4>
        <ul className="bout__list">
          {h.highlights.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>

        <h4 className="bout__label">Built with</h4>
        <ul className="bout__chips">
          {h.stack.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>

        <p className="bout__result">
          <strong>Result:</strong> made it to the {ORDINAL[h.round] ?? h.round} round.
        </p>

        {h.certificate && (
          <button type="button" className="bout__cert" onClick={() => onCertificate(h)}>
            <span aria-hidden="true">📜</span> View certificate
          </button>
        )}
      </div>
    </article>
  );
}

/**
 * Part of CHAPTER 04 — CHARACTER DEVELOPMENT.
 * Side quests: one IIIT-Delhi block holding both hackathons, each stamped
 * with the round she reached. Sits below the walking journey.
 */
export function JourneyHackathons() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [doc, setDoc] = useState<PdfDoc | null>(null);

  useGSAP(
    () => {
      if (reduced) return;
      const q = gsap.utils.selector(root);
      // refreshPriority -1: measured after the Journey pin above adds its scroll distance
      gsap
        .timeline({ scrollTrigger: { trigger: root.current, start: 'top 80%', once: true, refreshPriority: -1 } })
        .from(root.current, { y: 60, rotation: -1.5, opacity: 0, duration: 0.7, ease: EASE.settle })
        .from(q('.arena__head > *'), { y: 18, opacity: 0, duration: 0.4, stagger: 0.08, ease: EASE.settle }, 0.3)
        .from(q('.bout'), { y: 50, opacity: 0, duration: 0.6, stagger: 0.15, ease: EASE.settle }, 0.45)
        .from(q('.bout__stamp'), { scale: 0, rotation: -60, duration: 0.5, stagger: 0.15, ease: EASE.impact }, 0.85);
    },
    { scope: root, dependencies: [reduced] },
  );

  const openCertificate = (h: Hackathon) =>
    h.certificate &&
    setDoc({ title: `${h.event} · Certificate`, src: h.certificate, fileName: `${h.event.replace(/\s+/g, '_')}_Certificate.pdf` });

  return (
    <section ref={root} className="arena" aria-labelledby="arena-title">
      <header className="arena__head">
        <p className="arena__kicker">Side quests · Hackathons</p>
        <h3 id="arena-title" className="arena__title">
          {HACKATHON_VENUE.name} <span>· {HACKATHON_VENUE.fest}</span>
        </h3>
        <p className="arena__blurb">{HACKATHON_VENUE.blurb}</p>
        <ul className="arena__tally" aria-label="Results">
          {HACKATHONS.map((h) => (
            <li key={h.id}>
              <b>{h.event}</b> reached round {h.round}
            </li>
          ))}
        </ul>
      </header>

      <div className="arena__bouts">
        {HACKATHONS.map((h, i) => (
          <Bout key={h.id} h={h} i={i} onCertificate={openCertificate} />
        ))}
      </div>

      <PdfViewer doc={doc} onClose={() => setDoc(null)} />
    </section>
  );
}
