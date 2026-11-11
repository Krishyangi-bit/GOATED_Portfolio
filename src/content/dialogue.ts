import type { Mood } from '../character/poses';

export type Line = { text: string; mood: Mood; action?: 'wave' | 'hop' | 'shake' };

/** What the character says, and how she looks saying it. */
export const DIALOGUE = {
  arrival: { text: 'Well, look who just arrived!', mood: 'greeting', action: 'wave' } as Line,
  welcome: { text: 'Heyyy! Welcome to my universe.', mood: 'happy', action: 'hop' } as Line,

  /** Clicking the character cycles through these. */
  clicks: [
    { text: 'Well, hello there!', mood: 'happy', action: 'hop' },
    { text: "Okay, now you're just testing me.", mood: 'mischief' },
    { text: 'Are you… trying to boop me?', mood: 'confused', action: 'shake' },
    { text: "Fine, you win. Secret: type “bam” anywhere.", mood: 'mischief' },
    { text: 'I have run out of reactions. Please scroll.', mood: 'confused' },
  ] as Line[],

  idleNudge: { text: 'Psst… the story continues down there.', mood: 'mischief' } as Line,
  longHover: { text: "Go on… it doesn't bite. Probably.", mood: 'mischief' } as Line,
  toOrigin: { text: 'Alright, time for my origin story.', mood: 'thinking' } as Line,
  welcomeBack: { text: 'Oh hey, welcome back to the cover!', mood: 'greeting', action: 'wave' } as Line,
  bamButton: { text: '…was that really necessary?', mood: 'confused', action: 'shake' } as Line,
  secret: { text: 'BAM! You found the secret panel!', mood: 'excited', action: 'hop' } as Line,
  speedReader: { text: 'WHOA. Speed-reading my life story?', mood: 'surprised' } as Line,
  theEnd: { text: 'You read the whole origin story? Honestly, I’m honoured.', mood: 'happy', action: 'hop' } as Line,
};
