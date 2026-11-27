/**
 * Quiet, crisp "woosh" sounds made from short bursts of filtered noise:
 * a band-pass filter sweeps through the noise, which reads as air moving
 * past — sharp and quick rather than bubbly.
 *
 *   panel  quick swish as a comic panel slides in
 *   chime  rising woosh + one clean, short ping when the home page appears
 *   pop    short, bright flick when she's poked or BAM! is pressed
 *
 * Expression voices (playMoodVoice): tiny synthesized cartoon vocalisations —
 * a buzzy voice source shaped by vowel formant filters — one per expression:
 *   thinking "hmmm" · mischief/smirk "heh-heh" · excited/happy "woo-hoo!"
 *   greeting/wave "hey!" · confused "huh?" · surprised "oh!"
 *
 * Browsers only allow audio after a real gesture, so nothing plays until the
 * visitor's first click / tap / key press.
 */
import { useSyncExternalStore } from 'react';
import { readFlag, writeFlag } from './storage';
import type { Mood } from '../character/poses';

export type SoftSound = 'panel' | 'chime' | 'pop';

const MASTER = 0.07;
const COOLDOWN_MS = 120;
const MUTE_KEY = 'lcb-muted';

let ctx: AudioContext | null = null;
let out: GainNode | null = null;
let noise: AudioBuffer | null = null;
const last: Partial<Record<SoftSound, number>> = {};

// --- mute: on by default, the visitor's choice is remembered ---------------
let muted = typeof window !== 'undefined' && readFlag('local', MUTE_KEY) === '1';
const listeners = new Set<() => void>();

export function setMuted(next: boolean) {
  muted = next;
  writeFlag('local', MUTE_KEY, next ? '1' : '0');
  listeners.forEach((l) => l());
  if (!next) {
    // the unmute click is itself a gesture: unlock audio and give a tiny confirmation pop
    const ac = ensure();
    const go = () => playSoft('pop');
    if (ac?.state === 'suspended') void ac.resume().then(go);
    else go();
  }
}

export function useMuted() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => muted,
    () => false,
  );
}

function ensure() {
  if (ctx) return ctx;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  // only trim the low rumble; the top end stays open so wooshes sound crisp
  const trim = ctx.createBiquadFilter();
  trim.type = 'highpass';
  trim.frequency.value = 180;
  out = ctx.createGain();
  out.gain.value = MASTER;
  out.connect(trim).connect(ctx.destination);
  // one second of white noise, reused by every woosh
  noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return ctx;
}

if (typeof window !== 'undefined') {
  const unlock = () => {
    const ac = ensure();
    if (ac?.state === 'suspended') void ac.resume();
  };
  window.addEventListener('pointerdown', unlock, { passive: true });
  window.addEventListener('keydown', unlock);
  window.addEventListener('touchstart', unlock, { passive: true });
}

/**
 * Woosh: noise through a band-pass whose centre sweeps from `from` to `to` Hz.
 * Fast attack, quick tail — a narrow-ish band (Q) keeps it airy, not hissy.
 */
function woosh(ac: AudioContext, t: number, from: number, to: number, peak: number, dur: number, q = 1.6) {
  if (!noise) return;
  const src = ac.createBufferSource();
  src.buffer = noise;
  const bp = ac.createBiquadFilter();
  bp.type = 'bandpass';
  bp.Q.value = q;
  bp.frequency.setValueAtTime(from, t);
  bp.frequency.exponentialRampToValueAtTime(to, t + dur);
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + dur * 0.3);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(bp).connect(g).connect(out!);
  src.start(t, Math.random() * 0.5);
  src.stop(t + dur + 0.02);
}

/** a short tone with a fast attack and fade */
function note(ac: AudioContext, t: number, from: number, to: number, peak: number, attack: number, decay: number, type: OscillatorType = 'sine') {
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.setValueAtTime(from, t);
  o.frequency.exponentialRampToValueAtTime(to, t + attack + decay * 0.6);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  o.connect(g).connect(out!);
  o.start(t);
  o.stop(t + attack + decay + 0.05);
}

const RECIPES: Record<SoftSound, (ac: AudioContext, t: number, r: number) => void> = {
  panel(ac, t, r) {
    woosh(ac, t, 700 * r, 3800 * r, 1.4, 0.2);
  },
  chime(ac, t) {
    woosh(ac, t, 500, 5000, 1.2, 0.32, 1.2);
    note(ac, t + 0.26, 1568, 1568, 0.22, 0.004, 0.32, 'triangle');
  },
  pop(ac, t, r) {
    woosh(ac, t, 2400 * r, 6000 * r, 1.1, 0.09, 2.2);
    note(ac, t, 1200 * r, 1800 * r, 0.18, 0.003, 0.06, 'triangle');
  },
};

export function playSoft(name: SoftSound, opts: { rate?: number } = {}) {
  try {
    if (muted || !ctx || ctx.state !== 'running' || !out) return;
    const now = performance.now();
    if (now - (last[name] ?? 0) < COOLDOWN_MS) return;
    last[name] = now;
    // small random detune so consecutive panels never sound identical
    const r = (opts.rate ?? 1) * (0.95 + Math.random() * 0.1);
    RECIPES[name](ctx, ctx.currentTime + 0.01, r);
  } catch {
    /* audio is a nice-to-have */
  }
}

// ---------------------------------------------------------------------------
// Expression voices
// ---------------------------------------------------------------------------

/** vowel formants (F1, F2, F3 in Hz) for a light, higher voice */
const VOWEL = {
  ee: [310, 2790, 3310],
  eh: [610, 2330, 2990],
  ah: [850, 1220, 2810],
  oh: [500, 900, 2800],
  oo: [370, 950, 2670],
  uh: [700, 1350, 2780],
} as const;
type Vowel = keyof typeof VOWEL;

type Syllable = {
  /** start offset in seconds */
  at: number;
  dur: number;
  /** pitch glide, Hz */
  pitch: [number, number];
  /** vowel glide; 'mm' is a closed-mouth hum */
  vowel: [Vowel, Vowel] | 'mm';
  peak?: number;
  /** breathy "h" before the vowel */
  h?: boolean;
};

function syllable(ac: AudioContext, t0: number, s: Syllable) {
  const t = t0 + s.at + (s.h ? 0.045 : 0);
  const end = t + s.dur;
  const peak = s.peak ?? 1;

  if (s.h && noise) {
    // a short puff of air shaped like the vowel that follows
    const n = ac.createBufferSource();
    n.buffer = noise;
    const f = ac.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = s.vowel === 'mm' ? 900 : VOWEL[s.vowel[0]][1];
    f.Q.value = 1.2;
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t - 0.045);
    g.gain.exponentialRampToValueAtTime(0.5 * peak, t - 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
    n.connect(f).connect(g).connect(out!);
    n.start(t - 0.045, Math.random() * 0.5);
    n.stop(t + 0.05);
  }

  const osc = ac.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(s.pitch[0], t);
  osc.frequency.exponentialRampToValueAtTime(s.pitch[1], end);
  // a little vibrato keeps it from sounding like a robot
  const lfo = ac.createOscillator();
  const depth = ac.createGain();
  lfo.frequency.value = 5.5;
  depth.gain.value = s.pitch[0] * 0.015;
  lfo.connect(depth).connect(osc.frequency);

  const env = ac.createGain();
  env.gain.setValueAtTime(0.0001, t);
  env.gain.exponentialRampToValueAtTime(peak, t + Math.min(0.04, s.dur * 0.3));
  env.gain.setValueAtTime(peak, Math.max(t + 0.04, end - 0.09));
  env.gain.exponentialRampToValueAtTime(0.0001, end);
  env.connect(out!);

  if (s.vowel === 'mm') {
    // nasal hum: mouth closed, only the low buzz gets through
    const lp = ac.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 420;
    lp.Q.value = 3;
    const g = ac.createGain();
    g.gain.value = 1.4;
    osc.connect(lp).connect(g).connect(env);
  } else {
    const [a, b] = s.vowel;
    VOWEL[a].forEach((fa, i) => {
      const fb = VOWEL[b][i];
      const bp = ac.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(fa, t);
      bp.frequency.linearRampToValueAtTime(fb, end);
      bp.Q.value = fa / 90;
      const g = ac.createGain();
      g.gain.value = [2.6, 1.6, 0.7][i];
      osc.connect(bp).connect(g).connect(env);
    });
  }

  osc.start(t);
  lfo.start(t);
  osc.stop(end + 0.02);
  lfo.stop(end + 0.02);
}

/** one short vocalisation per expression; idle / neutral stay silent */
const VOICES: Partial<Record<Mood, Syllable[]>> = {
  thinking: [{ at: 0, dur: 0.75, pitch: [235, 205], vowel: 'mm', peak: 0.9 }],
  mischief: [
    { at: 0, dur: 0.12, pitch: [330, 300], vowel: ['eh', 'eh'], h: true, peak: 0.8 },
    { at: 0.19, dur: 0.14, pitch: [300, 270], vowel: ['eh', 'eh'], h: true, peak: 0.75 },
  ],
  smirk: [
    { at: 0, dur: 0.12, pitch: [330, 300], vowel: ['eh', 'eh'], h: true, peak: 0.8 },
    { at: 0.19, dur: 0.14, pitch: [300, 270], vowel: ['eh', 'eh'], h: true, peak: 0.75 },
  ],
  excited: [
    { at: 0, dur: 0.2, pitch: [300, 420], vowel: ['oo', 'oo'], peak: 0.9 },
    { at: 0.24, dur: 0.3, pitch: [380, 560], vowel: ['oo', 'oo'], h: true, peak: 1 },
  ],
  happy: [
    { at: 0, dur: 0.2, pitch: [300, 420], vowel: ['oo', 'oo'], peak: 0.9 },
    { at: 0.24, dur: 0.3, pitch: [380, 560], vowel: ['oo', 'oo'], h: true, peak: 1 },
  ],
  greeting: [{ at: 0, dur: 0.32, pitch: [300, 400], vowel: ['eh', 'ee'], h: true, peak: 1 }],
  wave: [{ at: 0, dur: 0.32, pitch: [300, 400], vowel: ['eh', 'ee'], h: true, peak: 1 }],
  waving: [{ at: 0, dur: 0.32, pitch: [300, 400], vowel: ['eh', 'ee'], h: true, peak: 1 }],
  confused: [{ at: 0, dur: 0.36, pitch: [220, 360], vowel: ['uh', 'uh'], h: true, peak: 1 }],
  surprised: [{ at: 0, dur: 0.26, pitch: [380, 300], vowel: ['oh', 'oo'], peak: 1 }],
};

const VOICE_COOLDOWN_MS = 450;
let lastVoice = 0;

/** Play the little vocalisation that goes with an expression (if any). */
export function playMoodVoice(mood: Mood) {
  try {
    const parts = VOICES[mood];
    if (!parts || muted || !ctx || ctx.state !== 'running' || !out) return;
    const now = performance.now();
    if (now - lastVoice < VOICE_COOLDOWN_MS) return;
    lastVoice = now;
    const t = ctx.currentTime + 0.03;
    parts.forEach((p) => syllable(ctx!, t, p));
  } catch {
    /* audio is a nice-to-have */
  }
}
