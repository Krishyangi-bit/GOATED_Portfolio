import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, useGSAP } from './lib/gsap';
import { emit } from './lib/events';
import { readFlag } from './lib/storage';
import { prefersReducedMotion } from './hooks/useReducedMotion';
import { useSecretCode } from './hooks/useSecretCode';
import { SoundProvider, useSound } from './sound/SoundController';
import { ChapterNav } from './components/ChapterNav';
import { SecretPanel } from './components/SecretPanel';
import { ComicCover, COVER_SEEN_KEY } from './sections/ComicCover';
import { Hero } from './sections/Hero';
import { About } from './sections/About';
import { Projects } from './sections/Projects';
import { Journey } from './sections/Journey';
import { Arsenal } from './sections/Arsenal';
import { Multiverse } from './sections/Multiverse';
import { Contact } from './sections/Contact';

type Intro = 'cover' | 'opening' | 'done';

/** A line of ink along the top edge that fills as the comic is read. */
function ReadingInk() {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    gsap.fromTo(
      ref.current,
      { scaleX: 0 },
      { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } },
    );
  });
  return <div ref={ref} className="reading-ink" aria-hidden="true" />;
}

function Comic() {
  const [returning] = useState(() => readFlag('session', COVER_SEEN_KEY) === '1');
  const [intro, setIntro] = useState<Intro>(() => (returning || prefersReducedMotion() ? 'done' : 'cover'));
  const [secret, setSecret] = useState(false);
  const { play } = useSound();

  useSecretCode('bam', () => {
    play('kapow');
    emit('secret');
    setSecret(true);
  });

  // keep the page from scrolling under the closed cover
  useEffect(() => {
    document.documentElement.style.overflow = intro === 'cover' ? 'hidden' : '';
  }, [intro]);

  // positions shift once fonts and images settle
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    void document.fonts?.ready.then(refresh);
    window.addEventListener('load', refresh);
    return () => window.removeEventListener('load', refresh);
  }, []);

  return (
    <>
      <a className="skip-link" href="#origin">
        Skip to the origin story
      </a>
      <ChapterNav />
      <ReadingInk />
      <main className="story">
        <Hero start={intro !== 'cover'} returning={returning} />
        <About />
        <Projects />
        <Journey />
        <Arsenal />
        <Multiverse />
        <Contact />
      </main>
      {intro !== 'done' && <ComicCover onOpen={() => setIntro('opening')} onDone={() => setIntro('done')} />}
      <SecretPanel open={secret} onClose={() => setSecret(false)} />
    </>
  );
}

export default function App() {
  return (
    <SoundProvider>
      <Comic />
    </SoundProvider>
  );
}
