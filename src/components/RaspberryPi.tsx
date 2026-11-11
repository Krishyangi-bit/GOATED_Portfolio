/**
 * Ink illustration of a Raspberry Pi having a very bad day — for the
 * "first bug" panel. The dashed slot marks the missing voltage divider.
 */
export function RaspberryPi({ className = '' }: { className?: string }) {
  const pins = [];
  for (let i = 0; i < 20; i++) {
    pins.push(<rect key={`a${i}`} x={44 + i * 6.8} y={19} width={4} height={4} rx={0.8} />);
    pins.push(<rect key={`b${i}`} x={44 + i * 6.8} y={25.5} width={4} height={4} rx={0.8} />);
  }
  return (
    <svg className={`rpi ${className}`} viewBox="0 0 250 190" role="img" aria-label="A Raspberry Pi board, smoking, with an empty spot where the voltage divider should be">
      {/* smoke */}
      <g className="rpi__smoke">
        <circle cx="96" cy="44" r="13" />
        <circle cx="110" cy="30" r="10" />
        <circle cx="88" cy="24" r="8" />
      </g>
      <g className="rpi__board" stroke="var(--ink)" strokeWidth="3" strokeLinejoin="round">
        <rect x="10" y="40" width="200" height="130" rx="10" fill="var(--teal)" />
        {/* traces */}
        <path d="M40 120 H 70 V 100 M150 70 H 180 M140 140 H 190" stroke="var(--teal-light)" strokeWidth="2" fill="none" opacity="0.8" />
        {/* holes */}
        {[
          [24, 54],
          [24, 156],
          [176, 54],
          [176, 156],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="5.5" fill="var(--paper)" />
        ))}
        {/* GPIO header */}
        <rect x="40" y="44" width="142" height="16" rx="2" fill="var(--ink)" />
        <g fill="var(--yellow)" stroke="none" transform="translate(0 26)">
          {pins}
        </g>
        {/* SoC */}
        <rect x="70" y="78" width="46" height="46" rx="4" fill="var(--ink)" />
        <rect x="76" y="84" width="14" height="6" rx="2" fill="var(--ink-mute)" stroke="none" />
        {/* ports */}
        <rect x="196" y="70" width="44" height="28" rx="3" fill="#d7dde2" />
        <rect x="196" y="104" width="44" height="28" rx="3" fill="#d7dde2" />
        <rect x="196" y="138" width="40" height="24" rx="3" fill="#d7dde2" />
        <path d="M203 78 h30 M203 112 h30" stroke="var(--ink-mute)" strokeWidth="2" />
      </g>
      {/* the missing voltage divider */}
      <g className="rpi__missing">
        <rect x="128" y="132" width="50" height="24" rx="4" fill="none" stroke="var(--yellow)" strokeWidth="3" strokeDasharray="6 5" />
        <text x="153" y="150" textAnchor="middle" fontFamily="var(--font-sfx)" fontSize="18" fill="var(--yellow)">
          ?
        </text>
      </g>
      {/* sparks */}
      <g className="rpi__sparks" fill="none" stroke="var(--yellow)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M120 74 l10 -12 l-2 10 l12 -10" />
        <path d="M64 82 l-12 -8 l9 -1 l-11 -10" />
        <path d="M118 128 l12 8 l-9 1 l11 9" />
      </g>
    </svg>
  );
}
