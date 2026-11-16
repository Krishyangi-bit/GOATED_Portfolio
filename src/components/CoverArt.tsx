import type { CoverArt as Art } from '../content/projects';

/**
 * Hand-inked cover illustrations, one per issue. Colours come from the cover's
 * CSS variables (--cv-*), so the same drawing works in the reader too.
 * Each has a hover animation defined in Projects.css (.cover:hover .art--*).
 */
const S = { stroke: 'var(--cv-ink)', strokeWidth: 3, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

export function CoverArt({ art }: { art: Art }) {
  return (
    <svg className={`art art--${art}`} viewBox="0 0 200 160" aria-hidden="true">
      {art === 'mind' && (
        <g>
          {/* brain cloud */}
          <path
            {...S}
            fill="var(--cv-paper)"
            d="M62 98c-16 2-26-10-22-24-10-6-8-24 6-26 0-16 18-24 30-14 8-12 30-12 36 2 14-6 30 4 26 20 14 4 14 24 2 30 2 14-12 22-24 18-6 10-24 12-32 2-10 6-22 2-22-8z"
          />
          <path {...S} fill="none" d="M76 48c4 10 0 18-8 22M108 46c-6 8-4 18 6 22M92 70c0 10 6 16 16 16M70 84c8-2 14 2 16 10" />
          {/* pulse line */}
          <path className="art__pulse" {...S} stroke="var(--cv-accent)" strokeWidth={5} fill="none" pathLength={1} d="M10 128h44l8-16 10 30 10-40 10 34 8-8h90" />
          {/* bars */}
          <g className="art__bars" fill="var(--cv-accent)" stroke="var(--cv-ink)" strokeWidth={2.5}>
            <rect x="150" y="56" width="10" height="30" />
            <rect x="164" y="40" width="10" height="46" />
            <rect x="178" y="64" width="10" height="22" />
          </g>
        </g>
      )}

      {art === 'nav' && (
        <g>
          <g className="art__sonar" fill="none" stroke="var(--cv-accent)" strokeWidth={3}>
            <circle cx="100" cy="76" r="40" />
            <circle cx="100" cy="76" r="58" opacity=".6" />
            <circle cx="100" cy="76" r="76" opacity=".3" />
          </g>
          <path {...S} fill="var(--cv-paper)" d="M52 76s18-30 48-30 48 30 48 30-18 30-48 30-48-30-48-30z" />
          <circle className="art__iris" cx="100" cy="76" r="15" fill="var(--cv-accent)" stroke="var(--cv-ink)" strokeWidth={3} />
          <circle cx="100" cy="76" r="6" fill="var(--cv-ink)" />
          <circle cx="94" cy="70" r="3" fill="#fff" />
          {/* chip */}
          <g {...S} fill="#1f7a73">
            <rect x="148" y="116" width="40" height="28" rx="4" />
          </g>
          <g fill="var(--cv-accent)">
            {[0, 1, 2, 3, 4].map((i) => (
              <rect key={i} x={152 + i * 7} y="119" width="4" height="4" />
            ))}
          </g>
          {/* obstacle */}
          <path {...S} fill="var(--cv-paper)" d="M16 144v-30h22v30M14 114h26" />
        </g>
      )}

      {art === 'bug' && (
        <g>
          {/* strange inputs raining into the sieve */}
          <g className="art__bits" fill="var(--cv-paper)" stroke="var(--cv-ink)" strokeWidth={2.5}>
            <rect x="52" y="8" width="14" height="14" transform="rotate(-14 59 15)" />
            <rect x="92" y="2" width="12" height="12" transform="rotate(22 98 8)" fill="var(--cv-accent)" />
            <rect x="128" y="12" width="14" height="14" transform="rotate(8 135 19)" />
            <rect x="74" y="28" width="10" height="10" transform="rotate(30 79 33)" fill="var(--cv-accent)" />
            <rect x="114" y="32" width="10" height="10" transform="rotate(-20 119 37)" />
          </g>
          {/* the sieve */}
          <path {...S} fill="var(--cv-paper)" d="M30 56h140l-24 50H54z" />
          <g stroke="var(--cv-ink)" strokeWidth={2} opacity=".55">
            <path d="M44 68h112M50 80h100M56 92h88M66 56l8 50M90 56l3 50M114 56l-2 50M138 56l-8 50" />
          </g>
          <path {...S} fill="none" strokeWidth={5} d="M22 56h156" />
          {/* the bug it caught */}
          <g className="art__bug">
            <g stroke="var(--cv-ink)" strokeWidth={3} strokeLinecap="round">
              <path d="M84 70l-12-8M84 80H70M86 88l-12 8M116 70l12-8M116 80h14M114 88l12 8M94 62l-6-10M106 62l6-10" />
            </g>
            <ellipse cx="100" cy="78" rx="18" ry="16" fill="var(--cv-ink)" />
            <path d="M100 63v31" stroke="var(--cv-accent)" strokeWidth={2.5} />
            <circle cx="92" cy="74" r="3" fill="var(--cv-accent)" />
            <circle cx="108" cy="82" r="3" fill="var(--cv-accent)" />
          </g>
          {/* the triage report it produces */}
          <g className="art__report">
            <path {...S} fill="var(--cv-paper)" d="M128 112h44v40h-44z" />
            <path stroke="var(--cv-ink)" strokeWidth={3} strokeLinecap="round" d="M136 124h28M136 134h20M136 144h24" />
            <circle {...S} cx="172" cy="112" r="10" fill="var(--cv-accent)" />
            <path stroke="var(--cv-ink)" strokeWidth={3} strokeLinecap="round" d="M172 107v5M172 116v.5" />
          </g>
          {/* a filtered-out drip */}
          <path className="art__drip" {...S} fill="var(--cv-accent)" d="M100 112c-5 8-6 12-6 15a6 6 0 0 0 12 0c0-3-1-7-6-15z" />
        </g>
      )}
    </svg>
  );
}
