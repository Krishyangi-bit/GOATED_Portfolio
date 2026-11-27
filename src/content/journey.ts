/**
 * ISSUE #03 — CHARACTER DEVELOPMENT
 *
 * Source: Krishyangi's LinkedIn profile export (résumé PDF), public GitHub and
 * details she supplied directly (Dean's Honours Award, BOL Club).
 * Only stated facts are used. Anything not supplied is `null` and renders as a
 * visible TODO chip so it can be filled in later — never guessed.
 */
import type { Mood } from '../character/poses';

export type Scene = 'campus' | 'ambassador' | 'hackathon' | 'next';

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
  /** overrides the "Responsibilities" heading on the card */
  responsibilitiesLabel?: string;
  /** public path to a certificate PDF, opened in the in-page viewer */
  certificate?: { label: string; src: string; fileName: string };
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
    achievements: [
      'Dean’s Honours Award — 9.12 CGPA',
      'Member of the BOL Club',
    ],
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
    id: 'hackathons',
    num: '03',
    title: 'Side Quests',
    scene: 'hackathon',
    organisation: 'IIIT-Delhi · ESYA ’26',
    position: 'Hackathon participant · HackIIITD & Fork-IT',
    duration: 'Oct – Nov 2026',
    location: 'New Delhi',
    responsibilitiesLabel: 'What we built',
    responsibilities: [
      'HackIIITD 2026 (national-level, 24 hours): KhetKaaj, a WhatsApp and web assistant for farmers in Hindi, Hinglish and English. It gives mandi selling advice, matches farmers to government schemes and prepares crop-damage claim dossiers, and it understands voice notes',
      'Fork-IT 2026 (FoodoScope track): SwaadSaar, a menu optimiser that cuts single-use kitchen ingredients by comparing flavour compounds, while the head chef approves every swap',
    ],
    achievements: [
      'HackIIITD 2026: reached round 3',
      'Fork-IT 2026: reached round 2',
      'SwaadSaar cut a 10-dish menu from 39 to 31 ingredients, using 38 API calls instead of 184',
    ],
    skills: ['Python', 'FastAPI', 'React', 'Node.js', 'Express', 'Twilio WhatsApp', 'FoodoScope APIs', 'Teamwork under pressure'],
    certificate: {
      label: 'HackIIITD 2026 certificate',
      src: '/docs/hackiiitd-2026-certificate.pdf',
      fileName: 'HackIIITD_2026_Certificate.pdf',
    },
    line: 'Two hackathons, one campus, zero sleep. Totally worth it.',
    mood: 'excited',
  },
  {
    id: 'next',
    num: '04',
    title: 'The Next Adventure',
    scene: 'next',
    organisation: 'Your team?',
    position: 'Open to opportunities',
    duration: 'Coming soon',
    responsibilities: ['Where AI meets hardware: robotics, embedded systems, system design and beyond'],
    achievements: null,
    skills: null,
    line: 'Next chapter? That might be you.',
    mood: 'excited',
  },
];
