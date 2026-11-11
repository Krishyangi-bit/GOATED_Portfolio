/**
 * ACT 02 — THE ORIGIN STORY
 *
 * Sources (nothing here is invented):
 *  - Taglines, interests, "learning", "ask me about", "looking for" and the
 *    Raspberry Pi voltage-divider story: Krishyangi's GitHub profile README.
 *  - Dates: creation dates of her public GitHub repositories.
 *
 * `null` values render as visible TODO placeholders until filled in.
 */
export const ORIGIN = {
  intro:
    'Every protagonist has an origin story. This one involves Python, a lot of curiosity, and one very unlucky Raspberry Pi.',

  beginning: {
    title: 'The Beginning',
    lines: ['Meet Krishyangi.', 'Student. Developer. Professional asker of “what if?”'],
    motto: 'Curious by default. Builder by choice. Debugger by necessity.',
    education: {
      /** e.g. 'B.Tech in Computer Science' */
      degree: null as string | null,
      /** e.g. 'Your University' */
      institution: null as string | null,
      /** e.g. '2025 – 2029' */
      years: null as string | null,
    },
  },

  curiosity: {
    title: 'The Curiosity',
    thought: 'What if…?',
    caption: 'Turning “What if?” into working software.',
    worlds: [
      { key: 'software', label: 'Software' },
      { key: 'ai', label: 'AI' },
      { key: 'hardware', label: 'Hardware' },
    ],
    footnote: 'Software + AI + hardware, one commit at a time.',
  },

  firstCode: {
    title: 'The First Line of Code',
    caption: 'It all started with Python.',
    terminal: [
      { prompt: true, text: 'git log --reverse --max-count=1' },
      { prompt: false, text: 'repo      PYTHON-project1' },
      { prompt: false, text: 'language  Python' },
      { prompt: false, text: 'created   23 Sep 2025' },
      { prompt: true, text: 'echo "and then it never stopped"' },
    ],
    note: 'first public repo, ever',
  },

  firstBug: {
    title: 'The First Bug',
    setup: 'Her first hardware build taught a hard lesson:',
    bubble: 'One missing voltage divider… and the Raspberry Pi was toast.',
    moral: 'Now it’s the first thing she checks.',
    sfx: 'FZZT!',
  },

  evolution: {
    title: 'The Evolution',
    caption: 'Every chapter, a new power unlocked.',
    milestones: [
      { when: 'Sep 2025', what: 'Python', detail: 'First public repo. The adventure begins.' },
      { when: 'Sep – Nov 2025', what: 'HTML & CSS', detail: 'First web pages, first layouts that (mostly) behaved.' },
      { when: 'Jan 2026', what: 'JavaScript', detail: 'Pages start moving, clicking and talking back.' },
      { when: 'Mar – May 2026', what: 'DSA & data', detail: 'Data structures, algorithms and data analysis in Python.' },
      { when: '2026', what: 'Computer vision', detail: '“Teaching machines to see — and to help.” On a Raspberry Pi, no less.' },
    ],
    now: { label: 'Now levelling up', items: ['Java', 'Data structures & algorithms', 'AI on small hardware'] },
  },

  file: {
    title: 'Character File',
    rows: [
      { k: 'Class', v: 'Builder: software, AI & hardware' },
      { k: 'Traits', v: 'Curious by default · Builder by choice · Debugger by necessity' },
      { k: 'Special move', v: 'Hardware debugging' },
      { k: 'Ask her about', v: 'Computer vision on a Raspberry Pi, and building student-led projects' },
      { k: 'Known weakness', v: 'A missing voltage divider (it’s personal)' },
      { k: 'Easter egg', v: 'An ASCII-art Shinchan lives in her GitHub README' },
    ],
    /** Off-duty interests and hobbies — add your own, e.g. ['music', 'sketching']. */
    interests: null as string[] | null,
  },

  continued: {
    title: 'To Be Continued…',
    bubble: 'Looking for internships, collaborations, and interesting problems worth losing sleep over.',
  },
};
