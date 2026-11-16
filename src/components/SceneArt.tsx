import type { Scene } from '../content/journey';

const INK = '#16131c';
const ink = { stroke: INK, strokeWidth: 5, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

/** Illustrated environments the protagonist travels through. Decorative. */
export function SceneArt({ scene }: { scene: Scene }) {
  return (
    <svg className={`scene-art scene-art--${scene}`} viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {scene === 'campus' && (
        <g>
          <rect width="1000" height="600" fill="#8fd0c4" />
          <circle cx="820" cy="120" r="60" fill="#ffd23f" stroke={INK} strokeWidth="5" />
          <rect x="0" y="480" width="1000" height="120" fill="#1f7a73" />
          {/* university building */}
          <g {...ink}>
            <rect x="330" y="200" width="560" height="290" fill="#fff8ea" />
            <path d="M310 200 L610 90 L910 200 Z" fill="#f07a2e" />
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <rect key={i} x={370 + i * 85} y="250" width="34" height="200" fill="#efdcbc" />
            ))}
            <rect x="560" y="390" width="100" height="100" fill="#0f4a47" />
          </g>
          <path d="M610 90 v-60" {...ink} />
          <path d="M610 34 l50 14 l-50 14 z" fill="#e5383b" stroke={INK} strokeWidth="4" />
          {/* books */}
          <g {...ink}>
            <rect x="90" y="430" width="160" height="30" fill="#2445d2" />
            <rect x="105" y="400" width="140" height="30" fill="#e5383b" />
            <rect x="80" y="370" width="150" height="30" fill="#ffd23f" />
          </g>
        </g>
      )}

      {scene === 'ambassador' && (
        <g>
          <rect width="1000" height="600" fill="#f7b6c8" />
          <circle cx="640" cy="290" r="250" fill="#fde3ea" stroke={INK} strokeWidth="5" />
          {/* sparkle constellation */}
          {[
            [640, 290, 70],
            [480, 170, 34],
            [820, 160, 40],
            [800, 430, 30],
            [480, 420, 26],
          ].map(([x, y, r], i) => (
            <path
              key={i}
              className="scene-art__spark"
              {...ink}
              strokeWidth="4"
              fill={i === 0 ? '#2445d2' : '#fff8ea'}
              d={`M${x} ${y - r} C${x + r * 0.12} ${y - r * 0.12} ${x + r * 0.12} ${y - r * 0.12} ${x + r} ${y} C${x + r * 0.12} ${y + r * 0.12} ${x + r * 0.12} ${y + r * 0.12} ${x} ${y + r} C${x - r * 0.12} ${y + r * 0.12} ${x - r * 0.12} ${y + r * 0.12} ${x - r} ${y} C${x - r * 0.12} ${y - r * 0.12} ${x - r * 0.12} ${y - r * 0.12} ${x} ${y - r}Z`}
            />
          ))}
          <g stroke={INK} strokeWidth="3" strokeDasharray="8 10" fill="none" opacity=".5">
            <path d="M480 170 L640 290 L820 160 M640 290 L800 430 M640 290 L480 420" />
          </g>
          {/* peers' bubbles */}
          <g {...ink} strokeWidth="4" fill="#fff8ea">
            <rect x="90" y="120" width="120" height="70" rx="34" />
            <rect x="150" y="380" width="140" height="70" rx="34" />
          </g>
          <text x="150" y="168" textAnchor="middle" fontFamily="var(--font-sfx)" fontSize="40" fill={INK}>
            AI?!
          </text>
          <text x="220" y="428" textAnchor="middle" fontFamily="var(--font-sfx)" fontSize="38" fill={INK}>
            HOW?
          </text>
        </g>
      )}

      {scene === 'next' && (
        <g>
          <rect width="1000" height="600" fill="#ffb07a" />
          <circle cx="620" cy="330" r="150" fill="#ffd23f" />
          <rect y="330" width="1000" height="270" fill="#c4521a" />
          <path d="M520 330 L380 600 L860 600 L720 330 Z" fill="#16131c" />
          <path d="M620 340 v40 M620 410 v60 M620 500 v80" stroke="#ffd23f" strokeWidth="10" strokeLinecap="round" />
          {/* signpost */}
          <g {...ink}>
            <path d="M200 560 V250" />
            <path d="M120 260 h170 l30 30 l-30 30 h-170 z" fill="#fff8ea" />
          </g>
          <text x="205" y="303" textAnchor="middle" fontFamily="var(--font-sfx)" fontSize="40" fill={INK}>
            NEXT →
          </text>
          {/* robot arm doodle: robotics & embedded */}
          <g {...ink} fill="#1f7a73">
            <rect x="830" y="470" width="90" height="40" />
            <path d="M875 470 L840 380 L900 320" fill="none" strokeWidth="14" stroke="#1f7a73" />
            <path d="M875 470 L840 380 L900 320" fill="none" />
            <circle cx="840" cy="380" r="14" fill="#ffd23f" />
            <path d="M900 320 l30 -10 M900 320 l14 28" fill="none" />
          </g>
          <text x="620" y="250" textAnchor="middle" fontFamily="var(--font-sfx)" fontSize="150" fill="#fff8ea" stroke={INK} strokeWidth="5">
            ?
          </text>
        </g>
      )}
    </svg>
  );
}
