/**
 * ISSUE #03 — CHARACTER DEVELOPMENT
 *
 * Source: Krishyangi's LinkedIn profile export (résumé PDF), public GitHub and
 * details she supplied directly (Dean's Honours Award, BOL Club).
 * Only stated facts are used. Anything not supplied is `null` and renders as a
 * visible TODO chip so it can be filled in later — never guessed.
 */
import type { Mood } from '../character/poses';

export type Scene = 'campus' | 'ambassador' | 'next';

export type Chapter = {
  id: string;
  num: string;
  title: string;
  scene: Scene;
  organisation: string;
  position: string;
  duration: string;
  location?: string;
  responsibilities: string[] | null;
  achievements: string[] | null;
  skills: string[] | null;
  /** what she says as she arrives in this scene */
  line: string;
  mood: Mood;
};

export const JOURNEY: Chapter[] = [
  {
    id: 'krmu',
    num: '01',
    title: 'The First Quest',
    scene: 'campus',
    organisation: 'KR Mangalam University',
    position: 'B.Tech CSE (Core) student',
    duration: '2025 – 2029',
    location: 'Gurugram, Haryana',
    responsibilities: [
      'Coursework across web development, Python, data structures & algorithms and data analysis',
      'Team minor projects: MindSpace and N.A.V.R.A.A.H',
    ],
    achievements: ['Dean’s Honours Award — 9.12 CGPA', 'Member of the BOL Club'],
    skills: ['HTML & CSS', 'JavaScript', 'React', 'Python', 'DSA', 'Data analysis'],
    line: 'Day one of B.Tech. The plot thickens.',
    mood: 'thinking',
  },
  {
    id: 'gemini',
    num: '02',
    title: 'Levelling Up',
    scene: 'ambassador',
    organisation: 'Google',
    position: 'Gemini Student Ambassador',
    duration: 'Apr 2026 – Present',
    location: 'Gurugram, Haryana',
    responsibilities: [
      'Translating the potential of AI into something tangible for peers',
      'Curating knowledge and sparking discussions about Gemini',
      'Building a campus community that stays ahead of the curve',
    ],
    achievements: [],
    skills: ['AI communication', 'Community building', 'Knowledge curation'],
    line: 'Now I get to talk about AI. Professionally. The yapping paid off.',
    mood: 'greeting',
  },
  {
    id: 'next',
    num: '03',
    title: 'The Next Adventure',
    scene: 'next',
    organisation: 'Your team?',
    position: 'Open to opportunities',
    duration: 'Coming soon',
    responsibilities: ['Where AI meets hardware: robotics, embedded systems and beyond'],
    achievements: null,
    skills: null,
    line: 'Next chapter? That might be you.',
    mood: 'excited',
  },
];
