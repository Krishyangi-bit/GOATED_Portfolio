/**
 * Very quiet, rounded sounds: no noise, no square/saw waves, slow attacks and
 * a low-pass on everything, so nothing ever sounds sharp.
 *
 *   panel  soft woody "pop" as a comic panel lands
 *   chime  two gentle notes when the home page appears
 *   pop    tiny bubble-pop when she's poked or BAM! is pressed
 *
 * Browsers only allow audio after a real gesture, so nothing plays until the
 * visitor's first click / tap / key press.
 */
import { useSyncExternalStore } from 'react';
import { readFlag, writeFlag } from './storage';

export type SoftSound = 'panel' | 'chime' | 'pop';

const MASTER = 0.05;
const COOLDOWN_MS = 120;
const MUTE_KEY = 'lcb-muted';

let ctx: AudioContext | null = null;
let out: GainNode | null = null;
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
  const warm = ctx.createBiquadFilter();
  warm.type = 'lowpass';
  warm.frequency.value = 1400;
  warm.Q.value = 0.4;
  out = ctx.createGain();
  out.gain.value = MASTER;
  out.connect(warm).connect(ctx.destination);
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

/** a sine note with a soft swell in and a long gentle fade */
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
    note(ac, t, 320 * r, 210 * r, 0.8, 0.012, 0.22);
    note(ac, t, 640 * r, 420 * r, 0.12, 0.015, 0.12);
  },
  chime(ac, t) {
    note(ac, t, 523, 523, 0.5, 0.03, 0.7);
    note(ac, t + 0.14, 784, 784, 0.4, 0.03, 0.9);
  },
  pop(ac, t, r) {
    note(ac, t, 380 * r, 560 * r, 0.6, 0.01, 0.14, 'triangle');
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
