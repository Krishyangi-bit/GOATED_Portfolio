import { useEffect, useRef, type ReactNode } from 'react';
import './ComicButton.css';

type Props = {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ink';
  href?: string;
  external?: boolean;
  onClick?: () => void;
  /** sound-effect word that pops out on hover */
  sfx?: string;
  icon?: ReactNode;
  /** fourth-wall hook: fires when someone hovers but doesn't commit */
  onLongHover?: () => void;
  longHoverMs?: number;
  className?: string;
  /** render as a form submit button */
  submit?: boolean;
  disabled?: boolean;
  /** link downloads the file (optionally under this name) instead of navigating */
  download?: string | boolean;
};

export function ComicButton({
  children,
  variant = 'primary',
  href,
  external,
  onClick,
  sfx,
  icon,
  onLongHover,
  longHoverMs = 2600,
  className = '',
  submit = false,
  disabled = false,
  download,
}: Props) {
  const timer = useRef<number>();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const enter = () => {
    if (!onLongHover) return;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(onLongHover, longHoverMs);
  };
  const leave = () => window.clearTimeout(timer.current);
  const click = () => {
    leave();
    onClick?.();
  };

  const inner = (
    <>
      <span className="cbtn__face">
        {icon && <span className="cbtn__icon" aria-hidden="true">{icon}</span>}
        <span className="cbtn__label">{children}</span>
      </span>
      <span className="cbtn__lines" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      {sfx && (
        <span className="cbtn__sfx" aria-hidden="true">
          {sfx}
        </span>
      )}
    </>
  );

  const cls = `cbtn cbtn--${variant} ${className}`;
  const handlers = { onPointerEnter: enter, onPointerLeave: leave, onFocus: enter, onBlur: leave };

  if (href) {
    return (
      <a
        className={cls}
        href={href}
        onClick={click}
        {...handlers}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...(download ? { download: download === true ? '' : download } : {})}
      >
        {inner}
        {external && <span className="sr-only"> (opens in a new tab)</span>}
      </a>
    );
  }
  return (
    <button type={submit ? 'submit' : 'button'} className={cls} onClick={click} disabled={disabled} {...handlers}>
      {inner}
    </button>
  );
}
