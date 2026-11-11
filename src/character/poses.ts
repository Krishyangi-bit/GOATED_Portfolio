/**
 * Character asset map.
 *
 * Five hand-illustrated poses of the same character, cut out from their
 * backgrounds and given one shared sticker border (see assets-src/README.md).
 * All poses share one 743×1052 canvas and are pixel-aligned, so swapping
 * between them reads as a change of expression rather than a new picture.
 */
export type Pose = 'idle' | 'wave' | 'excited' | 'mischief' | 'confused';

/** Narrative states the rest of the site asks for; each maps onto a drawn pose. */
export type Mood =
  | Pose
  | 'neutral'
  | 'greeting'
  | 'waving'
  | 'happy'
  | 'thinking'
  | 'smirk'
  | 'surprised';

const MOOD_TO_POSE: Record<Mood, Pose> = {
  idle: 'idle',
  neutral: 'idle',
  wave: 'wave',
  greeting: 'wave',
  waving: 'wave',
  excited: 'excited',
  happy: 'excited',
  mischief: 'mischief',
  thinking: 'mischief',
  smirk: 'mischief',
  confused: 'confused',
  surprised: 'confused',
};

export const resolvePose = (m: Mood): Pose => MOOD_TO_POSE[m];

export const CANVAS = { w: 743, h: 1052 } as const;

type Box = { x: number; y: number; w: number; h: number };

export type PoseAsset = {
  src: string;
  srcSm: string;
  alt: string;
  /** closed-eye overlay, painted to match this face */
  blink?: { src: string; box: Box };
  /** separately animated raised hand, rotating around its wrist */
  hand?: { src: string; box: Box; pivot: { x: number; y: number } };
};

const BLINK_BOX: Box = { x: 248, y: 280, w: 210, h: 80 };

export const POSES: Record<Pose, PoseAsset> = {
  idle: {
    src: '/character/idle.webp',
    srcSm: '/character/idle-sm.webp',
    alt: 'Krishyangi, smiling calmly',
    blink: { src: '/character/blink-idle.webp', box: BLINK_BOX },
  },
  wave: {
    src: '/character/wave-base.webp',
    srcSm: '/character/wave-base-sm.webp',
    alt: 'Krishyangi, waving hello',
    blink: { src: '/character/blink-wave.webp', box: BLINK_BOX },
    hand: {
      src: '/character/wave-hand.webp',
      box: { x: 0, y: 430, w: 280, h: 350 },
      pivot: { x: 165, y: 748 },
    },
  },
  excited: {
    src: '/character/excited.webp',
    srcSm: '/character/excited-sm.webp',
    alt: 'Krishyangi, grinning with excitement',
  },
  mischief: {
    src: '/character/mischief.webp',
    srcSm: '/character/mischief-sm.webp',
    alt: 'Krishyangi, smirking mischievously with a finger on her chin',
  },
  confused: {
    src: '/character/confused.webp',
    srcSm: '/character/confused-sm.webp',
    alt: 'Krishyangi, confused, hands raised in a shrug',
  },
};

/** CSS percentage helpers for overlay layers */
export const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(4)}%`;
