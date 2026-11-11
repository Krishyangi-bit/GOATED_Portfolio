import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { gsap } from '../lib/gsap';
import { EASE, clamp } from '../lib/motion';
import { hasFinePointer, useReducedMotion } from '../hooks/useReducedMotion';
import { CANVAS, POSES, pct, resolvePose, type Mood, type Pose } from './poses';
import './Character.css';

export type CharacterHandle = {
  /** Rotates the raised hand at the wrist. Queued if she isn't in the wave pose yet. */
  wave: (cycles?: number) => void;
  /** Little jump of joy. */
  hop: () => void;
  /** Flustered side-to-side shake. */
  shake: () => void;
};

type Props = {
  mood: Mood;
  /** Accessible name. When `onActivate` is set the character becomes a button. */
  label: string;
  onActivate?: () => void;
  /** Extra poses to mount up-front so their first appearance is instant. */
  preload?: Pose[];
  /** `sizes` attribute for the responsive images. */
  sizes?: string;
  /** Lean toward the cursor (mouse / trackpad only). */
  tilt?: boolean;
  blink?: boolean;
  eager?: boolean;
  className?: string;
  style?: CSSProperties;
};

/**
 * Layered character rig:
 *
 *   root ─ tilt (cursor lean, perspective)
 *          └ rig (hops, shakes, squash & stretch on expression change)
 *             └ breathe (looping CSS idle)
 *                └ pose layers (one per expression; crossfaded + scaled)
 *                   ├ base illustration
 *                   ├ blink overlay (idle / wave faces)
 *                   └ hand layer (wave pose, rotates at the wrist)
 *
 * Expression changes are image crossfades. Because every pose shares one
 * pixel-aligned canvas, the head, hair and jacket stay put while the face and
 * hands change, and a short squash on the rig sells it as one movement.
 */
export const Character = forwardRef<CharacterHandle, Props>(function Character(
  {
    mood,
    label,
    onActivate,
    preload = [],
    sizes = '(max-width: 640px) 80vw, 42vw',
    tilt = false,
    blink = true,
    eager = false,
    className = '',
    style,
  },
  ref,
) {
  const pose = resolvePose(mood);
  const reduced = useReducedMotion();

  const rootRef = useRef<HTMLElement | null>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const rigRef = useRef<HTMLDivElement>(null);
  const layers = useRef<Partial<Record<Pose, HTMLDivElement | null>>>({});
  const shown = useRef<Pose>(pose);
  const firstPose = useRef<Pose>(pose);
  const pendingWave = useRef(0);
  const visible = useRef(true);
  const token = useRef(0);

  const [mounted, setMounted] = useState<Pose[]>(() => Array.from(new Set([pose, ...preload])));
  const [paused, setPaused] = useState(false);

  // --- hand wave ---------------------------------------------------------
  const runWave = (cycles: number) => {
    const hand = layers.current.wave?.querySelector<HTMLElement>('.char__hand');
    const rig = rigRef.current;
    if (!hand || !rig || reduced) return;
    gsap.killTweensOf(hand);
    const tl = gsap.timeline();
    for (let i = 0; i < cycles; i++) {
      tl.to(hand, { rotation: -11, duration: 0.2, ease: EASE.sway }).to(hand, {
        rotation: -1.5,
        duration: 0.2,
        ease: EASE.sway,
      });
    }
    tl.to(hand, { rotation: 0, duration: 0.25, ease: EASE.settle });
    gsap.fromTo(
      rig,
      { rotation: 0 },
      { rotation: -0.8, duration: 0.4, ease: EASE.sway, yoyo: true, repeat: Math.max(1, cycles - 1), transformOrigin: '50% 100%' },
    );
  };

  // --- expression transitions -------------------------------------------
  useLayoutEffect(() => {
    if (!mounted.includes(pose)) {
      setMounted((m) => (m.includes(pose) ? m : [...m, pose]));
      return;
    }
    const from = shown.current;
    if (from === pose) return;

    const inEl = layers.current[pose];
    if (!inEl) return;
    const my = ++token.current;
    shown.current = pose;

    const go = () => {
      if (my !== token.current) return;
      const outEls = (Object.keys(layers.current) as Pose[])
        .filter((p) => p !== pose)
        .map((p) => layers.current[p])
        .filter((el): el is HTMLDivElement => !!el);
      const prev = layers.current[from];

      gsap.killTweensOf([inEl, ...outEls]);
      gsap.set(outEls, { zIndex: 1 });
      if (prev) gsap.set(prev, { zIndex: 2 });
      gsap.set(inEl, { zIndex: 3 });

      if (reduced) {
        gsap.to(inEl, { opacity: 1, duration: 0.2 });
        gsap.to(outEls, { opacity: 0, duration: 0.2, delay: 0.15 });
      } else {
        const tilt = (Math.random() > 0.5 ? 1 : -1) * 1.1;
        // incoming expression lands on top: quick opacity, springy transform
        gsap.to(inEl, { opacity: 1, duration: 0.2, ease: 'power1.out' });
        gsap.fromTo(
          inEl,
          { scale: 1.03, y: -8, rotation: tilt },
          { scale: 1, y: 0, rotation: 0, duration: 0.6, ease: EASE.pop },
        );
        // outgoing expression only fades once it's covered: no see-through ghosting
        if (prev) {
          gsap.to(prev, { scale: 0.99, y: 3, duration: 0.25, ease: 'power1.in' });
          gsap.to(prev, {
            opacity: 0,
            duration: 0.16,
            delay: 0.16,
            onComplete: () => void gsap.set(prev, { scale: 1, y: 0, rotation: 0 }),
          });
        }
        gsap.to(
          outEls.filter((el) => el !== prev),
          { opacity: 0, duration: 0.2 },
        );
        // squash & stretch on the whole rig
        if (rigRef.current) {
          gsap.fromTo(
            rigRef.current,
            { scaleX: 1.018, scaleY: 0.972 },
            { scaleX: 1, scaleY: 1, duration: 0.7, ease: EASE.spring, transformOrigin: '50% 100%' },
          );
        }
      }

      if (pose === 'wave' && pendingWave.current) {
        const n = pendingWave.current;
        pendingWave.current = 0;
        gsap.delayedCall(0.15, () => runWave(n));
      }
    };

    // don't crossfade into a half-decoded image
    const img = inEl.querySelector('img');
    if (img && !img.complete) {
      img.decode().then(go, go);
    } else {
      go();
    }
    // runWave is stable enough for our purposes; it reads refs only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pose, mounted, reduced]);

  // --- imperative actions ---------------------------------------------------
  useImperativeHandle(
    ref,
    () => ({
      wave(cycles = 3) {
        if (shown.current !== 'wave') {
          pendingWave.current = cycles;
          return;
        }
        runWave(cycles);
      },
      hop() {
        const rig = rigRef.current;
        if (!rig || reduced) return;
        gsap.killTweensOf(rig, 'y');
        gsap
          .timeline()
          .to(rig, { y: -22, duration: 0.18, ease: 'power2.out' })
          .to(rig, { y: 0, duration: 0.5, ease: 'bounce.out' });
      },
      shake() {
        const rig = rigRef.current;
        if (!rig || reduced) return;
        gsap.killTweensOf(rig, 'x');
        gsap.fromTo(
          rig,
          { x: 0 },
          { keyframes: { x: [0, -9, 8, -6, 4, 0] }, duration: 0.5, ease: 'none' },
        );
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [reduced],
  );

  // --- blinking -----------------------------------------------------------
  useEffect(() => {
    if (!blink || reduced) return;
    let alive = true;
    let next: gsap.core.Tween | null = null;
    const schedule = () => {
      next = gsap.delayedCall(2.2 + Math.random() * 3.6, doBlink);
    };
    const doBlink = () => {
      if (!alive) return;
      const lid = layers.current[shown.current]?.querySelector<HTMLElement>('.char__blink');
      if (lid && visible.current) {
        // the lid sweeps down (clip from the top), then lifts again
        const tl = gsap.timeline();
        tl.fromTo(lid, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.07, ease: 'power1.in' })
          .to(lid, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.11, ease: 'power1.out' }, '+=0.05');
        if (Math.random() < 0.2) {
          tl.to(lid, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.07, ease: 'power1.in' }, '+=0.12').to(
            lid,
            { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.11, ease: 'power1.out' },
            '+=0.05',
          );
        }
      }
      schedule();
    };
    schedule();
    return () => {
      alive = false;
      next?.kill();
    };
  }, [blink, reduced]);

  // --- pause idle loops off-screen ---------------------------------------
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => {
      visible.current = entry.isIntersecting;
      setPaused(!entry.isIntersecting);
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // --- lean toward the cursor ---------------------------------------------
  useEffect(() => {
    const el = tiltRef.current;
    const root = rootRef.current;
    if (!tilt || reduced || !el || !root || !hasFinePointer()) return;
    gsap.set(el, { transformPerspective: 1100, transformOrigin: '50% 85%' });
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.9, ease: 'power3' });
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.9, ease: 'power3' });
    const tx = gsap.quickTo(el, 'x', { duration: 1.1, ease: 'power3' });
    const onMove = (e: PointerEvent) => {
      if (!visible.current) return;
      const r = root.getBoundingClientRect();
      const dx = clamp((e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2), -1, 1);
      const dy = clamp((e.clientY - (r.top + r.height * 0.3)) / (window.innerHeight / 2), -1, 1);
      ry(dx * 9);
      rx(-dy * 5);
      tx(dx * 10);
    };
    const onLeave = () => {
      rx(0);
      ry(0);
      tx(0);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      gsap.set(el, { rotationX: 0, rotationY: 0, x: 0 });
    };
  }, [tilt, reduced]);

  // --- render ---------------------------------------------------------------
  const rig = (
    <div className="char__tilt" ref={tiltRef}>
      <div className="char__rig" ref={rigRef}>
        <div className="char__breathe">
          {mounted.map((p) => {
            const a = POSES[p];
            return (
              <div
                key={p}
                className="char__pose"
                data-pose={p}
                ref={(el) => {
                  layers.current[p] = el;
                }}
                style={{ opacity: p === firstPose.current ? 1 : 0 }}
              >
                <img
                  className="char__img"
                  src={a.src}
                  srcSet={`${a.srcSm} 416w, ${a.src} 743w`}
                  sizes={sizes}
                  width={CANVAS.w}
                  height={CANVAS.h}
                  alt=""
                  draggable={false}
                  loading={eager || p === firstPose.current ? 'eager' : 'lazy'}
                  decoding="async"
                />
                {a.blink && (
                  <img
                    className="char__blink"
                    src={a.blink.src}
                    alt=""
                    draggable={false}
                    style={{
                      left: pct(a.blink.box.x, CANVAS.w),
                      top: pct(a.blink.box.y, CANVAS.h),
                      width: pct(a.blink.box.w, CANVAS.w),
                      height: pct(a.blink.box.h, CANVAS.h),
                    }}
                  />
                )}
                {a.hand && (
                  <img
                    className="char__hand"
                    src={a.hand.src}
                    alt=""
                    draggable={false}
                    style={{
                      left: pct(a.hand.box.x, CANVAS.w),
                      top: pct(a.hand.box.y, CANVAS.h),
                      width: pct(a.hand.box.w, CANVAS.w),
                      height: pct(a.hand.box.h, CANVAS.h),
                      transformOrigin: `${pct(a.hand.pivot.x - a.hand.box.x, a.hand.box.w)} ${pct(
                        a.hand.pivot.y - a.hand.box.y,
                        a.hand.box.h,
                      )}`,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const cls = `char ${paused ? 'is-paused' : ''} ${className}`;

  if (onActivate) {
    return (
      <button
        type="button"
        ref={(el) => {
          rootRef.current = el;
        }}
        className={`${cls} char--interactive`}
        aria-label={label}
        onClick={onActivate}
        style={style}
      >
        {rig}
        <span className="sr-only">{POSES[pose].alt}</span>
      </button>
    );
  }

  return (
    <div
      ref={(el) => {
        rootRef.current = el;
      }}
      className={cls}
      role="img"
      aria-label={`${label}: ${POSES[pose].alt}`}
      style={style}
    >
      {rig}
    </div>
  );
});
