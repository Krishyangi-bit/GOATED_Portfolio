import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { readFlag, writeFlag } from '../lib/storage';

export type Sfx = 'pop' | 'whoosh' | 'bam' | 'page';

type SoundApi = {
  enabled: boolean;
  toggle: () => void;
  play: (name: Sfx) => void;
};

const SoundCtx = createContext<SoundApi>({ enabled: false, toggle: () => {}, play: () => {} });

const KEY = 'lcb-sfx';

/**
 * SoundController: optional comic sound effects, synthesised with Web Audio
 * (no audio files to download). Off by default; the choice is remembered.
 */
export function SoundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(() => readFlag('local', KEY) === 'on');
  const ctxRef = useRef<AudioContext | null>(null);
  const noiseRef = useRef<AudioBuffer | null>(null);

  const audio = useCallback(() => {
    if (!ctxRef.current) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctxRef.current = new AC();
    }
    if (ctxRef.current.state === 'suspended') void ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  const noise = (ac: AudioContext) => {
    if (!noiseRef.current) {
      const buf = ac.createBuffer(1, ac.sampleRate * 0.6, ac.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      noiseRef.current = buf;
    }
    const src = ac.createBufferSource();
    src.buffer = noiseRef.current;
    return src;
  };

  const synth = useCallback((name: Sfx) => {
    const ac = audio();
    if (!ac) return;
    const t = ac.currentTime;
    const out = ac.createGain();
    out.gain.value = 0.22;
    out.connect(ac.destination);

    if (name === 'pop') {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(420, t);
      o.frequency.exponentialRampToValueAtTime(1300, t + 0.07);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.8, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
      o.connect(g).connect(out);
      o.start(t);
      o.stop(t + 0.15);
    }

    if (name === 'whoosh' || name === 'page') {
      const n = noise(ac);
      const f = ac.createBiquadFilter();
      const g = ac.createGain();
      const len = name === 'page' ? 0.32 : 0.45;
      f.type = 'bandpass';
      f.Q.value = name === 'page' ? 0.8 : 1.4;
      f.frequency.setValueAtTime(name === 'page' ? 2400 : 300, t);
      f.frequency.exponentialRampToValueAtTime(name === 'page' ? 900 : 2600, t + len);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.9, t + len * 0.35);
      g.gain.exponentialRampToValueAtTime(0.0001, t + len);
      n.connect(f).connect(g).connect(out);
      n.start(t);
      n.stop(t + len);
    }

    if (name === 'bam') {
      const n = noise(ac);
      const f = ac.createBiquadFilter();
      const g = ac.createGain();
      f.type = 'lowpass';
      f.frequency.value = 1400;
      g.gain.setValueAtTime(1, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
      n.connect(f).connect(g).connect(out);
      n.start(t);
      n.stop(t + 0.3);
      const o = ac.createOscillator();
      const og = ac.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(150, t);
      o.frequency.exponentialRampToValueAtTime(42, t + 0.35);
      og.gain.setValueAtTime(1, t);
      og.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
      o.connect(og).connect(out);
      o.start(t);
      o.stop(t + 0.42);
    }
  }, [audio]);

  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const play = useCallback(
    (name: Sfx) => {
      if (!enabledRef.current) return;
      try {
        synth(name);
      } catch {
        /* audio is a nice-to-have */
      }
    },
    [synth],
  );

  const toggle = useCallback(() => {
    const next = !enabledRef.current;
    enabledRef.current = next;
    setEnabled(next);
    writeFlag('local', KEY, next ? 'on' : 'off');
    if (next) {
      // the click itself is the user gesture that unlocks audio
      try {
        synth('pop');
      } catch {
        /* ignore */
      }
    }
  }, [synth]);

  const api = useMemo(() => ({ enabled, toggle, play }), [enabled, toggle, play]);
  return <SoundCtx.Provider value={api}>{children}</SoundCtx.Provider>;
}

export const useSound = () => useContext(SoundCtx);
