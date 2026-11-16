/**
 * ISSUE #02 — THE HALL OF EXPERIMENTS
 *
 * Every fact below comes from the project's own README / repository:
 *  - descriptions, features, tech: the repo README and package.json
 *  - "My part": verified from commit history or the team README's credits
 *  - team projects link to the team's original repository
 * Narration lines (`opener`, `aside`) are comic flavour text, not claims.
 */
export type CoverArt = 'mind' | 'nav' | 'bug';

export type Project = {
  id: string;
  issue: string;
  title: string;
  /** small subtitle on the cover */
  subtitle: string;
  /** cover genre strap, e.g. "A team-up special" */
  genre: string;
  when: string;
  team: boolean;
  art: CoverArt;
  /** which cover layout (cover--v0…v2 in Projects.css) */
  layout: 0 | 1 | 2;
  /** one cover palette per issue */
  palette: { bg: string; accent: string; ink: string; paper: string };
  sfx: string;
  /** narrator caption that opens the issue */
  opener: string;
  /** what she says when you linger on the cover */
  aside: string;
  storyline: string;
  problem: string;
  solution: string;
  tech: string[];
  contribution: string[];
  /** where the contribution claim is verified */
  contributionSource: string;
  status: string;
  /** null when the repository is private */
  repo: string | null;
  demo: string | null;
  /** shown instead of a demo button */
  demoNote?: string;
};

export const PROJECTS: Project[] = [
  {
    id: 'mindspace',
    issue: '#001',
    title: 'MindSpace',
    subtitle: 'Student Burnout Analytics',
    genre: 'A team-up special',
    when: '2026',
    team: true,
    art: 'mind',
    layout: 0,
    palette: { bg: '#1f7a73', accent: '#ffd23f', ink: '#16131c', paper: '#fff8ea' },
    sfx: 'BEEP!',
    opener: 'We have a problem. And apparently, she decided to solve it — with five teammates.',
    aside: 'Team-up issue! My part: teaching the frontend some manners.',
    storyline:
      'Burnout rarely announces itself. Somewhere between late-night study sessions and “I’m fine”, the warning signs hide in the data.',
    problem:
      'Educators and students need a way to see burnout risk, stress and sentiment trends — from study habits, sleep and what students actually write.',
    solution:
      'A web dashboard that scores burnout (0–100) from study-to-sleep ratios and stress, reads written feedback with VADER sentiment analysis, sorts students into low / medium / high risk, trains a Random Forest on every uploaded dataset, and compares two datasets side by side.',
    tech: ['Python', 'Flask', 'Pandas', 'NumPy', 'NLTK (VADER)', 'React', 'TypeScript', 'React Query'],
    contribution: [
      'Migrated the Dashboard and Compare pages to React Query',
      'Added loading spinners and error banners across the frontend',
      'Improved the navigation flow and added comparative-data features',
    ],
    contributionSource: '7 commits in the team repository',
    status: 'Team minor project · 6 members',
    repo: 'https://github.com/Inkesk-Dozing/MindSpace',
    demo: 'https://mindspace-sepia.vercel.app',
  },
  {
    id: 'bugsift',
    issue: '#002',
    title: 'BugSift',
    subtitle: 'Fuzzing & Crash-Triage Platform',
    genre: 'Now in production',
    when: '2026',
    team: true,
    art: 'bug',
    layout: 2,
    palette: { bg: '#c4262e', accent: '#ffd23f', ink: '#16131c', paper: '#fff8ea' },
    sfx: 'CRASH!',
    opener: 'Feed a program thousands of strange inputs and something, somewhere, will crash. The real mystery: what broke, and why?',
    aside: 'Still being inked! My page: making sense of sanitizer crash logs.',
    storyline:
      'Fuzzers are brilliant at breaking programs and terrible at explaining what broke. One campaign can leave a pile of raw crashes — many of them the same bug wearing a different input.',
    problem:
      'Raw fuzzing output is hard to use: crashes have to be reproduced, grouped, minimised and explained before anyone can act on them.',
    solution:
      'A platform for authorized C/C++ programs that wraps AFL++ with Python automation. The Version 1 plan: build targets with Clang and ASan / UBSan, validate seed corpora, collect and independently reproduce crashes, parse sanitizer logs, deduplicate by stack trace, minimise inputs and write Markdown reports. It is in early development, so most of that pipeline is still being built.',
    tech: ['Python', 'AFL++', 'Clang / LLVM', 'AddressSanitizer', 'UndefinedBehaviorSanitizer', 'Linux (WSL2)'],
    contribution: [
      'Building the ASan / UBSan sanitizer-log parser — the module assigned to her',
      'It turns raw sanitizer logs into structured data: error category, description, stack frames, source file and line',
      'Empty, unreadable or unrecognised logs never crash it; they are flagged for manual review',
      '34 parser tests across 16 sample logs, plus a usage doc',
    ],
    contributionSource: 'her pull request in the team repository (open, under review)',
    status: 'Early development · 3-person team',
    repo: null,
    demo: null,
    demoNote: 'The repository is private while the team builds it, and there’s no demo yet.',
  },
  {
    id: 'navraah',
    issue: '#003',
    title: 'N.A.V.R.A.A.H',
    subtitle: 'Navigation Assistant for Visually Restricted And Aided Humans',
    genre: 'Hardware heroes',
    when: '2026',
    team: true,
    art: 'nav',
    layout: 1,
    palette: { bg: '#16131c', accent: '#62d0c0', ink: '#16131c', paper: '#fff8ea' },
    sfx: 'PING!',
    opener: 'Somewhere, a corridor full of chairs, walls and stairs. Our team saw a problem worth a whole wearable.',
    aside: 'Hardware + computer vision, built to help someone move around safely.',
    storyline:
      'Getting around an unfamiliar space is hard without sight — and many assistive tools stop working the moment the internet does.',
    problem:
      'Visually restricted people need to know what is in front of them and how far away it is, reliably and without depending on a connection.',
    solution:
      'A wearable on a Raspberry Pi Zero 2 W: a camera with OpenCV and TensorFlow Lite spots people, chairs, walls and stairs; an ultrasonic / ToF sensor measures distance; spoken directions and vibration alerts warn the user — entirely offline.',
    tech: ['Python', 'OpenCV', 'TensorFlow Lite', 'Raspberry Pi Zero 2 W', 'Ultrasonic / ToF sensor', 'Offline text-to-speech'],
    contribution: ['Testing', 'Documentation', 'Presentation'],
    contributionSource: 'credited in the team README',
    status: 'Team project · 5 members, faculty-mentored · prototype',
    repo: 'https://github.com/Inkesk-Dozing/N.A.V.R.A.A.H',
    demo: null,
    demoNote: 'It’s a wearable — no browser demo.',
  },
];
