import type { CSSProperties } from 'react';

/** Hand-inked decorative marks. Always decorative (aria-hidden). */
type DoodleKind = 'sparkle' | 'bolt' | 'spiral' | 'arrow' | 'star' | 'swoosh' | 'dots';

type Props = { kind: DoodleKind; className?: string; style?: CSSProperties; color?: string };

export function Doodle({ kind, className = '', style, color = 'var(--ink)' }: Props) {
  const common = {
    className: `doodle doodle--${kind} ${className}`,
    style,
    'aria-hidden': true as const,
    fill: 'none',
    stroke: color,
    strokeWidth: 3,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  switch (kind) {
    case 'sparkle':
      return (
        <svg viewBox="0 0 40 40" {...common}>
          <path d="M20 3 C 21 14, 26 19, 37 20 C 26 21, 21 26, 20 37 C 19 26, 14 21, 3 20 C 14 19, 19 14, 20 3 Z" fill={color} />
        </svg>
      );
    case 'bolt':
      return (
        <svg viewBox="0 0 40 60" {...common}>
          <path d="M24 2 L6 34 H19 L14 58 L34 22 H21 Z" fill="var(--yellow)" />
        </svg>
      );
    case 'spiral':
      return (
        <svg viewBox="0 0 60 60" {...common}>
          <path d="M30 30 c 0 -4 6 -4 6 0 c 0 7 -12 7 -12 0 c 0 -11 18 -11 18 0 c 0 15 -24 15 -24 0 c 0 -19 30 -19 30 0" />
        </svg>
      );
    case 'arrow':
      return (
        <svg viewBox="0 0 120 70" {...common}>
          <path d="M6 12 C 30 4, 70 6, 92 40" />
          <path d="M78 38 L94 44 L98 26" />
        </svg>
      );
    case 'star':
      return (
        <svg viewBox="0 0 40 40" {...common}>
          <path
            d="M20 3 L24.5 15 L37 15.5 L27 23.5 L30.5 36 L20 28.5 L9.5 36 L13 23.5 L3 15.5 L15.5 15 Z"
            fill="var(--yellow)"
          />
        </svg>
      );
    case 'swoosh':
      return (
        <svg viewBox="0 0 80 30" {...common}>
          <path d="M4 22 C 24 6, 52 4, 76 10" />
          <path d="M14 27 C 30 17, 50 15, 68 18" />
        </svg>
      );
    case 'dots':
      return (
        <svg viewBox="0 0 40 12" {...common} stroke="none">
          <circle cx="6" cy="6" r="4" fill={color} />
          <circle cx="20" cy="6" r="4" fill={color} />
          <circle cx="34" cy="6" r="4" fill={color} />
        </svg>
      );
  }
}

/* --- UI icons -------------------------------------------------------------- */

const icon = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true as const,
};

export const IconGithub = () => (
  <svg {...icon} fill="currentColor" stroke="none">
    <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.4-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
  </svg>
);

export const IconLinkedin = () => (
  <svg {...icon} fill="currentColor" stroke="none">
    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11H3v-11Zm6.5 0h3.83v1.5h.05c.53-.95 1.84-1.95 3.79-1.95 4.05 0 4.83 2.5 4.83 5.75v5.7h-4v-5.05c0-1.2-.02-2.75-1.77-2.75-1.78 0-2.05 1.3-2.05 2.66v5.14h-4v-11Z" />
  </svg>
);

export const IconCode = () => (
  <svg {...icon}>
    <path d="m8 7-5 5 5 5M16 7l5 5-5 5M13.5 4l-3 16" />
  </svg>
);

export const IconEye = () => (
  <svg {...icon}>
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3.2" />
  </svg>
);

export const IconChip = () => (
  <svg {...icon}>
    <rect x="6" y="6" width="12" height="12" rx="2" />
    <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
    <path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" />
  </svg>
);

export const IconArrowDown = () => (
  <svg {...icon}>
    <path d="M12 4v15M5 13l7 7 7-7" />
  </svg>
);

export const IconSound = ({ on }: { on: boolean }) => (
  <svg {...icon}>
    <path d="M4 9.5h3.5L12 5v14l-4.5-4.5H4z" fill="currentColor" />
    {on ? (
      <>
        <path d="M15.5 9a4.2 4.2 0 0 1 0 6" />
        <path d="M18.3 6.5a8 8 0 0 1 0 11" />
      </>
    ) : (
      <path d="m16 9.5 5 5m0-5-5 5" />
    )}
  </svg>
);
