import { useEffect, useState } from 'react';
import { ScrollTrigger } from './lib/gsap';
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

type Intro = 'cover' | 'opening' | 'done';

function Comic() {
  const [returning] = useState(() => readFlag('session', COVER_SEEN_KEY) === '1');
  const [intro, setIntro] = useState<Intro>(() => (returning || prefersReducedMotion() ? 'done' : 'cover'));
  const [secret, setSecret] = useState(false);
  const { play } = useSound();

  useSecretCode('bam', () => {
    play('bam');
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
      <main className="story">
        <Hero start={intro !== 'cover'} returning={returning} />
        <About />
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
