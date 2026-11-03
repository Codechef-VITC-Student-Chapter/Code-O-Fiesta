'use client';

import React from 'react';

interface Rule {
  title: string;
  description: string;
  critical?: boolean;
}

// Sample rules — organizers may update these before the event.
const RULES: Rule[] = [
  {
    title: 'AI tools are strictly prohibited',
    description:
      'Participants must not use ChatGPT, Claude, Gemini, Copilot, or any other AI-assisted coding/generation tool during the competition.',
    critical: true,
  },
  {
    title: 'Copy and paste is not allowed',
    description:
      'Participants must type their solutions directly inside the provided coding IDE. Copy/paste actions remain disabled wherever the competition currently enforces this.',
    critical: true,
  },
  {
    title: 'Tab switching is prohibited',
    description:
      'Participants should remain on the competition website during active rounds. Switching browser tabs/windows or leaving the competition page is not allowed.',
    critical: true,
  },
  {
    title: 'Do not refresh or close the competition unnecessarily',
    description: 'Participants should avoid actions that may interrupt their active round/session.',
  },
  {
    title: 'Do not share solutions',
    description:
      'Teams must solve their assigned problems independently and must not exchange code or solutions with other teams.',
  },
  {
    title: 'Follow the active round instructions',
    description: 'Each round may have additional rules or constraints. Participants must follow the instructions displayed for that round.',
  },
  {
    title: 'Organizer decisions are final',
    description: 'Any violation or suspicious activity may be reviewed by the organizers, and their decision will be final.',
  },
];

export default function RulesAndRegulations() {
  return (
    <section className="hd-card p-5 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-ink pb-4 mb-5">
        <div className="flex flex-col gap-2">
          <span className="hd-kicker text-ink">Read before you start</span>
          <h2 className="hd-h2 flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-9 h-9 shrink-0 rounded-[var(--radius-sm)] bg-lilac border-2 border-ink">
              <svg className="w-5 h-5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </span>
            Rules &amp; regulations
          </h2>
        </div>
      </div>

      <ol className="flex flex-col gap-3">
        {RULES.map((rule, index) => (
          <li
            key={rule.title}
            className={`flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-[var(--radius-sm)] border-2 ${
              rule.critical ? 'bg-bad-soft border-ink' : 'bg-cream border-[var(--border-subtle)]'
            }`}
          >
            <span
              className={`shrink-0 w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center text-xs font-mono font-bold border-2 border-ink ${
                rule.critical ? 'bg-brand text-ink' : 'bg-paper text-ink'
              }`}
            >
              {String(index + 1).padStart(2, '0')}
            </span>

            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-ink">{rule.title}</span>
                {rule.critical && <span className="hd-badge hd-badge-bad">Zero Tolerance</span>}
              </div>
              <span className="text-[13px] text-charcoal leading-relaxed">{rule.description}</span>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-5 text-[11px] font-mono text-muted italic leading-relaxed border-t border-[var(--border-subtle)] pt-4">
        These rules are currently sample rules and may be updated by the organizers before the event.
      </p>
    </section>
  );
}
