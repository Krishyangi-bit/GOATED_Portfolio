import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);
gsap.config({ nullTargetWarn: false });

export { gsap, ScrollTrigger, useGSAP };

if (import.meta.env.DEV) {
  (window as unknown as Record<string, unknown>).__ST = ScrollTrigger;
}
