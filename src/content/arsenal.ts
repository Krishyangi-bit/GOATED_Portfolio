/**
 * CHAPTER 05 — THE ARSENAL
 *
 * Only technologies backed by her résumé, her GitHub profile README or her
 * repositories. Titles are playful labels, NOT proficiency claims — there are
 * no levels or scores anywhere. `where` says where the evidence is.
 * Each category is drawn as a different gadget in her field kit (`kind`).
 */
export type Kind = 'keycap' | 'sticker' | 'cartridge' | 'floppy' | 'chip' | 'label';

export type Power = {
  id: string;
  name: string;
  /** playful comic title — not a proficiency claim */
  title: string;
  glyph: string;
  color: string;
  where: string;
  learning?: boolean;
};

export type Category = {
  id: string;
  name: string;
  kind: Kind;
  /** handwritten hint shown in the compartment before anything is picked */
  note: string;
  powers: Power[];
};

export const ARSENAL: Category[] = [
  {
    id: 'languages',
    name: 'Programming languages',
    kind: 'keycap',
    note: 'press any key',
    powers: [
      { id: 'python', name: 'Python', title: 'The Automation Wizard', glyph: 'Py', color: '#2445d2', where: 'Her DSA capstone, data-analysis labs and the sanitizer-log parser she’s writing for BugSift.' },
      { id: 'javascript', name: 'JavaScript', title: 'The Shape Shifter', glyph: 'JS', color: '#ffd23f', where: 'Her async weather-tracker assignment and every React project on her GitHub.' },
      { id: 'typescript', name: 'TypeScript', title: 'The Type Guardian', glyph: 'TS', color: '#2f7de1', where: 'MindSpace frontend work — and this very comic.' },
      { id: 'html', name: 'HTML', title: 'The Architect', glyph: '</>', color: '#e5383b', where: 'The first web pages, back in Sep 2025.' },
      { id: 'css', name: 'CSS', title: 'The Illusionist', glyph: '{ }', color: '#1f7a73', where: 'Responsive layouts, themes and animations across her web projects.' },
      { id: 'sql', name: 'SQL', title: 'The Query Whisperer', glyph: 'SQL', color: '#c4521a', where: 'Listed in her GitHub tech stack.' },
      { id: 'java', name: 'Java', title: 'The Apprentice', glyph: 'J', color: '#f07a2e', where: 'Currently learning.', learning: true },
    ],
  },
  {
    id: 'frontend',
    name: 'Frontend',
    kind: 'sticker',
    note: 'peel one off',
    powers: [
      { id: 'react', name: 'React', title: 'The Component Architect', glyph: '⚛', color: '#62d0c0', where: 'Her Web Dev 2 capstones, MindSpace’s frontend — and this comic.' },
      { id: 'router', name: 'React Router', title: 'The Pathfinder', glyph: '⇄', color: '#e5383b', where: 'Page navigation in her Web Dev 2 capstone apps.' },
      { id: 'query', name: 'React Query', title: 'The Data Courier', glyph: 'RQ', color: '#f7b6c8', where: 'Migrated MindSpace’s Dashboard and Compare pages to it.' },
      { id: 'tailwind', name: 'Tailwind CSS', title: 'The Utility Belt', glyph: 'tw', color: '#38bdf8', where: 'Styling for Cognita, her code-review capstone app (on GitHub).' },
      { id: 'vite', name: 'Vite', title: 'The Speedster', glyph: '⚡', color: '#ffd23f', where: 'Build tool for her React projects.' },
    ],
  },
  {
    id: 'backend',
    name: 'Backend',
    kind: 'cartridge',
    note: 'pull a cartridge',
    powers: [
      { id: 'flask', name: 'Flask', title: 'The Pocket Server', glyph: 'Fl', color: '#16131c', where: 'Listed in her stack; MindSpace runs on a Flask backend.' },
      { id: 'node', name: 'Node.js', title: 'The Event Looper', glyph: 'N', color: '#3c873a', where: 'Listed in her GitHub tech stack.' },
    ],
  },
  {
    id: 'data',
    name: 'Data & databases',
    kind: 'floppy',
    note: 'insert disk',
    powers: [
      { id: 'pandas', name: 'Pandas', title: 'The Table Tamer', glyph: 'pd', color: '#150458', where: 'Data-analysis labs and her GitHub tech stack.' },
      { id: 'numpy', name: 'NumPy', title: 'The Number Cruncher', glyph: 'np', color: '#4dabcf', where: 'Data-analysis labs and her GitHub tech stack.' },
      { id: 'sqldb', name: 'SQL databases', title: 'The Record Keeper', glyph: 'DB', color: '#c4521a', where: 'Listed in her GitHub tech stack.' },
    ],
  },
  {
    id: 'ai',
    name: 'AI / ML',
    kind: 'chip',
    note: 'handle with care',
    powers: [
      { id: 'llm', name: 'LLM APIs', title: 'The Oracle Caller', glyph: '✦', color: '#7c5cff', where: 'API integrations with ChatGPT and Gemini (résumé).' },
      { id: 'prompt', name: 'Prompt engineering', title: 'The Spell Writer', glyph: '“ ”', color: '#e5383b', where: 'One of her top skills on LinkedIn.' },
      { id: 'opencv', name: 'OpenCV', title: 'The All-Seeing Eye', glyph: '◉', color: '#5c3ee8', where: 'Computer vision on a Raspberry Pi (GitHub profile).' },
      { id: 'onnx', name: 'ONNX', title: 'The Shrink Ray', glyph: 'nx', color: '#16131c', where: 'Running vision models on small hardware (GitHub profile).' },
    ],
  },
  {
    id: 'tools',
    name: 'Developer tools & hardware',
    kind: 'label',
    note: 'labelled, obviously',
    powers: [
      { id: 'git', name: 'Git', title: 'The Time Machine', glyph: '⎇', color: '#f05033', where: '30+ public repositories and counting.' },
      { id: 'github', name: 'GitHub', title: 'The Archive Keeper', glyph: 'GH', color: '#16131c', where: 'Home of every issue in this comic.' },
      { id: 'linux', name: 'Linux', title: 'The Terminal Monk', glyph: '>_', color: '#ffd23f', where: 'Listed on her résumé.' },
      { id: 'pi', name: 'Raspberry Pi', title: 'The Tiny Titan', glyph: 'π', color: '#c51a4a', where: 'Hardware builds — including the one that taught her about voltage dividers.' },
      { id: 'vercel', name: 'Vercel', title: 'The Launch Pad', glyph: '▲', color: '#16131c', where: 'Listed in her GitHub tech stack.' },
      { id: 'figma', name: 'Figma', title: 'The Sketchbook', glyph: 'Fg', color: '#a259ff', where: 'Listed in her GitHub tech stack.' },
      { id: 'powershell', name: 'PowerShell', title: 'The Command Caster', glyph: 'PS', color: '#2a5fa8', where: 'Listed in her GitHub tech stack.' },
    ],
  },
];
