/**
 * Hackathons — shown in the Journey chapter (Chapter 04) as "side quests".
 *
 * Source: details Krishyangi supplied (events, rounds reached, certificate) and
 * the README of each project's repository. Repo links are intentionally NOT
 * shown on the site — only the summaries.
 */
/** Both hackathons were held at IIIT-Delhi during its ESYA ’26 tech fest. */
export const HACKATHON_VENUE = {
  name: 'IIIT-Delhi',
  fest: 'ESYA ’26',
  blurb: 'Two hackathons at Indraprastha Institute of Information Technology, Delhi, a few weeks apart, and two products built against the clock.',
};

export type Hackathon = {
  id: string;
  event: string;
  host: string;
  date: string;
  format: string;
  /** furthest round reached, e.g. 3 */
  round: number;
  project: string;
  /** one-line pitch */
  pitch: string;
  summary: string;
  highlights: string[];
  stack: string[];
  /** public path to the participation certificate, if one was issued */
  certificate: string | null;
};

export const HACKATHONS: Hackathon[] = [
  {
    id: 'hackiiitd',
    event: 'HackIIITD 2026',
    host: 'Technical Council, IIIT-Delhi · ESYA ’26',
    date: '24–25 Oct 2026',
    format: 'National-level 24-hour hackathon',
    round: 3,
    project: 'KhetKaaj',
    pitch: 'A farmer’s assistant on WhatsApp and the web, in Hindi, Hinglish and English.',
    summary:
      'KhetKaaj helps farmers with the paperwork and decisions around their crop: when and where to sell at the mandi, which government schemes they qualify for, and how to put together a crop-damage claim. Farmers can type or send a voice note on WhatsApp. KhetKaaj prepares everything, and the farmer reviews it and submits it themselves.',
    highlights: [
      'Mandi selling advice using e-NAM / Agmarknet prices',
      'Matches farmers to government schemes and builds a ready-to-submit scheme packet (PDF)',
      'Prepares crop-damage claim dossiers, e.g. after a hailstorm',
      'Watch Mode alerts for price and weather changes, using the IMD warning feed',
      'Voice notes transcribed with Bhashini speech recognition',
      'Stays safe on purpose: withholds an answer when its price or weather data is stale, and refuses to give pesticide or fertiliser doses',
      'New scheme notices are found from official government (.gov / NIC) sources and only shown to farmers after a human reviewer publishes them',
    ],
    stack: ['Python', 'FastAPI', 'Vite', 'Twilio WhatsApp', 'Bhashini ASR', 'TinyFish', 'Supabase', 'Docker'],
    certificate: '/docs/hackiiitd-2026-certificate.pdf',
  },
  {
    id: 'forkit',
    event: 'Fork-IT 2026',
    host: 'IIIT-Delhi · ESYA ’26',
    date: '14–15 Nov 2026',
    format: 'FoodoScope track: Computational Gastronomy & Kitchen Operations',
    round: 2,
    project: 'SwaadSaar',
    pitch: 'A menu optimiser that cuts single-use ingredients without changing how dishes taste.',
    summary:
      'Restaurants, cloud kitchens and bars often buy ingredients that only one dish uses. Each one means another supplier, more storage and more food that spoils. SwaadSaar reads a menu and suggests swaps that let the kitchen buy fewer unique ingredients. It compares the aroma compounds of ingredients so swaps stay close in flavour, and it protects each dish’s regional character. The head chef approves every change, and spice swaps always need the chef’s approval.',
    highlights: [
      'On a 10-dish Indian menu, cut unique ingredients from 39 to 31 (−20.5%) with chef approvals, and every dish kept a flavour score of at least 89.7 / 100',
      'Uses live FoodoScope data: FlavorDB, RecipeDB and CocktailDB',
      'Used 38 API calls instead of 184 by removing duplicate lookups and caching results',
      'Chef-friendly controls: how close a swap should taste, how strictly to protect each dish, and ingredients that must never change',
      'Shows a swap list you can download or print, the weekly food waste avoided, and the honest change in food cost',
      'Mocktail Twins: an alcohol-free version of each cocktail, made from ingredients the kitchen already stocks',
    ],
    stack: ['React', 'Vite', 'Tailwind CSS', 'Node.js', 'Express', 'FlavorDB', 'RecipeDB', 'CocktailDB'],
    certificate: null,
  },
];
