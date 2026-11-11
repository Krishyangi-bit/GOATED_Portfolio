/**
 * Shared motion language. Every animation in the comic pulls from these
 * so the character, panels, type and buttons all move with the same "hand".
 */
export const EASE = {
  /** things that land: speech bubbles, stamps, buttons */
  pop: 'back.out(2.2)',
  /** strong overshoot for impact moments (BAM!) */
  impact: 'back.out(3.2)',
  /** ink being drawn / panels wiping open */
  ink: 'power3.inOut',
  /** soft settling */
  settle: 'power3.out',
  /** squash & stretch recovery */
  spring: 'elastic.out(1, 0.45)',
  /** looping, organic motion */
  sway: 'sine.inOut',
} as const;

export const DUR = {
  blink: 0.06,
  fast: 0.18,
  base: 0.45,
  slow: 0.8,
  page: 1.1,
} as const;

/** Deterministic pseudo-random so jagged shapes look hand-made but stay stable between renders. */
export function seeded(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/** Points for a comic starburst polygon in a 0–100 viewBox. */
export function burstPoints(spikes: number, seed = 7, inner = 0.62, jitter = 0.12): string {
  const rnd = seeded(seed);
  const pts: string[] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const outer = i % 2 === 0;
    const r = (outer ? 1 : inner) * (1 - rnd() * jitter) * 50;
    const a = (i / (spikes * 2)) * Math.PI * 2 + (rnd() - 0.5) * 0.12;
    pts.push(`${(50 + Math.cos(a) * r).toFixed(2)},${(50 + Math.sin(a) * r).toFixed(2)}`);
  }
  return pts.join(' ');
}

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
