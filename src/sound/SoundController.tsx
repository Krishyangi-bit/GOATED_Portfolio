import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { readFlag, writeFlag } from '../lib/storage';

/**
 * Old-school cartoon sound palette — every sound is tied to a kind of moment:
 *
 *   tick     subtle woodblock            buttons & links
 *   bonk     hollow knock + pitch drop   character reacts (calm)
 *   boing    wobbly spring               character hops / levels up
 *   whoops   slide whistle up-and-down   character flustered, speed-reading
 *   kapow    punchy impact               BAM! moments
 *   thwack   soft slap                   a story panel lands
 *   zap      electric fizzle             the fried Raspberry Pi
 *   ratchet  mechanical clicks           page turns, chapter tabs
 *   honk     clown horn                  sound switched on, impatient hover
 */
export type Sfx = 'tick' | 'bonk' | 'boing' | 'whoops' | 'kapow' | 'thwack' | 'zap' | 'ratchet' | 'honk';

type PlayOpts = { rate?: number; volume?: number };

type SoundApi = {
  enabled: boolean;
  toggle: () => void;
  play: (name: Sfx, opts?: PlayOpts) => void;
};

const SoundCtx = createContext<SoundApi>({ enabled: false, toggle: () => {}, play: () => {} });

const KEY = 'lcb-sfx';
const MASTER = 0.2;
/** never fire the same sound twice within this window */
const COOLDOWN_MS = 140;

type Ctx = AudioContext;

function env(ac: Ctx, g: GainNode, t: number, peak: number, attack: number, decay: number) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  void ac;
}

function noiseSource(ac: Ctx, buf: AudioBuffer) {
  const s = ac.createBufferSource();
  s.buffer = buf;
  return s;
}

/** Each recipe gets: context, output node, start time, pitch multiplier, noise buffer. */
const RECIPES: Record<Sfx, (ac: Ctx, out: AudioNode, t: number, r: number, noise: AudioBuffer) => void> = {
  tick(ac, out, t, r) {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(1900 * r, t);
    o.frequency.exponentialRampToValueAtTime(1100 * r, t + 0.03);
    env(ac, g, t, 0.35, 0.002, 0.06);
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + 0.08);
  },

  bonk(ac, out, t, r, noise) {
    // hollow head-knock: triangle body with a sharp downward bend + a woody click
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(560 * r, t);
    o.frequency.exponentialRampToValueAtTime(150 * r, t + 0.14);
    env(ac, g, t, 0.9, 0.004, 0.2);
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + 0.25);
    const n = noiseSource(ac, noise);
    const f = ac.createBiquadFilter();
    const ng = ac.createGain();
    f.type = 'bandpass';
    f.frequency.value = 2400 * r;
    f.Q.value = 3;
    env(ac, ng, t, 0.6, 0.001, 0.025);
    n.connect(f).connect(ng).connect(out);
    n.start(t);
    n.stop(t + 0.04);
  },

  boing(ac, out, t, r) {
    // spring: rising pitch with a fast wobble that settles
    const o = ac.createOscillator();
    const g = ac.createGain();
    const lfo = ac.createOscillator();
    const depth = ac.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(120 * r, t);
    o.frequency.exponentialRampToValueAtTime(390 * r, t + 0.42);
    lfo.frequency.setValueAtTime(19, t);
    depth.gain.setValueAtTime(70 * r, t);
    depth.gain.exponentialRampToValueAtTime(2, t + 0.5);
    lfo.connect(depth).connect(o.frequency);
    env(ac, g, t, 0.75, 0.01, 0.55);
    o.connect(g).connect(out);
    o.start(t);
    lfo.start(t);
    o.stop(t + 0.6);
    lfo.stop(t + 0.6);
  },

  whoops(ac, out, t, r) {
    // slide whistle: up, then a long droop
    const o = ac.createOscillator();
    const g = ac.createGain();
    const vib = ac.createOscillator();
    const vd = ac.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(820 * r, t);
    o.frequency.exponentialRampToValueAtTime(1500 * r, t + 0.16);
    o.frequency.exponentialRampToValueAtTime(430 * r, t + 0.55);
    vib.frequency.value = 7;
    vd.gain.value = 22;
    vib.connect(vd).connect(o.frequency);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.45, t + 0.03);
    g.gain.setValueAtTime(0.45, t + 0.4);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
    o.connect(g).connect(out);
    o.start(t);
    vib.start(t);
    o.stop(t + 0.62);
    vib.stop(t + 0.62);
  },

  kapow(ac, out, t, r, noise) {
    // crack + body + low thump
    const crack = noiseSource(ac, noise);
    const hp = ac.createBiquadFilter();
    const cg = ac.createGain();
    hp.type = 'highpass';
    hp.frequency.value = 2500;
    env(ac, cg, t, 0.9, 0.001, 0.05);
    crack.connect(hp).connect(cg).connect(out);
    crack.start(t);
    crack.stop(t + 0.07);

    const body = noiseSource(ac, noise);
    const lp = ac.createBiquadFilter();
    const bg = ac.createGain();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(2600 * r, t);
    lp.frequency.exponentialRampToValueAtTime(300, t + 0.25);
    env(ac, bg, t, 1, 0.003, 0.28);
    body.connect(lp).connect(bg).connect(out);
    body.start(t);
    body.stop(t + 0.32);

    const o = ac.createOscillator();
    const og = ac.createGain();
    o.type = 'square';
    o.frequency.setValueAtTime(130 * r, t);
    o.frequency.exponentialRampToValueAtTime(38, t + 0.32);
    const ol = ac.createBiquadFilter();
    ol.type = 'lowpass';
    ol.frequency.value = 600;
    env(ac, og, t, 0.8, 0.004, 0.34);
    o.connect(ol).connect(og).connect(out);
    o.start(t);
    o.stop(t + 0.4);
  },

  thwack(ac, out, t, r, noise) {
    // soft slap of a panel landing on the page
    const n = noiseSource(ac, noise);
    const f = ac.createBiquadFilter();
    const g = ac.createGain();
    f.type = 'bandpass';
    f.frequency.value = 1000 * r;
    f.Q.value = 1.4;
    env(ac, g, t, 0.55, 0.002, 0.09);
    n.connect(f).connect(g).connect(out);
    n.start(t);
    n.stop(t + 0.12);
    const o = ac.createOscillator();
    const og = ac.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(190 * r, t);
    o.frequency.exponentialRampToValueAtTime(70 * r, t + 0.12);
    env(ac, og, t, 0.5, 0.003, 0.14);
    o.connect(og).connect(out);
    o.start(t);
    o.stop(t + 0.18);
  },

  zap(ac, out, t, r, noise) {
    // descending buzz chopped by a fast square LFO, with crackle on top
    const o = ac.createOscillator();
    const g = ac.createGain();
    const chop = ac.createOscillator();
    const chopDepth = ac.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(1500 * r, t);
    o.frequency.exponentialRampToValueAtTime(90 * r, t + 0.4);
    chop.type = 'square';
    chop.frequency.value = 34;
    chopDepth.gain.value = 0.25;
    chop.connect(chopDepth).connect(g.gain);
    const lp = ac.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 2800;
    g.gain.setValueAtTime(0.3, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
    o.connect(lp).connect(g).connect(out);
    o.start(t);
    chop.start(t);
    o.stop(t + 0.46);
    chop.stop(t + 0.46);
    const n = noiseSource(ac, noise);
    const hp = ac.createBiquadFilter();
    const ng = ac.createGain();
    hp.type = 'highpass';
    hp.frequency.value = 4000;
    env(ac, ng, t, 0.25, 0.005, 0.3);
    n.connect(hp).connect(ng).connect(out);
    n.start(t);
    n.stop(t + 0.35);
  },

  ratchet(ac, out, t, r, noise) {
    // a little mechanical clicker, rising
    for (let i = 0; i < 6; i++) {
      const at = t + i * 0.032;
      const n = noiseSource(ac, noise);
      const f = ac.createBiquadFilter();
      const g = ac.createGain();
      f.type = 'bandpass';
      f.frequency.value = (2200 + i * 260) * r;
      f.Q.value = 8;
      env(ac, g, at, 0.7, 0.001, 0.02);
      n.connect(f).connect(g).connect(out);
      n.start(at);
      n.stop(at + 0.03);
    }
  },

  honk(ac, out, t, r) {
    // clown horn: two detuned reedy squares with a squeeze-bend
    const lp = ac.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1700;
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.3, t + 0.02);
    g.gain.setValueAtTime(0.3, t + 0.17);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.26);
    lp.connect(g).connect(out);
    for (const det of [0, 7]) {
      const o = ac.createOscillator();
      o.type = 'square';
      o.frequency.setValueAtTime((290 + det) * r, t);
      o.frequency.exponentialRampToValueAtTime((345 + det) * r, t + 0.06);
      o.frequency.exponentialRampToValueAtTime((320 + det) * r, t + 0.24);
      o.connect(lp);
      o.start(t);
      o.stop(t + 0.27);
    }
  },
};

/**
 * SoundController: synthesised with Web Audio (no files to download).
 * Muted by default; the visitor's choice is remembered. Audio only starts
 * after a real user gesture, so browsers' autoplay rules are respected.
 */
export function SoundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(() => readFlag('local', KEY) === 'on');
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
  const ctxRef = useRef<AudioContext | null>(null);
  const noiseRef = useRef<AudioBuffer | null>(null);
  const last = useRef<Partial<Record<Sfx, number>>>({});

  const audio = useCallback((create: boolean) => {
    if (!ctxRef.current && create) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctxRef.current = new AC();
    }
    return ctxRef.current;
  }, []);

  // remembered "on" from a previous visit: wait for the first real gesture to unlock audio
  useEffect(() => {
    const unlock = () => {
      if (!enabledRef.current) return;
      const ac = audio(true);
      if (ac?.state === 'suspended') void ac.resume();
    };
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock);
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, [audio]);

  const synth = useCallback(
    (name: Sfx, opts: PlayOpts = {}) => {
      const ac = audio(false);
      if (!ac || ac.state !== 'running') return; // never try to autoplay
      const now = performance.now();
      if (now - (last.current[name] ?? 0) < COOLDOWN_MS) return;
      last.current[name] = now;
      if (!noiseRef.current) {
        const buf = ac.createBuffer(1, ac.sampleRate * 0.6, ac.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        noiseRef.current = buf;
      }
      const out = ac.createGain();
      out.gain.value = MASTER * (opts.volume ?? 1);
      out.connect(ac.destination);
      // small random detune so repeats never sound identical
      const rate = (opts.rate ?? 1) * (0.94 + Math.random() * 0.12);
      RECIPES[name](ac, out, ac.currentTime + 0.005, rate, noiseRef.current);
    },
    [audio],
  );

  const play = useCallback(
    (name: Sfx, opts?: PlayOpts) => {
      if (!enabledRef.current) return;
      try {
        synth(name, opts);
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
      // this click is the user gesture that unlocks audio
      const ac = audio(true);
      if (!ac) return;
      const go = () => synth('honk');
      if (ac.state === 'suspended') void ac.resume().then(go);
      else go();
    }
  }, [audio, synth]);

  const api = useMemo(() => ({ enabled, toggle, play }), [enabled, toggle, play]);
  return <SoundCtx.Provider value={api}>{children}</SoundCtx.Provider>;
}

export const useSound = () => useContext(SoundCtx);
