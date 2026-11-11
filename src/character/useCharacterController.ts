import { useCallback, useEffect, useRef, useState } from 'react';
import type { CharacterHandle } from './Character';
import type { Mood } from './poses';
import type { Line } from '../content/dialogue';

export type Speech = { id: number; text: string } | null;

type SayOptions = {
  /** ms the bubble stays up; defaults to reading time */
  hold?: number;
  /** mood to return to once the line is finished */
  rest?: Mood;
  /** keep the mood after the bubble closes instead of returning to `rest` */
  stay?: boolean;
};

/**
 * CharacterController: one place that pairs an expression, an action and a
 * line of dialogue, then returns the character to her resting state.
 * Sections talk to the character through `say()` — they never juggle timers.
 */
export function useCharacterController(initial: Mood = 'idle', restMood: Mood = 'idle') {
  const [mood, setMood] = useState<Mood>(initial);
  const [speech, setSpeech] = useState<Speech>(null);
  const charRef = useRef<CharacterHandle>(null);
  const timer = useRef<number>();
  const seq = useRef(0);
  const rest = useRef(restMood);
  rest.current = restMood;

  const clear = () => window.clearTimeout(timer.current);

  const say = useCallback((line: Line, opts: SayOptions = {}) => {
    clear();
    setMood(line.mood);
    setSpeech({ id: ++seq.current, text: line.text });
    if (line.action) {
      // wait a frame so the expression change starts first
      requestAnimationFrame(() => {
        const c = charRef.current;
        if (!c) return;
        if (line.action === 'wave') c.wave(3);
        if (line.action === 'hop') c.hop();
        if (line.action === 'shake') c.shake();
      });
    }
    const hold = opts.hold ?? Math.min(6500, 2200 + line.text.length * 48);
    timer.current = window.setTimeout(() => {
      setSpeech(null);
      if (!opts.stay) setMood(opts.rest ?? rest.current);
    }, hold);
  }, []);

  const hush = useCallback(() => {
    clear();
    setSpeech(null);
  }, []);

  useEffect(() => clear, []);

  return { mood, setMood, speech, say, hush, charRef };
}
