/**
 * Quiet, crisp "woosh" sounds made from short bursts of filtered noise:
 * a band-pass filter sweeps through the noise, which reads as air moving
 * past — sharp and quick rather than bubbly.
 *
 *   panel  quick swish as a comic panel slides in
 *   chime  rising woosh + one clean, short ping when the home page appears
 *   pop    short, bright flick when she's poked or BAM! is pressed
 *
 * Browsers only allow audio after a real gesture, so nothing plays until the
 * visitor's first click / tap / key press.
 */
import { useSyncExternalStore } from 'react';
import { readFlag, writeFlag } from './storage';

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
