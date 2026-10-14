import React from 'react';

export interface ChennaiSkylineProps {
  className?: string;
}

/**
 * Flat poster illustration in the spirit of the Hackday poster: an orange sun
 * behind a Chennai temple gopuram with palms and birds, a chef-hat coder at a
 * lavender laptop, an "Eat Code Repeat" cup and a Chennai signboard.
 */
const windowCount = (tier: number) => Math.max(2, 5 - Math.floor(tier / 2));

export default function ChennaiSkyline({ className = '' }: ChennaiSkylineProps) {
  const tiers = Array.from({ length: 8 }, (_, i) => {
    const bottom = 300 - i * 26;
    const half = 74 - i * 7.5;
    return { bottom, top: bottom - 26, half, topHalf: half - 5, i };
  });
  const cx = 430;

  return (
    <svg
      viewBox="0 0 560 420"
      className={className}
      role="img"
      aria-label="Illustration of a chef-hat coder at a laptop in front of a Chennai temple tower and an orange sun"
    >
      {/* Sun */}
      <circle cx="430" cy="118" r="92" fill="var(--brand)" />

      {/* Birds */}
      <g fill="none" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M300 92 q7 -7 14 0 q7 -7 14 0" />
        <path d="M272 140 q6 -6 12 0 q6 -6 12 0" />
        <path d="M336 168 q5 -5 10 0 q5 -5 10 0" />
      </g>

      {/* Gopuram */}
      <g>
        {tiers.map(({ bottom, top, half, topHalf, i }) => (
          <g key={i}>
            <path
              d={`M${cx - half} ${bottom} L${cx - topHalf} ${top} L${cx + topHalf} ${top} L${cx + half} ${bottom} Z`}
              fill={i % 2 === 0 ? 'var(--ink)' : 'var(--brand)'}
            />
            {Array.from({ length: windowCount(i) }, (_, n) => {
              const span = topHalf * 1.4;
              const x = cx - span / 2 + (span / (windowCount(i) - 1)) * n;
              return (
                <rect
                  key={n}
                  x={x - 3.5}
                  y={top + 7}
                  width="7"
                  height="12"
                  rx="3.5"
                  fill={i % 2 === 0 ? 'var(--brand)' : 'var(--ink)'}
                />
              );
            })}
          </g>
        ))}
        <path d={`M${cx - 26} 92 Q${cx} 58 ${cx + 26} 92 Z`} fill="var(--ink)" />
        {[-14, 0, 14].map((dx) => (
          <circle key={dx} cx={cx + dx} cy={64 + Math.abs(dx) * 0.5} r="4" fill="var(--ink)" />
        ))}
        <path d={`M${cx - 14} 300 L${cx - 14} 274 Q${cx} 260 ${cx + 14} 274 L${cx + 14} 300 Z`} fill="var(--brand)" />
      </g>

      {/* Palms */}
      <g fill="var(--ink)" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M330 320 Q334 262 342 214" fill="none" strokeWidth="5" />
        <path d="M342 214 q-30 -4 -48 12 q24 -4 48 -12 Z" />
        <path d="M342 214 q-8 -28 -34 -34 q16 16 34 34 Z" />
        <path d="M342 214 q22 -26 50 -20 q-26 6 -50 20 Z" />
        <path d="M342 214 q32 0 44 20 q-22 -8 -44 -20 Z" />
        <path d="M528 320 Q526 284 520 258" fill="none" strokeWidth="5" />
        <path d="M520 258 q-24 -4 -38 10 q18 -4 38 -10 Z" />
        <path d="M520 258 q18 -22 40 -16 q-20 4 -40 16 Z" />
      </g>

      {/* Ground */}
      <path d="M0 330 Q280 300 560 318 L560 420 L0 420 Z" fill="var(--ink)" />

      {/* Chennai signboard */}
      <g stroke="var(--ink)" strokeWidth="3.5" strokeLinejoin="round">
        <line x1="478" y1="300" x2="478" y2="340" />
        <line x1="540" y1="300" x2="540" y2="340" />
        <rect x="452" y="262" width="104" height="40" rx="6" fill="var(--lilac)" />
      </g>
      <text x="504" y="289" textAnchor="middle" fontFamily="var(--font-space-mono), monospace" fontWeight="700" fontSize="17" fill="var(--ink)">
        CHENNAI
      </text>

      {/* Laptop */}
      <g stroke="var(--ink)" strokeWidth="4" strokeLinejoin="round">
        <path d="M168 208 L330 186 L350 330 L190 352 Z" fill="var(--lilac)" />
        <path d="M150 360 L360 330 L372 348 L160 378 Z" fill="var(--lilac)" />
      </g>
      <text
        x="258"
        y="282"
        textAnchor="middle"
        fontFamily="var(--font-space-mono), monospace"
        fontWeight="700"
        fontSize="38"
        fill="var(--ink)"
        transform="rotate(-8 258 270)"
      >
        {'</>'}
      </text>

      {/* Chef-hat coder */}
      <g stroke="var(--ink)" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
        <path
          d="M52 210 C22 206 18 160 52 156 C50 118 100 108 116 140 C134 108 184 122 176 160 C206 166 200 210 172 210 Z"
          fill="var(--paper)"
        />
        <rect x="58" y="206" width="110" height="34" rx="4" fill="var(--paper)" />
        <circle cx="112" cy="292" r="58" fill="var(--paper)" />
        <circle cx="92" cy="282" r="8" fill="var(--ink)" />
        <circle cx="134" cy="282" r="8" fill="var(--ink)" />
        <circle cx="76" cy="304" r="7" fill="var(--brand-soft)" stroke="none" />
        <circle cx="150" cy="304" r="7" fill="var(--brand-soft)" stroke="none" />
        <path d="M84 318 q14 -10 28 0 q14 -10 28 0 q-8 16 -28 6 q-20 10 -28 -6 Z" fill="var(--ink)" />
      </g>

      {/* Coffee cup */}
      <g stroke="var(--ink)" strokeWidth="3.5" strokeLinejoin="round">
        <path d="M384 280 L452 280 L444 384 L392 384 Z" fill="var(--paper)" />
        <rect x="378" y="266" width="80" height="16" rx="4" fill="var(--brand)" />
      </g>
      <g fontFamily="var(--font-space-mono), monospace" fontWeight="700" fontSize="12" fill="var(--ink)" textAnchor="middle">
        <text x="418" y="318">EAT</text>
        <text x="418" y="334">CODE</text>
        <text x="418" y="350">REPEAT</text>
      </g>
    </svg>
  );
}
