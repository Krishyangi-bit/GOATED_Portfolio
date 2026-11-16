/**
 * Site-wide facts. Everything here comes from information Krishyangi supplied
 * (résumé, LinkedIn export) or from her public GitHub profile.
 * Edit this file (and the other content files) to change copy — components never hard-code facts.
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
  email: 'dixitkrishyangi@gmail.com',
  location: 'Haryana, India',
  links: {
    github: 'https://github.com/Krishyangi-bit',
    linkedin: 'https://www.linkedin.com/in/krishyangi-dixit-9527ba388/',
    /** not supplied yet — the LeetCode portal shows as "under construction" until set */
    leetcode: null as string | null,
  },
} as const;

/**
 * Contact form delivery. FormSubmit (formsubmit.co) relays the message to the
 * email below — no backend needed. The very first submission triggers a
 * one-time activation email to that inbox; messages arrive once it's confirmed.
 */
export const CONTACT = {
  endpoint: `https://formsubmit.co/ajax/${SITE.email}`,
  subject: 'New transmission from your comic-book portfolio',
};

/** Table of contents. Navigation is generated from this list. */
export const CHAPTERS = [
  { id: 'cover', num: '01', label: 'Cover', title: 'Meet the Protagonist' },
  { id: 'origin', num: '02', label: 'Origin', title: 'The Origin Story' },
  { id: 'projects', num: '03', label: 'Issues', title: 'The Hall of Experiments' },
  { id: 'journey', num: '04', label: 'Journey', title: 'Character Development' },
  { id: 'arsenal', num: '05', label: 'Arsenal', title: 'The Arsenal' },
  { id: 'multiverse', num: '06', label: 'Portals', title: 'The Multiverse' },
  { id: 'contact', num: '07', label: 'Contact', title: 'To Be Continued…?' },
] as const;

export type ChapterId = (typeof CHAPTERS)[number]['id'];
