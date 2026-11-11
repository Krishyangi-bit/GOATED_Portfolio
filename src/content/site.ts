/**
 * Site-wide facts. Everything here comes from information Krishyangi supplied
 * or from her public GitHub profile README (github.com/Krishyangi-bit).
 * Edit this file (and origin.ts) to change copy — components never hard-code facts.
 */
export const SITE = {
  name: 'Krishyangi',
  fullName: 'Krishyangi Dixit',
  issue: '#01',
  issueDate: 'Nov 2026',
  tagline: {
    lead: 'Developer by profession.',
    punch: 'Professional bug creator by accident.',
  },
  links: {
    github: 'https://github.com/Krishyangi-bit',
    linkedin: 'https://www.linkedin.com/in/krishyangi-dixit-9527ba388/',
  },
} as const;

/**
 * Chapters that exist in this build. The comic's long-term table of contents
 * has seven chapters; only implemented ones are listed so navigation never
 * points at a page that doesn't exist yet. Add entries here as chapters ship.
 */
export const CHAPTERS = [
  { id: 'cover', num: '01', label: 'Cover', title: 'Meet the Protagonist' },
  { id: 'origin', num: '02', label: 'Origin', title: 'The Origin Story' },
] as const;

export type ChapterId = (typeof CHAPTERS)[number]['id'];
