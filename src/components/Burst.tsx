import { forwardRef, useMemo, type CSSProperties } from 'react';
import { burstPoints } from '../lib/motion';
import './Burst.css';

type Props = {
  text: string;
  /** fill of the starburst */
  color?: string;
  /** colour of the lettering */
  ink?: string;
  spikes?: number;
  seed?: number;
  className?: string;
  style?: CSSProperties;
  /** decorative by default; pass a label to expose it */
  label?: string;
};

/** Comic sound-effect: jagged starburst with stamped lettering. */
export const Burst = forwardRef<HTMLDivElement, Props>(function Burst(
  { text, color = 'var(--yellow)', ink = 'var(--ink)', spikes = 14, seed = 11, className = '', style, label },
  ref,
) {
  const outer = useMemo(() => burstPoints(spikes, seed, 0.66, 0.16), [spikes, seed]);
  const inner = useMemo(() => burstPoints(spikes, seed + 3, 0.7, 0.14), [spikes, seed]);
  return (
    <div
      ref={ref}
      className={`burst ${className}`}
      style={{ ...style, ['--burst-fill' as string]: color, ['--burst-ink' as string]: ink }}
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
    >
      <svg className="burst__shape" viewBox="-4 -4 108 108" aria-hidden="true">
        <polygon className="burst__shadow" points={outer} transform="translate(3 3)" />
        <polygon className="burst__outer" points={outer} />
        <polygon className="burst__inner" points={inner} transform="translate(50 50) scale(.72) translate(-50 -50)" />
      </svg>
      <span className="burst__text">{text}</span>
    </div>
  );
});
