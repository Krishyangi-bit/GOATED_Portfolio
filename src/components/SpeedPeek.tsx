import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '../lib/gsap';
import { EASE } from '../lib/motion';
import { DIALOGUE } from '../content/dialogue';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { Bubble } from './SpeechBubble';
import './SpeedPeek.css';

/**
 * Fourth-wall moment: scroll through the story too fast and the protagonist
 * pops in from the screen edge to comment. Once per visit, gone in 3s.
 */
export function SpeedPeek({ within }: { within: string }) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const fired = useRef(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const st = ScrollTrigger.create({
      trigger: within,
      start: 'top 40%',
      end: 'bottom bottom',
      onUpdate: (self) => {
        if (!fired.current && Math.abs(self.getVelocity()) > 5200) {
          fired.current = true;
          setShow(true);
        }
      },
    });
    return () => st.kill();
  }, [within, reduced]);

  useEffect(() => {
    const el = ref.current;
    if (!show || !el) return;
    const tl = gsap
      .timeline({ onComplete: () => setShow(false) })
      .fromTo(el, { xPercent: -120, rotation: -14 }, { xPercent: 0, rotation: 0, duration: 0.5, ease: EASE.pop })
      .from(el.querySelector('.bubble'), { scale: 0.3, opacity: 0, duration: 0.4, ease: EASE.pop, transformOrigin: '0% 100%' }, 0.25)
      .to(el, { xPercent: -130, rotation: -10, duration: 0.4, ease: 'power2.in' }, '+=2.6');
    return () => {
      tl.kill();
    };
  }, [show]);

  if (!show) return null;
  return (
    <div className="peek" ref={ref} role="status">
      <img className="peek__face" src="/character/confused-sm.webp" alt="" width={416} height={589} />
      <Bubble tail="left" className="peek__bubble">
        {DIALOGUE.speedReader.text}
      </Bubble>
    </div>
  );
}
